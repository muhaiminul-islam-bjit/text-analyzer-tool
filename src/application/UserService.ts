import { CreateUserRequest, LoginRequest, LoginResponse, User } from '../domain/entities/User';
import { UserRepository } from '../domain/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '../infrastructure/logging/logger';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async register(userData: CreateUserRequest): Promise<User> {
    logger.info(`Attempting to register user with email: ${userData.email}`);
    
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    const user: User = {
      email: userData.email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdUser = await this.userRepository.create(user);
    logger.info(`User registered successfully with ID: ${createdUser.id}`);
    
    return createdUser;
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    logger.info(`Attempting to login user with email: ${loginData.email}`);
    
    // Find user by email
    const user = await this.userRepository.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in successfully with ID: ${user.id}`);

    return {
      token,
      user: {
        id: user.id!,
        email: user.email,
      },
    };
  }

  async getAllUsers(): Promise<User[]> {
    logger.info('Fetching all users');
    
    const users = await this.userRepository.findAll();
    
    // Remove password field from response for security
    const sanitizedUsers = users.map(user => ({
      id: user.id!,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    logger.info(`Retrieved ${sanitizedUsers.length} users`);
    return sanitizedUsers as User[];
  }
}
