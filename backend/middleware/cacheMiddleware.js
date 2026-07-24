const cache = require('../utils/cache');

/**
 * Middleware for caching responses.
 * @param {number} ttl TTL in milliseconds (default: 1 hour)
 */
const cacheMiddleware = (ttl = 3600000) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await cache.get(key);

      if (cachedResponse) {
        res.set('Cache-Control', 'no-cache');
        return res.json(cachedResponse);
      }

      // Capture the original res.json function
      const originalJson = res.json.bind(res);

      // Override res.json to cache the data
      res.json = (data) => {
        // Store in cache only for 2xx status codes
        if (res.statusCode >= 200 && res.statusCode < 300) {
          res.set('Cache-Control', 'no-cache');
          
          // Fire and forget cache set to not block response
          cache.set(key, data, ttl).catch(err => console.error('[Cache] Middleware set error:', err));
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('[Cache] Middleware error:', error);
      next();
    }
  };
};

/**
 * Helper to clear cache based on prefix.
 * @param {string} prefix Prefix of the cache keys to clear
 */
const clearCache = (prefix) => {
  return async (req, res, next) => {
    const fullPrefix = `__express__/api/${prefix}`;
    try {
      await cache.clearPattern(fullPrefix);
    } catch (err) {
      console.error('[Cache] clearCache middleware error:', err);
    }

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.clearPattern(fullPrefix).catch(err => console.error('[Cache] Post-clear error:', err));
      }
    });

    next();
  };
};

module.exports = {
  cacheMiddleware,
  clearCache
};
