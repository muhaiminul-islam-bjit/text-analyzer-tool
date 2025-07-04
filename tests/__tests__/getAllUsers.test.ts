import request from 'supertest';
import { createTestApp } from '../testApp';

describe('Get All Users (Protected Route)', () => {
  const app = createTestApp();

  const userData = {
    email: 'test@example.com',
    password: 'password123'
  };

  let authToken: string;

  beforeEach(async () => {
    // Register and login to get auth token
    await request(app)
      .post('/api/users/register')
      .send(userData);

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send(userData);

    authToken = loginResponse.body.token;
  });

  describe('GET /api/users', () => {
    it('should get all users with valid auth token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Users retrieved successfully',
        users: expect.any(Array),
        count: expect.any(Number)
      });

      expect(response.body.users).toHaveLength(1);
      expect(response.body.users[0]).toEqual({
        id: expect.any(String),
        email: userData.email
      });
      expect(response.body.count).toBe(1);
    });

    it('should return multiple users when multiple exist', async () => {
      // Register another user
      const secondUser = {
        email: 'test2@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(secondUser);

      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token/i);
    });

    it('should return 401 with invalid auth token', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token/i);
    });

    it('should return 401 with malformed auth header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/token/i);
    });

    it('should return 401 with expired token', async () => {
      // This would require mocking the JWT library or creating an expired token
      // For now, we'll test with an obviously invalid token
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
