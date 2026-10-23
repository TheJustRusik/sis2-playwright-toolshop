# SIS 2 — Playwright test automation

Automated functional and API tests for the public **[Practice Software Testing — Toolshop](https://practicesoftwaretesting.com/)** demo application, built with **Playwright + TypeScript** for the SIS 2 assignment.

**Public repository:** https://github.com/TheJustRusik/sis2-playwright-toolshop

## Result

| Projects | Suites | Test cases | Result | Duration |
| --- | --- | --- | --- | --- |
| `ui-chromium`, `api` | 6 | 32 | **32 passed, 0 failed** | 28.9 s |

![Playwright report — all suites passing](screenshots/report-overview.png)

## Test suites

| # | Suite | File | Tests | Tag |
| --- | --- | --- | --- | --- |
| 1 | Smoke | `tests/01-smoke.spec.ts` | 3 | `@smoke` |
| 2 | Authentication | `tests/02-authentication.spec.ts` | 5 | `@auth` |
| 3 | Product catalogue | `tests/03-catalog.spec.ts` | 7 | `@catalog` |
| 4 | Shopping cart | `tests/04-cart.spec.ts` | 5 | `@cart` |
| 5 | Checkout (end-to-end) | `tests/05-checkout.spec.ts` | 3 | `@checkout` |
| 6 | API | `tests/06-api.spec.ts` | 9 | `@api` |

The complete test-case list, steps and expected results are in **[TestCases.md](./TestCases.md)**.

## Quick start

Requirements: Node.js 18+ and npm. The project was verified with Node 26 and Playwright 1.64.1.

```bash
npm install
npx playwright install chromium
npm test
npm run report
```

If the browser download is blocked (for example, behind a campus proxy) but Google Chrome is installed:

```bash
PLAYWRIGHT_CHANNEL=chrome npm test
```

### Run one suite

```bash
npm run test:smoke
npm run test:auth
npm run test:catalog
npm run test:cart
npm run test:checkout
npm run test:api
```

### Run one test case

```bash
npx playwright test -g "TC-CHK-01"
```

## What is covered

- **Smoke:** home catalogue, product details, category navigation.
- **Authentication:** registration, valid/invalid login, logout, protected `/account`.
- **Catalogue:** search, empty state, reset, category filter, price sorting, pagination, product data.
- **Cart:** add, badge, quantity recalculation, removal, reload persistence, product-page quantity.
- **Checkout:** registered and guest purchases with Cash on Delivery, invoice creation, invoice listing, payment-method guard.
- **API:** paginated products, product by id, 404, search, empty search, register/login/profile, duplicate registration, 401s, cart lifecycle.

## Design

- **Page Object Model** in `src/pages/` — tests express intent, selectors live in page objects.
- **Fixtures** in `src/fixtures/test.ts` — page objects plus a lazy per-test `testUser`.
- **Disposable users** in `src/api/users.ts` — registered through the public API. The documented shared demo account is currently locked (“too many failed attempts”), so tests never depend on it.
- **Stable selectors** — the app's `data-test` hooks (configured as Playwright's `testIdAttribute`), accessible roles where no hook exists, and only two deliberately scoped CSS selectors.
- **Web-first assertions** — no fixed sleeps in tests; `expect.poll` is used for collection-level properties and asynchronous address lookup.
- **Two Playwright projects** — UI (`ui-chromium`) and API (`api`, running in seconds).
- **Evidence** — HTML/JSON reporters, trace and screenshot on failure; the main checkout test attaches its confirmation screenshot to the report.

## Repository layout

```
SIS2/
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── api/users.ts              # disposable test-user factory
│   ├── fixtures/test.ts          # page objects + testUser fixture
│   ├── pages/                    # Home, Product, Login, Register, Account, Cart, Checkout
│   └── utils/constants.ts
├── tests/                        # six suites
├── screenshots/                  # AI session + run evidence
├── scripts/capture-screenshots.mjs
├── Description.md
├── TestCases.md
├── Prompt.md
├── Review.md
└── README.md
```

## Documentation

| File | Content |
| --- | --- |
| [Description.md](./Description.md) | Goal, scope, approach, environment, execution, risks. |
| [TestCases.md](./TestCases.md) | 32 test cases with preconditions, steps and expected results. |
| [Prompt.md](./Prompt.md) | Exact prompt and AI tool/model identification. |
| [Review.md](./Review.md) | AI output review, corrections and justification. |
| [screenshots/README.md](./screenshots/README.md) | Evidence index. |

## Test data note

Tests create real users and orders on the public demo. Clients, passwords and invoices are disposable test data; no production data is involved. Each test uses a fresh browser context and unique emails to keep runs independent.

## AI assistance

The suite was produced in an AI-assisted session with Claude Code. The exact prompt, tool details and the review of the generated output — including the corrections forced by the live application — are documented in [Prompt.md](./Prompt.md) and [Review.md](./Review.md).

## License

ISC (assignment project).
