# Review of the AI output

## 1. What the AI generated
I used Claude Opus 5.5 (claude.ai) with a very short prompt and the assignment PDF attached.
It generated a full Playwright + TypeScript project: config, 6 Page Objects, 5 test suites with
20 test cases, and drafts of Description.md / Prompt.md / Review.md.

Important: the AI wrote the code **without access to the real site** (its sandbox couldn't open
practicesoftwaretesting.com), so all locators and expected messages were based on its general
knowledge of the Toolshop app. That's why I treated the output as a draft and had to verify it.

## 2. How I reviewed it
1. Read through the code: checked that every test has a real assertion, no hard-coded `waitForTimeout`,
   and that tests don't depend on each other.
2. Ran the whole suite locally: `npx playwright test` (Chromium, 4 workers, 1 retry).
3. For every failed test I read the Playwright error / call log and looked at the screenshot in
   `test-results/`, then decided whether the problem is in the test or in the site.

## 3. First run result
**16 passed, 4 failed** (1.4 min). Failed: TC-01, TC-02, TC-04 (login suite) and TC-20 (registration).
Screenshot: `screenshots/run1.png`.

The good part: suites 2, 3, 4 (search/sort/filter, cart, contact form) passed on the first try,
so the AI guessed the `data-test` locators correctly for most of the site.

## 4. Problems found and what I changed

| # | Test | What happened | Root cause | My fix |
|---|------|---------------|------------|--------|
| 1 | TC-02 | Expected "Invalid email or password", got **"Account locked, too many failed attempts. Please contact the administrator."** | The AI used the shared demo account `customer@practicesoftwaretesting.com` for the wrong-password test. Failed attempts (ours + everybody else using this public demo) locked the account. | Negative test now uses a random non-existent email (`nobody.<timestamp>@example.com`), so it can't lock any real account. |
| 2 | TC-01, TC-04 | Stayed on `/auth/login` instead of `/account` | Same locked account, so even the correct password didn't work. This is a test-design problem, not a site bug. | Positive tests switched to another demo account (`customer2@…`) and credentials can be overridden with env vars `TS_EMAIL` / `TS_PASSWORD`. Removed the hard-coded "Jane Doe" name check since it depends on the account. |
| 3 | TC-20 | After clicking Register the page stayed on `/auth/register`; the failure screenshot was just a blank page, so it gave no clue. | First I improved the test itself: it now waits for the `POST /users/register` request and, if the request is never sent, prints the form validation errors. The re-run showed **"House number is required"**: the site has a new required *House number* field that the AI didn't know about (it generated the form from an older version of the app and put the number inside `street`). | Added `houseNumber` to the `NewUser` model and filled the new field in `RegisterPage.fill()`; street and house number are now separate (`Abay Ave` + `10`). TC-20 also now asserts the API status (201) and shows the response body on failure. |

**Why this matters:** the AI made a classic mistake: a negative test changing the state of a
shared account that positive tests depend on. The tests were independent in code but not in
data. Lesson: negative auth tests should never use the same account as positive ones.

### Second run (after fixes 1–3)
**14 passed, 3 flaky, 3 failed** (2.5 min). House number fix worked: the register request was sent now.
New problems, mostly about stability:

| # | Test | What happened | Root cause | My fix |
|---|------|---------------|------------|--------|
| 4 | TC-01, TC-03, TC-04 (flaky) | First attempt: `page.goto: net::ERR_ABORTED` + 60 s timeout; passed on retry | Not a test logic bug: 4 workers opened the slow public site at the same time and navigation got aborted | Reduced workers to 2, added `navigationTimeout: 30s`, `goto` now waits for `domcontentloaded` + the email field instead of full `load` |
| 5 | TC-02 | Expected "Invalid email or password", got **"Login failed"** | For an unknown email the site shows a different message than for a wrong password. The AI hard-coded one exact text | Assertion now accepts both messages with a regex; the important part (error shown, user stays on login page) is still checked |
| 6 | TC-14 | Expected ≥ 3 errors, got 2 (it passed in the 1st run) | Race condition: `errors.count()` does not auto-wait, it counted while messages were still rendering | Replaced with `expect.poll(() => count())`, which retries until the condition is true |
| 7 | TC-20 | `response.text: No resource with given identifier found` | My own diagnostic code: after successful registration the page redirects and Chrome drops the response body | Read the body only when status ≠ 201 |

**Lesson:** half of the AI's problems were not wrong locators but *test stability*: exact texts,
non-waiting `count()`, too much parallelism against a public site. These things only show up when
you actually run the tests, sometimes more than once.

### Third run (after fixes 4–7)
**18 passed, 2 failed** (54 s, much faster with 2 workers). TC-14 and TC-20 are fixed.

| # | Test | What happened | Root cause | My fix |
|---|------|---------------|------------|--------|
| 8 | TC-01, TC-04 | Login with `customer2@…` stayed on `/auth/login` (also on retry) | The second demo account was also unusable: it's shared by everyone who practices on this site, so it can be locked or changed at any time. Switching accounts (fix #2) only moved the problem | Login suite now **registers its own fresh user in `beforeAll`** (helper `utils/users.ts → registerFreshUser()`) and logs in with it. The user factory is shared with the registration suite, so test data is in one place. Now the suite doesn't depend on any shared account at all |

## 5. Decisions I kept from the AI
- **Page Object Model**: locators in one place, tests stay readable.
- **`getByTestId` with `data-test`**: the site provides stable test attributes; this was confirmed
  by the run, since all locator-based suites passed.
- **`expect.poll` for sorting/search**: product list is loaded asynchronously; polling avoids flaky sleeps.
- **Unique email per run in registration**: the test can be re-run.
- **retries: 1 + screenshot/video/trace on failure**: the traces are what let me find the lockout message.

## 6. Limitations
- Tests run against a shared public demo, so some flakiness (slow responses, other users' actions) can't be fully removed; `retries: 1` stays for that reason.
- Every run creates new users on the demo site (registration + login suite). Acceptable for a practice site, but on a real project I would create users via API and clean them up afterwards.
- The AI can't know about recent UI changes (like the new House number field), so generated
  tests must always be run against the real site before trusting them.
- Checkout/payment was not automated.

## 7. Final run result
TODO after re-run: X passed / Y failed. Screenshot: `screenshots/run2.png`.
