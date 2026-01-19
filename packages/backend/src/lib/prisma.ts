import { PrismaClient } from '@prisma/client';

// Global declaration for prisma singleton in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create singleton instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Preserve singleton in development (hot reload)
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handling
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

// Handle process termination signals
const handleShutdown = async (signal: string) => {
  console.log(`Received ${signal}, disconnecting Prisma...`);
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
