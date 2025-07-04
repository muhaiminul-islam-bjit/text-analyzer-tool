import express, { Request, Response } from 'express';
import * as path from 'path';
import { connectToDatabase } from './infrastructure/database/mongoose';
import { connectToRedis } from './infrastructure/cache/redis';
import { logger } from './infrastructure/logging/logger';
import { generalRateLimit, healthCheckRateLimit } from './presentation/middleware/rateLimitMiddleware';
import userRoutes from './presentation/routes/userRoutes';
import textRoutes from './presentation/routes/textRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate client IP detection
app.set('trust proxy', 1);

app.use(express.json());

// Apply general rate limiting to all routes
app.use(generalRateLimit);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/texts', textRoutes);

app.get('/health', healthCheckRateLimit, (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    await connectToRedis();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
