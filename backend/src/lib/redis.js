import Redis from 'ioredis';

let redis;

export function getRedisClient() {
  if (redis) return redis;

  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.warn('REDIS_URL not set — Redis disabled, using memory fallback');
    return null;
  }

  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.error('Redis: max retries reached, giving up');
        return null; // stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true, // don't connect until first command
  });

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err.message));

  return redis;
}

// ── Helpers ──────────────────────────────────────────────

export async function getCache(key) {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    console.error('Redis getCache error:', err.message);
    return null;
  }
}

export async function setCache(key, value, ttlSeconds = 300) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    console.error('Redis setCache error:', err.message);
  }
}

export async function deleteCache(key) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error('Redis deleteCache error:', err.message);
  }
}

export async function acquireLock(key, ttlSeconds = 30) {
  const client = getRedisClient();
  if (!client) return true; // if no Redis, allow through
  try {
    const result = await client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  } catch (err) {
    console.error('Redis acquireLock error:', err.message);
    return true;
  }
}

export async function releaseLock(key) {
  const client = getRedisClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch (err) {
    console.error('Redis releaseLock error:', err.message);
  }
}

export async function getRateLimit(key, windowSeconds = 3600) {
  const client = getRedisClient();
  if (!client) return 0;
  try {
    const count = await client.incr(key);
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }
    return count;
  } catch (err) {
    console.error('Redis getRateLimit error:', err.message);
    return 0;
  }
}

export async function decrementCredits(userId) {
  const client = getRedisClient();
  if (!client) return null;
  try {
    const key = `credits:${userId}`;
    const val = await client.decr(key);
    return val;
  } catch (err) {
    console.error('Redis decrementCredits error:', err.message);
    return null;
  }
}

export default {
  getRedisClient,
  getCache,
  setCache,
  deleteCache,
  acquireLock,
  releaseLock,
  getRateLimit,
  decrementCredits,
};
