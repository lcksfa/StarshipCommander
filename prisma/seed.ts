// 数据库种子数据
// Database seed data

import { PrismaClient, Category, Difficulty } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始创建种子数据...");

  // 清理现有数据（仅用于开发环境）
  if (process.env.NODE_ENV === "development") {
    console.log("🧹 清理现有数据...");
    await prisma.missionHistory.deleteMany();
    await prisma.userAchievement.deleteMany();
    await prisma.userMission.deleteMany();
    await prisma.userProgress.deleteMany();
    await prisma.mission.deleteMany();
    await prisma.userStats.deleteMany();
    await prisma.achievement.deleteMany();
  }

  // 创建示例用户统计
  console.log("👤 创建用户统计...");
  const userStats = await prisma.userStats.create({
    data: {
      userId: "demo-user",
      level: 5,
      currentXp: 450,
      maxXp: 1000,
      coins: 1250,
      totalMissionsCompleted: 142,
      totalXpEarned: 5000,
      currentStreak: 7,
      longestStreak: 21,
      rank: "CAPTAIN",
      preferredLang: "zh",
    },
  });
  console.log(`✅ 创建用户: ${userStats.userId}`);

  // 创建示例任务
  console.log("📋 创建示例任务...");
  const missions = [
    {
      title: { en: "Dental Maintenance", zh: "牙齿维护协议" },
      description: {
        en: "Brush teeth for 2 minutes.",
        zh: "执行刷牙程序，持续2分钟。",
      },
      xpReward: 50,
      coinReward: 20,
      category: Category.HEALTH,
      emoji: "🦷",
      isDaily: true,
      difficulty: Difficulty.EASY,
    },
    {
      title: { en: "Data Intake", zh: "数据摄入" },
      description: {
        en: "Read 10 pages of a book.",
        zh: "阅读书籍10页，扩充数据库。",
      },
      xpReward: 100,
      coinReward: 40,
      category: Category.STUDY,
      emoji: "📚",
      isDaily: true,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: { en: "Quarters Cleanup", zh: "舱室清理" },
      description: {
        en: "Make your bed nicely.",
        zh: "整理休眠舱（铺床）。",
      },
      xpReward: 75,
      coinReward: 30,
      category: Category.CHORE,
      emoji: "🛏️",
      isDaily: true,
      difficulty: Difficulty.EASY,
    },
    {
      title: { en: "Hydration Check", zh: "液体补充" },
      description: {
        en: "Drink a glass of water.",
        zh: "摄入一杯H2O。",
      },
      xpReward: 25,
      coinReward: 10,
      category: Category.HEALTH,
      emoji: "💧",
      isDaily: false,
      difficulty: Difficulty.EASY,
    },
    {
      title: { en: "Academy Training", zh: "学院特训" },
      description: {
        en: "Complete homework.",
        zh: "完成学院指派的作业任务。",
      },
      xpReward: 150,
      coinReward: 60,
      category: Category.STUDY,
      emoji: "📝",
      isDaily: false,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: { en: "Creative Project", zh: "创意项目" },
      description: {
        en: "Work on your creative project for 30 minutes.",
        zh: "进行创意项目工作30分钟。",
      },
      xpReward: 120,
      coinReward: 50,
      category: Category.CREATIVE,
      emoji: "🎨",
      isDaily: false,
      difficulty: Difficulty.MEDIUM,
    },
    {
      title: { en: "Physical Exercise", zh: "体能训练" },
      description: {
        en: "Complete a 30-minute workout.",
        zh: "完成30分钟体能训练。",
      },
      xpReward: 200,
      coinReward: 80,
      category: Category.HEALTH,
      emoji: "💪",
      isDaily: true,
      difficulty: Difficulty.HARD,
    },
    {
      title: { en: "Meditation", zh: "冥想训练" },
      description: {
        en: "Meditate for 10 minutes.",
        zh: "进行10分钟冥想训练。",
      },
      xpReward: 60,
      coinReward: 25,
      category: Category.HEALTH,
      emoji: "🧘",
      isDaily: true,
      difficulty: Difficulty.EASY,
    },
  ];

  for (const mission of missions) {
    await prisma.mission.create({
      data: {
        ...mission,
        isActive: true,
      },
    });
  }
  console.log(`✅ 创建了 ${missions.length} 个任务`);

  // 创建任务历史记录
  console.log("📜 创建任务历史记录...");
  const allMissions = await prisma.mission.findMany();

  // 获取用户统计的 ID
  const statsForHistory = await prisma.userStats.findUnique({
    where: { userId: "demo-user" },
  });

  if (statsForHistory) {
    for (let i = 0; i < Math.min(5, allMissions.length); i++) {
      const mission = allMissions[i];
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - i); // 过去几天的数据

      await prisma.missionHistory.create({
        data: {
          userStatsId: statsForHistory.id, // 使用正确的外键字段
          missionId: mission.id,
          missionTitle: mission.title,
          xpEarned: mission.xpReward,
          coinEarned: mission.coinReward,
          category: mission.category,
          timestamp,
        },
      });
    }
    console.log("✅ 创建了 5 条历史记录");
  } else {
    console.log("⚠️  跳过历史记录创建：用户统计不存在");
  }

  // 创建用户任务关联
  console.log("🔗 创建用户任务关联...");
  for (const mission of allMissions) {
    await prisma.userMission.create({
      data: {
        userId: "demo-user",
        missionId: mission.id,
        isCompleted: Math.random() > 0.5, // 随机完成状态
        streak: Math.floor(Math.random() * 10),
      },
    });
  }
  console.log(`✅ 创建了 ${allMissions.length} 个用户任务关联`);

  console.log("✅ 种子数据创建完成！");
  console.log("\n📊 数据统计:");
  console.log(`  - 用户: 1`);
  console.log(`  - 任务: ${missions.length}`);
  console.log(`  - 历史记录: 5`);
  console.log(`  - 用户任务关联: ${allMissions.length}`);
}

main()
  .catch((e) => {
    console.error("❌ 种子数据创建失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
