const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Production-grade Cache utility with Redis support and in-memory fallback.
 */
class Cache {
  constructor() {
    this.useRedis = process.env.REDIS_URL || process.env.REDIS_HOST;
    this.localCache = new Map();
    this.redis = null;

    if (this.useRedis) {
      try {
        this.redis = new Redis(process.env.REDIS_URL || {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn('[Cache] Redis connection failed too many times. Falling back to in-memory cache.');
              this.useRedis = false;
              return null;
            }
            return Math.min(times * 50, 2000);
          }
        });

        this.redis.on('error', (err) => {
          console.error('[Cache] Redis Error:', err.message);
          this.useRedis = false;
        });

        this.redis.on('connect', () => {
          console.log('[Cache] Connected to Redis');
          this.useRedis = true;
        });
      } catch (error) {
        console.warn('[Cache] Failed to initialize Redis. Using in-memory fallback.');
        this.useRedis = false;
      }
    } else {
      console.log('[Cache] No Redis configuration found. Using in-memory cache.');
    }
  }

  /**
   * Set a value in cache with an optional TTL (in milliseconds for local, seconds for redis)
   * @param {string} key 
   * @param {any} value 
   * @param {number} ttl_ms TTL in milliseconds (default: 1 hour)
   */
  async set(key, value, ttl_ms = 3600000) {
    if (this.useRedis && this.redis) {
      try {
        const ttl_seconds = Math.floor(ttl_ms / 1000);
        await this.redis.set(key, JSON.stringify(value), 'EX', ttl_seconds);
      } catch (err) {
        console.error('[Cache] Redis SET error:', err);
      }
    } else {
      const expiry = Date.now() + ttl_ms;
      this.localCache.set(key, { value, expiry });
    }
  }

  /**
   * Get a value from cache
   * @param {string} key 
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (this.useRedis && this.redis) {
      try {
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
      } catch (err) {
        console.error('[Cache] Redis GET error:', err);
        return null;
      }
    } else {
      const cached = this.localCache.get(key);
      if (!cached) return null;

      if (Date.now() > cached.expiry) {
        this.localCache.delete(key);
        return null;
      }

      return cached.value;
    }
  }

  /**
   * Delete a specific key
   * @param {string} key 
   */
  async del(key) {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch (err) {
        console.error('[Cache] Redis DEL error:', err);
      }
    } else {
      this.localCache.delete(key);
    }
  }

  /**
   * Clear all keys that match a pattern (starts with)
   * @param {string} pattern 
   */
  async clearPattern(pattern) {
    if (this.useRedis && this.redis) {
      try {
        const stream = this.redis.scanStream({
          match: `${pattern}*`,
          count: 100
        });

        stream.on('data', async (keys) => {
          if (keys.length) {
            const pipeline = this.redis.pipeline();
            keys.forEach(key => pipeline.del(key));
            await pipeline.exec();
          }
        });
      } catch (err) {
        console.error('[Cache] Redis clearPattern error:', err);
      }
    } else {
      for (const key of this.localCache.keys()) {
        if (key.startsWith(pattern)) {
          this.localCache.delete(key);
        }
      }
    }
  }

  /**
   * Clear entire cache
   */
  async flush() {
    if (this.useRedis && this.redis) {
      try {
        await this.redis.flushall();
      } catch (err) {
        console.error('[Cache] Redis FLUSH error:', err);
      }
    } else {
      this.localCache.clear();
    }
  }
}

module.exports = new Cache();
