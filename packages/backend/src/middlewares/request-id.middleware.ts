import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that generates a unique request ID for each request.
 * Uses X-Request-ID header if provided, otherwise generates a new UUID.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing request ID from header or generate a new one
  const requestId = (req.headers['x-request-id'] as string) || uuidv4();

  // Attach to request object
  req.id = requestId;

  // Also set it in response headers for client tracking
  res.setHeader('X-Request-ID', requestId);

  next();
}
