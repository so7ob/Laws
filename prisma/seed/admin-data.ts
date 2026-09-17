import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding additional admin data (reports, audit logs, imports)...')

  const adminUser = await db.user.findUnique({ where: { username: 'admin' } })
  const reviewer = await db.user.findUnique({ where: { username: 'reviewer' } })
  const dataEntry = await db.user.findUnique({ where: { username: 'data.entry' } })
  const contentMgr = await db.user.findUnique({ where: { username: 'content.mgr' } })

  const legs = await db.legislation.findMany({
    take: 6,
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, officialTitle: true, shortTitle: true, workflowStatus: true, verificationLevel: true },
  })

  // 1. Quality Reports
  const existingReports = await db.report.count()
  if (existingReports === 0) {
    const reports = [
      {
        legislationId: legs[0]?.id,
        reportType: 'missing_source',
        severity: 'warning',
        title: 'مصدر مفقود للتشريع',
        description: 'لا يوجد مصدر رسمي مرتبط بهذا التشريع. يُنصح بإضافة المصدر الرسمي من الجريدة الرسمية.',
        status: 'open',
      },
      {
        legislationId: legs[1]?.id,
        reportType: 'incomplete_dates',
        severity: 'warning',
        title: 'تواريخ غير مكتملة',
        description: 'تاريخ النفاذ غير محدد لهذا التشريع. يُنصح بتحديد تاريخ النفاذ الدقيق.',
        status: 'open',
      },
      {
        legislationId: legs[2]?.id,
        reportType: 'unreviewed_ocr',
        severity: 'error',
        title: 'محتوى OCR غير مراجع',
        description: 'تم استخراج النص عبر OCR لكنه لم يُراجع من قبل مختص قانوني. قد يحتوي على أخطاء.',
        status: 'open',
      },
      {
        legislationId: legs[3]?.id,
        reportType: 'broken_reference',
        severity: 'critical',
        title: 'إحالة معطلة',
        description: 'يحتوي التشريع على إحالة لتشريع آخر لم يعد متاحًا أو تم إلغاؤه.',
        status: 'processing',
      },
      {
        legislationId: legs[4]?.id,
        reportType: 'missing_publish_data',
        severity: 'error',
        title: 'بيانات النشر مفقودة',
        description: 'بيانات الجريدة الرسمية غير مكتملة (رقم العدد، تاريخ النشر، الصفحات).',
        status: 'resolved',
      },
      {
        reportType: 'unlinked_amendment',
        severity: 'info',
        title: 'تعديل غير مرتبط',
        description: 'يوجد وثيقة تعديل غير مرتبطة بالتشريع المستهدف. يُنصح بمراجعة الربط.',
        status: 'ignored',
      },
    ]

    for (const r of reports) {
      await db.report.create({ data: r })
    }
    console.log(`✓ Created ${reports.length} quality reports`)
  } else {
    console.log('✓ Quality reports already exist')
  }

  // 2. Audit Logs (more variety)
  const existingLogs = await db.auditLog.count()
  if (existingLogs < 20) {
    const logs = [
      { userId: adminUser?.id, action: 'create', resource: 'legislation', resourceId: legs[0]?.id, operation: 'manual', reason: 'إنشاء تشريع جديد', ipAddress: '127.0.0.1' },
      { userId: dataEntry?.id, action: 'edit', resource: 'legislation', resourceId: legs[1]?.id, operation: 'edit_metadata', reason: 'تحديث البيانات', ipAddress: '127.0.0.1' },
      { userId: reviewer?.id, action: 'review', resource: 'legislation', resourceId: legs[2]?.id, operation: 'legal_review', reason: 'مراجعة قانونية', ipAddress: '127.0.0.1' },
      { userId: contentMgr?.id, action: 'publish', resource: 'legislation', resourceId: legs[3]?.id, operation: 'publish', reason: 'نشر التشريع', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'create', resource: 'role', operation: 'role_create', reason: 'إنشاء دور جديد', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'edit', resource: 'user', operation: 'user_edit', reason: 'تعديل بيانات المستخدم', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'publish', resource: 'amendment', operation: 'amendment_publish', reason: 'نشر وثيقة تعديل', ipAddress: '127.0.0.1' },
      { userId: reviewer?.id, action: 'review', resource: 'attachment', operation: 'attachment_review', reason: 'مراجعة ملحق', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'edit', resource: 'policy', operation: 'policy_toggle', reason: 'تفعيل سياسة', ipAddress: '127.0.0.1' },
      { userId: contentMgr?.id, action: 'create', resource: 'source', operation: 'source_upload', reason: 'رفع مصدر جديد', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'delete', resource: 'legislation', operation: 'soft_delete', reason: 'نقل للسلة', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'edit', resource: 'settings', operation: 'settings_update', reason: 'تحديث الإعدادات', ipAddress: '127.0.0.1' },
      { userId: dataEntry?.id, action: 'create', resource: 'import', operation: 'import_upload', reason: 'رفع ملف للاستيراد', ipAddress: '127.0.0.1' },
      { userId: adminUser?.id, action: 'create', resource: 'correction', operation: 'correction_create', reason: 'إنشاء مسودة تصحيح', ipAddress: '127.0.0.1' },
      { userId: reviewer?.id, action: 'approve', resource: 'correction', operation: 'correction_approve', reason: 'اعتماد تصحيح', ipAddress: '127.0.0.1' },
    ]

    for (const log of logs) {
      if (!log.userId) continue
      await db.auditLog.create({ data: log as any })
    }
    console.log(`✓ Created ${logs.length} audit logs`)
  } else {
    console.log('✓ Audit logs already exist')
  }

  // 3. Import Operations
  const existingImports = await db.importOperation.count()
  if (existingImports === 0) {
    const imports = [
      { fileName: 'قانون_العمل_1995.txt', fileType: 'txt', fileSize: 24576, status: 'completed', progress: 100, extractionText: 'قانون العمل رقم 5 لسنة 1995...', completedAt: new Date() },
      { fileName: 'دستور_2001.pdf', fileType: 'pdf', fileSize: 102400, status: 'completed', progress: 100, extractionText: 'دستور الجمهورية اليمنية...', completedAt: new Date() },
      { fileName: 'قانون_الضرائب.docx', fileType: 'docx', fileSize: 51200, status: 'ready_review', progress: 80, extractionText: 'قانون ضريبة الدخل...', startedAt: new Date() },
      { fileName: 'لائحة_تنفيذية.pdf', fileType: 'pdf', fileSize: 76800, status: 'extracting', progress: 45, startedAt: new Date() },
      { fileName: 'جدول_التعرفة.xlsx', fileType: 'xlsx', fileSize: 32768, status: 'uploaded', progress: 0 },
      { fileName: 'قانون_قديم.pdf', fileType: 'pdf', fileSize: 89000, status: 'failed', progress: 30, errorMessage: 'تعذر استخراج النص من ملف PDF مصور', startedAt: new Date() },
    ]

    for (const imp of imports) {
      await db.importOperation.create({ data: imp })
    }
    console.log(`✓ Created ${imports.length} import operations`)
  } else {
    console.log('✓ Import operations already exist')
  }

  console.log('🌱 Additional admin data seeded!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
