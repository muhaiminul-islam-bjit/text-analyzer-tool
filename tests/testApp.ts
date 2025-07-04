import express from 'express';
import userRoutes from '../src/presentation/routes/userRoutes';

export const createTestApp = () => {
  const app = express();
  
  app.use(express.json());
  
  // Routes
  app.use('/api/users', userRoutes);
  
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
  });
  
  return app;
};
