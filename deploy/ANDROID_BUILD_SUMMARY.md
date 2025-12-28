# 🎉 Android Release APK 构建完成

> 构建时间: 2025-12-28
> 构建类型: Release
> 构建状态: ✅ 成功

---

## 📦 APK 文件信息

### 文件位置
```
android/app/build/outputs/apk/release/app-release.apk
```

### 文件详情
- **文件名**: `app-release.apk`
- **文件大小**: 3.1 MB
- **文件类型**: Zip archive (APK 格式)
- **MD5 哈希**: `b115f84d4cace90c300299744ee9f7f7`

### 应用配置
- **应用 ID**: `com.starshipcommander.habits`
- **应用名称**: `Starship Commander`
- **版本号**: 1.0
- **版本代码**: 1

---

## 🌐 服务器配置

### 局域网地址
- **本机 IP**: `192.168.1.33`
- **前端地址**: `http://192.168.1.33:3000`
- **后端地址**: `http://192.168.1.33:3001/trpc`

### Capacitor 配置
应用已配置为从局域网服务器加载,而不是打包的静态资源。

**更新的配置文件**: [capacitor.config.ts](../capacitor.config.ts:11)

**允许的导航地址**:
- `http://192.168.1.33:*` (当前服务器)
- `http://192.168.1.*:*` (局域网段)
- `http://192.168.0.*:*`
- `http://10.0.0.*:*`
- `http://172.16.*:*`
- `http://localhost:*`

---

## 🔧 构建步骤回顾

### 1. 获取本机 IP
```bash
ipconfig getifaddr en0
# 结果: 192.168.1.33
```

### 2. 更新 Capacitor 配置
自动更新 `capacitor.config.ts` 中的服务器地址为当前局域网 IP。

### 3. 构建前端
```bash
VITE_API_URL="http://192.168.1.33:3001/trpc" pnpm build
```
**构建时间**: ~922ms
**输出大小**: 368.54 KB (gzip: 109.21 KB)

### 4. 同步到 Android
```bash
npx cap sync android
```
**同步时间**: 153ms
**插件数量**: 3 个 Capacitor 插件

### 5. 构建 Release APK
```bash
cd android && ./gradlew assembleRelease
```
**构建时间**: 17秒
**任务执行**: 244 个任务 (40 个执行, 204 个最新)

---

## 📲 安装方法

### 方法 1: 通过 ADB 安装 (推荐)
```bash
# 确保设备已连接并开启 USB 调试
adb devices

# 安装 APK
adb install android/app/build/outputs/apk/release/app-release.apk

# 如果需要覆盖安装
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### 方法 2: 手动安装
1. 将 APK 文件复制到手机
   - 通过 USB 数据线
   - 通过云盘/网盘
   - 通过即时通讯工具

2. 在手机上安装
   - 在文件管理器中找到 APK 文件
   - 点击安装
   - 允许安装来自未知来源的应用

### 方法 3: 通过 Gradle 任务
```bash
cd android
./gradlew installRelease
```

---

## ⚙️ 使用前准备

### 重要前提条件
1. **启动 Docker 容器**
   ```bash
   docker-compose up -d
   ```

2. **确保设备在同一网络**
   - Android 设备必须连接到与服务器相同的 Wi-Fi 网络
   - 检查设备的 IP 地址是否在 `192.168.1.x` 网段

3. **验证服务可访问**
   ```bash
   # 测试前端
   curl http://192.168.1.33:3000

   # 测试后端
   curl http://192.168.1.33:3001/trpc/health
   ```

---

## 🎯 应用特性

### Capacitor 插件
- ✅ `@capacitor/app@8.0.0` - 应用核心功能
- ✅ `@capacitor/splash-screen@8.0.0` - 启动画面
- ✅ `@capacitor/status-bar@8.0.0` - 状态栏控制

### Android 配置
- ✅ 允许混合内容 (HTTP + HTTPS)
- ✅ 禁用输入捕获 (避免干扰 React 组件)
- ✅ 启用 webContents 调试
- ✅ 优化软键盘行为

### 签名配置
- **Keystore 文件**: `starship-release.keystore`
- **Store Password**: `starship123`
- **Key Alias**: `starship`
- **Key Password**: `starship123`

> ⚠️ **安全提示**: 生产环境应使用安全的密钥库密码,不要提交到版本控制。

---

## 🔍 验证构建

### 检查 APK 信息
```bash
# 查看 APK 文件信息
ls -lh android/app/build/outputs/apk/release/app-release.apk

