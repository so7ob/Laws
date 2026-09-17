import { db } from '@/lib/db'

// Fix verification levels: downgrade legislations with no sources from "verified" to "reviewed"
async function main() {
  console.log('🔧 Fixing verification levels...')

  const result = await db.legislation.updateMany({
    where: {
      verificationLevel: 'verified',
      sources: { none: {} },
    },
    data: {
      verificationLevel: 'reviewed',
    },
  })

  console.log(`✓ Updated ${result.count} legislations from 'verified' to 'reviewed' (no sources)`)

  // Verify
  const stillVerified = await db.legislation.count({
    where: {
      verificationLevel: 'verified',
      sources: { none: {} },
    },
  })
  console.log(`Remaining 'verified' without sources: ${stillVerified}`)

  // Show updated stats
  const stats = await db.legislation.groupBy({
    by: ['verificationLevel'],
    _count: { _all: true },
  })
  console.log('Verification levels after fix:')
  stats.forEach(s => {
    console.log(`  ${s.verificationLevel}: ${s._count._all}`)
  })

  console.log('✅ Done!')
}

main()
  .catch((e) => {
    console.error('Failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
