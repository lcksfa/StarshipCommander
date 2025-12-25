/**
 * 服务器配置设置组件 / Server Configuration Settings Component
 * 允许用户在应用内配置后端服务器地址
 * Allows users to configure backend server address within the app
 */

import React, { useState, useEffect } from "react";
import { Settings, X, Wifi, TestTube, Check, X as XIcon, Info } from "lucide-react";
import { serverConfig } from "../lib/server-config";
import { useLanguage } from "../contexts/LanguageContext";

interface ServerSettingsProps {
  onClose: () => void;
  onConfigured?: () => void;
}

export const ServerSettings: React.FC<ServerSettingsProps> = ({
  onClose,
  onConfigured,
}) => {
  const { t } = useLanguage();
  const [serverInput, setServerInput] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latency?: number;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    // 加载当前配置 / Load current configuration
    const config = serverConfig.getConfigInfo();
    if (config?.baseUrl) {
      const displayUrl = config.baseUrl.replace("/trpc", "");
      setServerInput(displayUrl);
      setCurrentUrl(displayUrl);
    }
  }, []);

  /**
   * 保存服务器配置 / Save server configuration
   */
  const handleSave = () => {
    if (!serverInput.trim()) {
      setTestResult({
        success: false,
        message: "请输入服务器地址 / Please enter server address",
      });
      return;
    }

    try {
      const { fullUrl } = serverConfig.parseServerAddress(serverInput);
      serverConfig.setServerUrl(fullUrl);
      setCurrentUrl(serverInput);
      setTestResult({
        success: true,
        message: "配置已保存！/ Configuration saved!",
      });

      // 通知父组件配置已更新
      if (onConfigured) {
        onConfigured();
      }

      // 2秒后关闭
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setTestResult({
        success: false,
        message: `配置失败: ${error instanceof Error ? error.message : "未知错误"}`,
      });
    }
  };

  /**
   * 测试服务器连接 / Test server connection
   */
  const handleTest = async () => {
    if (!serverInput.trim()) {
      setTestResult({
        success: false,
        message: "请输入服务器地址 / Please enter server address",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const { fullUrl } = serverConfig.parseServerAddress(serverInput);
      const result = await serverConfig.testConnection(fullUrl);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败: ${error instanceof Error ? error.message : "未知错误"}`,
      });
    } finally {
      setTesting(false);
    }
  };

  /**
   * 重置为默认配置 / Reset to default configuration
   */
  const handleReset = () => {
    serverConfig.resetToDefault();
    setServerInput("");
    setCurrentUrl("");
    setTestResult({
      success: true,
      message: "已重置为默认配置 / Reset to default",
    });
  };

  /**
   * 快速配置当前 IP / Quick configure with current IP
   */
  const handleQuickConfig = (ip: string) => {
    setServerInput(ip);
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-space-900 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto border border-neon-cyan/30">
        {/* Header / 标题 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-neon-cyan" />
            <h2 className="text-xl font-bold text-white">
              服务器设置 / Server Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content / 内容 */}
        <div className="p-6 space-y-6">
          {/* 首次使用提示 / First-time usage notice */}
          {!currentUrl && (
            <div className="bg-neon-orange/10 rounded-lg p-4 border border-neon-orange/30">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-neon-orange flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-neon-orange font-bold mb-1">
                    首次使用必须配置 / First-time setup required
                  </p>
                  <p className="text-xs text-white/70">
                    应用默认使用 localhost，在移动设备上无法连接。请配置您电脑的局域网 IP 地址。
                    <br />
                    <span className="text-white/50">
                      App defaults to localhost which won't work on mobile. Please configure your computer's LAN IP.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 当前配置 / Current Configuration */}
          {currentUrl && (
            <div className="bg-space-950 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-white/60">
                  当前服务器 / Current Server
                </span>
              </div>
              <p className="text-white font-mono text-sm break-all">
                {currentUrl}
              </p>
            </div>
          )}

          {/* 输入框 / Input */}
          <div className="space-y-2">
            <label className="text-sm text-white/80">
              服务器地址 / Server Address
            </label>
            <input
              type="text"
              value={serverInput}
              onChange={(e) => setServerInput(e.target.value)}
              placeholder="192.168.1.100:3001"
              className="w-full px-4 py-3 bg-space-950 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-neon-cyan transition-colors font-mono"
            />
            <p className="text-xs text-white/40">
              支持格式 / Supported: IP:端口 或 完整 URL / IP:port or full URL
            </p>
          </div>

          {/* 快速配置选项 / Quick Config Options */}
          <div className="space-y-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="flex items-center gap-2 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>如何获取服务器地址？/ How to get server address?</span>
            </button>

            {showHelp && (
              <div className="bg-space-950 rounded-lg p-4 border border-white/10 text-sm text-white/80 space-y-2">
                <p><strong>方法 1 / Method 1:</strong></p>
                <p className="ml-4">在电脑上运行 / On computer:</p>
                <code className="block ml-4 bg-black/30 p-2 rounded font-mono text-xs">
                  ipconfig getifaddr en0
                </code>
                <p><strong>方法 2 / Method 2:</strong></p>
                <p className="ml-4">系统偏好设置 &gt; 网络 / System Preferences &gt; Network</p>
              </div>
            )}
          </div>

          {/* 测试结果 / Test Result */}
          {testResult && (
            <div
              className={`rounded-lg p-4 border ${
                testResult.success
                  ? "bg-neon-green/10 border-neon-green/30"
                  : "bg-neon-rose/10 border-neon-rose/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <Check className="w-5 h-5 text-neon-green flex-shrink-0 mt-0.5" />
                ) : (
                  <XIcon className="w-5 h-5 text-neon-rose flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      testResult.success ? "text-neon-green" : "text-neon-rose"
                    }`}
                  >
                    {testResult.message}
                  </p>
                  {testResult.latency && (
                    <p className="text-xs text-white/60 mt-1">
                      延迟 / Latency: {testResult.latency}ms
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 按钮 / Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-space-950 border border-neon-cyan/50 rounded-lg text-neon-cyan hover:bg-neon-cyan/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <TestTube className="w-4 h-4" />
                {testing ? "测试中... / Testing..." : "测试连接 / Test"}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-neon-cyan border border-neon-cyan rounded-lg text-space-950 font-bold hover:bg-neon-cyan/90 transition-all"
              >
                <Check className="w-4 h-4" />
                保存 / Save
              </button>
            </div>
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-space-950 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 transition-all text-sm"
            >
              重置为默认 / Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
