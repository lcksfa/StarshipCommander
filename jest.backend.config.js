/**
 * Jest Configuration for Backend Tests
 * 后端测试的 Jest 配置
 */

export default {
  // Test environment / 测试环境
  testEnvironment: "node",

  // Root directory for tests / 测试根目录
  roots: ["<rootDir>/src/backend"],

  // Test file patterns / 测试文件匹配模式
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts",
  ],

  // TypeScript transformer / TypeScript 转换器
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", {
      useESM: true,
    }],
  },

  // Module name mapper for path aliases / 路径别名的模块名映射
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1",
    "^@backend/(.*)$": "<rootDir>/src/backend/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },

  // Coverage collection / 覆盖率收集
  collectCoverageFrom: [
    "src/backend/**/*.{ts,js}",
    "!src/backend/**/*.d.ts",
    "!src/backend/**/*.spec.{ts,js}",
    "!src/backend/**/*.test.{ts,js}",
    "!src/backend/dist/**",
    "!src/backend/**/node_modules/**",
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

  // Module directories / 模块目录
  moduleDirectories: ["node_modules", "<rootDir>/src"],

  // Module file extensions / 模块文件扩展名
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  // Resolve .js imports as .ts files / 将 .js 导入解析为 .ts 文件
  resolver: undefined,

  // Ignore patterns / 忽略模式
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/.cache/",
  ],

  // Clear mocks between tests / 测试间清除 mock
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output / 详细输出
  verbose: true,

  // Maximum number of workers / 最大工作进程数
  maxWorkers: "50%",

  // Setup files / 设置文件
  setupFilesAfterEnv: [],
};
