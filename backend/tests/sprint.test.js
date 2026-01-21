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

describe('Sprint Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('jsonwebtoken').verify.mockReturnValue({ id: 'user-1', role: 'SCRUM_MASTER' });
  });

  describe('POST /api/sprints', () => {
    it('should create a sprint successfully', async () => {
      db.query
        .mockResolvedValueOnce([[{ role: 'SCRUM_MASTER' }], {}]) // isScrumMaster
        .mockResolvedValueOnce([[{ avg_velocity: 25 }], {}]) // getAverageVelocity
        .mockResolvedValueOnce([[], {}]); // create

      const response = await request(app)
        .post('/api/sprints')
        .set('Authorization', 'Bearer valid-token')
        .send({
          project_id: 'proj-1',
          name: 'Sprint 1',
          objective: 'Deliver authentication',
          start_date: '2024-01-01',
          end_date: '2024-01-14'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Sprint 1');
      expect(response.body.objective).toBe('Deliver authentication');
    });
  });

  describe('PUT /api/sprints/:id/activate', () => {
    it('should activate sprint', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', project_id: 'proj-1', status: 'PLANNING' }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'SCRUM_MASTER' }], {}]) // isScrumMaster
        .mockResolvedValueOnce([[], {}]) // findAllByProject for active check
        .mockResolvedValueOnce([[], {}]) // updateStatus
        .mockResolvedValueOnce([[], {}]); // update project

      const response = await request(app)
        .put('/api/sprints/sprint-1/activate')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Sprint activated successfully');
    });
  });

  describe('POST /api/sprints/:sprintId/items', () => {
    it('should move item to sprint with capacity warning', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', project_id: 'proj-1', planned_velocity: 30 }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'SCRUM_MASTER' }], {}]) // isScrumMaster
        .mockResolvedValueOnce([[{ id: 'item-1', sprint_id: null, story_points: 10 }], {}]) // findById item
        .mockResolvedValueOnce([[{ story_points: 25 }], {}]) // findAllBySprint
        .mockResolvedValueOnce([[], {}]); // update item

      const response = await request(app)
        .post('/api/sprints/sprint-1/items')
        .set('Authorization', 'Bearer valid-token')
        .send({ itemId: 'item-1' });

      expect(response.status).toBe(200);
      expect(response.body.warning).toContain('exceed sprint capacity');
    });
  });

  describe('PUT /api/sprints/:id/complete', () => {
    it('should complete sprint', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', project_id: 'proj-1' }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'SCRUM_MASTER' }], {}]) // isScrumMaster
        .mockResolvedValueOnce([[{ status: 'DONE' }], {}]) // findAllBySprint
        .mockResolvedValueOnce([[{ total: 25 }], {}]) // sumStoryPointsBySprint
        .mockResolvedValueOnce([[], {}]) // updatePartial
        .mockResolvedValueOnce([[], {}]); // update project

      const response = await request(app)
        .put('/api/sprints/sprint-1/complete')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.actual_velocity).toBe(25);
    });
  });

  describe('GET /api/sprints/active', () => {
    it('should return active sprint with capacity metrics', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', name: 'Sprint 1', status: 'ACTIVE', planned_velocity: 30 }], {}]) // findAllByProject
        .mockResolvedValueOnce([[{ id: 'item-1', status: 'DONE', story_points: 10 }, { id: 'item-2', status: 'TODO', story_points: 5 }], {}]); // findAllBySprint

      const response = await request(app)
        .get('/api/sprints/active?projectId=proj-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.capacity.total).toBe(30);
      expect(response.body.capacity.completed).toBe(10);
    });
  });

  describe('GET /api/sprints/:id/burndown', () => {
    it('should return burndown chart data', async () => {
      db.query
        .mockResolvedValueOnce([[{ id: 'sprint-1', project_id: 'proj-1', start_date: '2024-01-01', end_date: '2024-01-14', planned_velocity: 30 }], {}]) // findById
        .mockResolvedValueOnce([[{ role: 'TEAM_MEMBER' }], {}]) // isMember
        .mockResolvedValueOnce([[{ date: '2024-01-01', remaining_story_points: 30 }], {}]); // getBurndownData

      const response = await request(app)
        .get('/api/sprints/sprint-1/burndown')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('ideal_line');
      expect(response.body).toHaveProperty('actual_line');
    });
  });

  describe('GET /api/sprints/velocity-chart', () => {
    it('should return velocity chart data', async () => {
      db.query
        .mockResolvedValueOnce([[{ role: 'TEAM_MEMBER' }], {}]) // isMember
        .mockResolvedValueOnce([[{ name: 'Sprint 1', planned_velocity: 30, actual_velocity: 25 }], {}]); // sprints

      const response = await request(app)
        .get('/api/sprints/velocity-chart?projectId=proj-1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sprints');
      expect(response.body).toHaveProperty('moving_average');
    });
  });
});