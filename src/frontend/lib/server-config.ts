/**
 * 服务器配置管理 / Server Configuration Management
 * 用于动态配置和管理后端服务器地址
 * For dynamically configuring and managing backend server addresses
 */

interface ServerConfig {
  baseUrl: string;
  isCustom: boolean;
  lastUpdated: number;
}

const STORAGE_KEY = "starship-server-config";
const DEFAULT_PORTS = {
  HTTP: 3001,
  HTTPS: 443,
};

/**
 * 服务器配置管理类
 */
class ServerConfigManager {
  private config: ServerConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * 从 localStorage 加载配置 / Load config from localStorage
   */
  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load server config:", error);
      this.config = null;
    }
  }

  /**
   * 保存配置到 localStorage / Save config to localStorage
   */
  private saveConfig(): void {
    if (this.config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }
  }

  /**
   * 获取当前配置的基础 URL
   * 优先级：自定义配置 > 环境变量 > Capacitor 代理 > localhost
   */
  getBaseUrl(): string {
    // 1. 如果有自定义配置，优先使用
    if (this.config?.baseUrl) {
      return this.config.baseUrl;
    }

    // 2. 检查环境变量
    const envUrl = (import.meta.env as any).VITE_API_URL ||
                   (import.meta.env as any).VITE_TRPC_URL;
    if (envUrl) {
      return envUrl;
    }

    // 3. 如果是移动端，使用 Capacitor 的代理配置
    // 在开发模式下，Capacitor 可以代理到 localhost
    if (this.isNativeMobile()) {
      // 尝试检测本地网络 IP
      const detectedIp = this.detectLocalIp();
      if (detectedIp) {
        return `http://${detectedIp}:3001/trpc`;
      }
    }

    // 4. 默认使用 localhost（Web 开发）
    return "http://localhost:3001/trpc";
  }

  /**
   * 检测是否为原生移动应用 / Check if running on native mobile
   */
  private isNativeMobile(): boolean {
    // 检查是否在 Capacitor 环境中
    return !!(window as any).Capacitor?.isNativePlatform?.();
  }

  /**
   * 尝试检测本地网络 IP / Try to detect local network IP
   * 注意：这在客户端无法直接实现，仅作为示例
   * 实际需要用户配置或通过其他方式获取
   */
  private detectLocalIp(): string | null {
    // 无法在客户端直接检测
    // 返回 null，需要用户手动配置
    return null;
  }

  /**
   * 设置自定义服务器地址 / Set custom server URL
   */
  setServerUrl(url: string): void {
    // 确保 URL 格式正确
    let formattedUrl = url.trim();

    // 如果没有协议，添加 http://
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `http://${formattedUrl}`;
    }

    // 如果没有路径，添加 /trpc
    if (!formattedUrl.endsWith("/trpc")) {
      formattedUrl = `${formattedUrl}/trpc`;
    }

    this.config = {
      baseUrl: formattedUrl,
      isCustom: true,
      lastUpdated: Date.now(),
    };

    this.saveConfig();

    // eslint-disable-next-line no-console
    console.log("✅ Server URL updated:", formattedUrl);
  }

  /**
   * 重置为默认配置 / Reset to default configuration
   */
  resetToDefault(): void {
    this.config = null;
    localStorage.removeItem(STORAGE_KEY);
    // eslint-disable-next-line no-console
    console.log("✅ Server config reset to default");
  }

  /**
   * 获取当前配置信息 / Get current configuration info
   */
  getConfigInfo(): ServerConfig | null {
    return this.config;
  }

  /**
   * 测试服务器连接 / Test server connection
   */
  async testConnection(url?: string): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    const testUrl = url || this.getBaseUrl();

    try {
      const startTime = Date.now();
      const response = await fetch(testUrl.replace("/trpc", "/health"), {
        method: "GET",
        signal: AbortSignal.timeout(5000), // 5 秒超时
      });
      const latency = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: "连接成功 / Connection successful",
          latency,
        };
      } else {
        return {
          success: false,
          message: `服务器错误 / Server error: ${response.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `连接失败 / Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  /**
   * 解析服务器地址 / Parse server address
   * 支持多种输入格式：
   * - IP: 192.168.1.100
   * - IP + 端口: 192.168.1.100:3001
   * - 完整 URL: http://192.168.1.100:3001
   * - 域名: example.com
   */
  parseServerAddress(input: string): {
    fullUrl: string;
    displayUrl: string;
  } {
    let url = input.trim();

    // 如果是 IP 地址或域名，添加协议和端口
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // 检查是否包含端口号
      if (!url.includes(":")) {
        url = `${url}:3001`;
      }
      url = `http://${url}`;
    }

    // 确保 URL 格式正确
    const displayUrl = url.replace("/trpc", "");
    const fullUrl = url.endsWith("/trpc") ? url : `${url}/trpc`;

    return { fullUrl, displayUrl };
  }

  /**
   * 获取推荐的默认服务器列表 / Get recommended default servers
   */
  getRecommendedServers(): Array<{
    name: string;
    url: string;
    description: string;
  }> {
    return [
      {
        name: "本地开发 / Local Dev",
        url: "http://localhost:3001/trpc",
        description: "用于浏览器开发 / For browser development",
      },
      {
        name: "当前网络 IP / Current Network IP",
        url: "", // 需要用户填写
        description: "从电脑获取的 IP 地址 / IP from your computer",
      },
    ];
  }
}

// 创建并导出单例实例 / Create and export singleton instance
export const serverConfig = new ServerConfigManager();

/**
 * 快捷方法：设置服务器地址
 */
export function setServerUrl(url: string): void {
  serverConfig.setServerUrl(url);
}

/**
 * 快捷方法：获取服务器地址
 */
export function getServerUrl(): string {
  return serverConfig.getBaseUrl();
}

/**
 * 快捷方法：重置服务器配置
 */
export function resetServerConfig(): void {
  serverConfig.resetToDefault();
}
