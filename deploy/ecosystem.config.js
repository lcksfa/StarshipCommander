// PM2 Ecosystem 配置文件 / PM2 Ecosystem configuration
module.exports = {
  apps: [
    {
      name: "starship-backend",
      script: "./dist/backend/main.js",
      cwd: "/var/www/starship-commander",
      instances: 2, // 启动 2 个实例（根据服务器 CPU 核心数调整）
      exec_mode: "cluster", // 集群模式
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      max_memory_restart: "1G", // 内存超过 1G 自动重启
      autorestart: true,
      watch: false,
    },
    {
      name: "starship-frontend",
      script: "npx",
      args: "vite preview --dist dist --port 3000",
      cwd: "/var/www/starship-commander",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
