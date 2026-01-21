const request = require('supertest');
const app = require('../app');
const db = require('../config/database');

// Mock the database
jest.mock('../config/database');

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid'),
}));

describe('Backlog Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock jwt.verify
    require('jsonwebtoken').verify.mockReturnValue({ id: 'user-1', role: 'TEAM_MEMBER' });
  });

  describe('POST /api/backlog', () => {
    it('should create a backlog item successfully', async () => {
      db.query
        .mockResolvedValueOnce([[{ role: 'PRODUCT_OWNER' }], {}]) // isMember
        .mockResolvedValueOnce([[], {}]) // create

      const response = await request(app)
        .post('/api/backlog')
        .set('Authorization', 'Bearer valid-token')
        .send({
          project_id: 'proj-1',
          title: 'Test backlog item with proper length',
          description: 'Description',
          type: 'USER_STORY',
          story_points: 5,
          priority: 'HIGH',
          tags: ['tag1', 'tag2']
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Test backlog item with proper length');
    });

    it('should return 400 for invalid title length', async () => {
      const response = await request(app)
        .post('/api/backlog')
        .set('Authorization', 'Bearer valid-token')
        .send({
          project_id: 'proj-1',
          title: 'Short'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('10-200 characters');
    });
  });

  describe('GET /api/backlog', () => {
    it('should return backlog items with filters', async () => {
      db.query
        .mockResolvedValueOnce([[{ role: 'TEAM_MEMBER' }], {}]) // isMember
        .mockResolvedValueOnce([[{ id: 'item-1', title: 'Item 1', tags: '["tag1"]' }], {}]);

      const response = await request(app)
        .get('/api/backlog?projectId=proj-1&status=BACKLOG')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/backlog/:id', () => {
    it('should update backlog item', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'item-1', project_id: 'proj-1', created_by_id: 'user-1' }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'PRODUCT_OWNER' }], {}]) // isMember
        .mockResolvedValueOnce([[], {}]); // update

      const response = await request(app)
        .put('/api/backlog/item-1')
        .set('Authorization', 'Bearer valid-token')
        .send({ title: 'Updated title with proper length' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item updated successfully');
    });
  });

  describe('DELETE /api/backlog/:id', () => {
    it('should delete backlog item with confirmation', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'item-1', project_id: 'proj-1' }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'PRODUCT_OWNER' }], {}]) // isMember
        .mockResolvedValueOnce([[], {}]) // logChange
        .mockResolvedValueOnce([[], {}]); // softDelete

      const response = await request(app)
        .delete('/api/backlog/item-1?confirm=yes')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item deleted successfully');
    });
  });
});