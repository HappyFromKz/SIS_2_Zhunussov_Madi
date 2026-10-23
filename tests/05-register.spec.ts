import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { makeUser } from '../utils/users';

const newUser = makeUser;

test.describe('Suite 5: Customer registration', () => {
  let reg: RegisterPage;

  test.beforeEach(async ({ page }) => {
    reg = new RegisterPage(page);
    await reg.goto();
  });

  test('TC-18 Empty registration form shows required-field errors', async () => {
    await reg.submit.click();
    await expect(reg.errors.first()).toBeVisible();
    expect(await reg.errors.count()).toBeGreaterThanOrEqual(5);
  });

  test('TC-19 Weak password is rejected', async ({ page }) => {
    await reg.fill({ ...newUser(), password: '123' });
    await reg.submit.click();
    await expect(reg.passwordError).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('TC-20 Registration with valid data redirects to login, new user can log in', async ({ page }) => {
    const user = newUser();
    await reg.fill(user);

    // Review fix: the AI version only checked the URL, so when registration failed we got a
    // blank screenshot and no reason. Now we capture the API response (or the form errors)
    // so the failure message explains WHY registration did not succeed.
    const responsePromise = page
      .waitForResponse((r) => r.url().includes('/users/register') && r.request().method() === 'POST', { timeout: 15_000 })
      .catch(() => null);
    await reg.submit.click();
    const resp = await responsePromise;

    if (!resp) {
      const formErrors = (await reg.errors.allTextContents()).map((t) => t.trim()).filter(Boolean);
      throw new Error(`Register request was not sent. Form errors: ${JSON.stringify(formErrors)}`);
    }
    if (resp.status() !== 201) {
      // body is read only on failure: on success the page navigates away and the body is discarded
      const body = await resp.text().catch(() => '<body unavailable>');
      throw new Error(`Register API answered ${resp.status()}: ${body}`);
    }
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.getByTestId('email').fill(user.email);
    await page.getByTestId('password').fill(user.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('nav-menu')).toContainText(`${user.firstName} ${user.lastName}`);
  });
});
