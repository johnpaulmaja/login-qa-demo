const { test, expect } = require("@playwright/test");
const { openLogin } = require("./support/login-page");

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 720 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 320, height: 568 },
];

for (const viewport of VIEWPORTS) {
  test(`${viewport.name} layout has no horizontal page overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openLogin(page);

    const dimensions = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  });
}

test.describe("320px mobile layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await openLogin(page);
  });

  test("keeps the password hint clear of the visibility control", async ({ page }) => {
    const overlaps = await page.evaluate(() => {
      const input = document.querySelector("#password");
      const toggle = document.querySelector("#toggle-password");
      const style = getComputedStyle(input);
      const context = document.createElement("canvas").getContext("2d");
      context.font = style.font;
      const placeholderRight =
        input.getBoundingClientRect().left +
        parseFloat(style.paddingLeft) +
        context.measureText(input.placeholder).width;

      return placeholderRight > toggle.getBoundingClientRect().left;
    });

    expect(overlaps).toBe(false);
  });

  test("keeps auxiliary controls readable on one line", async ({ page }) => {
    const heights = await page.evaluate(() => ({
      remember: document.querySelector(".checkbox").getBoundingClientRect().height,
      forgot: document.querySelector("#forgot-password").getBoundingClientRect().height,
    }));

    expect(heights.remember).toBeLessThanOrEqual(24);
    expect(heights.forgot).toBeLessThanOrEqual(24);
  });

  test("provides a minimum 24 by 24 pixel password-toggle target", async ({ page }) => {
    const bounds = await page.locator("#toggle-password").boundingBox();

    expect(bounds.width).toBeGreaterThanOrEqual(24);
    expect(bounds.height).toBeGreaterThanOrEqual(24);
  });
});
