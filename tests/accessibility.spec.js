const { test, expect } = require("@playwright/test");
const { fillCredentials, openLogin } = require("./support/login-page");

test.describe("Login accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await openLogin(page);
  });

  test("provides a page title, language, heading, and form labels", async ({ page }) => {
    await expect(page).toHaveTitle("Login Page");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Sign in", level: 1 })).toBeVisible();
    await expect(page.getByLabel("Email or username")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("checkbox", { name: "Remember me" })).toBeVisible();
  });

  test("exposes required-field semantics", async ({ page }) => {
    await expect(page.locator("#username")).toHaveAttribute("required", "");
    await expect(page.locator("#password")).toHaveAttribute("required", "");
  });

  test("keeps a logical keyboard focus order", async ({ page }) => {
    const expectedOrder = [
      "username",
      "password",
      "toggle-password",
      "remember",
      "forgot-password",
    ];

    for (const id of expectedOrder) {
      await page.keyboard.press("Tab");
      await expect(page.locator(`#${id}`)).toBeFocused();
    }

    await fillCredentials(page, "Admin@example.com", "Password123");
    await page.locator("#forgot-password").focus();
    await page.keyboard.press("Tab");
    await expect(page.locator("#login-button")).toBeFocused();
  });

  test("announces authentication errors through a live region", async ({ page }) => {
    await fillCredentials(page, "Admin@example.com", "WrongPassword");
    await page.locator("#login-button").click();

    await expect(page.locator("#error-message")).toHaveAttribute("aria-live", "polite");
    await expect(page.locator("#error-message")).toHaveText(
      "Invalid username or password.",
    );
  });

  test("announces successful login as a status message", async ({ page }) => {
    await fillCredentials(page, "Admin@example.com", "Password123");
    await page.locator("#login-button").click();

    await expect(page.locator("#result")).toHaveAttribute("role", "status");
    await expect(page.locator("#result")).toHaveText("Login successful");
  });
});
