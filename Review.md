# Review of the AI-generated test automation

## 1. What the AI produced

The AI delivered a complete Playwright + TypeScript project:

- six test suites — Smoke, Authentication, Product catalogue, Shopping cart, Checkout (E2E) and API;
- **32 automated test cases**, each traceable by ID to [TestCases.md](./TestCases.md);
- a Page Object Model under `src/pages/` and reusable fixtures under `src/fixtures/`;
- an API user factory that provisions a unique customer for every test that needs one;
- Playwright configuration with two projects (`ui-chromium` and `api`), HTML/JSON reporters, traces and failure screenshots;
- the required documents and execution evidence in `screenshots/`.

The first full run finished with **32 passed, 0 failed** in **28.9 s** (3 workers). However, that clean result was not the first output: several assumptions in the AI's initial draft were wrong for the live application, and the suite only became stable after the corrections below.

## 2. How the output was reviewed

The review was evidence-driven rather than a read-through of the code:

1. **Live UI inspection.** Each page was opened in a real browser and its `data-test` attributes, accessible roles and rendered text were inspected before selectors were written.
2. **Live API inspection.** The published OpenAPI document (`/docs?api-docs.json`) and real responses were checked for status codes, schemas and error bodies.
3. **Suite-by-suite execution.** Every suite was run in isolation first, then all 32 tests together, so failures could be attributed to a suite rather than to parallel interference.
4. **Failure triage.** Each failing first run was investigated with the Playwright trace/screenshot and the page's actual DOM; the page object or assertion was corrected rather than weakened.
5. **Final verification.** The complete run was repeated after every material change, and the final HTML report was captured as evidence.

This process exposed a mix of wrong routes, wrong interaction models and an environment constraint. The table below records each finding, the change and the reason.

## 3. Corrections made to the AI output

| # | AI's initial assumption | What the live application showed | Change made | Why |
| --- | --- | --- | --- | --- |
| 1 | Use the documented demo account `customer@practicesoftwaretesting.com / welcome01`. | Login failed with **“Account locked, too many failed attempts. Please contact the administrator.”** The account is shared by every visitor of the public demo. | Removed the shared account from the tests. Added `createTestUser()` in `src/api/users.ts`, which registers a unique customer through the API for each test. | A shared, frequently locked account makes tests order-dependent and flaky. Unique users give real isolation and make the suite safe to run in parallel. |
| 2 | Cart page is `/cart`. | `/cart` redirects/renders nothing useful; the cart icon's `href` is `/checkout`. | Cart operations moved to `CartPage`, which opens `/checkout` and treats it as step 1 of the checkout stepper. | The route assumption was simply wrong; the UI is a single-page stepper. |
| 3 | Checkout consists of separate pages and URL transitions. | Cart, sign-in, billing address and payment all live under `/checkout`; steps are toggled client-side. | Replaced URL-based waits with visibility assertions on step-specific controls (`proceed-1`, `proceed-2`, `proceed-3`, payment selector). | The app never changes URL during checkout; asserting URLs would be misleading or flaky. |
| 4 | One payment click creates the invoice. | **“Check payment”** only authorizes the payment and shows “Payment was successful”; the button then changes to **“Confirm”**, and a second click creates the invoice/confirmation. | `confirmOrder()` performs the second click and extracts the invoice number from “Thanks for your order! Your invoice number is INV-…”. | Without the second click the test would pass payment but never verify the actual order outcome. The invoice is the business result. |
| 5 | The registration country dropdown is ready when the form renders. | The select fetches **249 options asynchronously**. `selectOption` timed out with “did not find some options” (30 s). | `RegisterPage.open()` waits with `expect.poll` until more than 20 options exist before selecting `NL`. | The original code was racing the app's data load. Waiting for the actual precondition is more reliable than a fixed sleep. |
| 6 | Category filter checkboxes can be addressed by `data-test`. | Category hooks contain dynamic ULIDs (`category-01M5MYQX…`), which change with the data set. | Use `getByRole('checkbox', { name: 'Pliers', exact: true })` instead. | Stable, accessible selector; avoids hard-coding generated identifiers. |
| 7 | “Continue as Guest” is a button that reveals a guest form. | It is a Bootstrap **tab** (`<a role="tab" href="#guest-tab">`); after guest submission a second control, `proceed-2-guest`, advances the stepper. | Implemented the guest path with `getByRole('tab', …)` and the `proceed-2-guest` button. | Matches the real interaction model; a text locator also matched three elements and produced a strict-mode violation. |
| 8 | The payment action shows a validation error when no method is selected. | The **Check payment** button is simply `disabled` until a payment method is chosen. | The test asserts disabled → select method → enabled, and never attempts an invalid submission. | Tests should assert the behaviour the app actually implements. This became TC-CHK-03 rather than an artificial negative case. |
| 9 | Category links in the header can be clicked directly. | The links are inside a collapsed **Categories** dropdown and are not visible on a fresh desktop page. The first smoke run failed on `nav-hand-tools` with “element is not visible”. | `HomePage.openCategory()` opens the Categories menu first (when the link is hidden), then clicks the link. | Preserves a real user journey instead of jumping directly to the URL, and fixes the observed failure. |
| 10 | The cart remove action has a test hook. | The remove control is an icon-only `<a class="btn btn-danger">` with no `data-test`. | Scoped CSS selector: `table tbody tr a.btn-danger`, used inside the row-level page object method. | The only available stable anchor; scoping it to the row prevents accidental matches. This exception is documented in the code. |
| 11 | Product/category counts could be asserted from a static test fixture. | The live catalogue is fixed but remote; counts are 50 products, 9 per page, 4 “pliers” results and 5 products under the Pliers filter. | Assertions use the observed counts, but the page objects read names/prices from the DOM where the value is already available; the risk of data drift is recorded in Description.md. | Exact counts are acceptable for this stable demo and catch unintended catalogue changes; deriving values from the page keeps price checks robust. |
| 12 | Video recording can be enabled for failure evidence. | The environment could not download the matching ffmpeg binary (browser CDN blocked on the campus proxy), so every browser test failed before navigation. | Set `video: 'off'`; keep traces and screenshots on failure, plus explicit report evidence. | A test suite must run in its actual environment. Video is optional evidence; traces cover debugging. The setting can be re-enabled after `npx playwright install ffmpeg` on a normal network. |

