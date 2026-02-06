/** @type {import('jest').Config} */
module.exports = {
  // Use ts-jest preset for TypeScript
  preset: 'ts-jest',

  // Node.js environment (backend APIs)
  testEnvironment: 'node',

  // Root directory for Jest
  rootDir: '.',

  // Where test files are located
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],

  // Match test files
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  // File extensions Jest will handle
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node'
  ],

  // Transform TypeScript files
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },

  // Clear mocks automatically between tests
  clearMocks: true,

  // Increase timeout for DB / API tests
  testTimeout: 30000,

  // Show individual test results
  verbose: true,

  // Prevent hanging open handles (MongoDB, server, etc.)
  forceExit: true,

  // Detect open handles (very useful for backend testing)
  detectOpenHandles: true,
};
