import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import type { MissionService } from "../services/mission.service.js";

// 全局 service 实例（从 main.ts 设置）
let missionServiceInstance: MissionService | null = null;

export function setMissionService(instance: MissionService) {
  missionServiceInstance = instance;
}

@ApiTags("missions")
@Controller("api/missions")
export class MissionController {
  private get missionService() {
    if (!missionServiceInstance) {
      throw new Error("MissionService not initialized");
    }
    return missionServiceInstance;
  }

  @Get()
  @ApiOperation({ summary: "获取所有任务" })
  @ApiQuery({
    name: "category",
    required: false,
    enum: ["study", "health", "chore", "creative"],
  })
  @ApiQuery({ name: "isDaily", required: false, type: Boolean })
  @ApiQuery({ name: "isActive", required: false, type: Boolean })
  @ApiQuery({
    name: "difficulty",
    required: false,
    enum: ["EASY", "MEDIUM", "HARD"],
  })
  @ApiResponse({ status: 200, description: "成功获取任务列表" })
  async getAllMissions(
    @Query("category") category?: string,
    @Query("isDaily") isDaily?: string,
    @Query("isActive") isActive?: string,
    @Query("difficulty") difficulty?: string,
  ) {
    const filters: Parameters<MissionService["getAllMissions"]>[0] = {};
    if (category) filters.category = category as any;
    if (isDaily !== undefined) filters.isDaily = isDaily === "true";
    if (isActive !== undefined) filters.isActive = isActive === "true";
    if (difficulty) filters.difficulty = difficulty as any;

    const missions = await this.missionService.getAllMissions(filters);
    return {
      success: true,
      data: missions,
      count: missions.length,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取单个任务" })
  @ApiParam({ name: "id", description: "任务 ID" })
  @ApiResponse({ status: 200, description: "成功获取任务" })
  @ApiResponse({ status: 404, description: "任务不存在" })
  async getMission(@Param("id") id: string) {
    const mission = await this.missionService.getMission(id);
    if (!mission) {
      return { success: false, error: "Mission not found" };
    }
    return {
      success: true,
      data: mission,
    };
  }

  @Post("complete")
  @ApiOperation({ summary: "完成任务" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        missionId: { type: "string", description: "任务 ID" },
        userId: { type: "string", description: "用户 ID" },
      },
      required: ["missionId", "userId"],
    },
  })
  @ApiResponse({ status: 200, description: "成功完成任务" })
  @ApiResponse({ status: 400, description: "请求参数错误" })
  @ApiResponse({ status: 404, description: "任务或用户不存在" })
  async completeMission(@Body() body: { missionId: string; userId: string }) {
    try {
      const result = await this.missionService.completeMission(
        body.missionId,
        body.userId,
      );
      return {
        success: true,
        data: result,
        message: result.message,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: message,
      };
    }
  }

  @Get("daily/:userId")
  @ApiOperation({ summary: "获取用户的每日任务" })
  @ApiParam({ name: "userId", description: "用户 ID" })
  @ApiResponse({ status: 200, description: "成功获取每日任务" })
  async getDailyMissions(@Param("userId") userId: string) {
    const missions = await this.missionService.getDailyMissions(userId);
    return {
      success: true,
      data: missions,
      count: missions.length,
    };
  }

  @Post("stats")
  @ApiOperation({ summary: "获取任务统计" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "用户 ID" },
        dateFrom: { type: "string", description: "开始日期 (ISO 8601)" },
        dateTo: { type: "string", description: "结束日期 (ISO 8601)" },
      },
      required: ["userId"],
    },
  })
  @ApiResponse({ status: 200, description: "成功获取统计数据" })
  async getMissionStats(
    @Body() body: { userId: string; dateFrom?: string; dateTo?: string },
  ) {
    try {
      const stats = await this.missionService.getMissionStats(body.userId, {
        from: body.dateFrom ? new Date(body.dateFrom) : new Date(),
        to: body.dateTo ? new Date(body.dateTo) : new Date(),
      });
      return {
        success: true,
        data: stats,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: message,
      };
    }
  }
}

@ApiTags("history")
@Controller("api/history")
export class HistoryController {
  private get missionService() {
    if (!missionServiceInstance) {
      throw new Error("MissionService not initialized");
    }
    return missionServiceInstance;
  }

  @Get(":userId")
  @ApiOperation({ summary: "获取用户历史记录" })
  @ApiParam({ name: "userId", description: "用户 ID" })
  @ApiQuery({ name: "dateFrom", required: false, type: String })
  @ApiQuery({ name: "dateTo", required: false, type: String })
  @ApiResponse({ status: 200, description: "成功获取历史记录" })
  async getUserHistory(
    @Param("userId") userId: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
  ) {
    try {
      const stats = await this.missionService.getMissionStats(userId, {
        from: dateFrom ? new Date(dateFrom) : undefined,
        to: dateTo ? new Date(dateTo) : undefined,
      });
      return {
        success: true,
        data: stats,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: message,
      };
    }
  }
}
