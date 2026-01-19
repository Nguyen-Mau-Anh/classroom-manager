export * from './health';
export * from './server';

// Start server when this file is run directly (production entry point)
import { app } from './server';

const PORT = process.env.PORT ?? 4000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}
