/**
 * Prisma Service Integration Tests / Prisma 服务集成测试
 *
 * 测试目标：验证数据库服务的关键功能
 * 验收标准：
 * 1. 生命周期钩子正确工作
 * 2. 健康检查功能正常
 * 3. 数据库初始化逻辑正确
 * 4. 清理功能正确处理环境
 */

import { PrismaService } from "./prisma.service";

describe("PrismaService / Prisma 服务", () => {
  let prismaService: PrismaService;

  beforeEach(() => {
    prismaService = new PrismaService();
    process.env.NODE_ENV = "test";
  });

  describe("Lifecycle Hooks / 生命周期钩子", () => {
    it("should connect on module init / 应该在模块初始化时连接", async () => {
      // Mock $connect 方法
      prismaService.$connect = jest.fn().mockResolvedValue(undefined);

      await prismaService.onModuleInit();

      expect(prismaService.$connect).toHaveBeenCalledTimes(1);
    });

    it("should disconnect on module destroy / 应该在模块销毁时断开连接", async () => {
      // Mock $disconnect 方法
      prismaService.$disconnect = jest.fn().mockResolvedValue(undefined);

      await prismaService.onModuleDestroy();

      expect(prismaService.$disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe("healthCheck / 健康检查", () => {
    it("should return healthy status when database is accessible / 应该在数据库可访问时返回健康状态", async () => {
      // Mock $queryRaw 方法
      prismaService.$queryRaw = jest.fn().mockResolvedValue([{ 1: 1 }]);

      const result = await prismaService.healthCheck();

      expect(prismaService.$queryRaw).toHaveBeenCalled();
      expect(result).toHaveProperty("status", "healthy");
      expect(result).toHaveProperty("timestamp");
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it("should return unhealthy status when database fails / 应该在数据库失败时返回不健康状态", async () => {
      const error = new Error("Connection lost");
      prismaService.$queryRaw = jest.fn().mockRejectedValue(error);

      const result = await prismaService.healthCheck();

      expect(result).toHaveProperty("status", "unhealthy");
      expect(result).toHaveProperty("error", error.message);
      expect(result).toHaveProperty("timestamp");
    });
  });

  describe("initializeDatabase / 初始化数据库", () => {
    it("should initialize database successfully / 应该成功初始化数据库", async () => {
      // Mock $connect 方法
      prismaService.$connect = jest.fn().mockResolvedValue(undefined);

      // Mock mission.count 和 userStats.count
      prismaService.mission = {
        count: jest.fn().mockResolvedValue(5),
      } as any;
      prismaService.userStats = {
        count: jest.fn().mockResolvedValue(2),
      } as any;

      const result = await prismaService.initializeDatabase();

      expect(prismaService.$connect).toHaveBeenCalled();
      expect(result).toHaveProperty("initialized", true);
      expect(result).toHaveProperty("missionCount", 5);
      expect(result).toHaveProperty("userStatsCount", 2);
    });

    it("should handle initialization errors / 应该处理初始化错误", async () => {
      const error = new Error("Database connection failed");
      prismaService.$connect = jest.fn().mockRejectedValue(error);

      await expect(prismaService.initializeDatabase()).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("clearDatabase / 清理数据库", () => {
    it("should clear all tables in correct order / 应该按正确顺序清理所有表", async () => {
      // Mock $transaction 方法
      prismaService.$transaction = jest.fn().mockResolvedValue([
        { count: 1 },
        { count: 2 },
        { count: 3 },
        { count: 4 },
        { count: 5 },
        { count: 6 },
        { count: 7 },
      ]);

      // Mock deleteMany 方法
      prismaService.missionHistory = {
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      } as any;
      prismaService.achievement = {
        deleteMany: jest.fn().mockResolvedValue({ count: 2 }),
      } as any;
      prismaService.mission = {
        deleteMany: jest.fn().mockResolvedValue({ count: 3 }),
      } as any;
      prismaService.userStats = {
        deleteMany: jest.fn().mockResolvedValue({ count: 4 }),
      } as any;
      prismaService.userAchievement = {
        deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
      } as any;
      prismaService.userMission = {
        deleteMany: jest.fn().mockResolvedValue({ count: 6 }),
      } as any;
      prismaService.userProgress = {
        deleteMany: jest.fn().mockResolvedValue({ count: 7 }),
      } as any;

      const result = await prismaService.clearDatabase();

      expect(prismaService.$transaction).toHaveBeenCalled();
      expect(result).toHaveProperty("cleared", true);
    });

    it("should throw error in production environment / 应该在生产环境抛出错误", async () => {
      process.env.NODE_ENV = "production";

      await expect(prismaService.clearDatabase()).rejects.toThrow(
        "Cannot clear database in production environment"
      );

      // Reset to test
      process.env.NODE_ENV = "test";
    });
  });

  describe("createSeedData / 创建种子数据", () => {
    it("should create seed missions / 应该创建种子任务", async () => {
      const mockCreatedMission = {
        id: "mission-1",
        title: "牙齿维护协议",
        isActive: true,
        createdAt: new Date(),
      };

      prismaService.mission = {
        create: jest.fn().mockResolvedValue(mockCreatedMission),
      } as any;

      const result = await prismaService.createSeedData();

      expect(prismaService.mission.create).toHaveBeenCalledTimes(6);
      expect(result).toHaveProperty("missionsCreated", 6);
    });

    it("should include all required seed missions / 应该包含所有必需的种子任务", async () => {
      prismaService.mission = {
        create: jest.fn().mockResolvedValue({
          id: "1",
          isActive: true,
        }),
      } as any;

      await prismaService.createSeedData();

      expect(prismaService.mission.create).toHaveBeenCalledTimes(6);

      const createdTitles = (prismaService.mission.create as jest.Mock).mock.calls.map(
        (call: any[]) => call[0].data.title
      );

      expect(createdTitles).toContain("牙齿维护协议");
      expect(createdTitles).toContain("数据摄入");
    });
  });
});
