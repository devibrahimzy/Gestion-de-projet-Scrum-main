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

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue(),
  })),
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
        is_verified: true,
        failed_attempts: 0,
        lock_until: null,
      };

      db.query
        .mockResolvedValueOnce([[mockUser], {}]) // findByEmail
        .mockResolvedValueOnce([{ affectedRows: 1 }, {}]); // updateLastLogin
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
        is_verified: true,
        failed_attempts: 0,
        lock_until: null,
      };

      db.query.mockResolvedValue([[mockUser], {}]);
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
        is_verified: true,
        failed_attempts: 0,
        lock_until: null,
      };

      db.query
        .mockResolvedValueOnce([[mockUser], {}]) // findByEmail
        .mockResolvedValueOnce([{ affectedRows: 1 }, {}]) // incrementFailedAttempts
        .mockResolvedValueOnce([[{ failed_attempts: 3 }], {}]) // findByEmail after increment
        .mockResolvedValueOnce([{ affectedRows: 1 }, {}]); // lockAccount

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
        is_verified: true,
        failed_attempts: 3,
        lock_until: new Date(Date.now() + 10000), // future date
      };

      db.query.mockResolvedValue([[mockUser], {}]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(423);
      expect(response.body.message).toContain('temporarily locked');
    });

    it('should return 403 for unverified account', async () => {
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed-password',
        role: 'TEAM_MEMBER',
        is_verified: false,
        failed_attempts: 0,
        lock_until: null,
      };

      db.query.mockResolvedValue([[mockUser], {}]);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('not verified');
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      db.query
        .mockResolvedValueOnce([[], {}]) // findByEmail
        .mockResolvedValueOnce([[], {}]); // create
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
      expect(response.body.message).toBe('User created. Please check your email for verification code.');
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should return 400 if email already exists', async () => {
      db.query.mockResolvedValue([[{ id: 'existing-id' }], {}]); // findByEmail

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password',
          first_name: 'First',
          last_name: 'Last',
          role: 'TEAM_MEMBER',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists');
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

  describe('GET /api/auth/profile', () => {
    it('should return user profile', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query.mockResolvedValue([[{ id: 'user-id', email: 'test@example.com', first_name: 'First', last_name: 'Last', role: 'TEAM_MEMBER', created_at: '2023-01-01', profile_photo: null, projects: 'Project 1, Project 2' }], {}]);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('projects', 'Project 1, Project 2');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query.mockResolvedValue([{ affectedRows: 1 }, {}]);

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', 'Bearer valid-token')
        .send({ first_name: 'NewFirst', last_name: 'NewLast', profile_photo: 'http://example.com/photo.jpg' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
    });
  });

  describe('PUT /api/auth/change-password', () => {
    it('should change password successfully', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query
        .mockResolvedValueOnce([[{ password: 'hashed-old' }], {}]) // findById
        .mockResolvedValueOnce([{ affectedRows: 1 }, {}]); // changePassword
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('hashed-new');

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ old_password: 'oldpass', new_password: 'newpass123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should return 400 for incorrect old password', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query.mockResolvedValue([[{ password: 'hashed-old' }], {}]);
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', 'Bearer valid-token')
        .send({ old_password: 'wrongold', new_password: 'newpass123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Old password is incorrect');
    });
  });

  describe('PUT /api/auth/change-email', () => {
    it('should request email change', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query
        .mockResolvedValueOnce([[], {}]) // check existing email
        .mockResolvedValueOnce([{ affectedRows: 1 }, {}]); // update email

      const response = await request(app)
        .put('/api/auth/change-email')
        .set('Authorization', 'Bearer valid-token')
        .send({ new_email: 'new@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Email change requested');
    });

    it('should return 400 if email already exists', async () => {
      jwt.verify.mockReturnValue({ id: 'user-id', role: 'TEAM_MEMBER' });
      db.query.mockResolvedValue([[{ id: 'other-id' }], {}]); // existing email

      const response = await request(app)
        .put('/api/auth/change-email')
        .set('Authorization', 'Bearer valid-token')
        .send({ new_email: 'existing@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });
  });
});