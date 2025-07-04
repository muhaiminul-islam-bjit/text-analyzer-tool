import request from 'supertest';
import { createTestApp } from '../testApp';

describe('User Login', () => {
  const app = createTestApp();

  const userData = {
    email: 'test@example.com',
    password: 'password123'
  };

  beforeEach(async () => {
    // Register a user before each test
    await request(app)
      .post('/api/users/register')
      .send(userData);
  });

  describe('POST /api/users/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(userData)
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login successful',
        token: expect.any(String),
        user: {
          id: expect.any(String),
          email: userData.email
        }
      });

      // Verify token is a valid JWT format
      expect(response.body.token).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/);
    });

    it('should return validation error for invalid email format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);
    });

    it('should return validation error for missing email', async () => {
      const invalidData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/email/i);
    });

    it('should return validation error for missing password', async () => {
      const invalidData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/password/i);
    });

    it('should return error for non-existent user', async () => {
      const nonExistentUser = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(nonExistentUser)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/invalid.*email.*password/i);
    });

    it('should return error for wrong password', async () => {
      const wrongPasswordData = {
        email: userData.email,
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(wrongPasswordData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/invalid.*email.*password/i);
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(userData)
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
