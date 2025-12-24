# User Authentication System Design
# 用户认证系统设计文档

**Date**: 2025-12-24
**Feature**: User Registration and Login
**Status**: Design Phase

---

## 📋 需求分析 / Requirements Analysis

### 当前问题 / Current Issues
1. ❌ 无用户注册功能 - 用户只能通过种子数据创建
2. ❌ 无用户登录功能 - 使用临时 `x-user-id` 请求头认证
3. ❌ 无会话管理 - 无 token 过期机制
4. ❌ 安全性低 - 用户ID直接暴露在请求头中

### 目标功能 / Target Features
1. ✅ 用户注册 - 创建新账户
2. ✅ 用户登录 - 验证身份并获取 token
3. ✅ JWT 认证 - 使用 JSON Web Token 进行会话管理
4. ✅ 自动刷新 - token 过期前自动刷新
5. ✅ 登出功能 - 清除客户端认证信息

---

## 🏗️ 系统架构设计 / System Architecture

### 认证流程 / Authentication Flow

```
┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│   Frontend  │          │   Backend   │          │   Database  │
└──────┬──────┘          └──────┬──────┘          └──────┬──────┘
       │                        │                        │
       │ 1. Register/Login      │                        │
       ├───────────────────────>│                        │
       │                        │                        │
       │                        │ 2. Validate User      │
       │                        ├───────────────────────>│
       │                        │                        │
       │                        │ 3. Return User Data   │
       │                        │<───────────────────────│
       │                        │                        │
       │ 4. Generate JWT Token  │                        │
       │                        │                        │
       │ 5. Return Token + User │                        │
       │<───────────────────────│                        │
       │                        │                        │
       │ 6. Store Token         │                        │
       │ (localStorage + Cookie)│                        │
       │                        │                        │
       │ 7. API Call (with Token)│                       │
       ├───────────────────────>│                        │
       │                        │                        │
       │                        │ 8. Verify Token       │
       │                        │                        │
       │                        │ 9. Process Request    │
       │                        │                        │
       │ 10. Return Response    │                        │
       │<───────────────────────│                        │
```

---

## 📊 数据库设计 / Database Design

### 1. User 表（用户基本信息）
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  username      String?   @unique
  passwordHash  String    // bcrypt hash

  // Profile information / 个人信息
  displayName   String?
  avatar        String?
  preferredLang  Language  @default(zh)

  // Account status / 账户状态
  isActive      Boolean   @default(true)
  isVerified    Boolean   @default(false)

  // Timestamps / 时间戳
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt    DateTime?

  // Relations / 关系
  stats         UserStats?
  sessions      Session[]

  @@map("users")
}
```

### 2. Session 表（会话管理）
```prisma
model Session {
  id          String   @id @default(cuid())
  userId      String

  // Token information / Token 信息
  token       String   @unique
  refreshToken String? @unique

  // Device and location info / 设备和位置信息
  userAgent   String?
  ipAddress   String?

  // Expiration / 过期时间
  expiresAt   DateTime

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations / 关系
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
  @@map("sessions")
}
```

### 3. 修改 UserStats 表
```prisma
// 添加外键关系
model UserStats {
  id          String   @id @default(cuid())
  userId      String   @unique

  // ... existing fields ...

  // NEW: Add foreign key to User / 新增：外键关联到 User
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_stats")
}
```

---

## 🔐 安全设计 / Security Design

### JWT Token 结构
```typescript
interface JWTPayload {
  userId: string;        // User ID
  email: string;         // User email
  iat: number;           // Issued at
  exp: number;           // Expiration time
}

interface JWTConfig {
  accessTokenExpiry: string;     // "15m"
  refreshTokenExpiry: string;    // "7d"
  algorithm: "HS256" | "RS256";  // HS256 for simplicity
}
```

### 密码策略
- 最小长度：8 个字符
- 必须包含：字母 + 数字
- 使用 bcrypt 加密（salt rounds: 10）

### API 安全
- HTTPS only (生产环境)
- CORS 配置
- Rate limiting（可选）
- Token 刷新机制

---

## 🔌 API 接口设计 / API Design

### 1. 注册接口 / Register
```typescript
POST /api/auth/register
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "displayName": "Starship Commander",
  "preferredLang": "zh"
}

