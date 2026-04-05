module.exports = {
  apps: [{
    name: "ideal-platform",
    script: "server/index.js",
    cwd: "/var/www/systems/ideal-platform",
    interpreter: "node",
    env: {
      NODE_ENV: "production",
      PORT: 3001,
      SESSION_DAYS: 30,
      BACKUP_RETENTION_DAYS: 30,
      PARENT_SESSION_DAYS: 30
    },
    max_memory_restart: "400M",
    log_file: "/var/log/ideal-platform.log",
    error_file: "/var/log/ideal-platform-error.log",
    out_file: "/var/log/ideal-platform-out.log",
    restart_delay: 3000,
    autorestart: true
  }]
};
