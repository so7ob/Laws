// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PrismaClient: any = require('@prisma/client').PrismaClient || require('@prisma/client').default || require('@prisma/client')

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
