import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifySessionCookieValue,
  getSessionCookieName,
} from '@/lib/session'

/**
 * POST /api/admin/amendments/[id]/apply
 *
 * Atomically applies the operations of an amendment document to the target
 * legislation's articles. The whole application runs inside a Prisma
 * transaction; any error rolls back all changes.
 *
 * Safety:
 *  - Rejects re-application: if the document status is already 'applied',
 *    returns 409.
 *  - Requires the document to have been reviewed (status in
 *    ['in_review', 'approved']). Drafts cannot be applied.
 *
 * Per operation type:
 *  - replace:        close the article's current version, create a new
 *                    ArticleVersion with newText (changeType='amended').
 *  - add:            create a new Article + first ArticleVersion
 *                    (changeType='added').
 *  - repeal:         close current version, create a repealed version
 *                    (changeType='repealed', empty text).
 *  - renumber:       update the article's publishedNumber.
 *  - correct:        close current version, create a corrected version
 *                    (changeType='corrected').
 *  - substitute_phrase: close current version, create a new version with
 *                    the phrase replaced (changeType='amended').
 *  - delete_part:    close current version, create a reduced version
 *                    (changeType='amended', text minus the deleted part).
 *
 * After applying: document status='applied', appliedAt=now, appliedById
 * from the session; each operation's `applied` flag set to true.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Resolve the acting user.
    const cookieName = getSessionCookieName()
    const cookie = request.cookies.get(cookieName)?.value
    const session = await verifySessionCookieValue(cookie)
    const actingUserId = session?.userId || null

    // Load the document with its operations.
    const doc = await db.amendmentDocument.findUnique({
      where: { id },
      include: {
        operations: { orderBy: { sortOrder: 'asc' } },
      },
    })
    if (!doc) {
      return NextResponse.json(
        { error: 'وثيقة التعديل غير موجودة' },
        { status: 404 }
      )
    }

    // --- Guard: prevent re-application ---
    if (doc.status === 'applied') {
      return NextResponse.json(
        {
          error:
            'تم تطبيق هذه الوثيقة بالفعل. لا يمكن إعادة التطبيق.',
        },
        { status: 409 }
      )
    }

    // --- Guard: require review status ---
    if (!['in_review', 'approved'].includes(doc.status)) {
      return NextResponse.json(
        {
          error: `لا يمكن تطبيق وثيقة بحالة «${doc.status}». يجب نقلها إلى «قيد المراجعة» أو «معتمد» أولًا.`,
        },
        { status: 400 }
      )
    }

    if (doc.operations.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد عمليات لتطبيقها في هذه الوثيقة' },
        { status: 400 }
      )
    }

    const now = new Date()

    // --- Apply atomically in a transaction ---
    const summary = await db.$transaction(async (tx) => {
      let appliedCount = 0
      const errors: string[] = []

      for (const op of doc.operations) {
        try {
          await applyOperation(tx, op, doc, now)
          appliedCount++
        } catch (e: any) {
          errors.push(`العملية ${op.sortOrder + 1} (${op.operationType}): ${e.message}`)
        }
      }

      if (errors.length > 0) {
        // Throw to abort the whole transaction.
        throw new Error('فشل تطبيق بعض العمليات: ' + errors.join('؛ '))
      }

      // Mark the document as applied.
      await tx.amendmentDocument.update({
        where: { id: doc.id },
        data: {
          status: 'applied',
          appliedAt: now,
          appliedById: actingUserId,
        },
      })

      // Mark all operations as applied.
      await tx.amendmentOperation.updateMany({
        where: { documentId: doc.id },
        data: { applied: true },
      })

      // Audit log
      try {
        await tx.auditLog.create({
          data: {
            userId: actingUserId,
            action: 'apply',
            resource: 'amendment',
            resourceId: doc.id,
            operation: 'apply_amendment',
            afterState: JSON.stringify({
              title: doc.title,
              operationCount: appliedCount,
              appliedAt: now.toISOString(),
            }),
            reason: 'تطبيق ذري لعمليات التعديل من لوحة الإدارة',
          },
        })
      } catch {
        // best-effort
      }

      return { appliedCount }
    })

    return NextResponse.json({
      ok: true,
      appliedOperations: summary.appliedCount,
      appliedAt: now.toISOString(),
    })
  } catch (e: any) {
    // If it's our validation error, return 400; otherwise 500.
    const msg = e.message || ''
    if (msg.includes('فشل تطبيق') || msg.includes('لا يمكن تطبيق')) {
      return NextResponse.json({ error: msg }, { status: 400 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * Apply a single amendment operation inside a transaction.
 */
