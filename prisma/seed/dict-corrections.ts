import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding dictionary and corrections data...')

  // 1. Create a published search dictionary with entries
  const existingPub = await db.searchDictionary.findFirst({
    where: { status: 'published' },
  })
  if (!existingPub) {
    const dict = await db.searchDictionary.create({
      data: { version: 1, status: 'published' },
    })

    const entries = [
      { canonical: 'قانون', synonym: 'تشريع' },
      { canonical: 'قانون', synonym: 'نظام' },
      { canonical: 'دستور', synonym: 'قانون أساسي' },
      { canonical: 'دستور', synonym: 'وثيقة دائمة' },
      { canonical: 'لائحة', synonym: 'تنفيذية' },
      { canonical: 'لائحة', synonym: 'تعليمات' },
      { canonical: 'مادة', synonym: 'بند' },
      { canonical: 'مادة', synonym: 'نص' },
      { canonical: 'عقوبة', synonym: 'جزاء' },
      { canonical: 'عقوبة', synonym: 'sanction' },
      { canonical: 'محكمة', synonym: 'قضاء' },
      { canonical: 'محكمة', synonym: 'هيئة قضائية' },
      { canonical: 'تشريع', synonym: 'قانون' },
      { canonical: 'تشريع', synonym: 'نظام قانوني' },
      { canonical: 'نافذ', synonym: 'ساري المفعول' },
      { canonical: 'نافذ', synonym: 'ملزم' },
      { canonical: 'مُلغى', synonym: 'منسوخ' },
      { canonical: 'مُلغى', synonym: 'باطل' },
      { canonical: 'تعديل', synonym: 'تبديل' },
      { canonical: 'تعديل', synonym: 'تنقيح' },
      { canonical: 'جهة', synonym: 'سلطة' },
      { canonical: 'جهة', synonym: 'هيئة' },
      { canonical: 'نفاذ', synonym: 'سريان' },
      { canonical: 'نفاذ', synonym: 'تنفيذ' },
      { canonical: 'حكومة', synonym: 'سلطة تنفيذية' },
      { canonical: 'برلمان', synonym: 'مجلس نواب' },
      { canonical: 'برلمان', synonym: 'سلطة تشريعية' },
      { canonical: 'قضاء', synonym: 'سلطة قضائية' },
      { canonical: 'محامي', synonym: 'مُرافِع' },
      { canonical: 'قاضي', synonym: 'حاكم' },
    ]

    for (const e of entries) {
      await db.searchDictionaryEntry.create({
        data: {
          dictionaryId: dict.id,
          canonical: e.canonical,
          synonym: e.synonym,
          isActive: true,
        },
      })
    }
    console.log(`✓ Created published dictionary v1 with ${entries.length} entries`)
  } else {
    console.log('✓ Published dictionary already exists')
  }

  // 2. Create correction drafts
  const legs = await db.legislation.findMany({
    take: 3,
    orderBy: { createdAt: 'asc' },
    select: { id: true, slug: true, officialTitle: true },
  })

  const existingCorr = await db.correctionDraft.count()
  if (existingCorr === 0 && legs.length >= 3) {
    // Draft correction for an article
    const art = await db.article.findFirst({
      where: { legislationId: legs[0].id },
      select: { id: true, publishedNumber: true, versions: { take: 1, select: { textContent: true } } },
    })
    if (art) {
      await db.correctionDraft.create({
        data: {
          legislationId: legs[0].id,
          targetArticleId: art.id,
          targetType: 'article',
          currentContent: art.versions[0]?.textContent || '',
          proposedContent: (art.versions[0]?.textContent || '') + ' [تم التصحيح: إضافة توضيح للنص]',
          reason: 'تصحيح خطأ إدخال في المادة - إضافة سياق ضروري',
          status: 'draft',
        },
      })
    }

    // Approved correction for a preamble
    if (legs[1]) {
      const leg1 = await db.legislation.findUnique({
        where: { id: legs[1].id },
        select: { preamble: true },
      })
      if (leg1?.preamble) {
        await db.correctionDraft.create({
          data: {
            legislationId: legs[1].id,
            targetType: 'preamble',
            currentContent: leg1.preamble,
            proposedContent: leg1.preamble.replace('يُنظِّم', 'ينظّم'),
            reason: 'توحيد التشكيل في الديباجة',
            status: 'approved',
          },
        })
      }
    }

    // Published correction
    if (legs[2]) {
      const art2 = await db.article.findFirst({
        where: { legislationId: legs[2].id },
        select: { id: true, versions: { take: 1, select: { textContent: true } } },
      })
      if (art2) {
        await db.correctionDraft.create({
          data: {
            legislationId: legs[2].id,
            targetArticleId: art2.id,
            targetType: 'article',
            currentContent: art2.versions[0]?.textContent || '',
            proposedContent: (art2.versions[0]?.textContent || '') + ' (نص مُحدَّث)',
            reason: 'تصحيح لغوي بسيط',
            status: 'published',
            effectDate: new Date(),
          },
        })
      }
    }
    console.log('✓ Created 3 correction drafts (draft, approved, published)')
  } else {
    console.log('✓ Correction drafts already exist')
  }

  console.log('🌱 Dictionary and corrections data seeded!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
