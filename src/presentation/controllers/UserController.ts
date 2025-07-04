import { Request, Response } from 'express';
import { UserService } from '../../application/UserService';
import { MongoUserRepository } from '../../infrastructure/repositories/MongoUserRepository';
import { registerValidation, loginValidation } from '../validation/userValidation';
import { logger } from '../../infrastructure/logging/logger';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const userRepository = new MongoUserRepository();
const userService = new UserService(userRepository);

export class UserController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = registerValidation.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const user = await userService.register(value);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          email: user.email,
        },
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validate input
      const { error, value } = loginValidation.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const result = await userService.login(value);
      
      res.status(200).json({
        message: 'Login successful',
        ...result,
      });
    } catch (error: any) {
      logger.error('Login error:', error);
      res.status(401).json({ error: error.message });
    }
  }

  async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        message: 'Users retrieved successfully',
        users,
        count: users.length,
      });
    } catch (error: any) {
      logger.error('Get all users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
