# SIS 2 — Test Automation with Playwright

## 1. Goal

The goal of this assignment is to design, implement and execute a maintainable automated test suite for the public **Practice Software Testing — Toolshop** application, using **Playwright** and **TypeScript**.

The work demonstrates:

- a risk-based selection of functional test scenarios;
- six independent automated test suites (more than the required five);
- use of the Page Object Model (POM) and reusable test fixtures;
- web-first assertions and stable selector strategies;
- UI **and** API automation in the same repository;
- a documented AI-assisted workflow, including the original prompt and a review of the AI output.

## 2. System under test

| Item | Value |
| --- | --- |
| Application | Practice Software Testing — Toolshop |
| UI URL | https://practicesoftwaretesting.com/ |
| API URL | https://api.practicesoftwaretesting.com |
| UI version observed | v5.0 (page title); footer reports v2.5, built 2026-10-11, Angular 20.0.5 |
| Nature | Public demo shop with a fixed catalogue, authentication, cart, checkout and invoices |
| Test data | 50 products, 9 products per page, two product brands, category tree |

The application is a shared public demo. Tests must not depend on mutable global state (for example, the shared demo account), and each test must run in its own browser context.

## 3. Scope

### In scope

1. **Smoke testing** — the critical entry points are available and render.
2. **Authentication** — registration, valid/invalid sign-in, sign-out, protected-route behaviour.
3. **Product catalogue** — search, empty search, reset, category filter, sorting, pagination, product details.
4. **Shopping cart** — add, quantity updates, price recalculation, removal, persistence across reload.
5. **Checkout** — registered-customer and guest end-to-end purchases with Cash on Delivery, invoice generation, payment validation.
6. **API testing** — catalogue, search, authentication, duplicate registration, authorization failures, cart lifecycle.

### Out of scope (and why)

| Area | Reason |
| --- | --- |
| Performance / load | The assignment targets functional automation; a public shared demo cannot provide stable load baselines. |
| Security testing | No authorization to attack the demo; security testing is a separate discipline. |
| Visual regression | The catalogue and marketing banners change without notice; screenshot diffing would be unstable here. |
| Mobile / responsive matrix | Covered by a single desktop viewport to keep the suite focused; Playwright can add projects later. |
| Rentals, favourites, messages, admin | Lower-risk secondary features; suitable follow-up work once the purchase path is covered. |

## 4. Test approach

- **Risk-based prioritisation.** The purchase path (catalogue → cart → checkout → invoice) is the highest business risk, so it receives end-to-end coverage. Authentication and catalogue behaviour are tested next. API tests protect the contract underneath the UI.
- **Page Object Model.** Each page/step has a class under `src/pages/`; tests contain intent, not selectors.
- **Fixtures.** `src/fixtures/test.ts` provides page objects and a per-test `testUser`. Test users are registered through the public API, which keeps tests isolated and avoids the locked shared demo account.
- **Selector strategy.** Prefer the application's stable `data-test` attributes (Playwright is configured with `testIdAttribute: 'data-test'`). Use accessible roles for elements without a hook (for example category checkboxes and the guest-checkout tab). Use a scoped CSS selector only for the icon-only cart remove control, which has no test hook.
- **Assertions.** Use web-first, auto-retrying assertions (`expect(locator).toHaveText`, `toBeVisible`, `toBeDisabled`, `expect.poll`) instead of fixed sleeps where possible.
- **Isolation.** Every test gets a fresh browser context (fresh cookies and `localStorage`) and, where needed, a unique customer. Checkout tests create real invoices on the demo, so the data is intentionally disposable.
- **API coverage.** The Playwright `request` fixture validates the OpenAPI contract directly, including negative cases (404, 401, 409).

## 5. Test suites