Additional small corrections made during review:

- `testMatch`/`testIgnore` patterns had to match the actual `06-api.spec.ts` filename (the first patterns expected `*.api.spec.ts`, so Playwright reported “No tests found”).
- TypeScript 7 removed `moduleResolution: "node"`; changed to `nodenext`.
- Search-result text is asserted from the application's own `search-result-count` element, not reconstructed from the product list.
- The product-page quantity input and the cart quantity input are distinct; the page objects expose them separately, which prevents a subtle locator collision.

## 4. Selector and wait review

- **Preferred:** `getByTestId(...)` for the app's `data-test` hooks, with `testIdAttribute: 'data-test'` configured globally.
- **Accessible fallback:** `getByRole` for checkboxes and tabs. This is both stable and closer to how a user perceives the page.
- **CSS only where unavoidable:** the remove icon and the active pagination item (`.page-item.active`), both scoped to a meaningful container.
- **No hard-coded generated IDs:** category/brand `data-test` values are ULIDs and were deliberately ignored.
- **Web-first assertions:** `toHaveText`, `toBeVisible`, `toBeEnabled`, `toHaveCount`, `toHaveValue` and `expect.poll` wait for the app to settle. There are no fixed `waitForTimeout` calls in the test suites; the only delays are in the documentation screenshot script while the report renders.
- **Explicit negative checks:** empty search, empty cart, invalid login, 404/401/409 API responses and disabled payment are all asserted as real outcomes.

The `expect.poll` for sorting is intentional: “the list is sorted” is a property of the whole collection, not a single web-first assertion. It retries the entire predicate until the catalogue finishes sorting.

## 5. Test data and independence review

- Every test runs in a fresh browser context, so `localStorage`, cookies and cart state do not leak between tests.
- Authentication and checkout tests receive a **new API-registered customer** (`testUser` fixture). The fixture is lazy: tests that do not request it create no user.
- Registration tests use a timestamp + random UUID in the email, making collisions practically impossible.
- The password satisfies the demo's strength policy and its breach check; the first AI-suggested password (`Str0ng!Passw0rd`) was rejected with “appeared in a data leak”, so it was replaced with `Sis2!Playwright#2026`.
- The suite accepts that checkout tests create real invoices in the demo. This is documented as a residual risk; no cleanup is attempted because the demo has no public cleanup contract for invoices.
- The Guest checkout test deliberately uses a unique guest email so repeated runs do not collide.

