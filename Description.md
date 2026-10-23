# SIS 2 — Test Automation with Playwright

## Goal
Automate end-to-end (UI) tests for the demo e-shop **Toolshop** — https://practicesoftwaretesting.com/ —
using **Playwright + TypeScript**. The tests cover the main user journeys of an online store:
authentication, product search/sorting/filtering, product details & cart, the contact form and
customer registration.

## Approach
- **Framework:** Playwright Test (`@playwright/test`), TypeScript, Chromium.
- **Design pattern:** Page Object Model (`/pages`) — locators and actions are kept separately from the
  test logic (`/tests`), so a UI change has to be fixed in one place only.
- **Locators:** the site exposes stable `data-test` attributes, so Playwright is configured with
  `testIdAttribute: 'data-test'` and tests use `getByTestId()` instead of brittle CSS/XPath.
- **Independence:** every test starts from a fresh browser context; registration uses a unique
  email (`Date.now()`), so tests can run in parallel and be re-run.
- **Waiting:** web-first assertions (`expect(...).toBeVisible()`, `expect.poll`) instead of fixed `sleep`.
- **Evidence:** HTML report, screenshot + video + trace on failure.

## Test suites and test cases (5 suites, 20 TCs)

### Suite 1 — Authentication (`tests/01-login.spec.ts`)
| ID | Test case | Expected result |
|----|-----------|-----------------|
| TC-01 | Login with valid credentials | Redirect to `/account`, title "My account", user name in menu |
| TC-02 | Login with wrong password | Error "Invalid email or password", stays on login page |
| TC-03 | Submit empty login form | Required-field errors for email and password |
| TC-04 | Log out | "Sign in" link is shown again |

### Suite 2 — Search, filter, sorting (`tests/02-search-sort.spec.ts`)
| ID | Test case | Expected result |
|----|-----------|-----------------|
| TC-05 | Search "pliers" | Caption shows the term, all results contain "pliers" |
| TC-06 | Search non-existent term | "There are no products found.", 0 products |
| TC-07 | Sort by price low → high | Prices are in ascending order |
| TC-08 | Sort by name Z → A | Names are in descending order |
| TC-09 | Filter by category "Hammer" | Only hammers are shown |

### Suite 3 — Product details and cart (`tests/03-cart.spec.ts`)
| ID | Test case | Expected result |
|----|-----------|-----------------|
| TC-10 | Open product details | Name matches the listing, price shown, "Add to cart" enabled |
| TC-11 | Add product to cart | Toast "Product added to shopping cart", cart badge = 1 |
| TC-12 | Increase quantity to 3 and add | Quantity field = 3, cart badge = 3 |
| TC-13 | Product appears in cart | Cart lists the product with quantity 1, "Proceed" visible |

### Suite 4 — Contact form (`tests/04-contact.spec.ts`)
| ID | Test case | Expected result |
|----|-----------|-----------------|
| TC-14 | Submit empty form | Validation errors shown |
| TC-15 | Invalid email format | Error shown, message not sent |
| TC-16 | Message shorter than 50 chars | Error shown |
| TC-17 | Valid form | Success message "Thanks for your message…" |

### Suite 5 — Registration (`tests/05-register.spec.ts`)
| ID | Test case | Expected result |
|----|-----------|-----------------|
| TC-18 | Submit empty registration form | Required-field errors shown |
| TC-19 | Weak password "123" | Password error, stays on register page |
| TC-20 | Valid registration + login with new account | Redirect to login, then `/account` with new user name |

## How to run
```bash
npm install
npx playwright install chromium
npx playwright test            # run all
npx playwright test --headed   # watch the browser
npx playwright show-report     # open HTML report
```
