// PM2 进程管理配置
// 使用: pm2 start ecosystem.config.js
module.exports = {
  apps: [{
    name: 'xiaobai-site',
    script: './server/server.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    autorestart: true,
    restart_delay: 3000,
    kill_timeout: 5000,
    listen_timeout: 10000,
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true
  }]
};
