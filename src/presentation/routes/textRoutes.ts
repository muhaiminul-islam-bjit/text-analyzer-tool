import { Router } from 'express';
import { TextController } from '../controllers/TextController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
const textController = new TextController();

// All text routes are protected - require authentication
router.use(authenticateToken);

// CRUD operations for texts
router.post('/', textController.createText.bind(textController));
router.get('/', textController.getTexts.bind(textController));
router.get('/:id', textController.getTextById.bind(textController));
router.put('/:id', textController.updateText.bind(textController));
router.delete('/:id', textController.deleteText.bind(textController));

// Text analysis endpoints
router.get('/:id/analysis', textController.getFullAnalysis.bind(textController));
router.get('/:id/words', textController.getWordCount.bind(textController));
router.get('/:id/characters', textController.getCharacterCount.bind(textController));
router.get('/:id/sentences', textController.getSentenceCount.bind(textController));
router.get('/:id/paragraphs', textController.getParagraphCount.bind(textController));
router.get('/:id/longest-words', textController.getLongestWords.bind(textController));

export default router;
