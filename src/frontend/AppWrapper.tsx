import { useState, useEffect } from 'react';
import { ServerConfig } from './components/ServerConfig';
import App from './App';

/**
 * 应用包装器组件
 * App Wrapper Component
 *
 * 负责检测服务器连接并启动主应用
 * Responsible for detecting server connection and launching main app
 */
export default function AppWrapper() {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // 从 localStorage 读取上次成功连接的服务器
    const lastServerUrl = localStorage.getItem('starship_server_url');
    if (lastServerUrl) {
      console.log('📦 找到上次连接的服务器 / Found last connected server:', lastServerUrl);
      setServerUrl(lastServerUrl);
    } else {
      // 如果没有历史记录，延迟一点显示配置页面，让自动检测有机会完成
      const timer = setTimeout(() => {
        if (!serverUrl) {
          console.log('⏰ 无历史记录，准备显示配置页面 / No history, preparing to show config');
          setShowConfig(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  /**
   * 处理服务器连接成功
   * Handle server connection success
   */
  const handleServerConnected = (url: string) => {
    console.log('✅ 服务器已连接 / Server connected:', url);
    setServerUrl(url);
    setShowConfig(false);

    // 保存到 localStorage
    localStorage.setItem('starship_server_url', url);

    // 更新全局 API 客户端
    // 注意：这里需要确保 apiClient 已经正确配置
    // Update global API client
    // Note: Ensure apiClient is properly configured
  };

  // 显示服务器配置页面 / Show server config page
  if (showConfig || !serverUrl) {
    return <ServerConfig onServerConnected={handleServerConnected} />;
  }

  // 显示主应用 / Show main app
  return <App />;
}
