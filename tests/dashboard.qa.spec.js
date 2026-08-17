const { test, expect } = require("@playwright/test");
const {
  DASHBOARD_URL,
  LOGIN_URL,
  openLogin,
  submitCredentials,
} = require("./support/login-page");

const SESSION_KEY = "login-demo-session";
const VALID_USERNAME = "admin@example.com";
const VALID_PASSWORD = "Password123";

async function completeLogin(page, { remember = false } = {}) {
  await openLogin(page);
  if (remember) {
    await page.getByRole("checkbox", { name: "Remember me" }).check();
  }
  await submitCredentials(page, VALID_USERNAME, VALID_PASSWORD);
  await expect(page.getByRole("link", { name: "Continue to dashboard" })).toBeVisible();
}

async function readStoredSessions(page) {
  return page.evaluate((key) => ({
    local: localStorage.getItem(key),
    session: sessionStorage.getItem(key),
  }), SESSION_KEY);
}

async function openDashboardWithSession(page) {
  await openLogin(page);
  await page.evaluate(({ key, username }) => {
    sessionStorage.setItem(key, JSON.stringify({ username }));
  }, { key: SESSION_KEY, username: VALID_USERNAME });
  await page.goto(DASHBOARD_URL);
}

test.describe("Dashboard session QA", () => {
  test("does not expose the dashboard or create a session after failed authentication", async ({
    page,
  }) => {
    await openLogin(page);
    await submitCredentials(page, VALID_USERNAME, "WrongPassword");

    await expect(page.getByRole("link", { name: "Continue to dashboard" })).toBeHidden();
    await expect(page.locator("#error-message")).toHaveText("Invalid username or password.");
    await expect.poll(() => readStoredSessions(page)).toEqual({ local: null, session: null });
  });

  test("uses tab-scoped storage when Remember me is not selected", async ({ page, context }) => {
    await completeLogin(page);

    const sessions = await readStoredSessions(page);
    expect(JSON.parse(sessions.session)).toEqual({ username: VALID_USERNAME });
    expect(sessions.local).toBeNull();

    await page.getByRole("link", { name: "Continue to dashboard" }).click();
    await expect(page).toHaveURL(DASHBOARD_URL);
    await page.reload();
    await expect(page.locator("#welcome-message")).toHaveText(`Welcome, ${VALID_USERNAME}.`);

    const separateTab = await context.newPage();
    await separateTab.goto(DASHBOARD_URL);
    await expect(separateTab).toHaveURL(LOGIN_URL);
    await separateTab.close();
  });

  test("uses persistent storage when Remember me is selected", async ({ page, context }) => {
    await completeLogin(page, { remember: true });

    const sessions = await readStoredSessions(page);
    expect(JSON.parse(sessions.local)).toEqual({ username: VALID_USERNAME });
    expect(sessions.session).toBeNull();

    const separateTab = await context.newPage();
    await separateTab.goto(DASHBOARD_URL);
    await expect(separateTab).toHaveURL(DASHBOARD_URL);
    await expect(separateTab.locator("#welcome-message")).toHaveText(
      `Welcome, ${VALID_USERNAME}.`,
    );
    await separateTab.close();
  });

  test("clears a malformed session and redirects to sign in", async ({ page }) => {
    await openLogin(page);
    await page.evaluate((key) => localStorage.setItem(key, "not-json"), SESSION_KEY);

    await page.goto(DASHBOARD_URL);

    await expect(page).toHaveURL(LOGIN_URL);
    await expect.poll(() => readStoredSessions(page)).toEqual({ local: null, session: null });
  });

  test("supports keyboard logout, clears both stores, and blocks history re-entry", async ({
    page,
  }) => {
    await completeLogin(page, { remember: true });
    await page.getByRole("link", { name: "Continue to dashboard" }).click();

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Log out" })).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(LOGIN_URL);
    await expect.poll(() => readStoredSessions(page)).toEqual({ local: null, session: null });
    await page.goBack();
    await expect(page).toHaveURL(LOGIN_URL);
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test("renders the account summary without browser or resource errors", async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    await openDashboardWithSession(page);

    await expect(page).toHaveTitle("Dashboard");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    await expect(page.locator(".dashboard-grid")).toHaveAttribute("aria-label", "Account summary");
    await expect(page.locator(".summary-card")).toHaveCount(3);
    await expect(page.locator(".summary-value")).toHaveText(["3", "8", "2"]);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });

  for (const viewport of [
    { name: "desktop", width: 1280, height: 720, columns: 3 },
    { name: "tablet", width: 768, height: 1024, columns: 3 },
    { name: "mobile", width: 320, height: 568, columns: 1 },
  ]) {
    test(`${viewport.name} dashboard remains usable without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openDashboardWithSession(page);

      const layout = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        gridColumns: getComputedStyle(document.querySelector(".dashboard-grid"))
          .gridTemplateColumns.split(" ").length,
        viewportWidth: window.innerWidth,
      }));

      expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.gridColumns).toBe(viewport.columns);
      await expect(page.getByRole("button", { name: "Log out" })).toBeVisible();
      await expect(page.locator(".summary-card")).toHaveCount(3);
    });
  }

  test("rejects a forged client-side session", async ({ page }) => {
    await openLogin(page);
    await page.evaluate(({ key, username }) => {
      localStorage.setItem(key, JSON.stringify({ username }));
    }, { key: SESSION_KEY, username: "intruder@example.com" });

    await page.goto(DASHBOARD_URL);

    await expect(page).toHaveURL(LOGIN_URL);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
