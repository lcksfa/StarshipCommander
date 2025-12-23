// 后端服务测试脚本
// Backend service test script

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testBackend() {
  console.log("🧪 开始测试后端服务...\n");

  try {
    // 1. 测试数据库连接
    console.log("1️⃣  测试数据库连接...");
    await prisma.$connect();
    console.log("✅ 数据库连接成功\n");

    // 2. 测试查询任务
    console.log("2️⃣  测试查询任务...");
    const missions = await prisma.mission.findMany({
      take: 3,
    });
    console.log(`✅ 找到 ${missions.length} 个任务:`);
    missions.forEach(mission => {
      const title = mission.title;
      console.log(`   - ${title.en || title.zh || 'Unknown'} (${mission.category})`);
    });
    console.log();

    // 3. 测试查询用户统计
    console.log("3️⃣  测试查询用户统计...");
    const userStats = await prisma.userStats.findFirst();
    if (userStats) {
      console.log("✅ 用户统计:");
      console.log(`   - Level: ${userStats.level}`);
      console.log(`   - XP: ${userStats.currentXp}/${userStats.maxXp}`);
      console.log(`   - Coins: ${userStats.coins}`);
      console.log(`   - Rank: ${userStats.rank}`);
    } else {
      console.log("⚠️  未找到用户统计");
    }
    console.log();

    // 4. 测试查询任务历史
    console.log("4️⃣  测试查询任务历史...");
    const history = await prisma.missionHistory.findMany({
      take: 3,
      orderBy: {
        timestamp: 'desc'
      }
    });
    console.log(`✅ 找到 ${history.length} 条历史记录`);
    console.log();

    // 5. 数据库健康检查
    console.log("5️⃣  数据库健康检查...");
    const result = await prisma.$queryRaw`SELECT 1 as healthy`;
    console.log("✅ 数据库健康检查通过\n");

    console.log("🎉 所有测试通过！后端数据库层工作正常。\n");

    // 输出统计信息
    console.log("📊 数据库统计:");
    const stats = await Promise.all([
      prisma.mission.count(),
      prisma.userStats.count(),
      prisma.missionHistory.count(),
      prisma.userMission.count(),
    ]);

    console.log(`   - 任务总数: ${stats[0]}`);
    console.log(`   - 用户统计: ${stats[1]}`);
    console.log(`   - 历史记录: ${stats[2]}`);
    console.log(`   - 用户任务关联: ${stats[3]}`);
    console.log();

  } catch (error) {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log("👋 数据库连接已关闭");
  }
}

testBackend();
