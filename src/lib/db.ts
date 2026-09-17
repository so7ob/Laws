/* eslint-disable @typescript-eslint/no-require-imports */
// In CI environments, @prisma/client may not export PrismaClient as a named export.
// We use dynamic resolution to handle both dev and CI environments.
const prismaModule = require('@prisma/client')
const PrismaClient = prismaModule.PrismaClient || prismaModule.default || prismaModule

const globalForPrisma = globalThis as unknown as {
  prisma: typeof PrismaClient extends new (...args: any[]) => infer T ? T : any | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