| # | Suite | AT type | File | Tests | Tag | Purpose |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Smoke | Smoke | `tests/01-smoke.spec.ts` | 3 | `@smoke` | Prove the application and critical entry points are alive. |
| 2 | Authentication | Functional / security-adjacent | `tests/02-authentication.spec.ts` | 5 | `@auth` | Registration, login, logout and route protection. |
| 3 | Product catalogue | Functional / regression | `tests/03-catalog.spec.ts` | 7 | `@catalog` | Search, filters, sorting, pagination, product details. |
| 4 | Shopping cart | Functional / regression | `tests/04-cart.spec.ts` | 5 | `@cart` | Add/update/remove, totals, persistence. |
| 5 | Checkout (E2E) | End-to-end / regression | `tests/05-checkout.spec.ts` | 3 | `@checkout` | Registered and guest purchases, invoice, payment validation. |
| 6 | API | API / contract | `tests/06-api.spec.ts` | 9 | `@api` | Catalogue contract, auth, negative responses, cart lifecycle. |
| | **Total** | | | **32** | | |

The presentation's AT types are therefore covered as follows: **smoke** in Suite 1, **functional/regression** in Suites 2–4, **end-to-end** in Suite 5 and **API/contract** in Suite 6. Negative and boundary checks are distributed where they belong: empty search, empty cart, invalid login, unauthorized access, 404/409 responses and the disabled payment guard. This gives six automated suites rather than the five required.

The individual test cases, steps and expected results are listed in [TestCases.md](./TestCases.md).

## 6. Environment and tools

| Tool | Version / detail |
| --- | --- |
| Node.js | 26.12.1 |
| Playwright Test | 1.64.1 |
| Language | TypeScript 7 |
| Browser | Chromium project; locally driven through installed Google Chrome (`PLAYWRIGHT_CHANNEL=chrome`) because the browser CDN is blocked on the campus network |
| OS | macOS (Darwin 25.6.0) |
| Reporters | `list`, `html` (`playwright-report/`), `json` (`test-results/results.json`) |
| Evidence | Traces on failure, screenshots on failure, HTML report; committed screenshots in `screenshots/` |

## 7. How to run

```bash
npm install
npx playwright install chromium   # skip if a system Chrome is available
npm test
npm run report
```

If the bundled Chromium cannot be downloaded:

```bash
PLAYWRIGHT_CHANNEL=chrome npm test
```

Useful subsets:

```bash
npm run test:smoke
npm run test:auth
npm run test:catalog
npm run test:cart
npm run test:checkout
npm run test:api
```

## 8. Expected result

A clean run executes **32 tests** across two Playwright projects (`ui-chromium` and `api`) and reports **32 passed, 0 failed**. The final local run on 23 October 2026 completed in **28.9 s** with 3 workers.

Evidence:

- `screenshots/report-overview.png` — all suites, 32 passed.
- `screenshots/report-test-detail.png` — step-by-step trace of the main checkout test.
- `screenshots/checkout-confirmation.png` — real order confirmation with invoice number.

## 9. Risks and limitations

- The target is a **live, shared demo**; product data, page version or third-party services (postcode lookup, payment) can change.
- The documented demo account is currently **locked** (“too many failed attempts”). The suite therefore provisions disposable users through the API. See [Review.md](./Review.md).
- Every checkout run creates a real invoice in the demo database; this is acceptable test data for a training application but is not cleaned up.
- Guest checkout is covered separately; guest invoices are not attached to an account.
- The suite is intentionally functional, not exhaustive: it does not cover payments other than Cash on Delivery, rentals, favourites, messages or accessibility.
- Retries are set to 1 to absorb occasional latency of the public demo. A flaky result would still be visible in the report; the final run had none.

## 10. Repository layout

```
SIS2/
├── playwright.config.ts
├── tsconfig.json
├── package.json
├── src/
│   ├── api/users.ts              # disposable test-user factory
│   ├── fixtures/test.ts          # page-object fixtures + testUser
│   ├── pages/                    # Home, Product, Login, Register, Account, Cart, Checkout
│   └── utils/constants.ts
├── tests/                        # six suites, 32 tests
├── screenshots/                  # AI session + run evidence
├── scripts/capture-screenshots.mjs
├── Description.md
├── TestCases.md
├── Prompt.md
├── Review.md
└── README.md
```
