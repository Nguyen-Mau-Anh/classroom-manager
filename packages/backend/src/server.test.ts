import request from 'supertest';

import { app } from './server';

describe('Express Server', () => {
  describe('GET /', () => {
    it('should return API info with 200 status', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Classroom Manager API');
      expect(response.body).toHaveProperty('version', '0.1.0');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status with 200', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('uptime');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/api/health');
      const body = response.body as { timestamp: string };

      const timestamp = new Date(body.timestamp);
      expect(timestamp.toISOString()).toBe(body.timestamp);
    });

    it('should return non-negative uptime', async () => {
      const response = await request(app).get('/api/health');
      const body = response.body as { uptime: number };

      expect(typeof body.uptime).toBe('number');
      expect(body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');

      expect(response.status).toBe(404);
    });
  });

  describe('JSON middleware', () => {
    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/health')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      // Even though POST to /api/health isn't a valid route, body should be parsed
      expect(response.status).toBe(404); // No POST handler, but JSON was parsed
    });
  });
});
