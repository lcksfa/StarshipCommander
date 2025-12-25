# Android APK 签名冲突修复指南

## 问题说明

当出现 `INSTALL_FAILED_UPDATE_INCOMPATIBLE` 错误时，表示设备上已安装的应用与新构建的应用签名不匹配。

## 快速解决方案

### 方法 1：使用 ADB 卸载旧应用

```bash
# 1. 查看已连接的设备
adb devices

# 2. 卸载旧应用
adb uninstall com.starshipcommander.habits

# 3. 重新安装
# 在 Android Studio 中点击运行按钮
# 或使用命令行
pnpm run cap:run:android
```

### 方法 2：在设备上手动卸载

1. 在 Android 设备上找到 "Starship Commander" 应用
2. 长按应用图标
3. 选择"卸载"或"删除应用"
4. 在 Android Studio 中重新运行

### 方法 3：使用 Android Studio 卸载

1. 在 Android Studio 中找到 "Logcat" 标签
2. 在下拉菜单中选择您的设备
3. 运行以下命令：
   ```bash
   adb shell pm list packages | grep starshipcommander
   adb uninstall com.starshipcommander.habits
   ```

## 预防措施

### 开发阶段使用调试签名

在 `android/app/build.gradle` 中配置：

```gradle
android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
    }
}
```

### 清理构建缓存

```bash
# 清理 Android 构建缓存
cd android
./gradlew clean

# 清理项目
pnpm run clean:full
pnpm install
pnpm run build
pnpm run cap:sync:android
```

## 验证安装

安装成功后，在设备上：

1. 打开应用
2. 检查应用名称: "Starship Commander"
3. 检查包名: `com.starshipcommander.habits`
4. 验证功能正常运行

## 常见问题

### Q: 为什么会出现签名不匹配？

A: 可能的原因：
- 之前使用不同的签名配置构建过应用
- 从其他来源安装过相同包名的应用
- Debug 和 Release 签名混用

### Q: 如何避免这个问题？

A:
- 开发阶段始终使用 debug 签名
- 避免频繁更换签名配置
- 卸载旧应用后再安装新版本

### Q: Release 版本怎么办？

A:
- Release 版本需要使用正式签名
- 首次安装 Release 版本前卸载 Debug 版本
- 后续更新使用相同签名即可

## 一键修复脚本

创建 `scripts/fix-apk-signature.sh`：

```bash
#!/bin/bash
echo "🔧 修复 APK 签名冲突..."

# 卸载旧应用
echo "📱 卸载旧应用..."
adb uninstall com.starshipcommander.habits

# 清理构建
echo "🧹 清理构建缓存..."
cd android && ./gradlew clean && cd ..

# 重新构建
echo "🔨 重新构建..."
pnpm run build
pnpm run cap:sync:android

# 安装
echo "📦 安装应用..."
pnpm run cap:run:android

echo "✅ 完成！"
```

使用方法：
```bash
chmod +x scripts/fix-apk-signature.sh
./scripts/fix-apk-signature.sh
```
