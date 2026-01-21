---
story_id: 'story-0.1'
epic: 'Epic 0: Project Foundation & Infrastructure'
title: 'Repository Structure and CI Pipeline'
status: 'completed'
priority: 'P0'
created_date: '2026-01-21'
assigned_to: 'Claude Sonnet 4.5'
estimated_effort: '3 days'
actual_effort: '2 hours'
sprint: 'Sprint 1'
dependencies: []
related_stories: ['story-0.2', 'story-0.3']
---

# Story 0.1: Repository Structure and CI Pipeline

## Story Overview

**As a** developer,
**I want** a properly configured monorepo with automated CI checks,
**So that** code quality is enforced and the team can collaborate effectively.

**Epic:** Epic 0: Project Foundation & Infrastructure
**Priority:** P0 (Critical - Foundation)
**Status:** ready-for-dev

---

## Business Context

This story establishes the technical foundation for the entire classroom-manager project. Without a solid repository structure and CI pipeline, the team cannot collaborate effectively or maintain code quality. This is the first story that must be completed before any feature development begins.

**User Value:** Enables efficient team collaboration with automated quality gates
**Business Impact:** Prevents technical debt and ensures consistent code quality from day one

---

## Acceptance Criteria

### AC1: Monorepo Structure Setup

**Given** a fresh checkout of the repository
**When** I run `pnpm install`
**Then** all workspace dependencies are installed correctly
**And** packages/frontend, packages/backend, and packages/shared exist
**And** each package has its own package.json with proper dependencies

**Verification:**
```bash
# Directory structure exists
ls -la packages/frontend packages/backend packages/shared

# Workspace installation works
pnpm install
pnpm list --depth 0
```

---

### AC2: ESLint Configuration

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** ESLint runs on all packages and fails build on errors
**And** TypeScript ESLint rules are enforced
**And** consistent code style rules are applied across all packages

**Verification:**
```bash
# ESLint passes on clean code
pnpm lint

# ESLint fails on code with errors
echo "const x = 5; x = 10;" > packages/backend/test.ts
pnpm lint # Should fail

# Clean up
rm packages/backend/test.ts
```

---

### AC3: Prettier Configuration

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** Prettier check runs and fails build on formatting issues
**And** consistent formatting is enforced (semi, trailing comma, single quotes)

**Verification:**
```bash
# Prettier check passes
pnpm format:check

# Prettier can fix formatting
pnpm format

# Verify .prettierrc configuration exists
cat .prettierrc
```

---

### AC4: TypeScript Type Checking

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** TypeScript type checking passes for all packages
**And** strict mode is enabled
**And** type errors fail the build

**Verification:**
```bash
# Type check all packages
pnpm typecheck

# Individual package type checking
pnpm --filter frontend typecheck
pnpm --filter backend typecheck
pnpm --filter shared typecheck
```

---

### AC5: Unit Test Configuration

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** Unit tests run with Jest and achieve 70% coverage threshold
**And** coverage report is generated
**And** tests failing will fail the build

**Verification:**
```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Verify coverage threshold (should be 70%)
# Check jest.config.js for coverageThreshold
```

---

### AC6: Build Process

**Given** any push to any branch
**When** GitHub Actions CI workflow runs
**Then** Build step succeeds for all packages
**And** Frontend builds with Vite
**And** Backend compiles TypeScript to JavaScript
**And** Build artifacts are created in dist/ directories

**Verification:**
```bash
# Build all packages
pnpm build

# Verify build outputs
ls -la packages/frontend/dist
ls -la packages/backend/dist
```

---

### AC7: CI Workflow Execution

**Given** CI workflow completion
**When** all checks pass
**Then** the commit/PR is marked as passing
**And** code coverage report is uploaded to codecov (optional)
**And** workflow completes in < 10 minutes

**Verification:**
- Push code to a branch
- Create PR
- Check GitHub Actions tab for workflow status
- Verify all jobs pass (lint, typecheck, test, build)

---

### AC8: CI Workflow on PR

**Given** a pull request is created
**When** CI workflow runs
**Then** status checks are required before merge
**And** all quality gates must pass
**And** PR cannot be merged with failing checks

**Verification:**
- Create PR with intentional linting error
- Verify CI fails
- Fix error and verify CI passes

---

## Technical Requirements

### Repository Structure

```
classroom-manager/
├── .github/
│   └── workflows/
│       └── ci.yml
├── packages/
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── jest.config.js
│   ├── backend/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── jest.config.js
│   └── shared/
│       ├── src/
│       ├── package.json
│       ├── tsconfig.json
│       └── jest.config.js
├── pnpm-workspace.yaml
├── package.json
├── .eslintrc.js
├── .prettierrc
├── tsconfig.json
└── README.md
```

