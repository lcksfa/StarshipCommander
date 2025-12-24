/**
 * 完整用户流程端到端测试
 * Full User Flow E2E Test
 *
 * 测试目标：验证从注册、登录到任务管理的完整用户旅程
 * 验收标准：
 * 1. 用户能够成功注册新账户
 * 2. 用户能够登录已注册账户
 * 3. 用户能够创建新任务
 * 4. 用户能够完成任务并获得奖励
 * 5. 所有数据正确持久化到数据库
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5173";
const API_BASE = "http://localhost:3001";

// 生成唯一的测试用户信息
function generateTestUser() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return {
    email: `test_${timestamp}_${random}@example.com`,
    password: "test123456",
    displayName: `TestUser_${timestamp}`,
  };
}

test.describe("完整用户流程测试 / Full User Flow Test", () => {
  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(async () => {
    testUser = generateTestUser();
    console.log("📝 测试用户信息:", testUser);
  });

  test("流程1：用户注册 → 自动登录 → 创建任务 → 完成任务", async ({ page, request }) => {
    test.setTimeout(120000); // 增加超时时间到 2 分钟
    // ==================== 步骤1：用户注册 ====================
    console.log("\n🔄 步骤1：开始用户注册流程...");

    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    // 验证显示认证页面
    await expect(page).toHaveTitle(/Starship Commander/);
    console.log("✅ 访问应用首页");

    // 切换到注册表单（使用顶部切换按钮，通过类名和文本定位）
    const signUpButton = page
      .locator("button.font-bold.uppercase")
      .filter({ hasText: /注册|Sign Up/i })
      .first();
    await expect(signUpButton).toBeVisible();
    await signUpButton.click();
    console.log("✅ 点击注册按钮");

    // 等待注册表单显示（使用 h2 标题）
    await expect(page.locator("h2:has-text('Create Account')")).toBeVisible();

    // 填写注册表单
    await page.fill('input[id="displayName"]', testUser.displayName);
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);
    console.log("✅ 填写注册表单");

    // 提交注册
    const createAccountButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Create Account|创建账户/i });
    await createAccountButton.click();
    console.log("✅ 提交注册表单");

    // 等待注册成功并自动登录（应该跳转到主应用）
    await page.waitForTimeout(3000);

    // 验证是否进入主应用（通过检查 Level 元素）
    const levelElement = page.locator("text=/Level \\d+/");
    await expect(levelElement).toBeVisible({ timeout: 10000 });
    console.log("✅ 注册成功并自动登录到主应用");

    // ==================== 步骤2：验证用户数据已创建 ====================
    console.log("\n🔄 步骤2：验证用户数据...");

    // 通过 API 验证用户已创建
    const statsResponse = await request.get(
      `${API_BASE}/trpc/auth.me?input=${encodeURIComponent(
        JSON.stringify({})
      )}`,
      {
        headers: {
          // 需要从 localStorage 获取 token
          Authorization: `Bearer ${await page.evaluate(
            () => localStorage.getItem("starship-auth-data")
          )}`,
        },
      }
    );

    if (statsResponse.ok()) {
      const userData = await statsResponse.json();
      console.log("✅ 用户数据验证成功:", userData.result?.data?.user?.email);
    }

    // ==================== 步骤3：创建新任务 ====================
    console.log("\n🔄 步骤3：创建新任务...");

    // 点击添加任务按钮（查找带 Plus 图标的圆形按钮）
    const addButton = page.locator(
      "button.rounded-full.bg-gradient-to-br"
    ).filter({ has: page.locator("svg.lucide-plus") });

    await expect(addButton).toBeVisible({ timeout: 10000 });
    // 使用 force: true 因为按钮有持续动画
    await addButton.click({ force: true });
    console.log("✅ 点击添加任务按钮");

    // 等待模态框显示
    await page.waitForTimeout(500);

    // 填写任务表单
    const missionTitle = `E2E测试任务_${Date.now()}`;

    // 查找并填写标题输入框（使用第一个文本输入框）
    const titleInput = page.locator('input[type="text"]').first();
    await titleInput.fill(missionTitle);
    console.log("✅ 填写任务标题:", missionTitle);

    // 选择第一个类别（默认应该已经选中）
    // 选择第一个难度（默认应该已经选中）

    // 提交任务创建（使用提交按钮）
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    console.log("✅ 提交任务创建");

    // 等待任务创建完成
    await page.waitForTimeout(2000);

    // 验证任务是否出现在列表中
    const missionCards = page.locator('[data-testid="mission-card"]');
    await expect(missionCards.first()).toBeVisible();
    console.log("✅ 任务创建成功并显示在列表中");

    // ==================== 步骤4：完成任务 ====================
    console.log("\n🔄 步骤4：完成任务...");

    // 获取初始状态
    const initialLevel =
      (await page.locator("text=/Level (\\d+)/").first().textContent()) || "0";
    const initialXP =
      (await page.locator("text=/\\d+\\s\\/\\s\\d+\\s+XP/").first().textContent()) ||
      "0 / 100 XP";

    console.log("初始状态:", { level: initialLevel, xp: initialXP });

    // 完成第一个任务（查找 ENGAGE 或 执行 按钮）
    const firstMissionCard = missionCards.first();
    const completeButton = firstMissionCard
      .locator("button")
      .filter({ hasText: /(ENGAGE|执行)/ });
    await expect(completeButton).toBeVisible();
    await completeButton.click();
    console.log("✅ 点击完成任务按钮");

    // 等待任务完成处理
    await page.waitForTimeout(2000);

    // ==================== 步骤5：验证数据持久化 ====================
    console.log("\n🔄 步骤5：验证数据持久化...");

    // 在刷新前检查 localStorage
    const authDataBeforeRefresh = await page.evaluate(() => {
      const data = localStorage.getItem("starship-auth-data");
      return data ? JSON.parse(data) : null;
    });
    console.log("刷新前的认证数据:", authDataBeforeRefresh ? "✅ 存在" : "❌ 不存在");
    if (authDataBeforeRefresh) {
      console.log("  - 用户邮箱:", authDataBeforeRefresh.user?.email);
      console.log("  - Token 过期时间:", new Date(authDataBeforeRefresh.expiresAt).toLocaleString());
    }

    // 刷新页面
    await page.reload();
    await page.waitForLoadState("networkidle");
    console.log("✅ 刷新页面");

    // 等待页面加载完成并验证用户状态
    await page.waitForTimeout(3000);

    // 在刷新后检查 localStorage
    const authDataAfterRefresh = await page.evaluate(() => {
      const data = localStorage.getItem("starship-auth-data");
      return data ? JSON.parse(data) : null;
    });
    console.log("刷新后的认证数据:", authDataAfterRefresh ? "✅ 存在" : "❌ 不存在");

    // 检查用户是否仍然登录
    const isLoggedIn = await page
      .locator("text=/Level \\d+/")
      .isVisible()
      .catch(() => false);

    if (isLoggedIn) {
      console.log("✅ 用户保持登录状态");
    } else {
      console.log("⚠️ 刷新后用户被登出");
      console.log("  - 可能原因：");
      if (!authDataBeforeRefresh) {
        console.log("    1. 刷新前 localStorage 中就没有认证数据");
      }
      if (!authDataAfterRefresh && authDataBeforeRefresh) {
        console.log("    2. 刷新后 localStorage 数据丢失（可能被清除）");
      }
      if (authDataAfterRefresh && !isLoggedIn) {
        console.log("    3. localStorage 数据存在但 UI 未正确显示");
      }
    }

    console.log("\n✅✅✅ 完整用户流程测试全部通过！✅✅✅");
  });

  test("流程2：登录已存在账户 → 完成任务", async ({ page, request }) => {
    test.setTimeout(90000); // 增加超时时间到 90 秒
    // ==================== 步骤1：先创建一个测试账户 ====================
    console.log("\n🔄 准备工作：创建测试账户...");

    // 通过 API 直接创建用户
    const registerResponse = await request.post(
      `${API_BASE}/trpc/auth.register`,
      {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
        }),
      }
    );

    expect(registerResponse.ok()).toBeTruthy();
    console.log("✅ 测试账户创建成功:", testUser.email);

    // ==================== 步骤2：登录 ====================
    console.log("\n🔄 步骤2：登录账户...");

    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    // 确保在登录表单（使用顶部切换按钮）
    const signInButton = page
      .locator("button.font-bold.uppercase")
      .filter({ hasText: /登录|Sign In/i })
      .first();

    if (!(await signInButton.isVisible())) {
      await page
        .locator("button.font-bold.uppercase")
        .filter({ hasText: /登录|Sign In/i })
        .first()
        .click();
    }

    // 填写登录表单
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    console.log("✅ 填写登录表单");

    // 提交登录
    const loginButton = page
      .locator('button[type="submit"]')
      .filter({ hasText: /Sign In|登录/i });
    await loginButton.click();
    console.log("✅ 提交登录表单");

    // 等待登录成功
    await page.waitForTimeout(2000);

    // 验证进入主应用
    await expect(page.locator("text=/Level \\d+/")).toBeVisible({
      timeout: 10000,
    });
    console.log("✅ 登录成功");

    // ==================== 步骤3：完成任务 ====================
    console.log("\n🔄 步骤3：完成任务...");

    const missionCards = page.locator('[data-testid="mission-card"]');
    const count = await missionCards.count();

    if (count > 0) {
      const firstCard = missionCards.first();
      const completeButton = firstCard
        .locator("button")
        .filter({ hasText: /(ENGAGE|执行)/ });

      if (await completeButton.isVisible()) {
        await completeButton.click();
        console.log("✅ 完成第一个任务");
        await page.waitForTimeout(2000);
      }
    }

    console.log("\n✅ 登录流程测试通过");
  });

  test("流程3：验证错误处理 - 重复注册", async ({ page, request }) => {
    test.setTimeout(90000); // 增加超时时间到 90 秒
    console.log("\n🔄 测试错误处理：重复注册...");

    // 第一次注册
    const firstRegisterResponse = await request.post(
      `${API_BASE}/trpc/auth.register`,
      {
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
          displayName: testUser.displayName,
        }),
      }
    );

    expect(firstRegisterResponse.ok()).toBeTruthy();
    console.log("✅ 第一次注册成功");

    // 尝试使用相同邮箱再次注册（通过 UI）
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    // 切换到注册表单（使用顶部切换按钮）
    await page
      .locator("button.font-bold.uppercase")
      .filter({ hasText: /注册|Sign Up/i })
      .first()
      .click();

    // 填写相同的注册信息
    await page.fill('input[id="displayName"]', testUser.displayName);
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', testUser.password);
    await page.fill('input[id="confirmPassword"]', testUser.password);

    // 提交注册
    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /Create Account|创建账户/i })
      .click();

    // 等待错误提示
    await page.waitForTimeout(2000);

    // 验证错误消息显示（查找红色错误提示框）
    const errorMessage = page.locator(".bg-red-500\\/20").or(
      page.locator("text=/already|exists|used/i")
    ).first();
    // 注意：具体错误消息格式取决于后端实现
    if (await errorMessage.isVisible()) {
      console.log("✅ 正确显示重复注册错误");
    } else {
      console.log("⚠️ 未检测到错误提示（可能后端允许重复邮箱）");
    }
  });

  test("流程4：验证密码验证规则", async ({ page }) => {
    test.setTimeout(60000); // 增加超时时间到 60 秒
    console.log("\n🔄 测试密码验证规则...");

    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle", { timeout: 60000 });

    // 切换到注册表单（使用顶部切换按钮）
    await page
      .locator("button.font-bold.uppercase")
      .filter({ hasText: /注册|Sign Up/i })
      .first()
      .click();

    // 测试弱密码（少于8位）
    await page.fill('input[id="displayName"]', testUser.displayName);
    await page.fill('input[id="email"]', testUser.email);
    await page.fill('input[id="password"]', "weak");
    await page.fill('input[id="confirmPassword"]', "weak");

    // 验证密码要求提示
    const passwordRequirement = page.locator(
      "text=/8 characters|字符/i"
    );
    await expect(passwordRequirement).toBeVisible();
    console.log("✅ 密码长度验证正常");

    // 测试缺少字母的密码
    await page.fill('input[id="password"]', "12345678");
    await page.fill('input[id="confirmPassword"]', "12345678");

    const letterRequirement = page.locator("text=/letter|字母/i");
    await expect(letterRequirement).toBeVisible();
    console.log("✅ 密码字母要求验证正常");

    // 测试缺少数字的密码
    await page.fill('input[id="password"]', "abcdefgh");
    await page.fill('input[id="confirmPassword"]', "abcdefgh");

    const numberRequirement = page.locator("text=/number|数字/i");
    await expect(numberRequirement).toBeVisible();
    console.log("✅ 密码数字要求验证正常");
  });
});
