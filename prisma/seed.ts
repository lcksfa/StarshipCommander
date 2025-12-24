// Prisma Seed Script / Prisma 种子脚本
// 简化版种子数据：1 个用户，每个类别 1 个任务（共 4 个），其他数据置零
// Simplified seed data: 1 user, 1 mission per category (4 total), other data set to zero

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 主种子函数 / Main seed function
async function main() {
  console.log("🌱 Starting database seeding...\n");

  // 清理现有数据 / Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.missionHistory.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userMission.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.userStats.deleteMany();
  await prisma.user.deleteMany(); // 清理 User 表 / Clean User table
  console.log("✅ Data cleaned\n");

  // 配置 / Configuration
  const USER_COUNT = 1; // 用户数量 / Number of users
  const MISSIONS_PER_CATEGORY = 1; // 每个类别的任务数量 / Missions per category

  // ========== 创建用户 / Create Users ==========
  console.log(`👶 Creating ${USER_COUNT} user...`);

  const users = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    // 1. 先创建 User 记录 / First create User record
    const userId = `user_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const userPasswordHash = "dummy_hash"; // 种子数据使用假密码 / Seed data uses dummy password

    await prisma.user.create({
      data: {
        id: userId,
        email: `user${i}@example.com`,
        username: `player${i}`,
        passwordHash: userPasswordHash,
      },
    });

    // 2. 再创建 UserStats 记录 / Then create UserStats record
    const userStats = await prisma.userStats.create({
      data: {
        userId: userId,
        preferredLang: "zh", // 默认中文 / Default to Chinese
        level: 1, // 初始等级为1 / Initial level is 1
        currentXp: 0, // XP 置零 / XP set to zero
        maxXp: 50, // 新系统：Level 1→2 需要 50 XP / New system: Level 1→2 needs 50 XP
        rank: "Cadet", // 初始军衔 / Initial rank
        coins: 0, // 金币置零 / Coins set to zero
        totalMissionsCompleted: 0, // 完成任务数置零 / Completed missions set to zero
        totalXpEarned: 0, // 总获得XP置零 / Total XP earned set to zero
        currentStreak: 0, // 当前连击置零 / Current streak set to zero
        longestStreak: 0, // 最长连击置零 / Longest streak set to zero
        lastActive: null, // 最后活动时间置空 / Last active set to null
      },
    });
    users.push(userStats);
    console.log(`  ✅ Created user: ${userStats.userId}`);
  }
  console.log(`✅ Created ${users.length} user\n`);

  // ========== 创建任务 / Create Missions ==========
  console.log(`📋 Creating missions...`);

  // 定义固定的任务 / Define fixed missions
  // 使用新的奖励配置 / Using new reward configuration
  const fixedMissions = [
    {
      category: "STUDY" as const,
      title: "阅读书籍",
      description: "每天阅读 30 分钟，培养阅读习惯",
      emoji: "📚",
      difficulty: "EASY" as const,
      xpReward: 12, // 新配置：12 XP / New config: 12 XP
      coinReward: 6, // 新配置：6 coins / New config: 6 coins
      isDaily: true,
    },
    {
      category: "HEALTH" as const,
      title: "晨间运动",
      description: "每天早上运动 20 分钟，保持健康",
      emoji: "💪",
      difficulty: "EASY" as const,
      xpReward: 12, // 新配置：12 XP / New config: 12 XP
      coinReward: 6, // 新配置：6 coins / New config: 6 coins
      isDaily: true,
    },
    {
      category: "CHORE" as const,
      title: "整理房间",
      description: "整理个人房间，保持环境整洁",
      emoji: "🧹",
      difficulty: "MEDIUM" as const,
      xpReward: 30, // 新配置：30 XP / New config: 30 XP
      coinReward: 15, // 新配置：15 coins / New config: 15 coins
      isDaily: false,
    },
    {
      category: "CREATIVE" as const,
      title: "绘画练习",
      description: "练习绘画技巧，发挥创造力",
      emoji: "🎨",
      difficulty: "MEDIUM" as const,
      xpReward: 30, // 新配置：30 XP / New config: 30 XP
      coinReward: 15, // 新配置：15 coins / New config: 15 coins
      isDaily: false,
    },
  ];

  const allMissions = [];

  for (const missionData of fixedMissions) {
    const mission = await prisma.mission.create({
      data: {
        title: missionData.title,
        description: missionData.description,
        xpReward: missionData.xpReward,
        coinReward: missionData.coinReward,
        category: missionData.category,
        emoji: missionData.emoji,
        isDaily: missionData.isDaily,
        difficulty: missionData.difficulty,
        isActive: true,
      },
    });

    allMissions.push(mission);
    console.log(
      `  ✅ [${missionData.category}] ${missionData.title} (${missionData.difficulty}) - ${missionData.xpReward} XP, ${missionData.coinReward} coins`,
    );
  }

  console.log(`✅ Created ${allMissions.length} missions total\n`);

  // ========== 打印统计信息 / Print Statistics ==========
  console.log("📊 Seeding Statistics:");
  console.log(`  👥 Users Created: ${users.length}`);
  console.log(`  📋 Missions Created: ${allMissions.length}`);
  console.log(`    - STUDY: 1 (阅读书籍)`);
  console.log(`    - HEALTH: 1 (晨间运动)`);
  console.log(`    - CHORE: 1 (整理房间)`);
  console.log(`    - CREATIVE: 1 (绘画练习)`);
  console.log("\n🎉 Database seeding completed successfully!\n");
}

// 执行种子脚本 / Execute seed script
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
