import { useState, useEffect } from 'react';
import { Wifi, Loader2 } from 'lucide-react';

/**
 * 服务器配置页面组件
 * Server Configuration Page Component
 *
 * 用于配置和检测后端服务器连接
 * For configuring and detecting backend server connection
 */
export function ServerConfig({
  onServerConnected,
}: {
  onServerConnected: (serverUrl: string) => void;
}) {
  const [serverIp, setServerIp] = useState('192.168.1.34');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkHistory, setCheckHistory] = useState<string[]>([]);

  // 默认端口
  const SERVER_PORT = '3001';
  const SERVER_PATH = 'trpc/health';

  /**
   * 检测服务器连接
   * Check server connection
   */
  const checkServerConnection = async (ip: string): Promise<boolean> => {
    const serverUrl = `http://${ip}:${SERVER_PORT}`;
    const healthUrl = `${serverUrl}/${SERVER_PATH}`;

    console.log('🔍 检测服务器 / Checking server:', healthUrl);

    try {
      // 设置超时为 3 秒 / Set timeout to 3 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        console.log('✅ 服务器连接成功 / Server connection successful');
        return true;
      } else {
        console.warn('⚠️ 服务器响应异常 / Server response abnormal:', response.status);
        return false;
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          console.warn('⏱️ 连接超时 / Connection timeout');
        } else {
          console.warn('❌ 连接失败 / Connection failed:', err.message);
        }
      }
      return false;
    }
  };

  /**
   * 自动检测默认服务器
   * Auto-detect default server
   */
  useEffect(() => {
    const autoCheck = async () => {
      setIsChecking(true);
      setError(null);
      console.log('🔄 自动检测服务器 / Auto-detecting server...');

      const connected = await checkServerConnection(serverIp);

      if (connected) {
        const serverUrl = `http://${serverIp}:${SERVER_PORT}`;
        console.log('🎉 自动连接成功 / Auto-connection successful:', serverUrl);
        onServerConnected(serverUrl);
      } else {
        console.log('⚠️ 自动检测失败，请手动配置 / Auto-detection failed, please configure manually');
        setError('无法连接到服务器，请检查 IP 地址是否正确');
        setCheckHistory([...checkHistory, `${serverIp} ❌`]);
      }

      setIsChecking(false);
    };

    autoCheck();
  }, []);

  /**
   * 手动连接服务器
   * Manually connect to server
   */
  const handleManualConnect = async () => {
    setIsChecking(true);
    setError(null);
    setCheckHistory([]);

    const connected = await checkServerConnection(serverIp);

    if (connected) {
      const serverUrl = `http://${serverIp}:${SERVER_PORT}`;
      onServerConnected(serverUrl);
    } else {
      setError(`无法连接到 ${serverIp}，请检查：\n1. 设备是否在同一 Wi-Fi 网络\n2. 服务器是否正在运行\n3. IP 地址是否正确`);
      setCheckHistory([...checkHistory, `${serverIp} ❌`]);
    }

    setIsChecking(false);
  };

  /**
   * 验证 IP 地址格式
   * Validate IP address format
   */
  const isValidIp = (ip: string): boolean => {
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipPattern.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every((part) => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const canConnect = isValidIp(serverIp) && !isChecking;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 主卡片 / Main Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700 shadow-2xl">
          {/* 标题 / Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <Wifi className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Starship Commander
            </h1>
            <p className="text-slate-400 text-sm">
              服务器连接配置 / Server Configuration
            </p>
          </div>

          {/* 输入框 / Input */}
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="server-ip" className="block text-sm font-medium text-slate-300 mb-2">
                服务器 IP 地址 / Server IP Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="server-ip"
                    type="text"
                    value={serverIp}
                    onChange={(e) => setServerIp(e.target.value)}
                    placeholder="192.168.1.33"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    disabled={isChecking}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && canConnect) {
                        handleManualConnect();
                      }
                    }}
                  />
                  {!isValidIp(serverIp) && serverIp && (
                    <p className="absolute -bottom-6 left-0 text-xs text-red-400">
                      IP 地址格式无效 / Invalid IP format
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 默认提示 / Default hint */}
            <div className="text-xs text-slate-500 bg-slate-900/30 rounded-lg p-3">
              <p className="mb-1">
                💡 <strong className="text-slate-400">提示 / Tip:</strong>
              </p>
              <ul className="space-y-1 text-slate-500">
                <li>• 确保设备在同一 Wi-Fi 网络</li>
                <li>• 确保后端服务器正在运行</li>
                <li>• 默认地址: 192.168.1.33:3001</li>
              </ul>
            </div>
          </div>

          {/* 错误信息 / Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
            </div>
          )}

          {/* 检测历史 / Check history */}
          {checkHistory.length > 0 && (
            <div className="mb-6 p-4 bg-slate-900/30 rounded-xl">
              <p className="text-xs text-slate-500 mb-2">检测历史 / Check History:</p>
              <div className="space-y-1">
                {checkHistory.map((record, index) => (
                  <p key={index} className="text-sm text-slate-400 font-mono">
                    {record}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 连接按钮 / Connect button */}
          <button
            onClick={handleManualConnect}
            disabled={!canConnect}
            className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all transform ${
              canConnect
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105 shadow-lg hover:shadow-xl'
                : 'bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            {isChecking ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>检测中... / Checking...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5" />
                <span>连接服务器 / Connect</span>
              </div>
            )}
          </button>

          {/* 帮助信息 / Help info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              需要帮助? / Need help? 查看部署文档 / Check deployment docs
            </p>
          </div>
        </div>

        {/* 版本信息 / Version info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-600">v1.0.0 • Starship Commander</p>
        </div>
      </div>
    </div>
  );
}
