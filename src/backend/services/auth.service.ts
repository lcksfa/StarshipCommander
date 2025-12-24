// Authentication Service / 认证服务
// Handles user authentication, registration, and token management
// 处理用户认证、注册和 token 管理

import { PrismaClient } from "@prisma/client";
import { SignJWT, jwtVerify } from "jose";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "../utils/password.util.js";
import { jwtConfig, type JWTPayload, type TokenPair } from "../config/jwt.config.js";

/**
 * Authentication Service / 认证服务
 *
 * Provides methods for:
 * - User registration / 用户注册
 * - User login / 用户登录
 * - Token generation and validation / Token 生成和验证
 * - Token refresh / Token 刷新
 * - Logout / 登出
 */
export class AuthService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Register a new user
   * 注册新用户
   *
   * @param email - User email / 用户邮箱
   * @param password - User password / 用户密码
   * @param displayName - Optional display name / 可选显示名称
   * @returns Created user object (without password) / 创建的用户对象（不包含密码）
   *
   * @throws Error if email already exists / 如果邮箱已存在则抛出错误
   * @throws Error if password is too weak / 如果密码太弱则抛出错误
   */
  async register(
    email: string,
    password: string,
    displayName?: string,
    preferredLang: "en" | "zh" = "zh"
  ) {
    try {
      // Validate email format / 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Validate password strength / 验证密码强度
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.error);
      }

      // Check if email already exists / 检查邮箱是否已存在
      const existingUser = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new Error("Email already registered");
      }

      // Hash password / 哈希密码
      const passwordHash = await hashPassword(password);

      // Create user / 创建用户
      const user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          displayName: displayName || email.split("@")[0],
          preferredLang,
          isActive: true,
          isVerified: false,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          avatar: true,
          preferredLang: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
        },
      });

      // Create user stats / 创建用户统计
      await this.prisma.userStats.create({
        data: {
          userId: user.id,
          preferredLang,
        },
      });

      return user;
    } catch (error) {
      throw new Error(
        `Registration failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Login user
   * 用户登录
   *
   * @param email - User email / 用户邮箱
   * @param password - User password / 用户密码
   * @returns User object and token pair / 用户对象和 token 对
   *
   * @throws Error if credentials are invalid / 如果凭据无效则抛出错误
   * @throws Error if user is inactive / 如果用户未激活则抛出错误
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: any; tokens: TokenPair }> {
    try {
      // Find user by email / 通过邮箱查找用户
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Verify password / 验证密码
      const isValidPassword = await verifyPassword(password, user.passwordHash);

      if (!isValidPassword) {
        throw new Error("Invalid email or password");
      }

      // Check if user is active / 检查用户是否激活
      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Update last login time / 更新最后登录时间
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate tokens / 生成 token
      const tokens = await this.generateTokens(user.id, user.email);

      // Save session to database / 保存会话到数据库
      await this.saveSession(user.id, tokens);

      // Return user data (without password) and tokens / 返回用户数据（不包含密码）和 token
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        tokens,
      };
    } catch (error) {
      throw new Error(
        `Login failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Generate access and refresh tokens
   * 生成访问令牌和刷新令牌
   *
   * @param userId - User ID / 用户 ID
   * @param email - User email / 用户邮箱
   * @returns Token pair / Token 对
   */
  private async generateTokens(
    userId: string,
    email: string
  ): Promise<TokenPair> {
    try {
      // Create secret key / 创建密钥
      const secretKey = new TextEncoder().encode(jwtConfig.secret);

      // Create access token / 创建访问令牌
      const accessToken = await new SignJWT({
        userId,
        email,
        iss: jwtConfig.issuer,
        aud: jwtConfig.audience,
      } as unknown as JWTPayload)
        .setProtectedHeader({ alg: jwtConfig.algorithm })
        .setIssuedAt()
        .setExpirationTime(jwtConfig.accessTokenExpiry)
        .sign(secretKey);

      // Create refresh token / 创建刷新令牌
      const refreshToken = await new SignJWT({
        userId,
        email,
        type: "refresh",
        iss: jwtConfig.issuer,
        aud: jwtConfig.audience,
      } as unknown as JWTPayload)
        .setProtectedHeader({ alg: jwtConfig.algorithm })
        .setIssuedAt()
        .setExpirationTime(jwtConfig.refreshTokenExpiry)
        .sign(secretKey);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.parseTimeToSeconds(jwtConfig.accessTokenExpiry),
      };
    } catch (error) {
      throw new Error(
        `Token generation failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Save session to database
   * 保存会话到数据库
   *
   * @param userId - User ID / 用户 ID
   * @param tokens - Token pair / Token 对
   */
  private async saveSession(userId: string, tokens: TokenPair) {
    try {
      // Calculate expiration date / 计算过期日期
      const expiresAt = new Date();
      expiresAt.setSeconds(
        expiresAt.getSeconds() +
          this.parseTimeToSeconds(jwtConfig.refreshTokenExpiry)
      );

      await this.prisma.session.create({
        data: {
          userId,
          token: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to save session: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Verify access token
   * 验证访问令牌
   *
   * @param token - Access token / 访问令牌
   * @returns Decoded payload / 解码后的载荷
   *
   * @throws Error if token is invalid / 如果 token 无效则抛出错误
   */
  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const secretKey = new TextEncoder().encode(jwtConfig.secret);
      const { payload } = await jwtVerify(token, secretKey);

      return payload as unknown as JWTPayload;
    } catch (error) {
      throw new Error(
        `Token verification failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Refresh access token using refresh token
   * 使用刷新令牌刷新访问令牌
   *
   * @param refreshToken - Refresh token / 刷新令牌
   * @returns New token pair / 新的 token 对
   *
   * @throws Error if refresh token is invalid / 如果刷新令牌无效则抛出错误
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token / 验证刷新令牌
      const secretKey = new TextEncoder().encode(jwtConfig.secret);
      const { payload } = await jwtVerify(refreshToken, secretKey);

      const tokenPayload = payload as unknown as JWTPayload;

      // Check if it's a refresh token / 检查是否是刷新令牌
      if (tokenPayload.type !== "refresh") {
        throw new Error("Invalid refresh token");
      }

      // Check if session exists in database / 检查数据库中是否存在会话
      const session = await this.prisma.session.findUnique({
        where: { refreshToken },
        include: { user: true },
      });

      if (!session) {
        throw new Error("Session not found");
      }

      // Check if session is expired / 检查会话是否过期
      if (session.expiresAt < new Date()) {
        // Delete expired session / 删除过期会话
        await this.prisma.session.delete({ where: { refreshToken } });
        throw new Error("Session expired");
      }

      // Generate new tokens / 生成新 token
      const newTokens = await this.generateTokens(
        tokenPayload.userId,
        tokenPayload.email
      );

      // Delete old session and create new one / 删除旧会话并创建新会话
      await this.prisma.session.delete({ where: { refreshToken } });
      await this.saveSession(tokenPayload.userId, newTokens);

      return newTokens;
    } catch (error) {
      throw new Error(
        `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Logout user
   * 用户登出
   *
   * @param refreshToken - Refresh token to invalidate / 要失效的刷新令牌
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await this.prisma.session.delete({
        where: { refreshToken },
      });
    } catch (error) {
      throw new Error(
        `Logout failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Parse time string to seconds
   * 将时间字符串转换为秒
   *
   * @param timeString - Time string (e.g., "15m", "7d", "1h") / 时间字符串（例如："15m"、"7d"、"1h"）
   * @returns Time in seconds / 时间（秒）
   */
  private parseTimeToSeconds(timeString: string): number {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1), 10);

    switch (unit) {
      case "s":
        return value;
      case "m":
        return value * 60;
      case "h":
        return value * 60 * 60;
      case "d":
        return value * 24 * 60 * 60;
      default:
        throw new Error(`Invalid time format: ${timeString}`);
    }
  }

  /**
   * Clean up expired sessions
   * 清理过期会话
   *
   * This method should be called periodically (e.g., via cron job)
   * 此方法应该定期调用（例如：通过 cron 作业）
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return result.count;
    } catch (error) {
      throw new Error(
        `Failed to cleanup expired sessions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

// Export singleton instance / 导出单例实例
export const authService = new AuthService();
