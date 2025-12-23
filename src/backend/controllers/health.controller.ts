import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "健康检查" })
  @ApiResponse({ status: 200, description: "服务正常运行" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: "Starship Commander Backend",
      version: "2.0.0",
    };
  }
}

@ApiTags("api")
@Controller("api")
export class ApiController {
  @Get("info")
  @ApiOperation({ summary: "API 信息" })
  @ApiResponse({ status: 200, description: "获取 API 基本信息" })
  getInfo() {
    return {
      name: "Starship Commander API",
      version: "2.0.0",
      description: "AI-powered task management with NestJS + tRPC + React",
      endpoints: {
        tRPC: "/trpc",
        docs: "/api/docs",
        health: "/health",
      },
      features: [
        "Type-safe RPC with tRPC",
        "Mission management",
        "User progress tracking",
        "Achievement system",
        "Multi-language support (en/zh)",
      ],
    };
  }
}
