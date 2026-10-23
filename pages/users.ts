import { Page } from '@playwright/test';
import { RegisterPage, NewUser } from '../pages/RegisterPage';

export const makeUser = (): NewUser => ({
  firstName: 'Aru',
  lastName: 'Tester',
  dob: '1999-05-15',
  street: 'Abay Ave',
  houseNumber: '10',
  postalCode: '050000',
  city: 'Almaty',
  state: 'Almaty',
  country: 'Kazakhstan',
  phone: '7071234567',
  email: `aru.tester.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`,
  password: 'Str0ng!Pass#2026',
});

/** Registers a fresh user through the UI and returns its credentials. */
export async function registerFreshUser(page: Page): Promise<NewUser> {
  const user = makeUser();
  const reg = new RegisterPage(page);
  await reg.goto();
  await reg.fill(user);
  await reg.submit.click();
  await page.waitForURL(/\/auth\/login/);
  return user;
}
