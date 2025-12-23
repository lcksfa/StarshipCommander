// 错误处理工具
// Error handling utilities

/**
 * 安全获取错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "Unknown error occurred";
}

/**
 * 检查错误消息是否包含特定字符串
 */
export function errorContains(error: unknown, searchString: string): boolean {
  const message = getErrorMessage(error);
  return message.includes(searchString);
}
