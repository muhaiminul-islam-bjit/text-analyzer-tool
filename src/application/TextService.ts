import { Text, CreateTextRequest, UpdateTextRequest, TextAnalysis } from '../domain/entities/Text';
import { TextRepository } from '../domain/repositories/TextRepository';
import { TextAnalyzer } from './TextAnalyzer';
import { CacheService } from '../infrastructure/cache/CacheService';
import { logger } from '../infrastructure/logging/logger';

export class TextService {
  private cacheService: CacheService;

  constructor(private textRepository: TextRepository) {
    this.cacheService = new CacheService();
  }

  async createText(userId: string, textData: CreateTextRequest): Promise<Text> {
    logger.info(`Creating text with title: ${textData.title} for user: ${userId}`);
    
    const text: Text = {
      title: textData.title,
      content: textData.content,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdText = await this.textRepository.create(text);
    logger.info(`Text created successfully with ID: ${createdText.id}`);
    
    // Update cache by adding the new text to existing cached list (if it exists)
    const cachedTexts = await this.cacheService.getCachedUserTexts(userId);
    if (cachedTexts) {
      // Add the new text to the cached list and update cache
      const updatedTexts = [...cachedTexts, createdText];
      await this.cacheService.cacheUserTexts(userId, updatedTexts);
    }
    // If no cache exists, we don't need to do anything - it will be cached on next getUserTexts call
    
    return createdText;
  }

  async getTextById(textId: string, userId: string): Promise<Text> {
    logger.info(`Fetching text with ID: ${textId} for user: ${userId}`);
    
    const text = await this.textRepository.findById(textId);
    
    if (!text) {
      throw new Error('Text not found');
    }

    if (text.userId !== userId) {
      throw new Error('Unauthorized access to text');
    }

    return text;
  }

  async getUserTexts(userId: string): Promise<Text[]> {
    logger.info(`Fetching all texts for user: ${userId}`);
    
    // Try to get from cache first
    const cachedTexts = await this.cacheService.getCachedUserTexts(userId);
    if (cachedTexts) {
      return cachedTexts;
    }
    
    // Cache miss - fetch from database and cache the result
    const texts = await this.textRepository.findByUserId(userId);
    await this.cacheService.cacheUserTexts(userId, texts);
    
    return texts;
  }

  async updateText(textId: string, userId: string, updateData: UpdateTextRequest): Promise<Text> {
    logger.info(`Updating text with ID: ${textId} for user: ${userId}`);
    
    const existingText = await this.getTextById(textId, userId);
    
    const updatedText = await this.textRepository.update(textId, {
      ...updateData,
      updatedAt: new Date(),
    });

    if (!updatedText) {
      throw new Error('Failed to update text');
    }

    // Invalidate all analysis caches related to this text since content might have changed
    await this.cacheService.invalidateAllTextCaches(textId);
    
    // Update user texts cache by replacing the updated text (if cache exists)
    const cachedTexts = await this.cacheService.getCachedUserTexts(userId);
    if (cachedTexts) {
      // Replace the updated text in the cached list and update cache
      const updatedTexts = cachedTexts.map(text => 
        text.id === textId ? updatedText : text
      );
      await this.cacheService.cacheUserTexts(userId, updatedTexts);
    }
    // If no cache exists, we don't need to do anything

    logger.info(`Text updated successfully with ID: ${textId}`);
    return updatedText;
  }

  async deleteText(textId: string, userId: string): Promise<void> {
    logger.info(`Deleting text with ID: ${textId} for user: ${userId}`);
    
    await this.getTextById(textId, userId); // Check if text exists and user owns it
    
    const deleted = await this.textRepository.delete(textId);
    
    if (!deleted) {
      throw new Error('Failed to delete text');
    }

    // Invalidate all caches related to this specific text since it was deleted
    await this.cacheService.invalidateAllTextCaches(textId);
    
    // Update user texts cache by removing the deleted text (if cache exists)
    const cachedTexts = await this.cacheService.getCachedUserTexts(userId);
    if (cachedTexts) {
      // Remove the deleted text from the cached list and update cache
      const updatedTexts = cachedTexts.filter(text => text.id !== textId);
      await this.cacheService.cacheUserTexts(userId, updatedTexts);
    }
    // If no cache exists, we don't need to do anything

    logger.info(`Text deleted successfully with ID: ${textId}`);
  }

  async analyzeText(textId: string, userId: string): Promise<TextAnalysis> {
    logger.info(`Analyzing text with ID: ${textId} for user: ${userId}`);
    
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedAnalysis = await this.cacheService.getCachedTextAnalysis(textId, text.content);
    if (cachedAnalysis) {
      return cachedAnalysis;
    }
    
    // Cache miss - perform analysis and cache the result
    const analysis = TextAnalyzer.analyzeText(text.content);
    await this.cacheService.cacheTextAnalysis(textId, text.content, analysis);
    
    return analysis;
  }

  async getWordCount(textId: string, userId: string): Promise<number> {
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedWordCount = await this.cacheService.getCachedAnalysisComponent(textId, 'wordCount', text.content);
    if (cachedWordCount !== null) {
      return cachedWordCount;
    }
    
    // Cache miss - get from full analysis and cache the component
    const analysis = await this.analyzeText(textId, userId);
    await this.cacheService.cacheAnalysisComponent(textId, 'wordCount', analysis.wordCount);
    
    return analysis.wordCount;
  }

  async getCharacterCount(textId: string, userId: string): Promise<number> {
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedCharacterCount = await this.cacheService.getCachedAnalysisComponent(textId, 'characterCount', text.content);
    if (cachedCharacterCount !== null) {
      return cachedCharacterCount;
    }
    
    // Cache miss - get from full analysis and cache the component
    const analysis = await this.analyzeText(textId, userId);
    await this.cacheService.cacheAnalysisComponent(textId, 'characterCount', analysis.characterCount);
    
    return analysis.characterCount;
  }

  async getSentenceCount(textId: string, userId: string): Promise<number> {
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedSentenceCount = await this.cacheService.getCachedAnalysisComponent(textId, 'sentenceCount', text.content);
    if (cachedSentenceCount !== null) {
      return cachedSentenceCount;
    }
    
    // Cache miss - get from full analysis and cache the component
    const analysis = await this.analyzeText(textId, userId);
    await this.cacheService.cacheAnalysisComponent(textId, 'sentenceCount', analysis.sentenceCount);
    
    return analysis.sentenceCount;
  }

  async getParagraphCount(textId: string, userId: string): Promise<number> {
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedParagraphCount = await this.cacheService.getCachedAnalysisComponent(textId, 'paragraphCount', text.content);
    if (cachedParagraphCount !== null) {
      return cachedParagraphCount;
    }
    
    // Cache miss - get from full analysis and cache the component
    const analysis = await this.analyzeText(textId, userId);
    await this.cacheService.cacheAnalysisComponent(textId, 'paragraphCount', analysis.paragraphCount);
    
    return analysis.paragraphCount;
  }

  async getLongestWords(textId: string, userId: string): Promise<string[]> {
    const text = await this.getTextById(textId, userId);
    
    // Try to get from cache first
    const cachedLongestWords = await this.cacheService.getCachedAnalysisComponent(textId, 'longestWords', text.content);
    if (cachedLongestWords !== null) {
      return cachedLongestWords;
    }
    
    // Cache miss - get from full analysis and cache the component
    const analysis = await this.analyzeText(textId, userId);
    await this.cacheService.cacheAnalysisComponent(textId, 'longestWords', analysis.longestWords);
    
    return analysis.longestWords;
  }

  // Add cache health and stats methods for monitoring
  async getCacheHealth(): Promise<boolean> {
    return await this.cacheService.isHealthy();
  }

  async getCacheStats(): Promise<any> {
    return await this.cacheService.getCacheStats();
  }
}
