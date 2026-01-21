import { CorsOptions } from 'cors';

/**
 * Parses allowed origins from environment variable or uses defaults.
 */
function getAllowedOrigins(): string[] {
  if (process.env.CORS_ORIGIN) {
    return process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  }

  // Default origins for development
  return ['http://localhost:3000', 'http://localhost:5173'];
}

const allowedOrigins = getAllowedOrigins();

/**
 * CORS configuration for the API.
 */
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86400, // 24 hours
};

/**
 * Returns the list of allowed origins (for testing).
 */
export function getCorsAllowedOrigins(): string[] {
  return getAllowedOrigins();
}
