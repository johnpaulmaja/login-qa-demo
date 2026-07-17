const { test, expect } = require("@playwright/test");
const path = require("path");

const URL = `file://${path.join(__dirname, "..", "index.html").replace(/\\/g, "/")}`;

test.describe("Login page bug regression tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("should disable submit when fields are empty", async ({ page }) => {
    await expect(page.locator("#login-button")).toBeDisabled();
  });

  test("should show blank username error", async ({ page }) => {
    await page.fill("#password", "Password123");
    await page.click("#login-button");
    await expect(page.locator("#error-message")).toHaveText(
      "Username or email cannot be blank.",
    );
  });

  test("should show blank password error", async ({ page }) => {
    await page.fill("#username", "admin@example.com");
    await page.click("#login-button");
    await expect(page.locator("#error-message")).toHaveText(
      "Password cannot be blank.",
    );
  });

  test("should validate password length", async ({ page }) => {
    await page.fill("#username", "admin@example.com");
    await page.fill("#password", "Passwrd");
    await page.click("#login-button");
    await expect(page.locator("#error-message")).toHaveText(
      "Password must be at least 8 characters.",
    );
  });

  test("should accept case-insensitive username", async ({ page }) => {
    await page.fill("#username", "admin@example.com");
    await page.fill("#password", "Password123");
    await page.click("#login-button");
    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("should toggle password visibility", async ({ page }) => {
    await page.fill("#password", "Password123");
    await page.click("#toggle-password");
    await expect(page.locator("#password")).toHaveAttribute("type", "text");
  });
});
