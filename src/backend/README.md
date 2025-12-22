# Starship Commander Backend

🚀 AI-friendly backend using NestJS + tRPC

## 📁 Directory Structure

```
src/backend/
├── 📄 main.ts                    # Application entry point
├── 📄 app.module.ts              # Root application module
├── 📄 package.json               # Dependencies and scripts
├── 📄 nest-cli.json              # NestJS CLI configuration
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 .env.example               # Environment variables template
│
├── 📂 modules/                   # Feature modules (NestJS modules)
│   └── 📂 mission/               # Mission management feature
│       ├── 📄 mission.module.ts  # Mission module definition
│       ├── 📄 mission.service.ts # Business logic
│       ├── 📄 mission.router.ts  # tRPC router
│       └── 📄 mission.types.ts   # TypeScript types and Zod schemas
│
└── 📂 trpc/                      # tRPC configuration
    ├── 📄 trpc.service.ts         # tRPC core service
    ├── 📄 trpc.module.ts          # tRPC module
    └── 📄 trpc.controller.ts      # tRPC controller (optional)
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Development

```bash
npm run start:dev    # Development with hot reload
npm run start        # Production build
```

### 4. API Documentation

- **Swagger UI**: http://localhost:3001/api/docs
- **tRPC Endpoint**: http://localhost:3001/trpc

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: CORS allowed origin
- `GEMINI_API_KEY`: AI API key (optional)

## 🛠️ Scripts

```bash
npm run build         # Build for production
npm run start:dev     # Development with watch mode
npm run start         # Start production server
npm run lint          # Lint TypeScript code
npm run test          # Run tests
npm run test:cov      # Run tests with coverage
```

## 🏗️ Architecture Features

### tRPC Integration

- ✅ End-to-end type safety
- ✅ Automatic client generation
- ✅ Zero runtime API errors
- ✅ Auto-completion in IDE

### NestJS Patterns

- ✅ Modular architecture
- ✅ Dependency injection
- ✅ Decorator-based programming
- ✅ Built-in validation

### AI Development Friendly

- ✅ Clear separation of concerns
- ✅ Self-documenting code
- ✅ Consistent patterns
- ✅ Easy to extend and maintain

## 📚 API Usage

### tRPC Client Example

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../types/api";

const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3001/trpc",
    }),
  ],
});

// Type-safe API calls
const missions = await client.missions.getAll.query();
const stats = await client.missions.getStats.query();
```

## 🧪 Testing

```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
```