Response (201):
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "displayName": "Starship Commander"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}

Error (400):
{
  "success": false,
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "该邮箱已被注册"
  }
}
```

### 2. 登录接口 / Login
```typescript
POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "tokens": { /* tokens object */ }
  }
}

Error (401):
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "邮箱或密码错误"
  }
}
```

### 3. Token 刷新接口 / Refresh Token
```typescript
POST /api/auth/refresh
Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

### 4. 登出接口 / Logout
```typescript
POST /api/auth/logout
Headers:
  Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "data": {
    "message": "登出成功"
  }
}
```

### 5. 获取当前用户信息 / Get Current User
```typescript
GET /api/auth/me
Headers:
  Authorization: Bearer <accessToken>

Response (200):
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "stats": { /* user stats object */ }
  }
}
```

---

## 🎨 前端设计 / Frontend Design

### 组件结构 / Component Structure
```
src/frontend/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx          # 登录表单
│   │   ├── RegisterForm.tsx       # 注册表单
│   │   └── AuthGuard.tsx          # 路由守卫
├── contexts/
│   └── AuthContext.tsx            # 认证上下文
├── hooks/
│   └── useAuth.ts                 # 认证相关 hooks
├── lib/
│   └── auth-api.ts                # 认证 API 客户端
└── types/
    └── auth.ts                    # 认证类型定义
```

### AuthContext 设计
```typescript
interface AuthContextValue {
  // State / 状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Methods / 方法
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

interface User {
  id: string;
  email: string;
  displayName?: string;
  preferredLang: Language;
  stats?: UserStats;
}
```

---

## 🔧 技术栈 / Tech Stack

### 后端 / Backend
- **JWT**: jsonwebtoken (npm)
- **密码加密**: bcrypt (npm)
- **验证**: Zod schemas
- **NestJS Guards**: AuthGuard

### 前端 / Frontend
- **状态管理**: React Context
- **表单处理**: React Hook Form
- **表单验证**: Zod + React Hook Form
- **UI 组件**: Tailwind CSS + Lucide Icons
- **Token 存储**: localStorage + httpOnly cookie (可选)

---

## 📝 开发计划 / Development Plan

### Phase 1: 数据库和后端基础 (1-2天)
- [ ] 更新 Prisma schema
- [ ] 创建数据库迁移
- [ ] 实现 JWT 工具类
- [ ] 实现密码加密工具

### Phase 2: 后端 API (2-3天)
- [ ] 实现注册接口
- [ ] 实现登录接口
- [ ] 实现 token 刷新接口
- [ ] 实现登出接口
- [ ] 添加认证 Guard

### Phase 3: 前端 UI (2-3天)
- [ ] 创建登录页面组件
- [ ] 创建注册页面组件
- [ ] 实现 AuthContext
- [ ] 实现认证 hooks
- [ ] 实现路由守卫

### Phase 4: 集成和测试 (1-2天)
- [ ] 更新 API 客户端
- [ ] 集成到现有页面
- [ ] 编写单元测试
- [ ] 编写 E2E 测试

### Phase 5: 文档和优化 (1天)
- [ ] API 文档
- [ ] 用户文档
- [ ] 代码审查
- [ ] 性能优化

**总计**: 7-11 个工作日

---

## ✅ 验收标准 / Acceptance Criteria

### 功能测试 / Functional Testing
1. ✅ 用户可以使用邮箱和密码注册
2. ✅ 用户可以使用邮箱和密码登录
3. ✅ 登录后可以访问需要认证的功能
4. ✅ Token 过期后自动刷新
5. ✅ 用户可以登出
6. ✅ 未登录用户会被重定向到登录页

### 安全测试 / Security Testing
1. ✅ 密码使用 bcrypt 加密存储
2. ✅ JWT token 签名验证
3. ✅ Token 过期机制正常工作
4. ✅ 防止 SQL 注入
5. ✅ 防止 XSS 攻击

---

**Document Version**: 1.0
**Last Updated**: 2025-12-24
