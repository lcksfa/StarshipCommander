// Playwright E2E 测试配置
// Playwright E2E Test Configuration

import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";

export default defineConfig({
  // E2E 测试目录 / E2E test directory
  testDir: "./tests/e2e",

  // 测试文件匹配模式 / Test file pattern
  testMatch: "**/*.spec.ts",

  // 并行运行工作线程 / Fully parallelize tests
  fullyParallel: false,

  // 在 CI 环境失败时不重试 / Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // 在 CI 环境重试失败测试 / Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // 在 CI 环境并行运行 / Parallelize workers on CI
  workers: process.env.CI ? 1 : undefined,

  // 测试报告器 / Test reporter
  reporter: "html",

  // 共享配置 / Shared settings
  use: {
    // 基础 URL / Base URL
    baseURL: BASE_URL,

    // 收集失败测试的追踪信息 / Collect trace when retrying the failed test
    trace: "on-first-retry",

    // 截图配置 / Screenshot configuration
    screenshot: "only-on-failure",

    // 视频配置 / Video configuration
    video: "retain-on-failure",
  },

  // 测试项目配置 / Test projects
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // 开发服务器配置 / Development server configuration
  webServer: {
    command: "pnpm dev:all",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
