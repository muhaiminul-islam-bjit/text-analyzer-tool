import { Text, CreateTextRequest, UpdateTextRequest, TextAnalysis } from '../domain/entities/Text';
import { TextRepository } from '../domain/repositories/TextRepository';
import { TextAnalyzer } from './TextAnalyzer';
import { logger } from '../infrastructure/logging/logger';

export class TextService {
  constructor(private textRepository: TextRepository) {}

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
    return await this.textRepository.findByUserId(userId);
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

    logger.info(`Text deleted successfully with ID: ${textId}`);
  }

  async analyzeText(textId: string, userId: string): Promise<TextAnalysis> {
    logger.info(`Analyzing text with ID: ${textId} for user: ${userId}`);
    
    const text = await this.getTextById(textId, userId);
    
    return TextAnalyzer.analyzeText(text.content);
  }

  async getWordCount(textId: string, userId: string): Promise<number> {
    const analysis = await this.analyzeText(textId, userId);
    return analysis.wordCount;
  }

  async getCharacterCount(textId: string, userId: string): Promise<number> {
    const analysis = await this.analyzeText(textId, userId);
    return analysis.characterCount;
  }

  async getSentenceCount(textId: string, userId: string): Promise<number> {
    const analysis = await this.analyzeText(textId, userId);
    return analysis.sentenceCount;
  }

  async getParagraphCount(textId: string, userId: string): Promise<number> {
    const analysis = await this.analyzeText(textId, userId);
    return analysis.paragraphCount;
  }

  async getLongestWords(textId: string, userId: string): Promise<string[]> {
    const analysis = await this.analyzeText(textId, userId);
    return analysis.longestWords;
  }
}
