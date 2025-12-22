# 使用 pnpm 管理项目

本项目已配置为使用 pnpm 作为包管理器，提供更快的安装速度、更少的存储占用和更好的依赖管理。

## 安装 pnpm

如果你还没有安装 pnpm，可以通过以下方式安装：

### 方式1：使用 npm（推荐）
```bash
npm install -g pnpm@latest
```

### 方式2：使用 Homebrew（macOS）
```bash
brew install pnpm
```

### 方式3：使用 curl
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

## 迁移到 pnpm

1. **清理现有的 npm 环境**（可选但推荐）：
```bash
pnpm run clean:full
```

2. **安装依赖**：
```bash
pnpm install
```

## 可用脚本

### 开发相关
- `pnpm dev` - 启动前端开发服务器
- `pnpm dev:backend` - 启动后端开发服务器
- `pnpm dev:all` - 同时启动前后端开发服务器

### 构建相关
- `pnpm build` - 构建前端
- `pnpm build:backend` - 构建后端
- `pnpm build:all` - 构建前后端

### 启动相关
- `pnpm start:backend` - 启动后端服务
- `pnpm start:prod` - 生产环境启动

### 包管理
- `pnpm install <package>` - 安装包
- `pnpm install <package> -D` - 安装开发依赖
- `pnpm remove <package>` - 移除包
- `pnpm update` - 更新包
- `pnpm audit` - 安全审计
- `pnpm audit --fix` - 自动修复安全问题

### 实用脚本
- `pnpm reinstall` - 完全重新安装依赖
- `pnpm clean` - 清理构建文件
- `pnpm clean:full` - 清理所有文件包括依赖
- `pnpm pnpm:list` - 列出所有直接依赖
- `pnpm pnpm:outdated` - 检查过期包
- `pnpm pnpm:update` - 更新所有包到最新版本

## pnpm 配置文件

本项目包含以下 pnpm 配置文件：

### `.pnpm-workspace.yaml`
配置 monorepo 工作空间结构

### `.npmrc`
全局 pnpm 配置，包括：
- 禁用严格对等依赖检查（兼容性）
- 启用 shamefully-hoist（兼容性）
- 自动安装对等依赖

### `.pnpmfile.js`
自定义安装钩子，处理特定的兼容性问题

## 性能优势

1. **安装速度**：比 npm 快 2-3 倍
2. **存储效率**：共享依赖，节省磁盘空间
3. **依赖解析**：更严格的依赖管理
4. **安全性**：内置安全审计功能

## 常用命令对比

| npm 命令 | pnpm 等效命令 |
|---------|-------------|
| npm install | pnpm install |
| npm install <pkg> | pnpm add <pkg> |
| npm install <pkg> -D | pnpm add <pkg> -D |
| npm run <script> | pnpm <script> 或 pnpm run <script> |
| npm update | pnpm update |
| npm audit | pnpm audit |
| npm list | pnpm list |

## 故障排除

### 遇到依赖冲突时
```bash
pnpm install --force
```

### 清理缓存
```bash
pnpm store prune
```

### 检查存储位置
```bash
pnpm store path
```

## 注意事项

1. **严格模式**：pnpm 默认使用严格的依赖解析，这可能会暴露一些隐藏的依赖问题
2. **符号链接**：pnpm 使用符号链接来避免重复，这在某些工具中可能需要额外配置
3. **版本控制**：确保 `pnpm-lock.yaml` 被提交到版本控制系统

## IDE 配置

### VS Code
推荐安装以下扩展：
- pnpm
- TypeScript Importer
- ESLint

确保在设置中指定使用 pnpm：
```json
{
  "npm.packageManager": "pnpm"
}
```

### WebStorm
在设置中指定包管理器为 pnpm：
```
Settings → Languages & Frameworks → Node.js and NPM → Package manager
```