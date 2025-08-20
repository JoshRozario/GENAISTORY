import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('API Tests', () => {
  describe('GET /api', () => {
    it('should return ok: true', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);
      
      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
      expect(response.body).toHaveProperty('time');
    });
  });

  describe('POST /api/events', () => {
    it('should accept event data', async () => {
      const eventData = {
        userId: 'user123',
        videoId: 'video456',
        timestamp: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/events')
        .send(eventData)
        .expect(201);
      
      expect(response.body).toHaveProperty('ok', true);
    });

    it('should reject invalid event data', async () => {
      const invalidData = { invalid: 'data' };

      await request(app)
        .post('/api/events')
        .send(invalidData)
        .expect(400);
    });
  });
});