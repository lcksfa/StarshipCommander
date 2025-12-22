module.exports = {
  displayName: 'e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src/backend/test',
  testMatch: [
    '**/**/*.e2e-spec.ts',
    '**/**/*.e2e.test.ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/backend/test/**/*.ts',
    '!src/backend/test/**/*.d.ts'
  ],
  coverageDirectory: 'coverage/e2e',
  testTimeout: 30000,
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@modules/(.*)$': '<rootDir>/../modules/$1',
    '^@trpc/(.*)$': '<rootDir>/../trpc/$1'
  }
};
