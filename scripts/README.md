# Scripts - 项目脚本目录

本目录包含 Starship Commander 项目的各种自动化脚本。

## 📜 可用脚本

### 1. build-android.sh
**Android 智能构建脚本**

自动检测 IP 并构建 Android APK。

```bash
# 自动检测 IP 并构建
./build-android.sh

# 指定 IP 构建
./build-android.sh 192.168.1.100

# 通过 pnpm 运行
pnpm android:smart-build
```

**功能**：
- ✅ 自动检测本机局域网 IP
- ✅ 更新 Capacitor 配置
- ✅ 构建前端代码
- ✅ 同步到 Android
- ✅ 编译 APK（Debug 或 Release）

**详细文档**：查看 [docs/ANDROID-DEPLOYMENT.md](../docs/ANDROID-DEPLOYMENT.md)

---

## 🔧 其他脚本

### cleanup-ports.sh
清理被占用的端口。

```bash
# 清理所有端口
./cleanup-ports.sh --all

# 清理特定端口
./cleanup-ports.sh 3000 3001
```

### git-worktree.sh
Git worktree 管理工具。

```bash
# 创建 worktree
./git-worktree.sh create

# 列出 worktree
./git-worktree.sh list

# 删除 worktree
./git-worktree.sh remove
```

### generate-icons.js
生成应用图标。

```bash
node generate-icons.js
```

---

## 📝 使用说明

所有脚本都需要在项目根目录运行。

```bash
# 确保在项目根目录
cd /path/to/StarshipCommander

# 运行脚本
./scripts/build-android.sh
```

或者使用 pnpm 命令：

```bash
pnpm android:smart-build
```

---

## 🔍 故障排除

### 脚本无法执行

```bash
# 添加执行权限
chmod +x scripts/*.sh
```

### IP 检测失败

手动指定 IP 地址：

```bash
./scripts/build-android.sh 192.168.1.100
```

### Android 构建失败

确保 Android SDK 和构建工具已正确安装：

```bash
# 检查 Android SDK
echo $ANDROID_HOME

# 查看 Gradle 版本
cd android && ./gradlew --version
```

---

## 📚 相关文档

- [Android 部署指南](../docs/ANDROID-DEPLOYMENT.md)
- [项目 README](../README.md)
- [部署文档](../DEPLOYMENT.md)

---

**Made with ❤️ for Starship Commander**
