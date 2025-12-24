// Authentication Validation Schemas / 认证验证模式
// Zod schemas for validating authentication-related requests
// 使用 Zod 验证认证相关的请求

import { z } from "zod";

/**
 * Registration Schema / 注册验证模式
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/\d/, "Password must contain at least one number"),
    displayName: z
      .string()
      .min(1, "Display name is required")
      .max(50, "Display name must be less than 50 characters")
      .optional(),
    preferredLang: z
      .enum(["en", "zh"])
      .optional(),
  })
  .strict();

/**
 * Login Schema / 登录验证模式
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email format"),
    password: z
      .string()
      .min(1, "Password is required"),
  })
  .strict();

/**
 * Refresh Token Schema / 刷新令牌验证模式
 */
export const refreshTokenSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required"),
  })
  .strict();

/**
 * Logout Schema / 登出验证模式
 */
export const logoutSchema = z
  .object({
    refreshToken: z
      .string()
      .min(1, "Refresh token is required"),
  })
  .strict();

/**
 * Get Current User Schema / 获取当前用户验证模式
 */
export const getCurrentUserSchema = z.object({}).strict();
