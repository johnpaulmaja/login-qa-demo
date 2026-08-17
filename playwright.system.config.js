const { defineConfig } = require("@playwright/test");
const baseConfig = require("./playwright.config");

module.exports = defineConfig(baseConfig, {
  use: {
    ...baseConfig.use,
    channel: "chrome",
  },
});
