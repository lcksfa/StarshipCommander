// JWT Configuration / JWT 配置
// JWT token generation and validation settings
// JWT token 生成和验证设置

/**
 * JWT Configuration / JWT 配置
 *
 * Security considerations / 安全考虑:
 * - Access tokens are short-lived (15 minutes) / 访问令牌短期有效（15分钟）
 * - Refresh tokens are long-lived (7 days) / 刷新令牌长期有效（7天）
 * - Use HS256 algorithm for simplicity / 使用 HS256 算法简化实现
 * - TODO: In production, use RS256 (asymmetric encryption) / TODO: 生产环境使用 RS256（非对称加密）
 */
export const jwtConfig = {
  // Access Token Configuration / 访问令牌配置
  accessTokenExpiry: "15m", // 15 minutes / 15分钟

  // Refresh Token Configuration / 刷新令牌配置
  refreshTokenExpiry: "7d", // 7 days / 7天

  // Algorithm / 算法
  algorithm: "HS256" as const,

  // Secret key (should be in environment variable in production)
  // 密钥（生产环境应该使用环境变量）
  secret: process.env.JWT_SECRET || "starship-commander-secret-key-change-in-production",

  // Issuer / 签发者
  issuer: "starship-commander",

  // Audience / 受众
  audience: "starship-commander-users",
};

/**
 * JWT Payload Interface / JWT 载荷接口
 */
export interface JWTPayload extends Record<string, unknown> {
  // User information / 用户信息
  userId: string;
  email: string;

  // Token metadata / Token 元数据
  iat?: number; // Issued at / 签发时间
  exp?: number; // Expiration time / 过期时间
  iss?: string; // Issuer / 签发者
  aud?: string; // Audience / 受众
  type?: string; // Token type (access or refresh) / Token 类型（访问或刷新）
}

/**
 * Token Pair Interface / Token 对接口
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds / 访问令牌过期时间（秒）
}
