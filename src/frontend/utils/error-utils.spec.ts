/**
 * Error utility functions tests / 错误工具函数测试
 *
 * 测试目标：验证错误处理和消息提取功能
 * 验收标准：
 * 1. 能够从各种错误类型中提取消息
 * 2. 能够识别网络、验证和认证错误
 * 3. 能够正确记录错误日志
 */

import {
  getErrorMessage,
  isNetworkError,
  isValidationError,
  isAuthError,
  getErrorTitle,
  logError,
} from "./error-utils";

describe("Error Utils / 错误工具函数", () => {
  describe("getErrorMessage", () => {
    it("应该从 Error 实例中提取消息 / should extract message from Error instance", () => {
      const error = new Error("Test error message");
      expect(getErrorMessage(error)).toBe("Test error message");
    });

    it("应该返回字符串本身 / should return string itself", () => {
      const error = "String error message";
      expect(getErrorMessage(error)).toBe("String error message");
    });

    it("应该从带有 message 属性的对象中提取消息 / should extract from object with message property", () => {
      const error = { message: "Object error message" };
      expect(getErrorMessage(error)).toBe("Object error message");
    });

    it("应该从 tRPC 错误格式中提取消息 / should extract from tRPC error format", () => {
      const error = {
        data: { message: "tRPC error message" },
      };
      expect(getErrorMessage(error)).toBe("tRPC error message");
    });

    it("应该从带有 error.message 的对象中提取消息 / should extract from object with error.message", () => {
      const error = {
        error: { message: "Nested error message" },
      };
      expect(getErrorMessage(error)).toBe("Nested error message");
    });

    it("应该为未知错误返回默认消息 / should return default message for unknown error", () => {
      const error = { some: "unknown object" };
      expect(getErrorMessage(error)).toBe(
        "未知错误，请稍后重试 / Unknown error, please try again later"
      );
    });

    it("应该为 null 返回默认消息 / should return default message for null", () => {
      expect(getErrorMessage(null)).toBe(
        "未知错误，请稍后重试 / Unknown error, please try again later"
      );
    });

    it("应该为 undefined 返回默认消息 / should return default message for undefined", () => {
      expect(getErrorMessage(undefined)).toBe(
        "未知错误，请稍后重试 / Unknown error, please try again later"
      );
    });
  });

  describe("isNetworkError", () => {
    it("应该识别网络错误 / should identify network errors", () => {
      const fetchError = new Error("Failed to fetch");
      expect(isNetworkError(fetchError)).toBe(true);

      const networkError = new Error("Network request failed");
      expect(isNetworkError(networkError)).toBe(true);

      const connRefusedError = new Error("ECONNREFUSED");
      expect(isNetworkError(connRefusedError)).toBe(true);
    });

    it("应该识别非网络错误 / should identify non-network errors", () => {
      const validationError = new Error("Validation failed");
      expect(isNetworkError(validationError)).toBe(false);

      const authError = new Error("Unauthorized");
      expect(isNetworkError(authError)).toBe(false);
    });

    it("应该处理非 Error 类型 / should handle non-Error types", () => {
      expect(isNetworkError("string error")).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });
  });

  describe("isValidationError", () => {
    it("应该识别验证错误 / should identify validation errors", () => {
      const zodError = new Error("Zod validation failed");
      expect(isValidationError(zodError)).toBe(true);

      const invalidError = new Error("Invalid input");
      expect(isValidationError(invalidError)).toBe(true);

      const requiredError = new Error("Field is required");
      expect(isValidationError(requiredError)).toBe(true);
    });

    it("应该识别非验证错误 / should identify non-validation errors", () => {
      const networkError = new Error("Network request failed");
      expect(isValidationError(networkError)).toBe(false);

      const authError = new Error("Unauthorized");
      expect(isValidationError(authError)).toBe(false);
    });
  });

  describe("isAuthError", () => {
    it("应该识别认证错误 / should identify auth errors", () => {
      const unauthorizedError = new Error("Unauthorized");
      expect(isAuthError(unauthorizedError)).toBe(true);

      const authError = new Error("Not authenticated");
      expect(isAuthError(authError)).toBe(true);

      const loginError = new Error("Must be logged in");
      expect(isAuthError(loginError)).toBe(true);

      const errorCode = new Error("401 Forbidden");
      expect(isAuthError(errorCode)).toBe(true);
    });

    it("应该识别非认证错误 / should identify non-auth errors", () => {
      const networkError = new Error("Network request failed");
      expect(isAuthError(networkError)).toBe(false);

      const validationError = new Error("Validation failed");
      expect(isAuthError(validationError)).toBe(false);
    });
  });

  describe("getErrorTitle", () => {
    it("应该为认证错误返回正确的标题 / should return correct title for auth errors", () => {
      const error = new Error("Unauthorized");
      expect(getErrorTitle(error)).toBe("认证失败 / Authentication Failed");
    });

    it("应该为网络错误返回正确的标题 / should return correct title for network errors", () => {
      const error = new Error("Failed to fetch");
      expect(getErrorTitle(error)).toBe("网络错误 / Network Error");
    });

    it("应该为验证错误返回正确的标题 / should return correct title for validation errors", () => {
      const error = new Error("Validation failed");
      expect(getErrorTitle(error)).toBe("输入验证失败 / Validation Error");
    });

    it("应该为其他错误返回通用标题 / should return generic title for other errors", () => {
      const error = new Error("Some random error");
      expect(getErrorTitle(error)).toBe("操作失败 / Operation Failed");
    });
  });

  describe("logError", () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on console.error / 监视 console.error
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {
        // Empty implementation to suppress output / 空实现以抑制输出
      });
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it("应该记录错误信息 / should log error information", () => {
      const error = new Error("Test error");
      const context = "testContext";

      logError(context, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error in testContext]",
        expect.objectContaining({
          error,
          message: "Test error",
          type: "Error",
        })
      );
    });

    it("应该记录带有上下文数据的错误 / should log error with context data", () => {
      const error = new Error("Test error");
      const context = "testContext";
      const data = { userId: "user-123", action: "createMission" };

      logError(context, error, data);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error in testContext]",
        expect.objectContaining({
          error,
          message: "Test error",
          context: data,
        })
      );
    });

    it("应该记录 tRPC 错误格式 / should log tRPC error format", () => {
      const error = { data: { message: "tRPC error" } };
      const context = "testContext";

      logError(context, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "[Error in testContext]",
        expect.objectContaining({
          error,
          message: "tRPC error",
          type: "object",
        })
      );
    });
  });
});
