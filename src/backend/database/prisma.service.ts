// Prisma 数据库服务
// Prisma Database Service

import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || "file:./dev.db",
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Database connected successfully");
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("✅ Database disconnected successfully");
  }

  // 健康检查方法
  async healthCheck() {
    try {
      await this.$queryRaw`SELECT 1`;
      return { status: "healthy", timestamp: new Date().toISOString() };
    } catch (error) {
      return {
        status: "unhealthy",
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 数据库初始化方法
  async initializeDatabase() {
    try {
      // 检查数据库连接
      await this.$connect();

      // 运行迁移（如果需要）
      // await this.$migrate.deploy();

      console.log("🗄️ Database initialized successfully");

      // 检查是否有基础数据
      const missionCount = await this.mission.count();
      const userStatsCount = await this.userStats.count();

      console.log(
        `📊 Database stats: ${missionCount} missions, ${userStatsCount} user stats records`,
      );

      return {
        initialized: true,
        missionCount,
        userStatsCount,
      };
    } catch (error) {
      console.error("❌ Database initialization failed:", error);
      throw error;
    }
  }

  // 清理数据库（仅用于开发/测试）
  async clearDatabase() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot clear database in production environment");
    }

    try {
      // 按依赖关系顺序删除数据
      await this.$transaction([
        this.missionHistory.deleteMany(),
        this.userAchievement.deleteMany(),
        this.userMission.deleteMany(),
        this.userProgress.deleteMany(),
        this.achievement.deleteMany(),
        this.mission.deleteMany(),
        this.userStats.deleteMany(),
      ]);

      console.log("🧹 Database cleared successfully");
      return { cleared: true };
    } catch (error) {
      console.error("❌ Failed to clear database:", error);
      throw error;
    }
  }

  // 种子数据创建方法
  async createSeedData() {
    try {
      // 创建示例任务
      const seedMissions = [
        {
          title: {
            en: "Dental Maintenance",
            zh: "牙齿维护协议",
          },
          description: {
            en: "Brush teeth for 2 minutes.",
            zh: "执行刷牙程序，持续2分钟。",
          },
          xpReward: 50,
          coinReward: 20,
          category: "HEALTH",
          emoji: "🦷",
          isDaily: true,
          difficulty: "EASY",
        },
        {
          title: {
            en: "Data Intake",
            zh: "数据摄入",
          },
          description: {
            en: "Read 10 pages of a book.",
            zh: "阅读书籍10页，扩充数据库。",
          },
          xpReward: 100,
          coinReward: 40,
          category: "STUDY",
          emoji: "📚",
          isDaily: true,
          difficulty: "MEDIUM",
        },
        {
          title: {
            en: "Quarters Cleanup",
            zh: "舱室清理",
          },
          description: {
            en: "Make your bed nicely.",
            zh: "整理休眠舱（铺床）。",
          },
          xpReward: 75,
          coinReward: 30,
          category: "CHORE",
          emoji: "🛏️",
          isDaily: true,
          difficulty: "EASY",
        },
        {
          title: {
            en: "Hydration Check",
            zh: "液体补充",
          },
          description: {
            en: "Drink a glass of water.",
            zh: "摄入一杯H2O。",
          },
          xpReward: 25,
          coinReward: 10,
          category: "HEALTH",
          emoji: "💧",
          isDaily: false,
          difficulty: "EASY",
        },
        {
          title: {
            en: "Academy Training",
            zh: "学院特训",
          },
          description: {
            en: "Complete homework.",
            zh: "完成学院指派的作业任务。",
          },
          xpReward: 150,
          coinReward: 60,
          category: "STUDY",
          emoji: "📝",
          isDaily: false,
          difficulty: "MEDIUM",
        },
        {
          title: {
            en: "Creative Project",
            zh: "创意项目",
          },
          description: {
            en: "Work on your creative project for 30 minutes.",
            zh: "进行创意项目工作30分钟。",
          },
          xpReward: 120,
          coinReward: 50,
          category: "CREATIVE",
          emoji: "🎨",
          isDaily: false,
          difficulty: "MEDIUM",
        },
      ];

      const createdMissions = await Promise.all(
        seedMissions.map((mission) =>
          this.mission.create({
            data: {
              ...mission,
              category: mission.category as any, // 类型断言以匹配 Prisma 枚举
              difficulty: mission.difficulty as any,
              isActive: true,
            },
          }),
        ),
      );

      console.log(`🌱 Created ${createdMissions.length} seed missions`);

      return {
        missionsCreated: createdMissions.length,
        missions: createdMissions,
      };
    } catch (error) {
      console.error("❌ Failed to create seed data:", error);
      throw error;
    }
  }
}
