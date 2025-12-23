/**
 * Mission Controller Unit Tests / Mission 控制器单元测试
 *
 * 测试目标：验证 Mission REST API 端点
 * 验收标准：
 * 1. 所有端点正确响应
 * 2. 查询参数正确处理
 * 3. 错误情况正确处理
 * 4. MissionService 正确调用
 */

import {
  MissionController,
  HistoryController,
  setMissionService,
} from "./mission.controller";

// Mock MissionService
const mockMissionService = {
  getAllMissions: jest.fn(),
  getMission: jest.fn(),
  completeMission: jest.fn(),
  getDailyMissions: jest.fn(),
  getMissionStats: jest.fn(),
  getUserHistory: jest.fn(),
};

describe("MissionController / Mission 控制器", () => {
  let missionController: MissionController;

  beforeEach(() => {
    // 设置 mock service
    setMissionService(mockMissionService);
    missionController = new MissionController();

    // 清除所有 mock 调用
    jest.clearAllMocks();
  });

  describe("getAllMissions / 获取所有任务", () => {
    it("should return all missions without filters / 应该返回所有任务（无过滤）", async () => {
      const mockMissions = [
        { id: "1", title: "Mission 1" },
        { id: "2", title: "Mission 2" },
      ];
      mockMissionService.getAllMissions.mockResolvedValue(mockMissions);

      const result = await missionController.getAllMissions();

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({});
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data", mockMissions);
      expect(result).toHaveProperty("count", 2);
    });

    it("should filter by category / 应该按类别过滤", async () => {
      mockMissionService.getAllMissions.mockResolvedValue([]);

      await missionController.getAllMissions("study");

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({
        category: "study",
      });
    });

    it("should filter by isDaily / 应该按是否每日任务过滤", async () => {
      mockMissionService.getAllMissions.mockResolvedValue([]);

      await missionController.getAllMissions(undefined, "true");

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({
        isDaily: true,
      });

      jest.clearAllMocks();
      await missionController.getAllMissions(undefined, "false");

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({
        isDaily: false,
      });
    });

    it("should filter by isActive / 应该按是否活跃过滤", async () => {
      mockMissionService.getAllMissions.mockResolvedValue([]);

      await missionController.getAllMissions(undefined, undefined, "true");

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it("should filter by difficulty / 应该按难度过滤", async () => {
      mockMissionService.getAllMissions.mockResolvedValue([]);

      await missionController.getAllMissions(
        undefined,
        undefined,
        undefined,
        "EASY"
      );

      expect(mockMissionService.getAllMissions).toHaveBeenCalledWith({
        difficulty: "EASY",
      });
    });

    it("should handle service errors / 应该处理服务错误", async () => {
      const error = new Error("Database error");
      mockMissionService.getAllMissions.mockRejectedValue(error);

      await expect(missionController.getAllMissions()).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getMission / 获取单个任务", () => {
    it("should return mission when found / 应该在找到时返回任务", async () => {
      const mockMission = { id: "123", title: "Test Mission" };
      mockMissionService.getMission.mockResolvedValue(mockMission);

      const result = await missionController.getMission("123");

      expect(mockMissionService.getMission).toHaveBeenCalledWith("123");
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data", mockMission);
    });

    it("should return error when mission not found / 应该在任务未找到时返回错误", async () => {
      mockMissionService.getMission.mockResolvedValue(null);

      const result = await missionController.getMission("non-existent");

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", "Mission not found");
    });
  });

  describe("completeMission / 完成任务", () => {
    it("should complete mission successfully / 应该成功完成任务", async () => {
      const mockResult = {
        success: true,
        xpEarned: 50,
        coinEarned: 25,
        message: "Mission completed!",
      };
      mockMissionService.completeMission.mockResolvedValue(mockResult);

      const result = await missionController.completeMission({
        missionId: "123",
        userId: "user-1",
      });

      expect(mockMissionService.completeMission).toHaveBeenCalledWith(
        "123",
        "user-1"
      );
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data", mockResult);
    });

    it("should handle completion errors / 应该处理完成错误", async () => {
      const error = new Error("Mission not found");
      mockMissionService.completeMission.mockRejectedValue(error);

      const result = await missionController.completeMission({
        missionId: "999",
        userId: "user-1",
      });

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", error.message);
    });
  });

  describe("getDailyMissions / 获取每日任务", () => {
    it("should return daily missions for user / 应该返回用户的每日任务", async () => {
      const mockMissions = [
        { id: "1", title: "Daily Mission 1", isDaily: true },
        { id: "2", title: "Daily Mission 2", isDaily: true },
      ];
      mockMissionService.getDailyMissions.mockResolvedValue(mockMissions);

      const result = await missionController.getDailyMissions("user-123");

      expect(mockMissionService.getDailyMissions).toHaveBeenCalledWith("user-123");
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data", mockMissions);
      expect(result).toHaveProperty("count", 2);
    });
  });

  describe("getMissionStats / 获取任务统计", () => {
    it("should return stats for user / 应该返回用户统计", async () => {
      const mockStats = {
        totalMissions: 100,
        completedMissions: 75,
        completionRate: 75,
        xpEarned: 5000,
        coinsEarned: 2000,
      };
      mockMissionService.getMissionStats.mockResolvedValue(mockStats);

      const result = await missionController.getMissionStats({
        userId: "user-123",
      });

      expect(mockMissionService.getMissionStats).toHaveBeenCalledWith(
        "user-123",
        expect.any(Object)
      );
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data", mockStats);
    });

    it("should handle date filters / 应该处理日期过滤器", async () => {
      mockMissionService.getMissionStats.mockResolvedValue({});

      const dateFrom = "2024-01-01T00:00:00.000Z";
      const dateTo = "2024-12-31T23:59:59.999Z";

      await missionController.getMissionStats({
        userId: "user-123",
        dateFrom,
        dateTo,
      });

      expect(mockMissionService.getMissionStats).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          from: new Date(dateFrom),
          to: new Date(dateTo),
        })
      );
    });

    it("should handle stats errors / 应该处理统计错误", async () => {
      const error = new Error("User not found");
      mockMissionService.getMissionStats.mockRejectedValue(error);

      const result = await missionController.getMissionStats({
        userId: "non-existent",
      });

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", error.message);
    });
  });
});

describe("HistoryController / History 控制器", () => {
  let historyController: HistoryController;

  beforeEach(() => {
    setMissionService(mockMissionService);
    historyController = new HistoryController();
    jest.clearAllMocks();
  });

  describe("getUserHistory / 获取用户历史", () => {
    it("should return user history / 应该返回用户历史", async () => {
      const mockHistory = [
        { missionId: "1", completedAt: new Date() },
        { missionId: "2", completedAt: new Date() },
      ];
      mockMissionService.getMissionStats.mockResolvedValue({
        totalMissions: 2,
        history: mockHistory,
      });

      const result = await historyController.getUserHistory("user-123");

      expect(mockMissionService.getMissionStats).toHaveBeenCalledWith(
        "user-123",
        expect.any(Object)
      );
      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("data");
    });

    it("should handle date filters / 应该处理日期过滤器", async () => {
      mockMissionService.getMissionStats.mockResolvedValue({});

      const dateFrom = "2024-01-01T00:00:00.000Z";
      const dateTo = "2024-12-31T23:59:59.999Z";

      await historyController.getUserHistory(
        "user-123",
        dateFrom,
        dateTo
      );

      expect(mockMissionService.getMissionStats).toHaveBeenCalledWith(
        "user-123",
        expect.objectContaining({
          from: new Date(dateFrom),
          to: new Date(dateTo),
        })
      );
    });

    it("should handle history errors / 应该处理历史错误", async () => {
      const error = new Error("Failed to fetch history");
      mockMissionService.getMissionStats.mockRejectedValue(error);

      const result = await historyController.getUserHistory("user-123");

      expect(result).toHaveProperty("success", false);
      expect(result).toHaveProperty("error", error.message);
    });
  });
});
