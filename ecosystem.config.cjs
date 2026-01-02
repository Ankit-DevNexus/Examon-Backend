module.exports = {
  apps: [
    {
      name: "examon-backend",
      script: "src/index.js", // adjust if entry file differs
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
