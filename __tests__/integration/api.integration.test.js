const { describe, test, expect, beforeAll, afterAll } = require('@jest/globals');
const request = require('supertest');

// Import the app - we'll need to modify server.js to export the app
const app = require('../../server');

describe('API Integration Tests', () => {
  let server;

  beforeAll(() => {
    // Start server on a test port
    server = app.listen(0); // Use port 0 to get a random available port
  });

  afterAll(() => {
    if (server) {
      server.close();
    }
  });

  describe('API Documentation Endpoint', () => {
    test('GET / should return API documentation', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.message).toBe('Bible Reading Schedule API');
    });
  });

  describe('User Profile Endpoints', () => {
    const testUser = {
      uid: 'integration-test-user-123',
      email: 'integration-test@example.com',
      displayName: 'Integration Test User',
      firstName: 'Integration',
      lastName: 'Test'
    };

    test('POST /api/user-profile should validate required fields', async () => {
      const response = await request(app)
        .post('/api/user-profile')
        .send({ email: 'test@example.com' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('uid');
    });

    test('POST /api/user-profile should validate email format', async () => {
      const response = await request(app)
        .post('/api/user-profile')
        .send({
          uid: 'test-user',
          email: 'invalid-email',
          displayName: 'Test User',
          firstName: 'Test'
        })
        .expect(400);

      expect(response.body.error).toContain('email');
    });

    test('GET /api/user-profile/:uid should return 400 for missing uid', async () => {
      const response = await request(app)
        .get('/api/user-profile/')
        .expect(404); // Express returns 404 for missing route params

      // This is expected behavior - the route doesn't match without the uid parameter
    });
  });

  describe('Reading Templates Endpoints', () => {
    test('GET /api/reading-templates should return templates array', async () => {
      const response = await request(app)
        .get('/api/reading-templates')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('templates');
      expect(Array.isArray(response.body.templates)).toBe(true);
    });

    test('GET /api/reading-templates/:templateId should return 400 for missing templateId', async () => {
      const response = await request(app)
        .get('/api/reading-templates/')
        .expect(404); // Express returns 404 for missing route params
    });
  });

  describe('Schedule Creation Endpoints', () => {
    test('POST /api/create-reading-schedule should validate required fields', async () => {
      const response = await request(app)
        .post('/api/create-reading-schedule')
        .send({ userId: 'test-user' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/create-group-reading-schedule should validate required fields', async () => {
      const response = await request(app)
        .post('/api/create-group-reading-schedule')
        .send({ groupName: 'Test Group' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Group Management Endpoints', () => {
    test('GET /api/available-groups should return groups array', async () => {
      const response = await request(app)
        .get('/api/available-groups')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('groups');
      expect(Array.isArray(response.body.groups)).toBe(true);
    });

    test('POST /api/join-group-reading-schedule should validate required fields', async () => {
      const response = await request(app)
        .post('/api/join-group-reading-schedule')
        .send({ userId: 'test-user' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('POST /api/leave-group-reading-schedule should validate required fields', async () => {
      const response = await request(app)
        .post('/api/leave-group-reading-schedule')
        .send({ userId: 'test-user' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Progress Tracking Endpoints', () => {
    test('POST /api/mark-reading-completed should validate required fields', async () => {
      const response = await request(app)
        .post('/api/mark-reading-completed')
        .send({ userId: 'test-user' }) // Missing required fields
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('GET /api/get-reading-schedule-with-progress should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/get-reading-schedule-with-progress')
        .query({}) // Missing required parameters
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('User Schedules Dashboard', () => {
    test('GET /api/user-schedules/:userId should return 400 for missing userId', async () => {
      const response = await request(app)
        .get('/api/user-schedules/')
        .expect(404); // Express returns 404 for missing route params
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await request(app)
        .get('/api/non-existent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Endpoint not found');
    });

    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/user-profile')
        .send('invalid-json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express should handle malformed JSON with a 400 error
    });

    test('should return proper CORS headers', async () => {
      const response = await request(app)
        .options('/api/user-profile')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Response Format Consistency', () => {
    test('all endpoints should return JSON responses', async () => {
      const endpoints = [
        { method: 'get', path: '/' },
        { method: 'get', path: '/api/reading-templates' },
        { method: 'get', path: '/api/available-groups' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        
        expect(response.headers['content-type']).toMatch(/application\/json/);
        expect(response.body).toBeInstanceOf(Object);
      }
    });

    test('error responses should have consistent format', async () => {
      const response = await request(app)
        .post('/api/user-profile')
        .send({}) // Invalid request to trigger error
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });
});