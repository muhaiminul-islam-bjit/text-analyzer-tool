import { TextService } from '../../src/application/TextService';
import { TextRepository } from '../../src/domain/repositories/TextRepository';
import { Text, CreateTextRequest, UpdateTextRequest } from '../../src/domain/entities/Text';

// Mock the TextRepository
const mockTextRepository: jest.Mocked<TextRepository> = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock the logger
jest.mock('../../src/infrastructure/logging/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TextService', () => {
  let textService: TextService;
  const userId = 'user123';
  const textId = 'text123';

  beforeEach(() => {
    textService = new TextService(mockTextRepository);
    jest.clearAllMocks();
  });

  describe('createText', () => {
    it('should create a new text successfully', async () => {
      const createRequest: CreateTextRequest = {
        title: 'Test Title',
        content: 'Test content here.',
      };

      const expectedText: Text = {
        id: textId,
        title: createRequest.title,
        content: createRequest.content,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.create.mockResolvedValue(expectedText);

      const result = await textService.createText(userId, createRequest);

      expect(mockTextRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createRequest.title,
          content: createRequest.content,
          userId,
        })
      );
      expect(result).toEqual(expectedText);
    });
  });

  describe('getTextById', () => {
    it('should return text when found and user is authorized', async () => {
      const text: Text = {
        id: textId,
        title: 'Test Title',
        content: 'Test content',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(text);

      const result = await textService.getTextById(textId, userId);

      expect(mockTextRepository.findById).toHaveBeenCalledWith(textId);
      expect(result).toEqual(text);
    });

    it('should throw error when text not found', async () => {
      mockTextRepository.findById.mockResolvedValue(null);

      await expect(textService.getTextById(textId, userId))
        .rejects.toThrow('Text not found');
    });

    it('should throw error when user is not authorized', async () => {
      const text: Text = {
        id: textId,
        title: 'Test Title',
        content: 'Test content',
        userId: 'differentUser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(text);

      await expect(textService.getTextById(textId, userId))
        .rejects.toThrow('Unauthorized access to text');
    });
  });

  describe('getUserTexts', () => {
    it('should return all texts for a user', async () => {
      const texts: Text[] = [
        {
          id: 'text1',
          title: 'Title 1',
          content: 'Content 1',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'text2',
          title: 'Title 2',
          content: 'Content 2',
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockTextRepository.findByUserId.mockResolvedValue(texts);

      const result = await textService.getUserTexts(userId);

      expect(mockTextRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(texts);
    });
  });

  describe('updateText', () => {
    it('should update text successfully', async () => {
      const existingText: Text = {
        id: textId,
        title: 'Old Title',
        content: 'Old content',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updateRequest: UpdateTextRequest = {
        title: 'New Title',
        content: 'New content',
      };

      const updatedText: Text = {
        ...existingText,
        ...updateRequest,
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(existingText);
      mockTextRepository.update.mockResolvedValue(updatedText);

      const result = await textService.updateText(textId, userId, updateRequest);

      expect(mockTextRepository.update).toHaveBeenCalledWith(
        textId,
        expect.objectContaining(updateRequest)
      );
      expect(result).toEqual(updatedText);
    });

    it('should throw error when update fails', async () => {
      const existingText: Text = {
        id: textId,
        title: 'Old Title',
        content: 'Old content',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(existingText);
      mockTextRepository.update.mockResolvedValue(null);

      await expect(textService.updateText(textId, userId, { title: 'New Title' }))
        .rejects.toThrow('Failed to update text');
    });
  });

  describe('deleteText', () => {
    it('should delete text successfully', async () => {
      const existingText: Text = {
        id: textId,
        title: 'Title',
        content: 'Content',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(existingText);
      mockTextRepository.delete.mockResolvedValue(true);

      await textService.deleteText(textId, userId);

      expect(mockTextRepository.delete).toHaveBeenCalledWith(textId);
    });

    it('should throw error when delete fails', async () => {
      const existingText: Text = {
        id: textId,
        title: 'Title',
        content: 'Content',
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTextRepository.findById.mockResolvedValue(existingText);
      mockTextRepository.delete.mockResolvedValue(false);

      await expect(textService.deleteText(textId, userId))
        .rejects.toThrow('Failed to delete text');
    });
  });

  describe('Text Analysis Methods', () => {
    const sampleText: Text = {
      id: textId,
      title: 'Sample',
      content: 'The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      mockTextRepository.findById.mockResolvedValue(sampleText);
    });

    describe('analyzeText', () => {
      it('should return complete analysis', async () => {
        const result = await textService.analyzeText(textId, userId);

        expect(result).toEqual({
          wordCount: 16,
          characterCount: 60,
          sentenceCount: 2,
          paragraphCount: 1,
          longestWords: expect.arrayContaining(['quick', 'brown', 'jumps', 'slept']),
        });
        expect(result.longestWords.length).toBe(4);
      });
    });

    describe('getWordCount', () => {
      it('should return word count', async () => {
        const result = await textService.getWordCount(textId, userId);
        expect(result).toBe(16);
      });
    });

    describe('getCharacterCount', () => {
      it('should return character count', async () => {
        const result = await textService.getCharacterCount(textId, userId);
        expect(result).toBe(60);
      });
    });

    describe('getSentenceCount', () => {
      it('should return sentence count', async () => {
        const result = await textService.getSentenceCount(textId, userId);
        expect(result).toBe(2);
      });
    });

    describe('getParagraphCount', () => {
      it('should return paragraph count', async () => {
        const result = await textService.getParagraphCount(textId, userId);
        expect(result).toBe(1);
      });
    });

    describe('getLongestWords', () => {
      it('should return longest words', async () => {
        const result = await textService.getLongestWords(textId, userId);
        expect(result).toEqual(expect.arrayContaining(['quick', 'brown', 'jumps', 'slept']));
      });
    });
  });
});
