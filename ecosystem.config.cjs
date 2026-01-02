module.exports = {
  apps: [
    {
      name: "examon-backend",
      script: "src/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "400M",

      env: {
        NODE_ENV: "production",
        DOTENV_CONFIG_PATH: "./src/.env",
      },
    },
  ],
};
