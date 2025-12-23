// Prisma Seed Script / Prisma 种子脚本
// 生成随机用户和任务数据，其他数据置零
// Generate random users and missions, other data set to zero

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 工具函数：生成随机数 / Utility function: Generate random number
const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// 工具函数：从数组中随机选择 / Utility function: Random choice from array
const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// 任务标题模板 / Mission title templates
const missionTitleTemplates = {
  STUDY: [
    "数学练习",
    "阅读时间",
    "科学项目",
    "语言学习",
    "完成作业",
    "在线课程",
    "复习笔记",
    "词汇练习",
  ],
  HEALTH: [
    "晨间运动",
    "喝水",
    "健康餐食",
    "刷牙",
    "冥想",
    "拉伸",
    "早睡",
    "眼保健操",
  ],
  CHORE: [
    "整理房间",
    "洗碗",
    "倒垃圾",
    "铺床",
    "整理书桌",
    "浇花",
    "叠衣服",
    "扫地",
  ],
  CREATIVE: [
    "绘画",
    "写故事",
    "练习音乐",
    "手工制作",
    "摄影",
    "编程",
    "跳舞",
    "烹饪",
  ],
};

// 任务描述模板 / Mission description templates
const descriptionTemplates = {
  STUDY: [
    "专注学习 30 分钟，完成今天的课程",
    "阅读一本好书，扩充知识面",
    "复习今天的笔记，巩固学习内容",
  ],
  HEALTH: [
    "保持身体健康，每天运动 30 分钟",
    "喝足够的水，保持身体水分充足",
    "养成良好的生活习惯",
  ],
  CHORE: [
    "保持房间整洁，创造舒适的生活环境",
    "帮助完成家务，培养责任感",
    "整理个人物品，提高生活效率",
  ],
  CREATIVE: [
    "发挥创意，创造独特的作品",
    "探索艺术天赋，表达自己的想法",
    "享受创作过程，放松心情",
  ],
};

// 表情符号映射 / Emoji mapping
const emojiMap = {
  STUDY: ["📚", "✏️", "📖", "🎓", "🔬", "💻", "📝", "🧮"],
  HEALTH: ["💪", "🏃", "🧘", "💧", "🥗", "😴", "🦷", "👀"],
  CHORE: ["🧹", "🍽️", "🗑️", "🛏️", "🪴", "👕", "🧺", "🏠"],
  CREATIVE: ["🎨", "✍️", "🎵", "✂️", "📸", "💃", "🍳", "🎭"],
};

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
  console.log("✅ Data cleaned\n");

  // 配置 / Configuration
  const USER_COUNT = 10; // 用户数量 / Number of users
  const MISSIONS_PER_CATEGORY = 8; // 每个类别的任务数量 / Missions per category

  // ========== 创建用户 / Create Users ==========
  console.log(`👶 Creating ${USER_COUNT} users...`);

  const users = [];
  for (let i = 1; i <= USER_COUNT; i++) {
    const user = await prisma.userStats.create({
      data: {
        userId: `user_${i}_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        preferredLang: randomChoice(["en", "zh"]),
        level: 1, // 初始等级为1 / Initial level is 1
        currentXp: 0, // XP 置零 / XP set to zero
        maxXp: 100,
        coins: 0, // 金币置零 / Coins set to zero
        totalMissionsCompleted: 0, // 完成任务数置零 / Completed missions set to zero
        totalXpEarned: 0, // 总获得XP置零 / Total XP earned set to zero
        currentStreak: 0, // 当前连击置零 / Current streak set to zero
        longestStreak: 0, // 最长连击置零 / Longest streak set to zero
        lastActive: null, // 最后活动时间置空 / Last active set to null
      },
    });
    users.push(user);
    console.log(`  ✅ Created user: ${user.userId}`);
  }
  console.log(`✅ Created ${users.length} users\n`);

  // ========== 创建任务 / Create Missions ==========
  console.log(`📋 Creating missions...`);

  const categories: Array<"STUDY" | "HEALTH" | "CHORE" | "CREATIVE"> = [
    "STUDY",
    "HEALTH",
    "CHORE",
    "CREATIVE",
  ];
  const difficulties: Array<"EASY" | "MEDIUM" | "HARD"> = [
    "EASY",
    "MEDIUM",
    "HARD",
  ];
  const allMissions = [];

  for (const category of categories) {
    console.log(`  📁 Creating missions for category: ${category}`);

    const titles = missionTitleTemplates[category];
    const descriptions = descriptionTemplates[category];
    const emojis = emojiMap[category];

    for (let i = 0; i < MISSIONS_PER_CATEGORY; i++) {
      const difficulty = randomChoice(difficulties);
      const title = titles[i % titles.length];
      const description = randomChoice(descriptions);
      const emoji = emojis[i % emojis.length];

      // 根据难度设置奖励 / Set rewards based on difficulty
      const baseXp: Record<string, number> = {
        EASY: 25,
        MEDIUM: 50,
        HARD: 100,
      };
      const baseCoin: Record<string, number> = {
        EASY: 10,
        MEDIUM: 25,
        HARD: 50,
      };

      const xpReward = baseXp[difficulty] + randomInt(-10, 10);
      const coinReward = baseCoin[difficulty] + randomInt(-5, 5);

      const mission = await prisma.mission.create({
        data: {
          title, // 直接使用字符串 / Use string directly
          description, // 直接使用字符串 / Use string directly
          xpReward,
          coinReward,
          category,
          emoji,
          isDaily: Math.random() > 0.5, // 50% 概率是每日任务 / 50% chance to be daily
          difficulty,
          isActive: true,
        },
      });

      allMissions.push(mission);
      console.log(
        `    ✅ [${category}] ${title} (${difficulty}) - ${xpReward} XP, ${coinReward} coins`,
      );
    }
  }

  console.log(`✅ Created ${allMissions.length} missions total\n`);

  // ========== 打印统计信息 / Print Statistics ==========
  console.log("📊 Seeding Statistics:");
  console.log(`  👥 Users Created: ${users.length}`);
  console.log(`  📋 Missions Created: ${allMissions.length}`);
  console.log(`    - STUDY: ${MISSIONS_PER_CATEGORY}`);
  console.log(`    - HEALTH: ${MISSIONS_PER_CATEGORY}`);
  console.log(`    - CHORE: ${MISSIONS_PER_CATEGORY}`);
  console.log(`    - CREATIVE: ${MISSIONS_PER_CATEGORY}`);
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
