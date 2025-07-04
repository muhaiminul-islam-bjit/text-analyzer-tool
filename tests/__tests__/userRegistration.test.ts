import request from 'supertest';
import { createTestApp } from '../testApp';

describe('User Registration', () => {
  const app = createTestApp();

  describe('POST /api/users/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User registered successfully',
        user: {
          id: expect.any(String),
          email: validUserData.email
        }
      });
    });

    it('should return validation error for invalid email', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
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
        .post('/api/users/register')
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
        .post('/api/users/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/password/i);
    });

    it('should return validation error for short password', async () => {
      const invalidData = {
        email: 'test@example.com',
        password: '123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/password/i);
    });

    it('should return error when trying to register with existing email', async () => {
      // First registration
      await request(app)
        .post('/api/users/register')
        .send(validUserData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/users/register')
        .send(validUserData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/already exists/i);
    });

    it('should return JSON content type', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send(validUserData)
        .expect(201);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
