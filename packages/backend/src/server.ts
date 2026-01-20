import express, { Application, json, Request, Response } from 'express';

import { getHealthStatus } from './health';
import authRoutes from './routes/auth.routes';

const app: Application = express();
const PORT = process.env.PORT ?? 4000;
const startTime = new Date();

// Middleware
app.use(json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const health = getHealthStatus(startTime);
  res.json(health);
});

// Auth routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Classroom Manager API', version: '0.1.0' });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

export { app };
