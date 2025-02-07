module.exports = {
  apps: [
    {
      name: "paint-project",
      script: "./dist/bundle.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      watch: false,
      max_memory_restart: "1G",
      error_file: "logs/pm2/error.log",
      out_file: "logs/pm2/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
    },
  ],
};
