/**
 * Error utility functions / 错误工具函数
 *
 * Provides utilities for error handling and message extraction
 * 提供错误处理和消息提取的工具函数
 */

/**
 * Extract error message from various error types
 * 从各种错误类型中提取错误消息
 *
 * @param error - The error to extract message from / 要提取消息的错误
 * @returns User-friendly error message / 用户友好的错误消息
 */
export function getErrorMessage(error: unknown): string {
  // Handle Error instances / 处理 Error 实例
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors / 处理字符串错误
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with message property / 处理带有 message 属性的对象
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  // Handle objects with data.message (tRPC errors) / 处理带有 data.message 的对象（tRPC 错误）
  if (
    error &&
    typeof error === "object" &&
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "message" in error.data
  ) {
    return String(error.data.message);
  }

  // Handle objects with error property / 处理带有 error 属性的对象
  if (
    error &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "object" &&
    error.error &&
    "message" in error.error
  ) {
    return String(error.error.message);
  }

  // Default message / 默认消息
  return "未知错误，请稍后重试 / Unknown error, please try again later";
}

/**
 * Check if error is a network-related error
 * 检查错误是否是网络相关错误
 *
 * @param error - The error to check / 要检查的错误
 * @returns True if network error / 如果是网络错误则返回 true
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("enotfound") ||
    message.includes("failed to fetch") ||
    message.includes("network request failed")
  );
}

/**
 * Check if error is a validation error
 * 检查错误是否是验证错误
 *
 * @param error - The error to check / 要检查的错误
 * @returns True if validation error / 如果是验证错误则返回 true
 */
export function isValidationError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required") ||
    message.includes("must be") ||
    message.includes("zod")
  );
}

/**
 * Check if error is an authentication error
 * 检查错误是否是认证错误
 *
 * @param error - The error to check / 要检查的错误
 * @returns True if authentication error / 如果是认证错误则返回 true
 */
export function isAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("unauthorized") ||
    message.includes("not authenticated") ||
    message.includes("must be logged in") ||
    message.includes("401")
  );
}

/**
 * Get user-friendly error title based on error type
 * 根据错误类型获取用户友好的错误标题
 *
 * @param error - The error to categorize / 要分类的错误
 * @returns Error title / 错误标题
 */
export function getErrorTitle(error: unknown): string {
  if (isAuthError(error)) {
    return "认证失败 / Authentication Failed";
  }

  if (isNetworkError(error)) {
    return "网络错误 / Network Error";
  }

  if (isValidationError(error)) {
    return "输入验证失败 / Validation Error";
  }

  return "操作失败 / Operation Failed";
}

/**
 * Log error to console with context
 * 将错误记录到控制台并附带上下文
 *
 * @param context - The operation context / 操作上下文
 * @param error - The error to log / 要记录的错误
 * @param data - Additional context data / 额外的上下文数据
 */
export function logError(
  context: string,
  error: unknown,
  data?: Record<string, unknown>
): void {
  console.error(`[Error in ${context}]`, {
    error,
    message: getErrorMessage(error),
    type: error instanceof Error ? error.constructor.name : typeof error,
    ...(data && { context: data }),
  });
}

/**
 * TODO: Send error to error tracking service (e.g., Sentry)
 * TODO：发送错误到错误追踪服务（如 Sentry）
 *
 * @param context - The operation context / 操作上下文
 * @param error - The error to track / 要追踪的错误
 * @param data - Additional context data / 额外的上下文数据
 */
/*
export function trackError(
  context: string,
  error: unknown,
  data?: Record<string, unknown>
): void {
  // Example implementation with Sentry:
  // Sentry.captureException(error, {
  //   tags: { context },
  //   extra: data,
  // });

  console.warn("[Error tracking not configured]", { context, error, data });
}
*/