## 6. Reliability decisions

| Decision | Justification |
| --- | --- |
| 3 workers, retries = 1 | The target is a public demo with variable latency. Parallelism keeps the feedback loop short; one retry absorbs transient network/API hiccups without hiding a persistent defect (a flaky test is still reported as flaky). |
| Isolation per suite | Each suite was run alone before the combined run. A failure can therefore be attributed to the suite, not to shared state. |
| Trace + screenshot on failure | Enough evidence to reproduce a failure without re-running immediately; the final HTML report also embeds the checkout confirmation attachment. |
| API-provisioned users | Faster and more deterministic than repeatedly driving the registration UI for setup; the registration UI itself is still covered by TC-AUTH-03. |
| API project with its own base URL | The API suite is independent of the browser project and runs in seconds; contract failures are separated from UI failures in the report. |
| No mocking | The assignment is about testing the real application; mocking would hide integration defects in the checkout and API contracts. |

## 7. Scope decisions

The brief required at least five suites. Six were delivered:

- **Smoke** proves the build is testable.
- **Authentication** protects the account boundary.
- **Catalogue** covers discovery and data presentation.
- **Cart** covers the main stateful interaction before purchase.
- **Checkout** covers the highest-risk, cross-component business flow, including a guest path and a payment guard.
- **API** protects the contract that the UI depends on.

I deliberately did **not** add performance, security, visual-regression, accessibility or mobile-matrix suites. Each would need its own environment, baseline or specialist tooling, and none would improve confidence in the purchase path enough to justify the scope. The assignment asks for functional test automation; adding shallow versions of those disciplines would create false confidence. They are listed as future work rather than omitted silently.

## 8. What was kept from the AI output, and what was not

**Kept:** the overall structure (POM + fixtures), TypeScript, the suite split, the data-test-first strategy, and most of the API assertions. The AI was effective at producing boilerplate quickly and at mapping a large number of page elements into page objects.

**Changed or rejected:** every live-behaviour assumption that did not match the app (routes, stepper, payment confirmation, async country list, guest tab, hidden category menu), the shared demo account, the weak first password, video recording in this environment, and a few locator patterns that were either dynamic or not unique. No assertion was deleted merely to make a test pass; where the app's behaviour differed, the test was rewritten to assert the correct behaviour (for example, payment disabled instead of an error message).

## 9. Verification evidence

| Evidence | File |
| --- | --- |
| AI session excerpt (prompt + response) | `screenshots/ai-session.png` |
| Full HTML report: 32 passed, 0 failed, 28.9 s | `screenshots/report-overview.png` |
| Step-by-step execution of TC-CHK-01, with the captured order confirmation | `screenshots/report-test-detail.png` |
| Real order confirmation with invoice `INV-2026000039` | `screenshots/checkout-confirmation.png` |

Commands used for the final verification:

```bash
PLAYWRIGHT_CHANNEL=chrome npx playwright test
# 32 passed (28.9s)
```

## 10. Residual risks and next steps

- **Live-data drift:** counts such as 4 search results or 5 filtered products can change if the demo catalogue is edited. The tests would then fail loudly, which is the correct signal; the assertions are documented so they can be updated deliberately.
- **Third-party dependencies:** the postcode lookup can be slow or unavailable; the page objects fall back to explicit address values, but the lookup itself is not under test.
- **No cleanup:** created users and invoices remain in the demo. A future version could delete carts/users through the API if a cleanup endpoint is available.
- **Selector drift:** any change to the app's `data-test` contract requires page-object updates. This is contained by the POM.
- **Environment:** the browser CDN is blocked here, so the suite uses system Chrome via `PLAYWRIGHT_CHANNEL=chrome`. In a normal environment the default bundled Chromium works with no changes.
- **Future:** add a CI workflow with sharding and artifacts, add an accessibility project (axe) with agreed thresholds, and add a mobile viewport project once the desktop suite has remained stable for a few runs.

## 11. Conclusion

The AI produced a strong first draft and the majority of the boilerplate, but it could not know the live application's actual interaction model. The meaningful review work was empirical: open the app, inspect the DOM and API, run the suites, and correct every assumption against observed behaviour. The resulting suite is isolated, readable, traceable to documented test cases, and green end-to-end (32/32) against the live system.
