const request = require('supertest');
const app = require('../app');
const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock the database
jest.mock('../config/database');

// Mock bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'TEAM_MEMBER',
        failed_attempts: 0,
        lock_until: null,
      };

      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token', 'mocked-token');
      expect(response.body.user).toHaveProperty('id', 'user-id');
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE users SET lastLogin = NOW() WHERE id = ?',
        ['user-id']
      );
    });

    it('should return 401 for invalid credentials', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'TEAM_MEMBER',
        failed_attempts: 0,
        lock_until: null,
      };

      db.query.mockResolvedValue([[mockUser]]);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong-password' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should lock account after 3 failed attempts', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'TEAM_MEMBER',
        failed_attempts: 2,
        lock_until: null,
      };

      db.query
        .mockResolvedValueOnce([[mockUser]]) // findByEmail
        .mockResolvedValueOnce([]) // incrementFailedAttempts
        .mockResolvedValueOnce([[{ failed_attempts: 3 }]]) // findByEmail after increment
        .mockResolvedValueOnce([]); // lockAccount

      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong-password' });

      expect(response.status).toBe(423);
      expect(response.body.message).toContain('Account locked');
    });

    it('should return 423 for locked account', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'TEAM_MEMBER',
        failed_attempts: 3,
        lock_until: new Date(Date.now() + 10000), // future date
      };

      db.query.mockResolvedValue([[mockUser]]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(423);
      expect(response.body.message).toContain('temporarily locked');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      db.query.mockResolvedValue([]);
      bcrypt.hash.mockResolvedValue('hashed-password');

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'new@example.com',
          password: 'password',
          first_name: 'First',
          last_name: 'Last',
          role: 'TEAM_MEMBER',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});