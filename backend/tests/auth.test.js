const request = require('supertest');
const express = require('express');
const session = require('express-session');
const authRoutes = require('../src/routes/auth');
const { initTestDb } = require('./setup');

const app = express();
app.use(express.json());
app.use(session({
  secret: 'test-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.username).toBe('testuser');
    });

    test('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should reject missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'testpass'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });

    test('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Username and password required');
    });
  });

  describe('GET /api/auth/status', () => {
    test('should return unauthenticated status for no session', async () => {
      const response = await request(app)
        .get('/api/auth/status');

      expect(response.status).toBe(200);
      expect(response.body.authenticated).toBe(false);
    });

    test('should return authenticated status for valid session', async () => {
      const agent = request.agent(app);
      
      // First login
      await agent
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      // Then check status
      const response = await agent
        .get('/api/auth/status');

      expect(response.status).toBe(200);
      expect(response.body.authenticated).toBe(true);
      expect(response.body.user.username).toBe('testuser');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      const agent = request.agent(app);
      
      // First login
      await agent
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      // Then logout
      const response = await agent
        .post('/api/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout successful');

      // Verify session is destroyed
      const statusResponse = await agent
        .get('/api/auth/status');
      expect(statusResponse.body.authenticated).toBe(false);
    });
  });
});