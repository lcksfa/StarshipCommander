// Jest setup file
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: [],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/backend/$1',
    '^@modules/(.*)$': '<rootDir>/src/backend/modules/$1',
    '^@trpc/(.*)$': '<rootDir>/src/backend/trpc/$1',
    '^@frontend/(.*)$': '<rootDir>/src/frontend/$1'
  }
};
