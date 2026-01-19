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
}

/**
 * Returns the health status of the application.
 */
export function getHealthStatus(startTime: Date): HealthStatus {
  const now = new Date();
  const uptime = Math.floor((now.getTime() - startTime.getTime()) / 1000);

  return {
    status: 'healthy',
    timestamp: now.toISOString(),
    version: APP_VERSION,
    uptime,
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
