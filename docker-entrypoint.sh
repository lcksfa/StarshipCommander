#!/bin/sh
set -e

# ==========================================
# Starship Commander - Backend Entrypoint
# 后端容器启动脚本 / Backend Container Entrypoint
# ==========================================
# This script ensures the database schema is
# initialized before starting the backend server.
#

echo "🚀 Starting Starship Commander Backend..."
echo "📦 Database URL: ${DATABASE_URL}"

# Run Prisma DB Push to initialize/update schema
# 执行 Prisma DB Push 以初始化/更新数据库模式
# This will create the database file if it doesn't exist
echo "🔧 Initializing database schema..."
npx prisma db push --skip-generate || {
  echo "❌ Failed to initialize database schema"
  exit 1
}

echo "✅ Database schema initialized successfully"

# Start the backend application
# 启动后端应用
echo "🌟 Starting backend server..."
exec node src/backend/dist/backend/main.js
