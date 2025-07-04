import { getRedisClient } from './redis';
import { TextAnalysis } from '../../domain/entities/Text';
import { logger } from '../logging/logger';

export class CacheService {
  private redisClient: any;
  private readonly TTL = 3600; // 1 hour in seconds

  constructor() {
    // Don't initialize redisClient here - do it lazily
  }

  // Lazy initialization of Redis client
  private getRedisClient() {
    if (!this.redisClient) {
      this.redisClient = getRedisClient();
      if (!this.redisClient) {
        throw new Error('Redis client not available. Make sure Redis is connected.');
      }
    }
    return this.redisClient;
  }

  // Generate cache keys
  private generateAnalysisKey(textId: string): string {
    return `text_analysis:${textId}`;
  }

  private generateTextHashKey(textId: string): string {
    return `text_hash:${textId}`;
  }

  private generateUserTextsKey(userId: string): string {
    return `user_texts:${userId}`;
  }

  // Hash function to detect content changes
  private generateContentHash(content: string): string {
    // Simple hash function - in production, consider using crypto
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Cache text analysis
  async cacheTextAnalysis(textId: string, content: string, analysis: TextAnalysis): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const analysisKey = this.generateAnalysisKey(textId);
      const hashKey = this.generateTextHashKey(textId);
      const contentHash = this.generateContentHash(content);

      // Store analysis and content hash with TTL
      await Promise.all([
        redisClient.setEx(analysisKey, this.TTL, JSON.stringify(analysis)),
        redisClient.setEx(hashKey, this.TTL, contentHash)
      ]);

      logger.info(`Cached analysis for text: ${textId}`);
    } catch (error) {
      logger.error(`Failed to cache analysis for text ${textId}:`, error);
    }
  }

  // Get cached text analysis
  async getCachedTextAnalysis(textId: string, content: string): Promise<TextAnalysis | null> {
    try {
      const redisClient = this.getRedisClient();
      const analysisKey = this.generateAnalysisKey(textId);
      const hashKey = this.generateTextHashKey(textId);
      const currentContentHash = this.generateContentHash(content);

      // Get both analysis and stored hash
      const [cachedAnalysis, storedHash] = await Promise.all([
        redisClient.get(analysisKey),
        redisClient.get(hashKey)
      ]);

      // Check if cache exists and content hasn't changed
      if (cachedAnalysis && storedHash && storedHash === currentContentHash) {
        logger.info(`Cache hit for text analysis: ${textId}`);
        return JSON.parse(cachedAnalysis);
      }

      // Cache miss or content changed
      if (cachedAnalysis && storedHash !== currentContentHash) {
        logger.info(`Content changed for text ${textId}, invalidating cache`);
        await this.invalidateTextCache(textId);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to get cached analysis for text ${textId}:`, error);
      return null;
    }
  }

  // Invalidate text-specific cache
  async invalidateTextCache(textId: string): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const analysisKey = this.generateAnalysisKey(textId);
      const hashKey = this.generateTextHashKey(textId);

      await Promise.all([
        redisClient.del(analysisKey),
        redisClient.del(hashKey)
      ]);

      logger.info(`Invalidated cache for text: ${textId}`);
    } catch (error) {
      logger.error(`Failed to invalidate cache for text ${textId}:`, error);
    }
  }

  // Cache user texts list
  async cacheUserTexts(userId: string, texts: any[]): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const key = this.generateUserTextsKey(userId);
      await redisClient.setEx(key, this.TTL, JSON.stringify(texts));
      logger.info(`Cached texts list for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to cache texts for user ${userId}:`, error);
    }
  }

  // Get cached user texts list
  async getCachedUserTexts(userId: string): Promise<any[] | null> {
    try {
      const redisClient = this.getRedisClient();
      const key = this.generateUserTextsKey(userId);
      const cachedTexts = await redisClient.get(key);
      
      if (cachedTexts) {
        logger.info(`Cache hit for user texts: ${userId}`);
        return JSON.parse(cachedTexts);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to get cached texts for user ${userId}:`, error);
      return null;
    }
  }

  // Invalidate user texts cache
  async invalidateUserTextsCache(userId: string): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const key = this.generateUserTextsKey(userId);
      await redisClient.del(key);
      logger.info(`Invalidated texts cache for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to invalidate texts cache for user ${userId}:`, error);
    }
  }

  // Cache individual analysis components (for specific endpoint caching)
  async cacheAnalysisComponent(textId: string, component: string, value: any): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const key = `text_${component}:${textId}`;
      await redisClient.setEx(key, this.TTL, JSON.stringify(value));
      logger.info(`Cached ${component} for text: ${textId}`);
    } catch (error) {
      logger.error(`Failed to cache ${component} for text ${textId}:`, error);
    }
  }

  // Get cached analysis component
  async getCachedAnalysisComponent(textId: string, component: string, content: string): Promise<any | null> {
    try {
      // First check if the content hash is still valid
      const redisClient = this.getRedisClient();
      const hashKey = this.generateTextHashKey(textId);
      const storedHash = await redisClient.get(hashKey);
      const currentContentHash = this.generateContentHash(content);

      if (!storedHash || storedHash !== currentContentHash) {
        // Content changed, invalidate all caches for this text
        await this.invalidateAllTextCaches(textId);
        return null;
      }

      const key = `text_${component}:${textId}`;
      const cachedValue = await redisClient.get(key);
      
      if (cachedValue) {
        logger.info(`Cache hit for ${component} of text: ${textId}`);
        return JSON.parse(cachedValue);
      }

      return null;
    } catch (error) {
      logger.error(`Failed to get cached ${component} for text ${textId}:`, error);
      return null;
    }
  }

  // Invalidate all caches related to a specific text
  async invalidateAllTextCaches(textId: string): Promise<void> {
    try {
      const redisClient = this.getRedisClient();
      const patterns = [
        `text_analysis:${textId}`,
        `text_hash:${textId}`,
        `text_wordCount:${textId}`,
        `text_characterCount:${textId}`,
        `text_sentenceCount:${textId}`,
        `text_paragraphCount:${textId}`,
        `text_longestWords:${textId}`
      ];

      await Promise.all(patterns.map(pattern => redisClient.del(pattern)));
      logger.info(`Invalidated all caches for text: ${textId}`);
    } catch (error) {
      logger.error(`Failed to invalidate all caches for text ${textId}:`, error);
    }
  }

  // Health check for cache
  async isHealthy(): Promise<boolean> {
    try {
      const redisClient = this.getRedisClient();
      await redisClient.ping();
      return true;
    } catch (error) {
      logger.error('Cache health check failed:', error);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<any> {
    try {
      const redisClient = this.getRedisClient();
      const info = await redisClient.info('memory');
      return {
        connected: true,
        memoryInfo: info
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return { connected: false };
    }
  }
}
