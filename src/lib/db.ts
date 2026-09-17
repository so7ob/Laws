import { PrismaClient } from '@prisma/client'

// In CI/production, the generated client might not have PrismaClient as a named export
// Use default export fallback
const PrismaClientImpl = (PrismaClient as any).default ?? PrismaClient

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClientImpl({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db