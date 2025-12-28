// 添加特定用户到数据库 / Add specific user to database
//
// 使用方法 / Usage:
//   pnpm prisma:db:push  # 确保 Prisma Client 已生成
//   tsx prisma/add-user.ts

import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 添加用户到数据库 / Adding user to database...\n");

  // 用户信息 / User information
  const userEmail = "lck@li.com";
  const userName = "葫芦";
  const userPassword = "q12345678";

  // 检查用户是否已存在 / Check if user already exists
  console.log(`🔍 检查用户是否已存在 / Checking if user already exists: ${userEmail}`);
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log(`⚠️  用户已存在 / User already exists: ${userEmail}`);
    console.log(`   用户名 / Username: ${existingUser.username || "N/A"}`);
    console.log(`   显示名称 / Display Name: ${existingUser.displayName || "N/A"}`);
    await prisma.$disconnect();
    return;
  }

  // 哈希密码 / Hash password
  console.log(`🔐 哈希密码 / Hashing password...`);
  const passwordHash = await bcrypt.hash(userPassword, 10);

  // 生成唯一 ID / Generate unique ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  // 创建用户 / Create user
  console.log(`👤 创建用户 / Creating user...`);
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: userEmail,
      username: userName,
      passwordHash: passwordHash,
      displayName: userName,
      preferredLang: "zh",
      isActive: true,
      isVerified: true, // 标记为已验证 / Mark as verified
    },
  });

  console.log(`✅ 用户创建成功 / User created successfully:`);
  console.log(`   邮箱 / Email: ${user.email}`);
  console.log(`   用户名 / Username: ${user.username}`);
  console.log(`   显示名称 / Display Name: ${user.displayName}`);
  console.log(`   语言 / Language: ${user.preferredLang}`);
  console.log(`   激活状态 / Active: ${user.isActive ? "是 / Yes" : "否 / No"}`);
  console.log(`   验证状态 / Verified: ${user.isVerified ? "是 / Yes" : "否 / No"}`);

  // 创建用户统计 / Create user stats
  console.log(`\n📊 创建用户统计 / Creating user stats...`);
  const userStats = await prisma.userStats.create({
    data: {
      userId: userId,
      preferredLang: "zh",
      level: 1, // 初始等级 / Initial level
      currentXp: 0,
      maxXp: 50,
      rank: "Cadet", // 初始军衔 / Initial rank
      coins: 0,
      totalMissionsCompleted: 0,
      totalXpEarned: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActive: null,
    },
  });

  console.log(`✅ 用户统计创建成功 / User stats created successfully:`);
  console.log(`   等级 / Level: ${userStats.level}`);
  console.log(`   军衔 / Rank: ${userStats.rank}`);
  console.log(`   当前 XP / Current XP: ${userStats.currentXp}/${userStats.maxXp}`);
  console.log(`   金币 / Coins: ${userStats.coins}`);

  console.log("\n🎉 用户添加完成！/ User added successfully!\n");
  console.log("📝 登录信息 / Login Information:");
  console.log(`   邮箱 / Email: ${userEmail}`);
  console.log(`   密码 / Password: ${userPassword}`);
  console.log(`\n⚠️  请妥善保管登录信息！/ Please keep your login information safe!\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ 错误 / Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
