import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding additional article versions...')

  // Find the constitution legislation and article 5
  const constitution = await db.legislation.findUnique({
    where: { slug: 'constitution-2001' },
    select: { id: true, effectiveDate: true },
  })
  if (!constitution) {
    console.error('Constitution not found')
    return
  }

  const article5 = await db.article.findFirst({
    where: { legislationId: constitution.id, publishedNumber: '5' },
    select: { id: true, versions: { orderBy: { versionNo: 'asc' } } },
  })
  if (!article5) {
    console.error('Article 5 not found')
    return
  }

  if (article5.versions.length >= 2) {
    console.log('✓ Article 5 already has multiple versions')
  } else {
    // Mark the initial version's effectiveTo and create a new current version
    const initialVersion = article5.versions[0]
    if (initialVersion) {
      // The amendment effectiveDate was 2003-05-15 per the seed
      const amendmentDate = new Date('2003-05-15')
      await db.articleVersion.update({
        where: { id: initialVersion.id },
        data: {
          effectiveTo: amendmentDate,
          isCurrent: false,
          changeType: 'amended',
          changeReason: 'تعديل بموجب تعديل بعض مواد دستور الجمهورية اليمنية سنة 2003',
        },
      })

      // Create the new current version with the amended text
      await db.articleVersion.create({
        data: {
          articleId: article5.id,
          versionNo: 2,
          textContent: '**الاقتصاد الوطني** — يقوم الاقتصاد الوطني على أساس التنمية المستدامة، ويُعنى بالتنمية المتوازنة بين مناطق الجمهورية، وتنويع مصادر الدخل، وتشجيع الاستثمار المحلي والأجنبي. (نص مُعدَّل بموجب تعديل 2003)',
          rawText: 'يقوم الاقتصاد الوطني على أساس التنمية المستدامة، ويُعنى بالتنمية المتوازنة بين مناطق الجمهورية، وتنويع مصادر الدخل، وتشجيع الاستثمار المحلي والأجنبي.',
          effectiveFrom: amendmentDate,
          changeType: 'amended',
          changeReason: 'تعديل بموجب تعديل بعض مواد دستور الجمهورية اليمنية سنة 2003',
          isCurrent: true,
          isFuture: false,
        },
      })
      console.log('✓ Created second version for article 5')
    }
  }

  // Also add a future version to article 7 to demonstrate "future effective"
  const article7 = await db.article.findFirst({
    where: { legislationId: constitution.id, publishedNumber: '7' },
    select: { id: true, versions: { orderBy: { versionNo: 'asc' } } },
  })
  if (article7 && article7.versions.length < 2) {
    const initialVersion = article7.versions[0]
    if (initialVersion) {
      // Add a future version (effective in the future)
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      await db.articleVersion.create({
        data: {
          articleId: article7.id,
          versionNo: 2,
          textContent: '**المساواة** — المواطنون جميعهم متساوون في الحقوق والواجبات العامة، لا تمييز بينهم بسبب الجنس أو اللون أو الأصل أو اللغة أو المهنة أو المركز الاجتماعي. (نص مستقبلي سيُطبَّق قريبًا)',
          rawText: 'المواطنون جميعهم متساوون في الحقوق والواجبات العامة...',
          effectiveFrom: futureDate,
          changeType: 'amended',
          changeReason: 'تعديل مستقبلي مخطط له',
          isCurrent: false,
          isFuture: true,
        },
      })
      console.log('✓ Created future version for article 7')
    }
  } else {
    console.log('✓ Article 7 already has multiple versions')
  }

  console.log('🌱 Additional article versions seeded!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
