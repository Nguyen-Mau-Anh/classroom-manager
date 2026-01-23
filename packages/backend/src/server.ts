import cors from 'cors';
import express, { Application, json, Request, Response } from 'express';

import { corsConfig } from './config/cors';
import { getHealthStatus } from './health';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.middleware';
import { requestIdMiddleware } from './middlewares/request-id.middleware';
import { requestLogger } from './middlewares/request-logger.middleware';
import authRoutes from './routes/auth.routes';
import classRoutes from './routes/class.routes';
import roomRoutes from './routes/room.routes';
import studentRoutes from './routes/student.routes';
import subjectRoutes from './routes/subject.routes';
import teacherRoutes from './routes/teacher.routes';
import { success } from './utils/api-response';

const app: Application = express();
const PORT = process.env.PORT ?? 4000;
const startTime = new Date();

// 1. CORS (must be first)
app.use(cors(corsConfig));

// 2. Request ID generation
app.use(requestIdMiddleware);

// 3. Request logging (pino-http)
app.use(requestLogger);

// 4. Body parsing
app.use(json({ limit: '10kb' }));

// Health check endpoint (uses new response format)
app.get('/api/health', (_req: Request, res: Response) => {
  void (async () => {
    try {
      const health = await getHealthStatus(startTime);
      // Return 503 if any service is unhealthy
      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode);
      success(res, health);
    } catch (error) {
      logger.error({ err: error }, 'Health check error');
      res.status(503);
      success(res, {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        uptime: 0,
        services: {
          database: 'unhealthy',
          redis: 'unhealthy',
        },
      });
    }
  })();
});

// Auth routes
app.use('/api/auth', authRoutes);

// Student routes
app.use('/api/students', studentRoutes);

// Teacher routes
app.use('/api/teachers', teacherRoutes);

// Class routes
app.use('/api/classes', classRoutes);

// Room routes
app.use('/api/rooms', roomRoutes);

// Subject routes
app.use('/api/subjects', subjectRoutes);

// Root endpoint (uses new response format)
app.get('/', (_req: Request, res: Response) => {
  success(res, { message: 'Classroom Manager API', version: '0.1.0' });
});

// 5. 404 handler (after all routes)
app.use(notFoundHandler);

// 6. Global error handler (must be last)
app.use(errorHandler);

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Health check: http://localhost:${PORT}/api/health`);
  });
}

export { app };
