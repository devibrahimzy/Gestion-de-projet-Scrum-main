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

describe('Retrospective Export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('jsonwebtoken').verify.mockReturnValue({ id: 'user-1', role: 'TEAM_MEMBER' });
  });

  describe('GET /api/retrospectives/:id/export-pdf', () => {
    it('should export retrospective as PDF', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'retro-1', sprint_id: 'sprint-1', date: '2024-01-15', status: 'PUBLISHED' }], {}])
        .mockResolvedValueOnce([[
          { category: 'POSITIVE', text: 'Good teamwork', votes: 5 },
          { category: 'IMPROVE', text: 'Better testing', votes: 3 }
        ], {}]);

      const response = await request(app)
        .get('/api/retrospectives/sprint-1/export-pdf')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
    });
  });
});

describe('Dashboard Export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('jsonwebtoken').verify.mockReturnValue({ id: 'user-1', role: 'TEAM_MEMBER' });
  });

  describe('GET /api/dashboard/:projectId/report', () => {
    it('should generate project report', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'user-1' }], {}]) // getMembers
        .mockResolvedValueOnce([[{ total_items: 10, completed_items: 5, total_story_points: 50, completed_story_points: 25 }], {}]) // getMainMetrics
        .mockResolvedValueOnce([[], {}]) // getMemberWorkload
        .mockResolvedValueOnce([[], {}]) // getVelocityHistory
        .mockResolvedValueOnce([[{ avg_lead_time_hours: 24, avg_cycle_time_hours: 12 }], {}]) // getAgileMetrics
        .mockResolvedValueOnce([[], {}]); // getSprintOverview

      const response = await request(app)
        .get('/api/dashboard/proj-1/report')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('velocity_history');
    });
  });

  describe('GET /api/dashboard/:projectId/export/backlog', () => {
    it('should export backlog as CSV', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'user-1' }], {}]) // getMembers
        .mockResolvedValueOnce([[{ id: 'item-1', title: 'Test Item', description: '', type: 'USER_STORY', priority: 'MEDIUM', story_points: 5, status: 'TODO', tags: null, due_date: null, is_blocked: 0, assigned_first_name: 'John', assigned_last_name: 'Doe', created_at: '2024-01-01' }], {}]); // backlog query

      const response = await request(app)
        .get('/api/dashboard/proj-1/export/backlog')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/csv');
    });
  });
});