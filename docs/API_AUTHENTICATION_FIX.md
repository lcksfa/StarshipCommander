# API Authentication Fix Report
# API 认证修复报告

**Date**: 2025-12-24
**Issue**: UNAUTHORIZED error when creating missions
**Status**: ✅ Fixed

---

## 问题描述 / Problem Description

### 错误信息 / Error Message
```json
{
  "error": {
    "message": "You must be logged in to perform this action",
    "code": -32001,
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "missions.createMission"
    }
  }
}
```

### 重现步骤 / Steps to Reproduce
1. 打开前端应用
2. 点击"创建任务"按钮
3. 填写任务信息并提交
4. 收到 401 UNAUTHORIZED 错误

---

## 根本原因分析 / Root Cause Analysis

### 1. 后端认证机制 / Backend Authentication

**文件**: `src/backend/main.ts:63-76`
```typescript
const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to perform this action",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
```

**关键点**:
- `createMission` 使用 `protectedProcedure`（第 137 行）
- 要求 `ctx.user` 必须存在
- 否则抛出 UNAUTHORIZED 错误

### 2. 用户识别实现 / User Identification

**文件**: `src/backend/context.ts:61-87`
```typescript
async function getUserFromRequest(req: IncomingMessage): Promise<User | null> {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    email: `${userId}@example.com`,
    role: "user",
  };
}
```

**关键点**:
- 后端从 `x-user-id` 请求头中提取用户ID
- 如果请求头不存在，返回 `null`
- 导致 `ctx.user` 为 `null`

### 3. 前端缺失请求头 / Frontend Missing Header

**文件**: `src/frontend/lib/trpc.ts:61-73` (修复前)
```typescript
const options: RequestInit = {
  method,
  headers: {
    "Content-Type": "application/json",
    // ❌ 缺少 "x-user-id" 请求头
  },
  signal: AbortSignal.timeout(30000),
};
```

**关键点**:
- 前端 API 客户端只发送 `Content-Type` 请求头
- **没有发送 `x-user-id` 请求头**
- 后端无法识别用户身份

---

## 解决方案 / Solution

### 修改文件 / Modified File

**文件**: `src/frontend/lib/trpc.ts`

### 修改内容 / Changes

#### 1. 添加 `getUserId()` 方法
```typescript
/**
 * 获取当前用户 ID
 * Get current user ID from localStorage
 */
private getUserId(): string {
  return localStorage.getItem("starship-user-id") || "";
}
```

#### 2. 在请求中添加 `x-user-id` 请求头
```typescript
private async call<T>(
  endpoint: string,
  input?: any,
  method: "GET" | "POST" = "POST",
): Promise<T> {
  try {
    let url = `${this.baseUrl}${endpoint}`;
    const userId = this.getUserId(); // ✅ 获取用户ID

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(userId && { "x-user-id": userId }), // ✅ 添加用户ID请求头
      },
      signal: AbortSignal.timeout(30000),
    };
```

---

## 测试验证 / Testing

### 验证步骤 / Verification Steps
1. ✅ 前端应用已加载并存储用户ID到 localStorage
2. ✅ 所有 API 请求现在自动包含 `x-user-id` 请求头
3. ✅ 后端成功从请求头中提取用户ID
4. ✅ `createMission` API 可以正常调用

### 预期结果 / Expected Results
- ✅ 创建任务不再出现 401 错误
- ✅ 其他需要认证的 API 也能正常工作

---

## 后续改进建议 / Future Improvements

### 1. 实现更安全的认证机制 / Implement Secure Authentication

**当前方案** (临时):
- 使用简单的 `x-user-id` 请求头
- 用户ID存储在 localStorage
- 无加密验证

**推荐方案** (长期):
- 实现 JWT (JSON Web Token) 认证
- 添加 token 刷新机制
- 实现登录/登出流程
- 加密存储敏感信息

### 2. 统一认证上下文 / Unified Authentication Context

创建统一的认证管理模块：
```typescript
// src/frontend/lib/auth.ts
export class AuthManager {
  private static instance: AuthManager;

  static getInstance() {
    if (!this.instance) {
      this.instance = new AuthManager();
    }
    return this.instance;
  }

  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Authorization': `Bearer ${token}`,
      'x-user-id': this.getUserId(),
    };
  }
}
```

### 3. 添加认证拦截器 / Add Auth Interceptor

自动处理认证失败：
```typescript
// 当收到 401 错误时
if (response.status === 401) {
  // 清除过期的认证信息
  AuthManager.getInstance().clearAuth();
  // 重定向到登录页面
  window.location.href = '/login';
}
```

### 4. 用户体验改进 / UX Improvements

- 在创建任务前验证用户登录状态
- 显示友好的错误提示
- 提供重新登录的选项
- 实现自动登录功能

---

## 相关文件 / Related Files

### 后端 / Backend
- `src/backend/main.ts` - tRPC 路由配置
- `src/backend/context.ts` - 用户认证上下文

### 前端 / Frontend
- `src/frontend/lib/trpc.ts` - API 客户端（已修复）
- `src/frontend/App.tsx` - 用户ID管理

### 测试 / Tests
- `tests/e2e/mission-creation.spec.ts` - E2E 测试（已更新）

---

## 总结 / Summary

### 问题 / Problem
前端 API 客户端缺少认证请求头，导致后端无法识别用户身份

### 根本原因 / Root Cause
- `TrpcApiClient.call()` 方法没有发送 `x-user-id` 请求头
- 后端的 `protectedProcedure` 要求必须有用户信息

### 解决方案 / Solution
在所有 API 请求中自动添加 `x-user-id` 请求头

### 影响 / Impact
- ✅ 修复了创建任务的认证问题
- ✅ 所有需要认证的 API 现在都能正常工作
- ⚠️  仍然是临时方案，需要实现更安全的认证机制

---

**Document Version**: 1.0
**Last Updated**: 2025-12-24
