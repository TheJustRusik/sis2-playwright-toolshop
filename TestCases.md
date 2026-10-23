# Test cases to be automated

**Application:** Practice Software Testing — Toolshop (https://practicesoftwaretesting.com/)  
**Total:** 32 automated test cases in 6 suites. Each ID matches the corresponding Playwright test title.

Priority: **P1** = critical business path, **P2** = important functional coverage, **P3** = supporting coverage.

## Suite 1 — Smoke (`@smoke`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-SMOKE-01 | Home page loads with catalogue and search controls | The site is reachable | 1. Open `/`. | Page title contains “Practice Software Testing”; 9 product cards are visible; search input, search button, sort selector and main navigation are visible. | P1 |
| TC-SMOKE-02 | Product detail page exposes core purchase information | Home page loaded | 1. Open the first product card. | URL contains `/product/`; product name, unit price, description and specification rows are visible; “Add to cart” is enabled. | P1 |
| TC-SMOKE-03 | Category navigation opens the matching catalogue | Home page loaded | 1. Open the **Categories** menu. 2. Click **Hand Tools**. | URL is `/category/hand-tools`; page title is “Category: Hand Tools”; 9 products are displayed. | P1 |

## Suite 2 — Authentication (`@auth`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-AUTH-01 | Valid credentials sign the customer in | A unique active customer exists | 1. Open `/auth/login`. 2. Enter email and password. 3. Submit. | Redirect to `/account`; page title “My account”; the account menu shows the customer’s full name. | P1 |
| TC-AUTH-02 | Invalid password is rejected with an error | A unique active customer exists | 1. Open login. 2. Enter the correct email and a wrong password. 3. Submit. | User stays on `/auth/login`; error “Invalid email or password” is visible. | P1 |
| TC-AUTH-03 | A new customer can register and then sign in | Unique email available | 1. Open `/auth/register`. 2. Fill first/last name, date of birth, country, postcode, house number, phone, email and a strong password. 3. Submit. 4. Log in with the new credentials. | After registration the app redirects to `/auth/login`; login succeeds and `/account` shows the new customer’s name. | P1 |
| TC-AUTH-04 | Sign-out ends the session and protects the account route | Customer signed in | 1. Sign in. 2. Open the account menu. 3. Click **Sign out**. 4. Navigate to `/account`. | After sign-out the URL is `/auth/login` and **Sign in** is visible; direct access to `/account` redirects to the login form. | P1 |
| TC-AUTH-05 | Anonymous visitor is redirected away from `/account` | No active session | 1. Open `/account` directly. | Redirect to `/auth/login`; login form is visible. | P2 |

## Suite 3 — Product catalogue (`@catalog`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-CAT-01 | Search returns products matching the term | Home page loaded | 1. Enter `Pliers` in search. 2. Submit. | Result count is “4 products found for 'Pliers'”; 4 products are displayed; every product name contains “pliers”. | P1 |
| TC-CAT-02 | Search without matches shows the empty state | Home page loaded | 1. Search for `zzzznotfound`. | Result count is 0; message “There are no products found.” is visible; no product cards are shown. | P2 |
| TC-CAT-03 | Resetting the search restores the full catalogue | A search is active | 1. Search for `Pliers`. 2. Click the reset (X) button. | Search input is empty; all 9 products are displayed again. | P2 |
| TC-CAT-04 | Category filter narrows the catalogue to Pliers products | Home page loaded | 1. Check the **Pliers** category checkbox. | 5 products are displayed: Combination Pliers, Pliers, Bolt Cutters, Long Nose Pliers and Slip Joint Pliers. | P2 |
| TC-CAT-05 | Sorting by price ascending orders the visible products | Home page loaded | 1. Select “Price (Low - High)” in the sort selector. | All visible prices are in non-decreasing order; first price is lower than the last. | P2 |
| TC-CAT-06 | Pagination moves to the next page of products | Home page loaded | 1. Capture page 1 products. 2. Click **Next** in pagination. | Active page becomes 2; 9 different products are displayed. | P2 |
| TC-CAT-07 | Product detail shows description, price, specs and purchase action | Home page loaded | 1. Open the first product. | Name and description are non-empty; unit price matches `xx.xx`; at least one specification row is visible; Add to cart is enabled. | P2 |

## Suite 4 — Shopping cart (`@cart`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-CART-01 | Adding a product updates the badge and cart contents | Cart empty | 1. Open a product. 2. Click **Add to cart**. 3. Open the cart. | Badge shows 1; product title is shown; line total and cart total equal the product price. | P1 |
| TC-CART-02 | Changing quantity recalculates line price, total and badge | One product in cart | 1. Change quantity to 3 and blur. | Line price and cart total equal 3 × unit price; badge shows 3. | P1 |
| TC-CART-03 | Removing the only product empties the cart | One product in cart | 1. Click the remove (X) control in the product row. | Message “The cart is empty. Nothing to display.” appears; no product rows, badge or “Proceed to checkout” button remain. | P2 |
| TC-CART-04 | Cart contents survive a page reload | One product in cart | 1. Reload `/checkout`. | Product title and total are unchanged; badge still shows 1. | P2 |
| TC-CART-05 | Quantity chosen on the product page is carried into the cart | Cart empty | 1. Open a product. 2. Set quantity to 2. 3. Add to cart. 4. Open the cart. | Cart quantity is 2; total equals 2 × unit price; badge shows 2. | P2 |

## Suite 5 — Checkout, end-to-end (`@checkout`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-CHK-01 | Registered customer completes an order and receives an invoice | Unique customer; one product in cart | 1. Sign in. 2. Open cart and proceed. 3. Continue through sign-in and billing address. 4. On payment, verify the action is disabled. 5. Choose **Cash on Delivery**, click **Check payment**. 6. Click **Confirm**. 7. Open **My account → Invoices**. | Payment success message appears; confirmation shows “Thanks for your order! Your invoice number is INV-…”; the invoice appears in the account invoice list; cart badge disappears. | P1 |
| TC-CHK-02 | Guest customer completes an order without an account | One product in cart | 1. Proceed to checkout. 2. Choose **Continue as Guest**. 3. Enter guest email and name; continue. 4. Fill the billing address; continue. 5. Pay Cash on Delivery and confirm. | “Continuing as guest: …” is shown; the order completes and an invoice number is displayed. | P2 |
| TC-CHK-03 | Payment cannot be submitted without a payment method | Signed-in customer; one product in cart | 1. Proceed through cart, sign-in and billing address. 2. Inspect **Check payment**. 3. Select **Cash on Delivery**. | Button is disabled before a method is selected and becomes enabled after selection. | P2 |

## Suite 6 — API (`@api`)

| ID | Title | Precondition | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-API-01 | Products endpoint returns a paginated catalogue | API reachable | 1. `GET /products?page=1`. | HTTP 200; `current_page=1`, `per_page=9`, `total ≥ 9`, 9 items; item has id, name, description, numeric price, boolean stock and CO₂ rating. | P1 |
| TC-API-02 | Product can be retrieved by id | Product list available | 1. Read an id from `/products`. 2. `GET /products/{id}`. | HTTP 200; id, name and price match the list item. | P1 |
| TC-API-03 | Unknown product id returns 404 | API reachable | 1. `GET /products/does-not-exist`. | HTTP 404; body `{"message":"Requested item not found"}`. | P2 |
| TC-API-04 | Product search returns matching items | API reachable | 1. `GET /products/search?q=pliers`. | HTTP 200; total and array length are 4; every name contains “pliers”. | P2 |
| TC-API-05 | Product search with no matches returns an empty list | API reachable | 1. `GET /products/search?q=zzzznotfound`. | HTTP 200; `total=0`; `data=[]`. | P2 |
| TC-API-06 | Register, login and retrieve the authenticated profile | Unique email available | 1. `POST /users/register`. 2. `POST /users/login`. 3. `GET /users/me` with the bearer token. | Register returns 201; login returns 200 with a bearer token; `/users/me` returns 200 and the same email. | P1 |
| TC-API-07 | Duplicate registration is rejected | Email already registered | 1. Register the same payload twice. | First call 201; second call 409 with “already exists” for the email. | P2 |
| TC-API-08 | Invalid credentials and anonymous access are rejected | API reachable | 1. Login with a nonexistent user/wrong password. 2. `GET /users/me` without a token. | Both return HTTP 401; anonymous body message is “Unauthorized”. | P2 |
| TC-API-09 | Cart can be created, read and deleted | API reachable | 1. `POST /carts`. 2. `GET /carts/{id}`. 3. `DELETE /carts/{id}`. | Create 201 with id; read 200 with the same id; delete 204. | P3 |

## Traceability

Every test title in `tests/*.spec.ts` starts with its TC ID. Run a single case with:

```bash
npx playwright test -g "TC-CHK-01"
```
