/**
 * Jest Configuration
 * Jest 配置文件
 */

export default {
  // Test environment / 测试环境
  testEnvironment: "node",

  // Root directories for tests / 测试根目录
  roots: ["<rootDir>/src"],

  // Test file patterns / 测试文件匹配模式
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts",
  ],

  // Exclude patterns / 排除模式
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/.cache/",
    "/tests/e2e/", // 排除 Playwright E2E 测试
  ],

  // TypeScript transformer / TypeScript 转换器
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", {
      useESM: true,
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // Module name mapper for path aliases / 路径别名的模块名映射
  moduleNameMapper: {
    "^@frontend/(.*)$": "<rootDir>/src/frontend/$1",
    "^@backend/(.*)$": "<rootDir>/src/backend/$1",
    "^@components/(.*)$": "<rootDir>/src/frontend/components/$1",
    "^@contexts/(.*)$": "<rootDir>/src/frontend/contexts/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Setup files / 设置文件
  setupFilesAfterEnv: ["<rootDir>/config/jest.setup.js"],

  // Module directories / 模块目录
  moduleDirectories: ["node_modules", "<rootDir>/src"],

  // Module file extensions / 模块文件扩展名
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Coverage collection / 覆盖率收集
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.spec.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/frontend/dist/**",
    "!src/backend/dist/**",
    "!src/**/node_modules/**",
  ],

  // Coverage thresholds / 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },

  // Clear mocks between tests / 测试间清除 mock
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
