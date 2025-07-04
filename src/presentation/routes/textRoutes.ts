import { Router } from 'express';
import { TextController } from '../controllers/TextController';
import { authenticateToken } from '../middleware/authMiddleware';
import { analysisRateLimit, textModificationRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();
const textController = new TextController();

// All text routes are protected - require authentication
router.use(authenticateToken);

// CRUD operations for texts (with modification rate limiting)
router.post('/', textModificationRateLimit, textController.createText.bind(textController));
router.get('/', textController.getTexts.bind(textController));
router.get('/:id', textController.getTextById.bind(textController));
router.put('/:id', textModificationRateLimit, textController.updateText.bind(textController));
router.delete('/:id', textModificationRateLimit, textController.deleteText.bind(textController));

// Text analysis endpoints (with analysis rate limiting)
router.get('/:id/analysis', analysisRateLimit, textController.getFullAnalysis.bind(textController));
router.get('/:id/words', analysisRateLimit, textController.getWordCount.bind(textController));
router.get('/:id/characters', analysisRateLimit, textController.getCharacterCount.bind(textController));
router.get('/:id/sentences', analysisRateLimit, textController.getSentenceCount.bind(textController));
router.get('/:id/paragraphs', analysisRateLimit, textController.getParagraphCount.bind(textController));
router.get('/:id/longest-words', analysisRateLimit, textController.getLongestWords.bind(textController));

// Cache monitoring endpoints (no specific rate limiting - uses general)
router.get('/cache/health', textController.getCacheHealth.bind(textController));
router.get('/cache/stats', textController.getCacheStats.bind(textController));

export default router;
