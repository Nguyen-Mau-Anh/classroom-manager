import request from 'supertest';

import { app } from './server';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
}

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}

interface RootData {
  message: string;
  version: string;
}

describe('Express Server', () => {
  describe('GET /', () => {
    it('should return API info with 200 status in new response format', async () => {
      const response = await request(app).get('/');
      const body = response.body as ApiResponse<RootData>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.message).toBe('Classroom Manager API');
      expect(body.data?.version).toBe('0.1.0');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status with 200 in new response format', async () => {
      const response = await request(app).get('/api/health');
      const body = response.body as ApiResponse<HealthData>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data?.status).toBe('healthy');
      expect(body.data?.timestamp).toBeDefined();
      expect(body.data?.version).toBeDefined();
      expect(body.data?.uptime).toBeDefined();
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/api/health');
      const body = response.body as ApiResponse<HealthData>;

      const timestamp = new Date(body.data!.timestamp);
      expect(timestamp.toISOString()).toBe(body.data!.timestamp);
    });

    it('should return non-negative uptime', async () => {
      const response = await request(app).get('/api/health');
      const body = response.body as ApiResponse<HealthData>;

      expect(typeof body.data!.uptime).toBe('number');
      expect(body.data!.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('404 handling', () => {
    it('should return 404 for unknown routes in new response format', async () => {
      const response = await request(app).get('/unknown-route');
      const body = response.body as ApiResponse<never>;

      expect(response.status).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('NOT_FOUND');
      expect(body.error?.message).toBe('Cannot GET /unknown-route');
    });
  });

  describe('JSON middleware', () => {
    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/health')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');
      const body = response.body as ApiResponse<never>;

      // Even though POST to /api/health isn't a valid route, body should be parsed
      expect(response.status).toBe(404); // No POST handler, but JSON was parsed
      expect(body.success).toBe(false);
      expect(body.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('Request ID', () => {
    it('should include X-Request-ID in response headers', async () => {
      const response = await request(app).get('/');

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('should use provided X-Request-ID from request', async () => {
      const customRequestId = 'custom-request-123';
      const response = await request(app).get('/').set('X-Request-ID', customRequestId);

      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });

  describe('CORS', () => {
    it('should have CORS headers for allowed origins', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should respond to preflight requests', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });
});
