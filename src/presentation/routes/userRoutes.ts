import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middleware/authMiddleware';
import { authRateLimit, registrationRateLimit } from '../middleware/rateLimitMiddleware';

const router = Router();
const userController = new UserController();

router.post('/register', registrationRateLimit, (req, res) => userController.register(req, res));
router.post('/login', authRateLimit, (req, res) => userController.login(req, res));
router.get('/', authenticateToken, (req, res) => userController.getAllUsers(req, res));

export default router;
