/**
 * 任务创建流程端到端测试
 * Mission Creation Flow E2E Test
 *
 * 测试目标：验证任务创建的完整流程，包括验证和错误处理
 * 验收标准：
 * 1. 能够成功创建有效任务
 * 2. 验证规则正确拦截无效输入
 * 3. 重复任务被正确拒绝
 * 4. 错误提示用户友好
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const API_BASE = "http://localhost:3001";

test.describe("Mission Creation Flow / 任务创建流程测试", () => {
  // 使用前端默认用户 ID，确保测试用户存在
  const TEST_USER_ID = "user_10_1766463362298_8tjuvr";

  // 在所有测试前创建测试用户数据（Test 1 需要用户数据存在）
  test.beforeAll(async ({ request }) => {
    // 创建一个测试任务
    const createResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": TEST_USER_ID,
      },
      data: JSON.stringify({
        title: `E2E Setup_${Date.now()}`,
        description: "Mission to create test user stats",
        xpReward: 10,
        coinReward: 5,
        category: "study",
        emoji: "🚀",
        isDaily: false,
        difficulty: "EASY",
      }),
    });

    if (createResponse.ok()) {
      const missionData = await createResponse.json();
      if (missionData.result?.data?.id) {
        // 完成任务以创建用户统计
        await request.post(`${API_BASE}/trpc/missions.completeMission`, {
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            missionId: missionData.result.data.id,
            userId: TEST_USER_ID,
          }),
        });
      }
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
  });

  test("测试1：验证应用正常加载 / should load application successfully", async ({ page }) => {
    await expect(page).toHaveTitle(/Starship Commander/);

    const levelElement = page.locator("text=/Level \\d+/");
    await expect(levelElement).toBeVisible();

    console.log("✅ 应用加载成功");
  });

  test("测试2：成功创建有效任务 / should create valid mission successfully", async ({ page, request }) => {
    // 准备测试数据
    const missionData = {
      title: `测试任务_${Date.now()}`, // 使用时间戳避免重复
      description: "这是一个自动化测试任务",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    // 通过 API 直接创建任务（模拟前端调用）
    const createResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr", // 模拟认证头
      },
      data: JSON.stringify(missionData),
    });

    console.log("API Response status:", createResponse.status());

    // 验证响应
    expect(createResponse.ok()).toBeTruthy();

    const result = await createResponse.json();
    expect(result).toHaveProperty("result");

    const missionResult = result.result.data;
    expect(missionResult).toHaveProperty("success", true);
    expect(missionResult.data).toHaveProperty("id");
    expect(missionResult.data.title).toBe(missionData.title);

    console.log("✅ 任务创建成功:", missionResult.data.id);
  });

  test("测试3：拒绝奖励不匹配难度的任务 / should reject rewards that don't match difficulty", async ({ page, request }) => {
    // EASY 难度但设置了 HARD 的奖励
    const invalidMissionData = {
      title: `无效任务_${Date.now()}`,
      description: "EASY 任务设置过高奖励",
      xpReward: 200, // EASY max is 50
      coinReward: 100, // EASY max is 25
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    const createResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidMissionData),
    });

    // 应该返回错误
    expect(createResponse.ok()).toBeFalsy();

    const error = await createResponse.json();
    expect(error).toHaveProperty("error");

    console.log("✅ 正确拒绝了不匹配的奖励:", error.error.message);
  });

  test("测试4：拒绝空标题任务 / should reject mission with empty title", async ({ page, request }) => {
    const invalidMissionData = {
      title: "   ", // 只有空格
      description: "空标题任务",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    const createResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidMissionData),
    });

    expect(createResponse.ok()).toBeFalsy();

    const error = await createResponse.json();
    expect(error).toHaveProperty("error");

    console.log("✅ 正确拒绝了空标题任务");
  });

  test("测试5：拒绝无效的 emoji / should reject invalid emoji", async ({ page, request }) => {
    const invalidMissionData = {
      title: `无效表情测试_${Date.now()}`,
      description: "使用无效 emoji",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "abc123", // 不是有效的 emoji
      isDaily: false,
      difficulty: "EASY",
    };

    const createResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidMissionData),
    });

    expect(createResponse.ok()).toBeFalsy();

    const error = await createResponse.json();
    expect(error).toHaveProperty("error");

    console.log("✅ 正确拒绝了无效 emoji");
  });

  test("测试6：拒绝重复任务 / should reject duplicate mission", async ({ page, request }) => {
    const uniqueTitle = `重复测试任务_${Date.now()}`;

    const missionData = {
      title: uniqueTitle,
      description: "测试重复检测",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    // 第一次创建 - 应该成功
    const firstResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(missionData),
    });

    expect(firstResponse.ok()).toBeTruthy();
    console.log("✅ 第一次创建成功");

    // 第二次创建相同标题 - 应该失败
    const secondResponse = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(missionData),
    });

    expect(secondResponse.ok()).toBeFalsy();

    const error = await secondResponse.json();
    expect(error).toHaveProperty("error");
    expect(error.error.data?.code).toBe("CONFLICT");

    console.log("✅ 正确拒绝了重复任务:", error.error.message);
  });

  test("测试7：验证所有难度级别 / should validate all difficulty levels", async ({ request }) => {
    const difficulties = [
      { level: "EASY", xp: 25, coins: 10 },
      { level: "MEDIUM", xp: 75, coins: 30 },
      { level: "HARD", xp: 200, coins: 100 },
    ];

    for (const diff of difficulties) {
      const missionData = {
        title: `${diff.level}_任务_${Date.now()}_${Math.random()}`,
        description: `${diff.level} 难度任务`,
        xpReward: diff.xp,
        coinReward: diff.coins,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: diff.level,
      };

      const response = await request.post(`${API_BASE}/trpc/missions.createMission`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user_10_1766463362298_8tjuvr",
        },
        data: JSON.stringify(missionData),
      });

      expect(response.ok()).toBeTruthy();
      const result = await response.json();
      expect(result.result.data.success).toBe(true);

      console.log(`✅ ${diff.level} 难度任务创建成功`);
    }
  });

  test("测试8：验证边界值 / should validate boundary values", async ({ request }) => {
    // 测试 EASY 边界
    const boundaryTests = [
      { title: "EASY 最小值", xp: 10, coins: 5, difficulty: "EASY", shouldPass: true },
      { title: "EASY 最大值", xp: 50, coins: 25, difficulty: "EASY", shouldPass: true },
      { title: "EASY 超出最小值", xp: 5, coins: 2, difficulty: "EASY", shouldPass: false },
      { title: "EASY 超出最大值", xp: 51, coins: 26, difficulty: "EASY", shouldPass: false },
    ];

    for (const test of boundaryTests) {
      const missionData = {
        title: `${test.title}_${Date.now()}_${Math.random()}`,
        description: "边界值测试",
        xpReward: test.xp,
        coinReward: test.coins,
        category: "study",
        emoji: "📚",
        isDaily: false,
        difficulty: test.difficulty,
      };

      const response = await request.post(`${API_BASE}/trpc/missions.createMission`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user_10_1766463362298_8tjuvr",
        },
        data: JSON.stringify(missionData),
      });

      if (test.shouldPass) {
        expect(response.ok()).toBeTruthy();
        console.log(`✅ ${test.title} 通过验证`);
      } else {
        expect(response.ok()).toBeFalsy();
        console.log(`✅ ${test.title} 被正确拒绝`);
      }
    }
  });

  test("测试9：验证所有类别 / should validate all categories", async ({ request }) => {
    const categories = ["study", "health", "chore", "creative"];

    for (const category of categories) {
      const missionData = {
        title: `${category}_任务_${Date.now()}_${Math.random()}`,
        description: `${category} 类别任务`,
        xpReward: 25,
        coinReward: 10,
        category: category,
        emoji: "📚",
        isDaily: false,
        difficulty: "EASY",
      };

      const response = await request.post(`${API_BASE}/trpc/missions.createMission`, {
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user_10_1766463362298_8tjuvr",
        },
        data: JSON.stringify(missionData),
      });

      expect(response.ok()).toBeTruthy();
      console.log(`✅ ${category} 类别任务创建成功`);
    }
  });

  test("测试10：验证长字符串限制 / should validate string length limits", async ({ request }) => {
    // 标题长度测试
    const longTitle = "a".repeat(101); // 超过 100 字符限制
    const longDescription = "a".repeat(501); // 超过 500 字符限制

    const invalidMission1 = {
      title: longTitle,
      description: "测试",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    const response1 = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidMission1),
    });

    expect(response1.ok()).toBeFalsy();
    console.log("✅ 正确拒绝了过长的标题");

    const invalidMission2 = {
      title: "测试",
      description: longDescription,
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    const response2 = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidMission2),
    });

    expect(response2.ok()).toBeFalsy();
    console.log("✅ 正确拒绝了过长的描述");
  });

  test("测试11：未认证用户应该被拒绝 / should reject unauthenticated user", async ({ request }) => {
    const missionData = {
      title: `未认证测试_${Date.now()}`,
      description: "测试未认证",
      xpReward: 25,
      coinReward: 10,
      category: "study",
      emoji: "📚",
      isDaily: false,
      difficulty: "EASY",
    };

    // 不发送 x-user-id 头
    const response = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        // 故意不发送 x-user-id
      },
      data: JSON.stringify(missionData),
    });

    expect(response.ok()).toBeFalsy();

    const error = await response.json();
    expect(error.error.data?.code).toBe("UNAUTHORIZED");

    console.log("✅ 正确拒绝了未认证用户");
  });

  test("测试12：验证 API 错误响应格式 / should validate API error response format", async ({ request }) => {
    const invalidData = {
      // 缺少必需字段
      title: "",
      description: "",
      xpReward: -1, // 负数
      coinReward: -1,
      category: "invalid", // 无效类别
      emoji: "",
      isDaily: false,
      difficulty: "INVALID", // 无效难度
    };

    const response = await request.post(`${API_BASE}/trpc/missions.createMission`, {
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "user_10_1766463362298_8tjuvr",
      },
      data: JSON.stringify(invalidData),
    });

    expect(response.ok()).toBeFalsy();

    const error = await response.json();
    expect(error).toHaveProperty("error");
    expect(error.error).toHaveProperty("message");

    console.log("✅ API 错误响应格式正确");
  });
});
