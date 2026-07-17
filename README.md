# Login QA Demo

A demo login page with intentional bugs for QA regression testing and Playwright automation.

## Project structure

- `index.html` — main login page
- `styles.css` — page styling
- `script.js` — login validation and UI behavior
- `forgot-password.html` — missing page target for reset flow
- `tests/login.spec.js` — Playwright regression tests
- `playwright.config.js` — Playwright configuration
- `package.json` — npm scripts and dev dependencies
- `testcases.md` — QA test case matrix

## Known issues

1. Username is compared case-insensitively now, but the original bug was case-sensitive comparison.
2. Password validation required at least 8 characters.
3. Password visibility toggle now works correctly.
4. `forgot-password.html` now exists.

## Getting started

### Prerequisites

- Node.js installed
- npm available

### Install dependencies

```powershell
cd "c:\Users\johnp\OneDrive\Desktop\login"
npm install
```

### Run tests

```powershell
npx playwright test
```

### View report

```powershell
npx playwright show-report
```

## Manual QA test cases

See `testcases.md` for the full QA matrix covering happy path, edge cases, and negative scenarios.

## Notes

- The authenticated credentials are `admin@example.com` and `Password123`.
- The current test suite loads the page directly from the local file system.
- If you want to host the page with a local server, use a static server and update the test URL accordingly.
