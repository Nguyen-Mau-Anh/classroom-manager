# Classroom Manager

[![CI](https://github.com/Nguyen-Mau-Anh/classroom-manager/workflows/CI/badge.svg)](https://github.com/Nguyen-Mau-Anh/classroom-manager/actions)

A comprehensive classroom management system built with modern web technologies. This system helps manage teachers, students, classes, and classroom operations efficiently.

## Project Structure

This is a monorepo managed with pnpm workspaces, containing three main packages:

```
classroom-manager/
├── packages/
│   ├── frontend/       # React frontend application
│   ├── backend/        # Express.js backend API
│   └── shared/         # Shared types and utilities
├── .github/
│   └── workflows/
│       └── ci.yml      # Continuous Integration pipeline
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json        # Root package with workspace scripts
```

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/Nguyen-Mau-Anh/classroom-manager.git
cd classroom-manager

# Install dependencies
pnpm install
```

### Development

Start all packages in development mode:

```bash
pnpm dev
```

### Building

Build all packages for production:

```bash
pnpm build
```

Build outputs:
- `packages/frontend/dist` - Frontend production build
- `packages/backend/dist` - Backend compiled JavaScript
- `packages/shared/dist` - Shared package compiled JavaScript

## Available Scripts

### Root Level Scripts

- `pnpm dev` - Start all packages in development mode
- `pnpm build` - Build all packages for production
- `pnpm test` - Run all tests
- `pnpm test:coverage` - Run tests with coverage report
- `pnpm lint` - Lint all packages
- `pnpm lint:fix` - Lint and auto-fix issues
- `pnpm format` - Format all files with Prettier
- `pnpm format:check` - Check formatting without writing changes
- `pnpm typecheck` - Run TypeScript type checking on all packages

### Package-Specific Scripts

Run commands in specific packages using the `--filter` flag:

```bash
# Frontend
pnpm --filter frontend dev
pnpm --filter frontend build
pnpm --filter frontend typecheck

# Backend
pnpm --filter backend dev
pnpm --filter backend build
pnpm --filter backend typecheck

# Shared
pnpm --filter shared build
pnpm --filter shared typecheck
```

## Code Quality

This project enforces code quality through automated checks:

### Linting (ESLint)

- Enforces TypeScript ESLint rules
- Consistent code style across all packages
- Runs automatically in CI pipeline

```bash
pnpm lint
```

### Formatting (Prettier)

- Consistent code formatting
- Enforces semicolons, trailing commas, and single quotes
- Runs automatically in CI pipeline

```bash
pnpm format:check  # Check formatting
pnpm format        # Fix formatting
```

### Type Checking (TypeScript)

- Strict mode enabled
- Type errors fail the build
- Runs automatically in CI pipeline

```bash
pnpm typecheck
```

### Testing (Jest)

- Unit tests with Jest
- 70% coverage threshold enforced
- Runs automatically in CI pipeline

```bash
pnpm test              # Run tests
pnpm test:coverage     # Run tests with coverage report
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration. On every push and pull request:

1. **Lint** - ESLint and Prettier checks
2. **Type Check** - TypeScript compilation checks
3. **Test** - Jest unit tests with coverage
4. **Build** - Production build verification

All checks must pass before code can be merged.

## Monorepo Structure

### Frontend (`packages/frontend`)

React application with Vite build tool.

**Key Dependencies:**
- React 18
- TypeScript
- Vite
- Axios

**Scripts:**
- `pnpm dev` - Development server
- `pnpm build` - Production build
- `pnpm preview` - Preview production build

### Backend (`packages/backend`)

Express.js API server with Prisma ORM.

**Key Dependencies:**
- Express
- Prisma
- TypeScript
- JWT authentication
- Redis
- PostgreSQL

**Scripts:**
- `pnpm dev` - Development mode with watch
- `pnpm build` - Production build
- `pnpm start` - Start production server

### Shared (`packages/shared`)

Shared TypeScript types and utilities used by both frontend and backend.

**Scripts:**
- `pnpm build` - Compile TypeScript
- `pnpm dev` - Watch mode

## Configuration Files

- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `tsconfig.json` - Root TypeScript configuration
- `jest.config.js` - Jest test configuration
- `pnpm-workspace.yaml` - pnpm workspace configuration

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass (`pnpm test`)
5. Ensure linting passes (`pnpm lint`)
6. Ensure formatting is correct (`pnpm format:check`)
7. Ensure type checking passes (`pnpm typecheck`)
8. Commit your changes (`git commit -m 'Add amazing feature'`)
9. Push to the branch (`git push origin feature/amazing-feature`)
10. Open a Pull Request

All pull requests must pass CI checks before they can be merged.

## License

This project is licensed under the MIT License.
