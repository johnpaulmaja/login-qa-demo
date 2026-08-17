const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const {
  REPO_ROOT,
  fillCredentials,
  openLogin,
  submitCredentials,
} = require("./support/login-page");

const DOCUMENTED_USERNAME = "admin@example.com";
const WORKING_USERNAME = "Admin@example.com";
const VALID_PASSWORD = "Password123";

test.describe("Login behavior", () => {
  test.beforeEach(async ({ page }) => {
    await openLogin(page);
  });

  test("keeps submit disabled until both fields contain values", async ({ page }) => {
    const submit = page.locator("#login-button");

    await expect(submit).toBeDisabled();
    await page.locator("#username").fill(WORKING_USERNAME);
    await expect(submit).toBeDisabled();

    await page.locator("#username").fill("");
    await page.locator("#password").fill(VALID_PASSWORD);
    await expect(submit).toBeDisabled();

    await page.locator("#username").fill("   ");
    await expect(submit).toBeDisabled();

    await page.locator("#username").fill(WORKING_USERNAME);
    await expect(submit).toBeEnabled();
  });

  test("accepts the documented credentials", async ({ page }) => {
    await submitCredentials(page, DOCUMENTED_USERNAME, VALID_PASSWORD);

    await expect(page.locator("#error-message")).toBeEmpty();
    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("compares usernames case-insensitively", async ({ page }) => {
    await submitCredentials(page, "ADMIN@EXAMPLE.COM", VALID_PASSWORD);

    await expect(page.locator("#error-message")).toBeEmpty();
    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("trims surrounding username whitespace", async ({ page }) => {
    await submitCredentials(page, `  ${WORKING_USERNAME}  `, VALID_PASSWORD);

    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  for (const credentials of [
    { name: "unknown username", username: "nobody@example.com", password: VALID_PASSWORD },
    { name: "incorrect password", username: WORKING_USERNAME, password: "WrongPassword" },
  ]) {
    test(`shows a generic error for ${credentials.name}`, async ({ page }) => {
      await submitCredentials(page, credentials.username, credentials.password);

      await expect(page.locator("#error-message")).toHaveText(
        "Invalid username or password.",
      );
      await expect(page.locator("#result")).toBeEmpty();
    });
  }

  for (const password of ["Passw", "Passwd", "Passwrd"]) {
    test(`rejects a ${password.length}-character password as too short`, async ({ page }) => {
      await submitCredentials(page, WORKING_USERNAME, password);

      await expect(page.locator("#error-message")).toHaveText(
        "Password must be at least 8 characters.",
      );
    });
  }

  test("allows an eight-character password to reach credential validation", async ({ page }) => {
    await submitCredentials(page, WORKING_USERNAME, "Passwrd8");

    await expect(page.locator("#error-message")).toHaveText(
      "Invalid username or password.",
    );
  });

  test("submits valid populated fields with Enter", async ({ page }) => {
    await fillCredentials(page, WORKING_USERNAME, VALID_PASSWORD);
    await page.locator("#password").press("Enter");

    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("clears an authentication error after a successful resubmission", async ({ page }) => {
    await submitCredentials(page, WORKING_USERNAME, "WrongPassword");
    await expect(page.locator("#error-message")).toBeVisible();

    await page.locator("#password").fill(VALID_PASSWORD);
    await page.locator("#login-button").click();

    await expect(page.locator("#error-message")).toBeEmpty();
    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("remains stable across repeated submissions", async ({ page }) => {
    await fillCredentials(page, WORKING_USERNAME, VALID_PASSWORD);

    await page.locator("#login-button").click();
    await expect(page.locator("#result")).toHaveText("Login successful");
    await page.locator("#login-button").click();

    await expect(page.locator("#error-message")).toBeEmpty();
    await expect(page.locator("#result")).toHaveText("Login successful");
  });

  test("reveals and hides the password", async ({ page }) => {
    const password = page.locator("#password");
    const toggle = page.locator("#toggle-password");

    await password.fill(VALID_PASSWORD);
    await expect(password).toHaveAttribute("type", "password");
    await expect(toggle).toHaveText("Show");

    await toggle.click();
    await expect(password).toHaveAttribute("type", "text");
    await expect(toggle).toHaveText("Hide");

    await toggle.click();
    await expect(password).toHaveAttribute("type", "password");
    await expect(toggle).toHaveText("Show");
  });

  test("preserves the Remember me selection during submission", async ({ page }) => {
    const remember = page.locator("#remember");

    await remember.check();
    await submitCredentials(page, WORKING_USERNAME, VALID_PASSWORD);

    await expect(remember).toBeChecked();
  });

  test("links to an existing password recovery page", async ({ page }) => {
    const recoveryLink = page.locator("#forgot-password");
    const href = await recoveryLink.getAttribute("href");
    const recoveryPath = path.resolve(REPO_ROOT, href);

    expect(fs.existsSync(recoveryPath), `${href} should exist`).toBe(true);
  });

  test("loads without console errors, page errors, or failed resources", async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => failedRequests.push(request.url()));

    await page.reload();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
});
