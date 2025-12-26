// 连续打卡功能测试脚本 / Streak functionality test script
// 用于测试每日任务的连续打卡逻辑是否正常工作

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 设置任务的最后完成时间为相对今天的天数
 * Set the mission's last completion time to relative days from today
 *
 * @param userId - 用户 ID / User ID
 * @param missionId - 任务 ID / Mission ID
 * @param daysAgo - 几天前（0=今天，1=昨天，2=前天） / Days ago (0=today, 1=yesterday, 2=day before yesterday)
 * @param streak - 设置的连续天数 / Streak count to set
 */
async function setMissionCompletionTime(
  userId: string,
  missionId: string,
  daysAgo: number,
  streak: number,
) {
  // 计算目标时间 / Calculate target time
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() - daysAgo);
  targetDate.setHours(12, 0, 0, 0); // 设置为中午 12 点，避免时区问题 / Set to noon to avoid timezone issues

  console.log(`📅 设置最后完成时间为: ${targetDate.toLocaleString("zh-CN")}`);
  console.log(`🔥 设置连续天数为: ${streak} 天`);

  // 更新 UserMission 记录 / Update UserMission record
  const updated = await prisma.userMission.upsert({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
    create: {
      userId,
      missionId,
      isCompleted: daysAgo === 0, // 只有 0 天前才算今天完成 / Only count as completed if 0 days ago
      completedAt: targetDate,
      streak,
      lastCompleted: targetDate,
    },
    update: {
      isCompleted: daysAgo === 0,
      completedAt: targetDate,
      streak,
      lastCompleted: targetDate,
    },
  });

  console.log(`✅ 更新成功:`, {
    isCompleted: updated.isCompleted,
    streak: updated.streak,
    lastCompleted: updated.lastCompleted?.toLocaleString("zh-CN"),
  });

  return updated;
}

/**
 * 获取用户当前的任务状态 / Get user's current mission status
 */
async function getMissionStatus(userId: string, missionId: string) {
  const userMission = await prisma.userMission.findUnique({
    where: {
      userId_missionId: {
        userId,
        missionId,
      },
    },
    include: {
      mission: true,
    },
  });

  if (!userMission) {
    console.log("❌ 未找到用户任务记录");
    return null;
  }

  console.log("\n📊 当前任务状态:");
  console.log(`   任务名称: ${userMission.mission.title}`);
  console.log(`   是否每日任务: ${userMission.mission.isDaily ? "是" : "否"}`);
  console.log(`   是否已完成: ${userMission.isCompleted ? "是" : "否"}`);
  console.log(`   连续天数: ${userMission.streak}`);
  console.log(`   最后完成: ${userMission.lastCompleted?.toLocaleString("zh-CN") ?? "从未完成"}`);

  return userMission;
}

/**
 * 获取用户统计信息 / Get user statistics
 */
async function getUserStats(userId: string) {
  const userStats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!userStats) {
    console.log("❌ 未找到用户统计记录");
    return null;
  }

  console.log("\n📈 用户统计:");
  console.log(`   当前连胜: ${userStats.currentStreak}`);
  console.log(`   最长连胜: ${userStats.longestStreak}`);
  console.log(`   最后活跃: ${userStats.lastActive?.toLocaleString("zh-CN") ?? "从未活跃"}`);

  return userStats;
}

/**
 * 列出所有每日任务 / List all daily missions
 */
async function listDailyMissions() {
  const missions = await prisma.mission.findMany({
    where: {
      isDaily: true,
      isActive: true,
    },
  });

  console.log("\n📋 每日任务列表:");
  missions.forEach((mission, index) => {
    console.log(`   ${index + 1}. [${mission.id}] ${mission.title} (${mission.emoji})`);
  });

  return missions;
}

/**
 * 列出所有用户 / List all users
 */
async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
    },
  });

  console.log("\n👥 用户列表:");
  users.forEach((user, index) => {
    console.log(`   ${index + 1}. [${user.id}] ${user.displayName || user.email}`);
  });

  return users;
}

/**
 * 主测试函数 / Main test function
 */
async function main() {
  console.log("========================================");
  console.log("   连续打卡功能测试工具");
  console.log("   Streak Functionality Test Tool");
  console.log("========================================\n");

  try {
    // 1. 列出所有用户 / List all users
    const users = await listUsers();
    if (users.length === 0) {
      console.log("❌ 没有用户，请先创建用户");
      return;
    }

    // 使用第一个用户进行测试 / Use first user for testing
    const testUser = users[0];
    console.log(`\n🎯 使用测试用户: ${testUser.displayName || testUser.email}`);

    // 2. 列出所有每日任务 / List all daily missions
    const missions = await listDailyMissions();
    if (missions.length === 0) {
      console.log("❌ 没有每日任务，请先创建每日任务");
      return;
    }

    // 使用第一个每日任务进行测试 / Use first daily mission for testing
    const testMission = missions[0];
    console.log(`\n🎯 使用测试任务: ${testMission.title}`);

    // 3. 获取当前状态 / Get current status
    await getMissionStatus(testUser.id, testMission.id);
    await getUserStats(testUser.id);

    // 4. 模拟昨天完成（测试连续性）/ Simulate completion yesterday (test continuity)
    console.log("\n" + "=".repeat(50));
    console.log("测试场景 1: 模拟昨天完成，今天应该可以继续连续");
    console.log("=".repeat(50));

    await setMissionCompletionTime(testUser.id, testMission.id, 1, 3); // 设置为昨天完成，连续3天

    // 5. 获取更新后的状态 / Get updated status
    await getMissionStatus(testUser.id, testMission.id);
    await getUserStats(testUser.id);

    console.log("\n✅ 测试完成！");
    console.log("\n💡 现在你可以在前端完成任务，验证连续天数是否正确增加到 4 天");
    console.log("💡 Now you can complete the mission in the frontend to verify if streak increases to 4 days");

  } catch (error) {
    console.error("❌ 测试失败:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 如果直接运行此脚本 / If running this script directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  main();
}

export {
  setMissionCompletionTime,
  getMissionStatus,
  getUserStats,
  listDailyMissions,
  listUsers,
};
