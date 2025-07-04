import request from 'supertest';
import { createTestApp } from '../testApp';

describe('Integration Tests - Complete User Flow', () => {
  const app = createTestApp();

  describe('Complete user registration and authentication flow', () => {
    const userData = {
      email: 'integration@example.com',
      password: 'password123'
    };

    it('should complete the full user journey', async () => {
      // 1. Check health endpoint
      const healthResponse = await request(app)
        .get('/health')
        .expect(200);

      expect(healthResponse.body.status).toBe('OK');

      // 2. Register a new user
      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.message).toBe('User registered successfully');
      expect(registerResponse.body.user.email).toBe(userData.email);

      // 3. Login with registered user
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send(userData)
        .expect(200);

      expect(loginResponse.body.message).toBe('Login successful');
      expect(loginResponse.body.token).toBeDefined();
      const authToken = loginResponse.body.token;

      // 4. Access protected route with token
      const getUsersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getUsersResponse.body.message).toBe('Users retrieved successfully');
      expect(getUsersResponse.body.users).toHaveLength(1);
      expect(getUsersResponse.body.users[0].email).toBe(userData.email);

      // 5. Verify cannot access protected route without token
      await request(app)
        .get('/api/users')
        .expect(401);
    });

    it('should handle multiple users in the system', async () => {
      const users = [
        { email: 'user1@example.com', password: 'password123' },
        { email: 'user2@example.com', password: 'password123' },
        { email: 'user3@example.com', password: 'password123' }
      ];

      // Register all users
      for (const user of users) {
        await request(app)
          .post('/api/users/register')
          .send(user)
          .expect(201);
      }

      // Login with first user
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send(users[0])
        .expect(200);

      const authToken = loginResponse.body.token;

      // Get all users
      const getUsersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getUsersResponse.body.users).toHaveLength(3);
      expect(getUsersResponse.body.count).toBe(3);

      // Verify all user emails are present
      const emails = getUsersResponse.body.users.map((user: any) => user.email);
      expect(emails).toContain(users[0].email);
      expect(emails).toContain(users[1].email);
      expect(emails).toContain(users[2].email);
    });
  });
});
