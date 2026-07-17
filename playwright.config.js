const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  testDir: "./tests",
});
