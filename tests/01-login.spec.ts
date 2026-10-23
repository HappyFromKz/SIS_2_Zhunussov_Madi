import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { registerFreshUser } from '../utils/users';
import { NewUser } from '../pages/RegisterPage';

// Review fix (history):
// 1) AI version used shared demo account customer@… for positive AND wrong-password tests → account got locked.
// 2) Switched to customer2@… → it was also unusable (shared public demo, other people lock/change it).
// 3) Final: the suite registers its OWN fresh user in beforeAll, so it doesn't depend on any shared account.
let USER: NewUser;

test.describe('Suite 1: Authentication (Login / Logout)', () => {
  let login: LoginPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    USER = await registerFreshUser(page);
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    login = new LoginPage(page);
    await login.goto();
  });

  test('TC-01 Login with valid credentials opens My account', async ({ page }) => {
    await login.login(USER.email, USER.password);
    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('page-title')).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toContainText(`${USER.firstName} ${USER.lastName}`);
  });

  test('TC-02 Login with unknown credentials shows an error', async ({ page }) => {
    await login.login(`nobody.${Date.now()}@example.com`, 'wrongPassword123');
    await expect(login.loginError).toBeVisible();
    // Site returns different texts ("Invalid email or password" / "Login failed") depending on the case
    await expect(login.loginError).toHaveText(/invalid email or password|login failed/i);
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('TC-03 Submitting an empty form shows required-field errors', async () => {
    await login.submit.click();
    await expect(login.emailError).toBeVisible();
    await expect(login.passwordError).toBeVisible();
  });

  test('TC-04 User can log out', async ({ page }) => {
    await login.login(USER.email, USER.password);
    await expect(page).toHaveURL(/\/account/);
    await page.getByTestId('nav-menu').click();
    await page.getByTestId('nav-sign-out').click();
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
  });
});
