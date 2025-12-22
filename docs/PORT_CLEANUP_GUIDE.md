# 🚀 端口清理脚本

## 概述

`cleanup-ports.sh` 是一个安全的端口清理工具，可以帮助你快速释放被占用的端口。**必须明确指定要清理的端口**，避免误删重要进程。

## 使用方法

### 1. 命令行直接使用

```bash
# 清理指定端口
./scripts/cleanup-ports.sh 3000 8080 8081

# 清理所有常用开发端口
./scripts/cleanup-ports.sh --all

# 显示帮助信息
./scripts/cleanup-ports.sh --help

# 单个端口清理
./scripts/cleanup-ports.sh 3000  # 清理前端端口
./scripts/cleanup-ports.sh 3001  # 清理后端端口
```

### 2. 通过 pnpm 脚本使用

```bash
# 清理所有常用开发端口
pnpm ports:clean:all

# 清理前端端口 (3000)
pnpm ports:clean:frontend

# 清理后端端口 (3001)
pnpm ports:clean:backend

# 清理开发环境常用端口 (3000-3005)
pnpm ports:clean:dev
```

### ⚠️ 安全特性

- **无默认端口**: 不指定端口时会显示错误信息，避免误删
- **明确警告**: 每次运行都会提醒保存工作
- **帮助信息**: 使用 `--help` 查看详细用法

## 端口范围说明

### 项目特定端口
- **3000**: 前端开发服务器 (React/Vue)
- **3001**: 后端 API 服务器 (NestJS/tRPC)

### --all 选项清理的端口
- **3000-3010**: Node.js/React/Vue 应用
- **8000-8015**: 后端服务器
- **8080-8099**: 各种开发服务器
- **9000-9009**: 数据库和工具端口

## 功能特性

### 🎯 智能检测
- 自动检测端口占用情况
- 安全地终止占用进程
- 详细的清理日志

### 📊 清理报告
- 显示清理统计信息
- 验证端口释放状态
- 清理前后对比

### 🛡️ 安全性
- 只终止指定端口的进程
- 支持帮助信息显示
- 参数验证

## 实际使用场景

### 场景1: 重启开发服务器
```bash
# 快速清理前后端端口
pnpm ports:clean

# 重新启动服务
pnpm dev:all
```

### 场景2: 端口冲突解决
```bash
# 检查特定端口占用
lsof -i :3000

# 清理特定端口
pnpm ports:clean:3000

# 或者清理所有开发端口
pnpm ports:clean:all
```

### 场景3: 切换项目
```bash
# 清理所有开发端口
pnpm ports:clean:all

# 启动新项目
cd /path/to/another-project
npm start
```

## 脚本原理

1. **进程检测**: 使用 `lsof -ti :<port>` 命令查找占用端口的进程ID
2. **进程终止**: 使用 `kill -9` 强制终止进程
3. **状态验证**: 使用 `lsof -i :<port>` 验证端口是否释放
4. **结果统计**: 提供详细的清理报告

## 注意事项

⚠️ **警告**: 脚本会强制终止占用端口的进程，请确保数据已保存

- 在运行脚本前，请确保没有重要数据未保存
- 建议先尝试正常关闭应用程序
- 脚本只能清理当前用户有权限终止的进程

## 故障排除

### 权限问题
如果遇到权限错误，可能需要使用 `sudo`：
```bash
sudo ./scripts/cleanup-ports.sh
```

### 端口仍然占用
如果端口清理后仍然显示占用，可能是系统进程：
```bash
# 查看占用端口的进程详情
lsof -i :<port>

# 检查系统服务
sudo netstat -tulpn | grep :<port>
```

## 自定义配置

如需修改默认清理的端口，可以编辑脚本文件：
```bash
vim scripts/cleanup-ports.sh
```

在 `main()` 函数中修改 `ports` 数组即可。