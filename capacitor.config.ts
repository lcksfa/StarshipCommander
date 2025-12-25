import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starshipcommander.habits',
  appName: 'Starship Commander',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // 开发环境配置：允许连接开发服务器
    // Development configuration: Allow connection to dev server
    cleartext: true,
    // 允许在安卓上加载本地网络资源
    // Allow loading local network resources on Android
    androidPathResolver: (path) => path,
  },
  android: {
    // 启用混合内容以支持开发环境的 HTTP 连接
    // Enable hybrid content for HTTP connections in development
    allowMixedContent: true,
    // 捕获输入以防止软键盘问题
    // Capture input to prevent soft keyboard issues
    captureInput: true,
    // 启用 webContents 调试
    // Enable webContents debugging
    webContentsDebuggingEnabled: true,
  },
};

export default config;
