module.exports = {
  displayName: 'backend',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src/backend',
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/backend/**/*.ts',
    '!src/backend/**/*.d.ts',
    '!src/backend/**/*.spec.ts',
    '!src/backend/**/*.test.ts'
  ],
  coverageDirectory: 'coverage/backend',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/backend/$1',
    '^@modules/(.*)$': '<rootDir>/src/backend/modules/$1',
    '^@trpc/(.*)$': '<rootDir>/src/backend/trpc/$1'
  }
};
