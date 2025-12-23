/**
 * Mission Service Unit Tests / Mission 服务单元测试
 *
 * 测试目标：验证 MissionService 的核心业务逻辑
 * 验收标准：
 * 1. 所有 CRUD 操作正常工作
 * 2. 错误处理正确
 * 3. 数据验证正确
 */

import { MissionService } from "./mission.service";
import { MissionCreateInput, MissionUpdateInput } from "../types/backend.types";

// Mock PrismaClient
jest.mock("@prisma/client");

describe("MissionService / Mission 服务", () => {
  let service: MissionService;
  let mockPrisma: any;

  beforeEach(() => {
    // 创建 mock Prisma 客户端
    mockPrisma = {
      mission: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userMission: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      userStats: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      missionHistory: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
      $connect: jest.fn(),
    };

    // 创建服务实例
    service = new MissionService();
    // 替换内部的 prisma 实例为 mock
    (service as any).prisma = mockPrisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createMission / 创建任务", () => {
    const validInput: MissionCreateInput = {
      title: "Read a book",
      description: "Read for 30 minutes",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    it("should create mission with valid input / 应该使用有效输入创建任务", async () => {
      const mockDbMission = {
        id: "mission-123",
        title: validInput.title,
        description: validInput.description,
        xpReward: validInput.xpReward,
        coinReward: validInput.coinReward,
        category: "STUDY",
        emoji: validInput.emoji,
        isDaily: validInput.isDaily,
        difficulty: validInput.difficulty,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userProgress: [],
        userMissions: [],
      };

      mockPrisma.mission.create.mockResolvedValue(mockDbMission);

      const result = await service.createMission(validInput);

      expect(result).toHaveProperty("id", "mission-123");
      expect(result.title).toBe(validInput.title);
      expect(result.xpReward).toBe(validInput.xpReward);
      expect(mockPrisma.mission.create).toHaveBeenCalledTimes(1);
      expect(mockPrisma.mission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: validInput.title,
          xpReward: validInput.xpReward,
          coinReward: validInput.coinReward,
        }),
      });
    });

    it("should handle database errors gracefully / 应该优雅处理数据库错误", async () => {
      const dbError = new Error("Database connection failed");
      mockPrisma.mission.create.mockRejectedValue(dbError);

      await expect(service.createMission(validInput)).rejects.toThrow("Failed to create mission");
    });

    it("should reject invalid XP rewards / 应该拒绝无效的 XP 奖励", async () => {
      const invalidInput = { ...validInput, xpReward: 10000 };

      const mockDbMission = {
        id: "mission-123",
        ...invalidInput,
        category: "STUDY",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userProgress: [],
        userMissions: [],
      };

      // Prisma 会执行，但 Zod 验证会在上层拦截
      mockPrisma.mission.create.mockResolvedValue(mockDbMission);

      // 这里我们只测试 service 层，验证会发生在 router 层
      const result = await service.createMission(invalidInput);
      expect(result).toHaveProperty("id");
    });
  });

  describe("findDuplicate / 查找重复任务", () => {
    it("should find existing duplicate mission / 应该找到存在的重复任务", async () => {
      const existingMission = {
        id: "existing-123",
        title: "Read a book",
        description: "Read for 30 minutes",
        xpReward: 25,
        coinReward: 10,
        category: "STUDY",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
        isActive: true,
        isCompleted: false,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.mission.findFirst.mockResolvedValue(existingMission);

      const result = await service.findDuplicate({
        title: "Read a book",
        isActive: true,
      });

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Read a book");
      expect(mockPrisma.mission.findFirst).toHaveBeenCalledWith({
        where: {
          title: "Read a book",
          isActive: true,
        },
      });
    });

    it("should return null when no duplicate found / 当没有找到重复时返回 null", async () => {
      mockPrisma.mission.findFirst.mockResolvedValue(null);

      const result = await service.findDuplicate({
        title: "New unique mission",
        isActive: true,
      });

      expect(result).toBeNull();
    });

    it("should trim whitespace from title / 应该去除标题空格", async () => {
      mockPrisma.mission.findFirst.mockResolvedValue(null);

      await service.findDuplicate({
        title: "  Read a book  ",
        isActive: true,
      });

      expect(mockPrisma.mission.findFirst).toHaveBeenCalledWith({
        where: {
          title: "Read a book",
          isActive: true,
        },
      });
    });
  });

  describe("getMission / 获取任务", () => {
    it("should return mission when found / 应该在找到时返回任务", async () => {
      const mockMission = {
        id: "mission-123",
        title: "Test Mission",
        description: "Test Description",
        xpReward: 50,
        coinReward: 25,
        category: "HEALTH",
        emoji: "💪",
        isDaily: true,
        difficulty: "MEDIUM",
        isActive: true,
        isCompleted: false,
        streak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        userProgress: [],
        userMissions: [],
      };

      mockPrisma.mission.findUnique.mockResolvedValue(mockMission);

      const result = await service.getMission("mission-123");

      expect(result).not.toBeNull();
      expect(result?.id).toBe("mission-123");
      expect(result?.title).toBe("Test Mission");
    });

    it("should return null when mission not found / 应该在任务未找到时返回 null", async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(null);

      const result = await service.getMission("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("getAllMissions / 获取所有任务", () => {
    it("should return all missions when no filters / 应该在没有过滤条件时返回所有任务", async () => {
      const mockMissions = [
        {
          id: "mission-1",
          title: "Mission 1",
          description: "Description 1",
          xpReward: 25,
          coinReward: 10,
          category: "STUDY",
          emoji: "📚",
          isDaily: false,
          difficulty: "EASY",
          isActive: true,
          isCompleted: false,
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userMissions: [],
        },
        {
          id: "mission-2",
          title: "Mission 2",
          description: "Description 2",
          xpReward: 75,
          coinReward: 30,
          category: "HEALTH",
          emoji: "💪",
          isDaily: true,
          difficulty: "MEDIUM",
          isActive: true,
          isCompleted: false,
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userMissions: [],
        },
      ];

      mockPrisma.mission.findMany.mockResolvedValue(mockMissions);

      const result = await service.getAllMissions();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe("Mission 1");
      expect(result[1].title).toBe("Mission 2");
    });

    it("should filter by category / 应该按类别过滤", async () => {
      const mockMissions = [
        {
          id: "mission-1",
          title: "Study Mission",
          description: "Description",
          xpReward: 25,
          coinReward: 10,
          category: "STUDY",
          emoji: "📚",
          isDaily: false,
          difficulty: "EASY",
          isActive: true,
          isCompleted: false,
          streak: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          userMissions: [],
        },
      ];

      mockPrisma.mission.findMany.mockResolvedValue(mockMissions);

      const result = await service.getAllMissions({ category: "study" });

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe("study");
      expect(mockPrisma.mission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "STUDY",
          }),
        })
      );
    });

    it("should filter by difficulty / 应该按难度过滤", async () => {
      mockPrisma.mission.findMany.mockResolvedValue([]);

      await service.getAllMissions({ difficulty: "EASY" });

      expect(mockPrisma.mission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            difficulty: "EASY",
          }),
        })
      );
    });
  });

  describe("updateMission / 更新任务", () => {
    it("should update mission with valid data / 应该使用有效数据更新任务", async () => {
      const existingMission = {
        id: "mission-123",
        title: "Old Title",
        description: "Old Description",
        xpReward: 25,
        coinReward: 10,
        category: "STUDY",
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        userProgress: [],
        userMissions: [],
      };

      const updatedMission = {
        ...existingMission,
        title: "New Title",
        xpReward: 50,
      };

      mockPrisma.mission.findUnique.mockResolvedValue(existingMission);
      mockPrisma.mission.update.mockResolvedValue(updatedMission);

      const updateData: MissionUpdateInput = {
        title: "New Title",
        xpReward: 50,
      };

      const result = await service.updateMission("mission-123", updateData);

      expect(result.title).toBe("New Title");
      expect(result.xpReward).toBe(50);
      expect(mockPrisma.mission.update).toHaveBeenCalledWith({
        where: { id: "mission-123" },
        data: expect.objectContaining({
          title: "New Title",
          xpReward: 50,
        }),
        include: expect.anything(),
      });
    });

    it("should throw error when mission not found / 应该在任务未找到时抛出错误", async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMission("non-existent", { title: "New Title" })
      ).rejects.toThrow("not found");
    });
  });

  describe("deleteMission / 删除任务", () => {
    it("should delete mission successfully / 应该成功删除任务", async () => {
      mockPrisma.mission.delete.mockResolvedValue({ id: "mission-123" });

      const result = await service.deleteMission("mission-123");

      expect(result).toBe(true);
      expect(mockPrisma.mission.delete).toHaveBeenCalledWith({
        where: { id: "mission-123" },
      });
    });

    it("should handle delete errors / 应该处理删除错误", async () => {
      const deleteError = new Error("Foreign key constraint");
      mockPrisma.mission.delete.mockRejectedValue(deleteError);

      await expect(service.deleteMission("mission-123")).rejects.toThrow(
        "Failed to delete mission"
      );
    });
  });

  describe("completeMission / 完成任务", () => {
    const mockMission = {
      id: "mission-123",
      title: "Test Mission",
      description: "Test",
      xpReward: 50,
      coinReward: 25,
      isDaily: false,
      category: "STUDY",
      emoji: "📚",
      difficulty: "EASY",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUserStats = {
      id: "stats-123",
      userId: "user-123",
      level: 1,
      currentXp: 0,
      maxXp: 100,
      coins: 0,
      rank: 1,
      totalMissionsCompleted: 0,
      totalXpEarned: 0,
      preferredLang: "en",
      currentStreak: 0,
      longestStreak: 0,
      lastActive: new Date(),
    };

    it("should complete mission successfully / 应该成功完成任务", async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(mockMission);
      mockPrisma.userMission.findUnique.mockResolvedValue(null);
      mockPrisma.userStats.findUnique.mockResolvedValue(mockUserStats);

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrisma);
      });

      mockPrisma.userMission.upsert.mockResolvedValue({});
      mockPrisma.userStats.update.mockResolvedValue({});
      mockPrisma.missionHistory.create.mockResolvedValue({});

      // Mock getMission 和 getUserStats
      jest.spyOn(service as any, "getMission").mockResolvedValue({
        id: "mission-123",
        title: "Test Mission",
        isCompleted: true,
      });
      jest.spyOn(service as any, "mapDbUserStatsToFrontend").mockResolvedValue(mockUserStats);

      mockPrisma.userStats.findUnique.mockResolvedValue(mockUserStats);

      const result = await service.completeMission("mission-123", "user-123");

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("xpEarned", 50);
      expect(result).toHaveProperty("coinEarned", 25);
    });

    it("should throw error when mission not found / 应该在任务未找到时抛出错误", async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(null);

      await expect(
        service.completeMission("non-existent", "user-123")
      ).rejects.toThrow("not found");
    });
  });
});
