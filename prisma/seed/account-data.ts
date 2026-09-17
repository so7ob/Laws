import { db } from '@/lib/db'

// Seed demo account data for the "reader" user
async function main() {
  console.log('🌱 Seeding demo account data...')

  const reader = await db.user.findUnique({ where: { username: 'reader' } })
  if (!reader) {
    console.error('Reader user not found')
    return
  }

  // Get some legislations to favorite
  const legs = await db.legislation.findMany({
    take: 5,
    orderBy: { publicationDate: 'desc' },
    select: { id: true, slug: true, officialTitle: true, year: true, typeId: true, authorityId: true },
  })

  // 1. Favorites
  for (const leg of legs.slice(0, 4)) {
    const existing = await db.favorite.findFirst({
      where: { userId: reader.id, legislationId: leg.id },
    })
    if (!existing) {
      await db.favorite.create({
        data: {
          userId: reader.id,
          legislationId: leg.id,
          label: leg.year ? `تشريع سنة ${leg.year}` : null,
        },
      })
    }
  }
  console.log(`✓ Created favorites`)

  // 2. Saved searches
  const savedSearches = [
    { name: 'قوانين الضرائب', query: 'ضريبة', filters: { type: 'law' } },
    { name: 'التشريعات المصرفية', query: 'مصرف', filters: { subject: 'banking' } },
    { name: 'قانون العمل', query: 'العمل', filters: {} },
  ]
  for (const s of savedSearches) {
    const existing = await db.savedSearch.findFirst({
      where: { userId: reader.id, name: s.name },
    })
    if (!existing) {
      await db.savedSearch.create({
        data: {
          userId: reader.id,
          name: s.name,
          query: s.query,
          filters: JSON.stringify(s.filters),
        },
      })
    }
  }
  console.log(`✓ Created saved searches`)

  // 3. Notes
  if (legs[0]) {
    const existing = await db.note.findFirst({
      where: { userId: reader.id, legislationId: legs[0].id },
    })
    if (!existing) {
      await db.note.create({
        data: {
          userId: reader.id,
          legislationId: legs[0].id,
          content: 'مراجعة المادة ٥ من هذا التشريع مهمة قبل الاجتماع القادم. النص المتعلق بالأحكام العامة يحتاج إلى توضيح إضافي.',
          contextDate: new Date(),
        },
      })
    }
  }
  if (legs[1]) {
    const existing = await db.note.findFirst({
      where: { userId: reader.id, legislationId: legs[1].id },
    })
    if (!existing) {
      await db.note.create({
        data: {
          userId: reader.id,
          legislationId: legs[1].id,
          content: 'هذا التشريع مرتبط بقانون آخر، يُنصح بمراجعة العلاقات القانونية قبل الاعتماد.',
          contextDate: new Date(),
        },
      })
    }
  }
  console.log(`✓ Created notes`)

  // 4. Participations
  if (legs[2]) {
    const existing = await db.participation.findFirst({
      where: { userId: reader.id, legislationId: legs[2].id },
    })
    if (!existing) {
      await db.participation.create({
        data: {
          userId: reader.id,
          legislationId: legs[2].id,
          participationType: 'suggestion',
          content: 'اقترح إضافة توضيح للفقرة الثالثة من المادة الأولى لبيان المقصود من "الشؤون العامة".',
          trackingNumber: `YE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
          status: 'received',
          isPublic: false,
        },
      })
    }
  }
  if (legs[3]) {
    const existing = await db.participation.findFirst({
      where: { userId: reader.id, legislationId: legs[3].id },
    })
    if (!existing) {
      await db.participation.create({
        data: {
          userId: reader.id,
          legislationId: legs[3].id,
          participationType: 'comment',
          content: 'النص المنشور يتفق مع المصدر الرسمي، شكرًا على الجهود.',
          trackingNumber: `YE-${(Date.now() + 1).toString(36).toUpperCase()}-${Math.random().toString(16).substring(2, 8).toUpperCase()}`,
          status: 'triage',
          isPublic: false,
        },
      })
    }
  }
  console.log(`✓ Created participations`)

  console.log('🌱 Demo account data seeded!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
