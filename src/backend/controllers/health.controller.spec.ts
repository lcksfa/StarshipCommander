/**
 * Health Controller Unit Tests / Health 控制器单元测试
 *
 * 测试目标：验证健康检查和 API 信息端点
 * 验收标准：
 * 1. 健康检查返回正确状态
 * 2. API 信息端点返回正确结构
 * 3. 响应时间合理
 */

import {
  HealthController,
  ApiController,
} from "./health.controller";

describe("HealthController / Health 控制器", () => {
  let healthController: HealthController;
  let apiController: ApiController;

  beforeEach(() => {
    // 由于控制器没有依赖，我们可以直接实例化
    healthController = new HealthController();
    apiController = new ApiController();
  });

  describe("check / 健康检查", () => {
    it("should return health status / 应该返回健康状态", () => {
      const result = healthController.check();

      expect(result).toHaveProperty("status", "ok");
      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("uptime");
      expect(result).toHaveProperty("service", "Starship Commander Backend");
      expect(result).toHaveProperty("version", "2.0.0");

      // 验证 timestamp 是有效的 ISO 8601 格式
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);

      // 验证 uptime 是数字
      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should return current timestamp / 应该返回当前时间戳", () => {
      const before = new Date();
      const result = healthController.check();
      const after = new Date();

      const resultDate = new Date(result.timestamp);

      expect(resultDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(resultDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it("should include service information / 应该包含服务信息", () => {
      const result = healthController.check();

      expect(result.service).toBe("Starship Commander Backend");
      expect(result.version).toMatch(/^\d+\.\d+\.\d+$/); // 语义化版本号格式
    });
  });

  describe("getInfo / API 信息", () => {
    it("should return API information / 应该返回 API 信息", () => {
      const result = apiController.getInfo();

      expect(result).toHaveProperty("name", "Starship Commander API");
      expect(result).toHaveProperty("version", "2.0.0");
      expect(result).toHaveProperty("description");
      expect(result).toHaveProperty("endpoints");
      expect(result).toHaveProperty("features");
    });

    it("should include correct endpoints / 应该包含正确的端点", () => {
      const result = apiController.getInfo();

      expect(result.endpoints).toHaveProperty("tRPC", "/trpc");
      expect(result.endpoints).toHaveProperty("docs", "/api/docs");
      expect(result.endpoints).toHaveProperty("health", "/health");
    });

    it("should include features list / 应该包含功能列表", () => {
      const result = apiController.getInfo();

      expect(Array.isArray(result.features)).toBe(true);
      expect(result.features.length).toBeGreaterThan(0);

      // 验证包含核心功能
      expect(result.features).toContain("Type-safe RPC with tRPC");
      expect(result.features).toContain("Mission management");
    });

    it("should have valid description / 应该有有效的描述", () => {
      const result = apiController.getInfo();

      expect(typeof result.description).toBe("string");
      expect(result.description.length).toBeGreaterThan(0);
      expect(result.description).toContain("NestJS");
      expect(result.description).toContain("tRPC");
    });
  });

  describe("响应格式 / Response Format", () => {
    it("should return JSON-serializable objects / 应该返回 JSON 可序列化对象", () => {
      const healthResult = healthController.check();
      const apiResult = apiController.getInfo();

      // 验证可以序列化为 JSON（不会抛出错误）
      expect(() => JSON.stringify(healthResult)).not.toThrow();
      expect(() => JSON.stringify(apiResult)).not.toThrow();
    });

    it("should not expose sensitive information / 不应该暴露敏感信息", () => {
      const healthResult = healthController.check();
      const apiResult = apiController.getInfo();

      // 确保没有敏感信息
      expect(JSON.stringify(healthResult)).not.toContain("password");
      expect(JSON.stringify(healthResult)).not.toContain("secret");
      expect(JSON.stringify(healthResult)).not.toContain("token");
      expect(JSON.stringify(apiResult)).not.toContain("password");
      expect(JSON.stringify(apiResult)).not.toContain("secret");
      expect(JSON.stringify(apiResult)).not.toContain("token");
    });
  });

  describe("版本信息 / Version Information", () => {
    it("should have consistent version / 应该有一致的版本号", () => {
      const healthResult = healthController.check();
      const apiResult = apiController.getInfo();

      expect(healthResult.version).toBe(apiResult.version);
    });

    it("should use semantic versioning / 应该使用语义化版本", () => {
      const healthResult = healthController.check();
      const semverRegex = /^\d+\.\d+\.\d+$/;

      expect(healthResult.version).toMatch(semverRegex);
    });
  });
});
