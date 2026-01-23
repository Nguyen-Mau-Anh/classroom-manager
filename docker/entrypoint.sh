#!/bin/sh
set -e

echo "Starting backend service..."

# Run database migrations
echo "Running database migrations..."
if [ -d "./prisma" ]; then
  npx prisma migrate deploy || {
    echo "Migration failed, exiting..."
    exit 1
  }
  echo "Migrations completed successfully"
else
  echo "No Prisma schema found, skipping migrations"
fi

# Start the application
echo "Starting application..."
exec node dist/index.js