async function applyOperation(
  tx: any,
  op: any,
  doc: any,
  now: Date
): Promise<void> {
  const effectiveFrom = doc.effectiveDate || now

  switch (op.operationType) {
    case 'add': {
      // Create a new Article + its first version.
      const article = await tx.article.create({
        data: {
          legislationId: doc.targetLegislationId,
          publishedNumber: op.newArticleNumber || null,
          sortOrder: await nextSortOrder(tx, doc.targetLegislationId),
        },
      })
      await tx.articleVersion.create({
        data: {
          articleId: article.id,
          versionNo: 1,
          textContent: op.newText || '',
          rawText: op.newText || null,
          effectiveFrom,
          changeType: 'added',
          isCurrent: true,
          isFuture: false,
          amendmentOperationId: op.id,
          changeReason: op.reason || `إضافة بموجب ${doc.title}`,
        },
      })
      break
    }

    case 'repeal': {
      const article = await resolveArticle(tx, op, doc)
      if (!article) {
        throw new Error('المادة الهدف غير محددة لهذه العملية')
      }
      await closeCurrentVersion(tx, article.id, now)
      await tx.articleVersion.create({
        data: {
          articleId: article.id,
          versionNo: await nextVersionNo(tx, article.id),
          textContent: '',
          rawText: null,
          effectiveFrom,
          changeType: 'repealed',
          isCurrent: true,
          isFuture: false,
          amendmentOperationId: op.id,
          changeReason: op.reason || `إلغاء بموجب ${doc.title}`,
        },
      })
      break
    }

    case 'renumber': {
      const article = await resolveArticle(tx, op, doc)
      if (!article) {
        throw new Error('المادة الهدف غير محددة لهذه العملية')
      }
      if (!op.newArticleNumber) {
        throw new Error('الرقم الجديد مطلوب لإعادة الترقيم')
      }
      await tx.article.update({
        where: { id: article.id },
        data: { publishedNumber: op.newArticleNumber },
      })
      // Optionally close current version + create a renumbered version.
      await closeCurrentVersion(tx, article.id, now)
      const currentText = await getCurrentText(tx, article.id)
      await tx.articleVersion.create({
        data: {
          articleId: article.id,
          versionNo: await nextVersionNo(tx, article.id),
          textContent: currentText,
          rawText: null,
          effectiveFrom,
          changeType: 'renumbered',
          isCurrent: true,
          isFuture: false,
          amendmentOperationId: op.id,
          changeReason: op.reason || `إعادة ترقيم بموجب ${doc.title}`,
        },
      })
      break
    }

    case 'replace':
    case 'correct':
    case 'substitute_phrase':
    case 'delete_part': {
      const article = await resolveArticle(tx, op, doc)
      if (!article) {
        throw new Error('المادة الهدف غير محددة لهذه العملية')
      }
      const currentText = await getCurrentText(tx, article.id)
      let newText = op.newText || ''

      if (op.operationType === 'substitute_phrase' && op.oldText) {
        // Replace the phrase in the current text.
        newText = currentText.split(op.oldText).join(op.newText || '')
        if (newText === currentText) {
          throw new Error('العبارة المطلوب استبدالها غير موجودة في نص المادة')
        }
      } else if (op.operationType === 'delete_part' && op.oldText) {
        // Remove the deleted part from the text.
        newText = currentText.split(op.oldText).join('').trim()
        if (newText === currentText) {
          throw new Error('الجزء المطلوب حذفه غير موجود في نص المادة')
        }
      }

      await closeCurrentVersion(tx, article.id, now)
      const changeType =
        op.operationType === 'correct'
          ? 'corrected'
          : 'amended'
      await tx.articleVersion.create({
        data: {
          articleId: article.id,
          versionNo: await nextVersionNo(tx, article.id),
          textContent: newText,
          rawText: op.newText || null,
          effectiveFrom,
          changeType,
          isCurrent: true,
          isFuture: false,
          amendmentOperationId: op.id,
          changeReason: op.reason || `تعديل بموجب ${doc.title}`,
        },
      })
      break
    }

    default:
      throw new Error(`نوع عملية غير مدعوم: ${op.operationType}`)
  }
}

/**
 * Resolve the target Article for an operation. Uses targetArticleId if
 * present, otherwise tries to find by publishedNumber === newArticleNumber
 * on the target legislation.
 */
async function resolveArticle(tx: any, op: any, doc: any): Promise<any> {
  if (op.targetArticleId) {
    return tx.article.findUnique({
      where: { id: op.targetArticleId },
      select: { id: true, publishedNumber: true, legislationId: true },
    })
  }
  if (op.newArticleNumber) {
    return tx.article.findFirst({
      where: {
        legislationId: doc.targetLegislationId,
        publishedNumber: op.newArticleNumber,
      },
      select: { id: true, publishedNumber: true, legislationId: true },
    })
  }
  return null
}

/**
 * Close the current version of an article (set effectiveTo + isCurrent=false).
 */
async function closeCurrentVersion(tx: any, articleId: string, now: Date) {
  await tx.articleVersion.updateMany({
    where: { articleId, isCurrent: true },
    data: { effectiveTo: now, isCurrent: false },
  })
}

/**
 * Get the textContent of the current version of an article.
 */
async function getCurrentText(tx: any, articleId: string): Promise<string> {
  const current = await tx.articleVersion.findFirst({
    where: { articleId, isCurrent: true },
    select: { textContent: true },
    orderBy: { versionNo: 'desc' },
  })
  return current?.textContent || ''
}

/**
 * Get the next version number for an article.
 */
async function nextVersionNo(tx: any, articleId: string): Promise<number> {
  const latest = await tx.articleVersion.findFirst({
    where: { articleId },
    select: { versionNo: true },
    orderBy: { versionNo: 'desc' },
  })
  return (latest?.versionNo || 0) + 1
}

/**
 * Get the next sortOrder for an article in a legislation.
 */
async function nextSortOrder(tx: any, legislationId: string): Promise<number> {
  const latest = await tx.article.findFirst({
    where: { legislationId },
    select: { sortOrder: true },
    orderBy: { sortOrder: 'desc' },
  })
  return (latest?.sortOrder || 0) + 1
}
