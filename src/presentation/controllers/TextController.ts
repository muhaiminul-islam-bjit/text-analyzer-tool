import { Response } from 'express';
import { TextService } from '../../application/TextService';
import { MongoTextRepository } from '../../infrastructure/repositories/MongoTextRepository';
import { createTextValidation, updateTextValidation, textIdValidation } from '../validation/textValidation';
import { logger } from '../../infrastructure/logging/logger';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const textRepository = new MongoTextRepository();
const textService = new TextService(textRepository);

export class TextController {
  async createText(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = createTextValidation.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const text = await textService.createText(req.user!.userId, value);
      
      res.status(201).json({
        message: 'Text created successfully',
        text: {
          id: text.id,
          title: text.title,
          content: text.content,
          createdAt: text.createdAt,
          updatedAt: text.updatedAt,
        },
      });
    } catch (error: any) {
      logger.error('Text creation error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async getTexts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const texts = await textService.getUserTexts(req.user!.userId);
      
      res.status(200).json({
        message: 'Texts retrieved successfully',
        texts: texts.map(text => ({
          id: text.id,
          title: text.title,
          content: text.content,
          createdAt: text.createdAt,
          updatedAt: text.updatedAt,
        })),
      });
    } catch (error: any) {
      logger.error('Get texts error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async getTextById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate text ID
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const text = await textService.getTextById(req.params.id, req.user!.userId);
      
      res.status(200).json({
        message: 'Text retrieved successfully',
        text: {
          id: text.id,
          title: text.title,
          content: text.content,
          createdAt: text.createdAt,
          updatedAt: text.updatedAt,
        },
      });
    } catch (error: any) {
      logger.error('Get text error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async updateText(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate text ID
      const idValidation = textIdValidation.validate(req.params.id);
      if (idValidation.error) {
        res.status(400).json({ error: idValidation.error.details[0].message });
        return;
      }

      // Validate input
      const { error, value } = updateTextValidation.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const text = await textService.updateText(req.params.id, req.user!.userId, value);
      
      res.status(200).json({
        message: 'Text updated successfully',
        text: {
          id: text.id,
          title: text.title,
          content: text.content,
          createdAt: text.createdAt,
          updatedAt: text.updatedAt,
        },
      });
    } catch (error: any) {
      logger.error('Update text error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async deleteText(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Validate text ID
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      await textService.deleteText(req.params.id, req.user!.userId);
      
      res.status(200).json({
        message: 'Text deleted successfully',
      });
    } catch (error: any) {
      logger.error('Delete text error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  // Text Analysis Endpoints
  async getWordCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const wordCount = await textService.getWordCount(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        wordCount,
      });
    } catch (error: any) {
      logger.error('Get word count error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getCharacterCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const characterCount = await textService.getCharacterCount(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        characterCount,
      });
    } catch (error: any) {
      logger.error('Get character count error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getSentenceCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const sentenceCount = await textService.getSentenceCount(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        sentenceCount,
      });
    } catch (error: any) {
      logger.error('Get sentence count error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getParagraphCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const paragraphCount = await textService.getParagraphCount(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        paragraphCount,
      });
    } catch (error: any) {
      logger.error('Get paragraph count error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getLongestWords(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const longestWords = await textService.getLongestWords(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        longestWords,
      });
    } catch (error: any) {
      logger.error('Get longest words error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }

  async getFullAnalysis(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { error } = textIdValidation.validate(req.params.id);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const analysis = await textService.analyzeText(req.params.id, req.user!.userId);
      
      res.status(200).json({
        textId: req.params.id,
        analysis,
      });
    } catch (error: any) {
      logger.error('Get full analysis error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 
                        error.message.includes('Unauthorized') ? 403 : 500;
      res.status(statusCode).json({ error: error.message });
    }
  }
}
