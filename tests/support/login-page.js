const path = require("path");
const { pathToFileURL } = require("url");

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const INDEX_PATH = path.join(REPO_ROOT, "index.html");
const LOGIN_URL = pathToFileURL(INDEX_PATH).href;
const DASHBOARD_PATH = path.join(REPO_ROOT, "dashboard.html");
const DASHBOARD_URL = pathToFileURL(DASHBOARD_PATH).href;

async function openLogin(page) {
  await page.goto(LOGIN_URL);
}

async function fillCredentials(page, username, password) {
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
}

async function submitCredentials(page, username, password) {
  await fillCredentials(page, username, password);
  await page.locator("#login-button").click();
}

module.exports = {
  DASHBOARD_URL,
  INDEX_PATH,
  LOGIN_URL,
  REPO_ROOT,
  fillCredentials,
  openLogin,
  submitCredentials,
};
