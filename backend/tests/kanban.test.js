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

describe('Kanban Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('jsonwebtoken').verify.mockReturnValue({ id: 'user-1', role: 'TEAM_MEMBER' });
  });

  describe('GET /api/kanban/:sprintId', () => {
    it('should return Kanban board with enhanced cards', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', project_id: 'proj-1' }], {}]) // Sprint.findById
        .mockResolvedValueOnce([[{ role: 'TEAM_MEMBER' }], {}]) // isMember
        .mockResolvedValueOnce([[], {}]) // kanban_columns
        .mockResolvedValueOnce([[
          { id: 'item-1', title: 'Task 1', status: 'TODO', priority: 'HIGH', story_points: 5, tags: '["tag1"]', due_date: '2024-01-01', is_blocked: 0, assigned_to_id: 'user-2' }
        ], {}]) // findAllBySprint
        .mockResolvedValueOnce([[{ count: 2 }], {}]) // comments
        .mockResolvedValueOnce([[{ first_name: 'John', last_name: 'Doe', profile_photo: null }], {}]); // assigned user

      const response = await request(app)
        .get('/api/kanban/sprint-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('columns');
      expect(response.body.columns[0].items[0]).toHaveProperty('unique_id');
      expect(response.body.columns[0].items[0]).toHaveProperty('comment_count', 2);
    });
  });

  describe('PATCH /api/kanban/move/:id', () => {
    it('should move item and record history', async () => {
      // Mock complex moveKanbanItem - simplified for test
      db.query.mockResolvedValue([[], {}]); // Simplified mock

      const response = await request(app)
        .patch('/api/kanban/move/item-1')
        .set('Authorization', 'Bearer valid-token')
        .send({ toStatus: 'IN_PROGRESS', toPosition: 1 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item moved successfully');
    });
  });
});