const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }]],
  timeout: 15_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  testDir: "./tests",
});
