import request from 'supertest';
import { createTestApp } from '../testApp';

// Simple test without database
describe('Health Endpoint - Simple Test', () => {
  const app = createTestApp();

  describe('GET /health', () => {
    it('should return health status when server is running', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'Server is running'
      });
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
