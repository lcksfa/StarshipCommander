import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.starshipcommander.habits',
  appName: 'Starship Commander',
  webDir: 'dist',
  server: {
    // 配置为局域网服务器地址 / Configure for LAN server address
    // 移动端将从局域网服务器加载应用，而不是打包的资源
    // Mobile app will load from LAN server instead of bundled resources
    url: 'http://192.168.1.2:3000',
    androidScheme: 'https',
    // 开发环境配置：允许连接开发服务器
    // Development configuration: Allow connection to dev server
    cleartext: true,
    // 允许在安卓上加载本地网络资源
    // Allow loading local network resources on Android
    androidPathResolver: (path) => path,
    // 允许导航到外部 URL
    // Allow navigation to external URLs
    allowNavigation: [
      'http://192.168.1.2:*',
      'http://localhost:*',
    ],
  },
  android: {
    // 启用混合内容以支持开发环境的 HTTP 连接
    // Enable hybrid content for HTTP connections in development
    allowMixedContent: true,
    // 禁用输入捕获以避免干扰 React 受控组件
    // Disable input capture to avoid interference with React controlled components
    captureInput: false,
    // 启用 webContents 调试
    // Enable webContents debugging
    webContentsDebuggingEnabled: true,
    // 保持 WebView 在软键盘弹出时不重新布局
    // Keep WebView from relayouting when soft keyboard appears
    keyboardDisplayRequiresUserAction: false,
  },
};

export default config;