---

### pnpm Workspace Configuration

**File:** `pnpm-workspace.yaml`

```yaml
packages:
  - 'packages/*'
```

**File:** Root `package.json`

```json
{
  "name": "classroom-manager",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "install": "pnpm install",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

### ESLint Configuration

**File:** `.eslintrc.js`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: ['./tsconfig.json', './packages/*/tsconfig.json'],
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ['dist', 'node_modules', '*.config.js', '*.config.ts'],
};
```

---

### Prettier Configuration

**File:** `.prettierrc`

```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

### TypeScript Configuration

**File:** Root `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

### Jest Configuration

**File:** Root `jest.config.js`

```javascript
module.exports = {
  projects: [
    '<rootDir>/packages/frontend',
    '<rootDir>/packages/backend',
    '<rootDir>/packages/shared',
  ],
  collectCoverageFrom: ['**/src/**/*.{ts,tsx}', '!**/node_modules/**', '!**/dist/**'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

---

### GitHub Actions CI Workflow

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['main', 'develop']

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        if: always()
        with:
          fail_ci_if_error: false

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

---

## Implementation Tasks

### Task 1: Initialize Monorepo Structure
- [x] Create packages/ directory with frontend, backend, shared subdirectories
- [x] Create pnpm-workspace.yaml
- [x] Create root package.json with workspace scripts
- [x] Initialize package.json in each package with proper names and dependencies

**Estimated Effort:** 2 hours

---

### Task 2: Configure ESLint and Prettier
- [x] Install ESLint and TypeScript ESLint plugins
- [x] Create .eslintrc.js with proper configuration
- [x] Install Prettier
- [x] Create .prettierrc configuration
- [x] Add .eslintignore and .prettierignore files
- [x] Verify linting works across all packages

**Estimated Effort:** 3 hours

---

### Task 3: Configure TypeScript
- [x] Create root tsconfig.json
- [x] Create package-specific tsconfig.json extending root config
- [x] Configure paths for shared package references
- [x] Verify type checking works

**Estimated Effort:** 2 hours

---

### Task 4: Configure Jest Testing
- [x] Install Jest and ts-jest
- [x] Create root jest.config.js with projects configuration
- [x] Create package-specific jest.config.js files
- [x] Set up coverage thresholds (70%)
- [x] Write example test to verify setup
- [x] Verify test command works

**Estimated Effort:** 4 hours

---

### Task 5: Set Up GitHub Actions CI
- [x] Create .github/workflows/ci.yml
- [x] Configure lint job
- [x] Configure typecheck job
- [x] Configure test job with coverage upload
- [x] Configure build job
- [x] Test CI workflow by pushing code

**Estimated Effort:** 3 hours

---

### Task 6: Documentation
- [x] Update root README.md with setup instructions
- [x] Document monorepo structure
- [x] Document available npm scripts
- [x] Add contributing guidelines
- [x] Add badge for CI status

**Estimated Effort:** 2 hours

---

## Testing Strategy

### Unit Tests
- Write example unit tests in each package to verify Jest configuration
- Verify coverage reporting works
- Test that coverage threshold enforcement works

### Integration Tests
- Verify all pnpm workspace commands work
- Test that linting, formatting, type checking work across packages
- Verify package imports work (shared package imported in frontend/backend)

### CI/CD Tests
- Push code with linting errors to verify CI fails
- Push code with type errors to verify CI fails
- Push code with test failures to verify CI fails
- Push clean code to verify CI passes
- Verify PR checks work correctly

---

## Dependencies

**Blocks:** All other stories - this is the foundation
**Blocked By:** None
**Related:** Story 0.2 (Docker), Story 0.3 (Database)

---

## Architecture References

- **Architecture Document:** docs/architecture.md (Section: CI/CD Pipeline)
- **PRD:** docs/prd.md (Section: Technical Requirements)

---

## Definition of Done

- [x] All acceptance criteria are met
- [x] All implementation tasks are completed
- [x] Unit tests written and passing (70% coverage minimum)
- [x] CI pipeline configured and passing
- [x] Documentation updated (README.md)
- [ ] Code reviewed and approved
- [ ] Merged to main branch
- [x] CI status badge added to README

---

## Notes

- This story focuses purely on repository structure and CI automation
- No feature code is included - just the foundation
- Use Node.js 20 LTS for consistency
- Use pnpm v8+ for workspace support
- Coverage threshold set to 70% per architecture requirements
- CI workflow should complete in under 10 minutes

---

**Created:** 2026-01-21
**Completed:** 2026-01-21
**Status:** completed
**Priority:** P0
