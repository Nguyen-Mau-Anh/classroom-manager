import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const redisUrl = process.env.REDIS_URL ?? 'redis://localhost:6379';
  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Graceful shutdown
const shutdown = () => {
  if (redis.status === 'ready') {
    void redis.quit();
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Refresh token storage functions
const REFRESH_TOKEN_PREFIX = 'refresh_token:';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export async function storeRefreshToken(userId: string, token: string): Promise<void> {
  const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
  await redis.set(key, token, 'EX', REFRESH_TOKEN_TTL);
}

export async function getRefreshToken(userId: string): Promise<string | null> {
  const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
  return redis.get(key);
}

export async function deleteRefreshToken(userId: string): Promise<void> {
  const key = `${REFRESH_TOKEN_PREFIX}${userId}`;
  await redis.del(key);
}

export async function validateRefreshToken(userId: string, token: string): Promise<boolean> {
  const storedToken = await getRefreshToken(userId);
  return storedToken === token;
}
