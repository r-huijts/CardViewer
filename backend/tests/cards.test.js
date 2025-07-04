const request = require('supertest');
const express = require('express');
const session = require('express-session');
const path = require('path');
const cardRoutes = require('../src/routes/cards');
const authRoutes = require('../src/routes/auth');
const { initTestDb } = require('./setup');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);

describe('Cards Endpoints', () => {
  let authenticatedAgent;

  beforeAll(async () => {
    await initTestDb();
    
    // Create an authenticated agent
    authenticatedAgent = request.agent(app);
    await authenticatedAgent
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpass'
      });
  });

  describe('GET /api/cards', () => {
    test('should get all cards', async () => {
      const response = await request(app)
        .get('/api/cards');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
    });
  });

  describe('GET /api/cards/:id', () => {
    test('should get a specific card', async () => {
      const response = await request(app)
        .get('/api/cards/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title');
    });

    test('should return 404 for non-existent card', async () => {
      const response = await request(app)
        .get('/api/cards/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('POST /api/cards', () => {
    test('should create a new card when authenticated', async () => {
      const newCard = {
        title: 'New Test Card',
        subtitle: 'Test Subtitle',
        description: 'Test Description'
      };

      const response = await authenticatedAgent
        .post('/api/cards')
        .send(newCard);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newCard.title);
      expect(response.body.subtitle).toBe(newCard.subtitle);
      expect(response.body.description).toBe(newCard.description);
    });

    test('should reject creating card without authentication', async () => {
      const newCard = {
        title: 'Unauthorized Card',
        description: 'Should not be created'
      };

      const response = await request(app)
        .post('/api/cards')
        .send(newCard);

      expect(response.status).toBe(401);
    });

    test('should reject creating card without title', async () => {
      const newCard = {
        description: 'Card without title'
      };

      const response = await authenticatedAgent
        .post('/api/cards')
        .send(newCard);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title is required');
    });
  });

  describe('PUT /api/cards/:id', () => {
    test('should update an existing card when authenticated', async () => {
      const updatedData = {
        title: 'Updated Card Title',
        subtitle: 'Updated Subtitle',
        description: 'Updated Description'
      };

      const response = await authenticatedAgent
        .put('/api/cards/1')
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
      expect(response.body.subtitle).toBe(updatedData.subtitle);
      expect(response.body.description).toBe(updatedData.description);
    });

    test('should reject updating card without authentication', async () => {
      const updatedData = {
        title: 'Unauthorized Update'
      };

      const response = await request(app)
        .put('/api/cards/1')
        .send(updatedData);

      expect(response.status).toBe(401);
    });

    test('should return 404 for non-existent card', async () => {
      const updatedData = {
        title: 'Updated Title'
      };

      const response = await authenticatedAgent
        .put('/api/cards/999')
        .send(updatedData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Card not found');
    });
  });

  describe('DELETE /api/cards/:id', () => {
    test('should delete a card when authenticated', async () => {
      const response = await authenticatedAgent
        .delete('/api/cards/2');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Card deleted successfully');

      // Verify card is deleted
      const getResponse = await request(app)
        .get('/api/cards/2');
      expect(getResponse.status).toBe(404);
    });

    test('should reject deleting card without authentication', async () => {
      const response = await request(app)
        .delete('/api/cards/1');

      expect(response.status).toBe(401);
    });

    test('should return 404 for non-existent card', async () => {
      const response = await authenticatedAgent
        .delete('/api/cards/999');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Card not found');
    });
  });
});