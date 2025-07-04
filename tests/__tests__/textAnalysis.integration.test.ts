import request from 'supertest';
import { Application } from 'express';
import jwt from 'jsonwebtoken';
import { testApp } from '../testApp';

let app: Application;
let authToken: string;
let userId: string;

// Test data
const exampleText = "The quick brown fox jumps over the lazy dog. The lazy dog slept in the sun.";

const testTextData = {
  title: 'Test Text',
  content: exampleText,
};

const testUser = {
  email: 'texttest@example.com',
  password: 'password123',
};

describe('Text Analysis API Integration Tests', () => {
  beforeAll(async () => {
    app = await testApp();
    
    // Register and login user to get auth token
    await request(app)
      .post('/api/users/register')
      .send(testUser);

    const loginResponse = await request(app)
      .post('/api/users/login')
      .send(testUser);

    authToken = loginResponse.body.token;
    userId = loginResponse.body.user.id;
  });

  describe('Text CRUD Operations', () => {
    let textId: string;

    describe('POST /api/texts', () => {
      it('should create a new text with authentication', async () => {
        const response = await request(app)
          .post('/api/texts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(testTextData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Text created successfully');
        expect(response.body.text).toMatchObject({
          title: testTextData.title,
          content: testTextData.content,
        });
        expect(response.body.text.id).toBeDefined();
        
        textId = response.body.text.id;
      });

      it('should reject text creation without authentication', async () => {
        const response = await request(app)
          .post('/api/texts')
          .send(testTextData);

        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Access token required');
      });

      it('should reject text creation with invalid data', async () => {
        const response = await request(app)
          .post('/api/texts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: '', // Invalid: empty title
            content: testTextData.content,
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Title must not be empty');
      });
    });

    describe('GET /api/texts', () => {
      it('should get all texts for authenticated user', async () => {
        const response = await request(app)
          .get('/api/texts')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Texts retrieved successfully');
        expect(Array.isArray(response.body.texts)).toBe(true);
        expect(response.body.texts.length).toBeGreaterThan(0);
      });

      it('should reject request without authentication', async () => {
        const response = await request(app)
          .get('/api/texts');

        expect(response.status).toBe(401);
      });
    });

    describe('GET /api/texts/:id', () => {
      it('should get specific text by ID', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Text retrieved successfully');
        expect(response.body.text).toMatchObject({
          id: textId,
          title: testTextData.title,
          content: testTextData.content,
        });
      });

      it('should return 404 for non-existent text', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        const response = await request(app)
          .get(`/api/texts/${fakeId}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Text not found');
      });

      it('should return 400 for invalid text ID format', async () => {
        const response = await request(app)
          .get('/api/texts/invalid-id')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid text ID format');
      });
    });

    describe('PUT /api/texts/:id', () => {
      it('should update text successfully', async () => {
        const updateData = {
          title: 'Updated Title',
          content: 'Updated content here.',
        };

        const response = await request(app)
          .put(`/api/texts/${textId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Text updated successfully');
        expect(response.body.text).toMatchObject(updateData);
      });

      it('should reject update with invalid data', async () => {
        const response = await request(app)
          .put(`/api/texts/${textId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({}); // Empty update

        expect(response.status).toBe(400);
        expect(response.body.error).toContain('At least one field');
      });
    });
  });

  describe('Text Analysis Endpoints', () => {
    let textId: string;

    beforeAll(async () => {
      // Create a text for analysis
      const response = await request(app)
        .post('/api/texts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTextData);
      
      textId = response.body.text.id;
    });

    describe('GET /api/texts/:id/analysis', () => {
      it('should return complete text analysis', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/analysis`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.analysis).toMatchObject({
          wordCount: expect.any(Number),
          characterCount: expect.any(Number),
          sentenceCount: expect.any(Number),
          paragraphCount: expect.any(Number),
          longestWords: expect.any(Array),
        });
      });
    });

    describe('GET /api/texts/:id/words', () => {
      it('should return word count', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/words`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.wordCount).toBe(15);
      });
    });

    describe('GET /api/texts/:id/characters', () => {
      it('should return character count', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/characters`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.characterCount).toBe(60);
      });
    });

    describe('GET /api/texts/:id/sentences', () => {
      it('should return sentence count', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/sentences`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.sentenceCount).toBe(2);
      });
    });

    describe('GET /api/texts/:id/paragraphs', () => {
      it('should return paragraph count', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/paragraphs`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.paragraphCount).toBe(1);
      });
    });

    describe('GET /api/texts/:id/longest-words', () => {
      it('should return longest words in paragraphs', async () => {
        const response = await request(app)
          .get(`/api/texts/${textId}/longest-words`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
        expect(response.body.textId).toBe(textId);
        expect(response.body.longestWords).toEqual(
          expect.arrayContaining(['quick', 'brown', 'jumps', 'slept'])
        );
      });
    });

    describe('Authorization checks for analysis endpoints', () => {
      it('should reject analysis requests without authentication', async () => {
        const endpoints = [
          '/analysis',
          '/words',
          '/characters',
          '/sentences',
          '/paragraphs',
          '/longest-words'
        ];

        for (const endpoint of endpoints) {
          const response = await request(app)
            .get(`/api/texts/${textId}${endpoint}`);

          expect(response.status).toBe(401);
        }
      });
    });
  });

  describe('Cross-user access control', () => {
    let otherUserToken: string;
    let textId: string;

    beforeAll(async () => {
      // Create another user
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
      };

      await request(app)
        .post('/api/users/register')
        .send(otherUser);

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send(otherUser);

      otherUserToken = loginResponse.body.token;

      // Create a text with the original user
      const textResponse = await request(app)
        .post('/api/texts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTextData);

      textId = textResponse.body.text.id;
    });

    it('should prevent unauthorized access to other users texts', async () => {
      const response = await request(app)
        .get(`/api/texts/${textId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized access to text');
    });

    it('should prevent unauthorized analysis of other users texts', async () => {
      const response = await request(app)
        .get(`/api/texts/${textId}/words`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Unauthorized access to text');
    });
  });

  describe('DELETE /api/texts/:id', () => {
    it('should delete text successfully', async () => {
      // Create a text to delete
      const createResponse = await request(app)
        .post('/api/texts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testTextData);

      const textId = createResponse.body.text.id;

      const deleteResponse = await request(app)
        .delete(`/api/texts/${textId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Text deleted successfully');

      // Verify text is deleted
      const getResponse = await request(app)
        .get(`/api/texts/${textId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
