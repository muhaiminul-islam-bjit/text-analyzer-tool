import { Request, Response, NextFunction } from 'express';
import { getRedisClient } from '../../infrastructure/cache/redis';
import { logger } from '../../infrastructure/logging/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  keyPrefix: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private redisClient: any;

  constructor() {
    // Don't initialize redisClient here - do it lazily
  }

  // Lazy initialization of Redis client
  private getRedisClient() {
    if (!this.redisClient) {
      try {
        this.redisClient = getRedisClient();
        if (!this.redisClient) {
          throw new Error('Redis client not available');
        }
      } catch (error) {
        logger.warn('Redis not available for rate limiting:', error);
        return null;
      }
    }
    return this.redisClient;
  }

  private async getRateLimitInfo(key: string): Promise<RateLimitInfo | null> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      return null;
    }

    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Error getting rate limit info:', error);
      return null;
    }
  }

  private async setRateLimitInfo(key: string, info: RateLimitInfo, ttlSeconds: number): Promise<void> {
    const redisClient = this.getRedisClient();
    if (!redisClient) {
      return;
    }

    try {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(info));
    } catch (error) {
      logger.error('Error setting rate limit info:', error);
    }
  }

  private generateKey(config: RateLimitConfig, identifier: string): string {
    const window = Math.floor(Date.now() / config.windowMs);
    return `ratelimit:${config.keyPrefix}:${identifier}:${window}`;
  }

  private getClientIdentifier(req: Request): string {
    // Use IP address as primary identifier
    return req.ip || req.socket.remoteAddress || 'unknown';
  }

  private getUserIdentifier(req: Request): string {
    // Use user ID if authenticated, otherwise fall back to IP
    const user = (req as any).user;
    const ip = this.getClientIdentifier(req);
    return user?.userId ? `user:${user.userId}` : `ip:${ip}`;
  }

  async checkRateLimit(
    req: Request,
    res: Response,
    config: RateLimitConfig,
    useUserIdentifier: boolean = false
  ): Promise<boolean> {
    const identifier = useUserIdentifier ? this.getUserIdentifier(req) : this.getClientIdentifier(req);
    const key = this.generateKey(config, identifier);
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const resetTime = windowStart + config.windowMs;

    // Get Redis client with lazy initialization
    const redisClient = this.getRedisClient();
    
    // If Redis is not available, allow the request (fail open)
    if (!redisClient) {
      logger.warn('Rate limiting disabled: Redis unavailable');
      return true;
    }

    try {
      const currentInfo = await this.getRateLimitInfo(key);
      const currentCount = currentInfo ? currentInfo.count : 0;

      // Set rate limit headers
      res.set({
        'RateLimit-Limit': config.maxRequests.toString(),
        'RateLimit-Remaining': Math.max(0, config.maxRequests - currentCount - 1).toString(),
        'RateLimit-Reset': new Date(resetTime).toISOString(),
      });

      if (currentCount >= config.maxRequests) {
        // Rate limit exceeded
        res.set('Retry-After', Math.ceil((resetTime - now) / 1000).toString());
        
        logger.warn(`Rate limit exceeded for ${identifier} (${config.keyPrefix})`);
        res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil((resetTime - now) / 1000),
        });
        return false;
      }

      // Increment counter
      const newInfo: RateLimitInfo = {
        count: currentCount + 1,
        resetTime,
      };

      const ttlSeconds = Math.ceil(config.windowMs / 1000);
      await this.setRateLimitInfo(key, newInfo, ttlSeconds);

      return true;
    } catch (error) {
      logger.error('Rate limiting error:', error);
      // If there's an error, allow the request (fail open)
      return true;
    }
  }
}

const rateLimiter = new RateLimiter();

// Rate limiting middleware factory
function createRateLimit(config: RateLimitConfig, useUserIdentifier: boolean = false) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const allowed = await rateLimiter.checkRateLimit(req, res, config, useUserIdentifier);
    if (allowed) {
      next();
    }
    // If not allowed, response is already sent by checkRateLimit
  };
}

// General API rate limiter
export const generalRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
  keyPrefix: 'general',
});

// Strict rate limiter for authentication endpoints
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  message: 'Too many authentication attempts from this IP, please try again later.',
  keyPrefix: 'auth',
  skipSuccessfulRequests: true,
});

// Rate limiter for text analysis endpoints
export const analysisRateLimit = createRateLimit(
  {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    message: 'Too many analysis requests, please try again later.',
    keyPrefix: 'analysis',
  },
  true // Use user identifier
);

// Rate limiter for user registration
export const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
  message: 'Too many registration attempts from this IP, please try again later.',
  keyPrefix: 'register',
});

// Rate limiter for text creation/modification
export const textModificationRateLimit = createRateLimit(
  {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 20,
    message: 'Too many text modification requests, please try again later.',
    keyPrefix: 'textmod',
  },
  true // Use user identifier
);

// Health check rate limiter
export const healthCheckRateLimit = createRateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 30,
  message: 'Too many health check requests.',
  keyPrefix: 'health',
});