# 验证文件类型
file android/app/build/outputs/apk/release/app-release.apk

# 计算 MD5
md5 android/app/build/outputs/apk/release/app-release.apk
```

### 运行时验证
安装后,在应用中检查:
1. ✅ 应用能正常加载
2. ✅ 能连接到局域网服务器
3. ✅ API 调用正常工作
4. ✅ 用户可以注册和登录

---

## 🐛 故障排除

### 问题 1: 应用无法加载内容

**症状**: 应用启动但显示空白页面

**解决方法**:
1. 确认 Docker 容器正在运行
   ```bash
   docker-compose ps
   ```

2. 确认设备在同一网络
   ```bash
   # 在设备上查看 IP 地址
   # Android: 设置 > Wi-Fi > 当前网络 > IP 地址
   ```

3. 测试服务器可访问性
   ```bash
   # 从设备浏览器访问
   http://192.168.1.33:3000
   ```

### 问题 2: ADB 安装失败

**症状**: `adb install` 报错

**解决方法**:
```bash
# 1. 检查 ADB 连接
adb devices

# 2. 如果需要,重启 ADB
adb kill-server && adb start-server

# 3. 允许 USB 调试授权
# 在设备上确认 USB 调试授权

# 4. 卸载旧版本
adb uninstall com.starshipcommander.habits

# 5. 重新安装
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 问题 3: IP 地址变更

**症状**: 服务器 IP 地址改变后应用无法连接

**解决方法**:
```bash
# 使用构建脚本重新构建
./scripts/build-android.sh <NEW_IP>

# 或手动更新 capacitor.config.ts 并重新构建
```

---

## 📚 相关文档

- [Capacitor Android 文档](https://capacitorjs.com/docs/android)
- [Android 构建脚本](../scripts/build-android.sh)
- [Capacitor 配置文件](../capacitor.config.ts)
- [Android Gradle 配置](../android/app/build.gradle)

---

## 🔄 重新构建

### 完整重新构建
```bash
# 清理旧构建
cd android && ./gradlew clean && cd ..

# 重新构建前端
pnpm build

# 同步到 Android
npx cap sync android

# 构建 Release APK
cd android && ./gradlew assembleRelease
```

### 使用智能构建脚本 (推荐)
```bash
# 自动检测 IP
./scripts/build-android.sh

# 指定 IP
./scripts/build-android.sh 192.168.1.100
```

---

## 📊 构建统计

### 构建性能
- **总构建时间**: ~20 秒
- **前端构建**: 922ms
- **Android 同步**: 153ms
- **Gradle 构建**: 17秒

### APK 性能
- **APK 大小**: 3.1 MB
- **构建类型**: Release (已签名)
- **最小 SDK**: 由项目配置决定
- **目标 SDK**: 由项目配置决定

### Gradle 任务
- **总任务数**: 244
- **执行任务**: 40
- **缓存任务**: 204
- **成功率**: 100%

---

## 🎓 下一步

### 生产环境优化
1. **代码混淆**: 启用 ProGuard/R8
   ```gradle
   minifyEnabled true
   ```

2. **APK 瘦身**: 启用资源压缩
   ```gradle
   shrinkResources true
   ```

3. **APK 分包**: 配置 ABI 拆分
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include 'armeabi-v7a', 'arm64-v8a', 'x86'
       }
   }
   ```

4. **应用签名**: 使用生产密钥库
   ```bash
   # 创建生产密钥库
   keytool -genkey -v -keystore release.keystore -alias release
   ```

---

**构建成功!🎉**

现在你可以将 APK 安装到 Android 设备上测试应用了!
