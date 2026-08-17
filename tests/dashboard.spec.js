const { test, expect } = require("@playwright/test");
const {
  DASHBOARD_URL,
  LOGIN_URL,
  openLogin,
  submitCredentials,
} = require("./support/login-page");

const VALID_USERNAME = "admin@example.com";
const VALID_PASSWORD = "Password123";

test.describe("Dashboard and logout", () => {
  test("opens the dashboard after a successful login", async ({ page }) => {
    await openLogin(page);
    await submitCredentials(page, VALID_USERNAME, VALID_PASSWORD);
    await page.locator("#dashboard-link").click();

    await expect(page).toHaveURL(DASHBOARD_URL);
    await expect(page).toHaveTitle("Dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.locator("#welcome-message")).toHaveText(
      `Welcome, ${VALID_USERNAME}.`,
    );
  });

  test("redirects visitors without a session to sign in", async ({ page }) => {
    await page.goto(DASHBOARD_URL);

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("logs out and prevents returning to the dashboard", async ({ page }) => {
    await openLogin(page);
    await submitCredentials(page, VALID_USERNAME, VALID_PASSWORD);
    await page.locator("#dashboard-link").click();
    await page.locator("#logout-button").click();

    await expect(page).toHaveURL(LOGIN_URL);

    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });
});
