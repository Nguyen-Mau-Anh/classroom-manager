import { prisma } from './lib/prisma';
import { redis } from './lib/redis';

/**
 * Application version - injected via environment variable or defaults to package version.
 * In production, set APP_VERSION env var during build/deployment.
 */
export const APP_VERSION = process.env.APP_VERSION ?? '0.1.0';

/**
 * Health check response interface.
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
  };
}

/**
 * Returns the health status of the application.
 * Validates database and Redis connectivity.
 */
export async function getHealthStatus(startTime: Date): Promise<HealthStatus> {
  const now = new Date();
  const uptime = Math.floor((now.getTime() - startTime.getTime()) / 1000);

  // Check database connectivity
  let dbStatus: 'healthy' | 'unhealthy' = 'unhealthy';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  // Check Redis connectivity
  let redisStatus: 'healthy' | 'unhealthy' = 'unhealthy';
  try {
    // Connect if using lazyConnect
    if (redis.status === 'wait') {
      await redis.connect();
    }
    await redis.ping();
    redisStatus = 'healthy';
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const allHealthy = dbStatus === 'healthy' && redisStatus === 'healthy';

  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: now.toISOString(),
    version: APP_VERSION,
    uptime,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  };
}

/**
 * Formats uptime in human-readable format.
 */
export function formatUptime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}
