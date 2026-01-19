/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'shared',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>/packages/shared',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      transform: { '^.+\\.ts$': 'ts-jest' },
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
    },
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      rootDir: '<rootDir>/packages/backend',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      transform: { '^.+\\.ts$': 'ts-jest' },
      collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
    },
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      rootDir: '<rootDir>/packages/frontend',
      testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
      },
      moduleNameMapper: { '\\.(css|less|scss|sass)$': 'identity-obj-proxy' },
      collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/index.ts',
        '!src/main.tsx',
        '!src/setupTests.ts',
      ],
    },
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'html'],
};
