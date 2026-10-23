import { Page, Locator } from '@playwright/test';

export interface NewUser {
  firstName: string;
  lastName: string;
  dob: string; // YYYY-MM-DD
  street: string;
  houseNumber: string; // added in review: new required field on the site
  postalCode: string;
  city: string;
  state: string;
  country: string; // option label, e.g. "Kazakhstan"
  phone: string;
  email: string;
  password: string;
}

export class RegisterPage {
  readonly submit: Locator;
  readonly errors: Locator;
  readonly passwordError: Locator;

  constructor(private page: Page) {
    this.submit = page.getByTestId('register-submit');
    this.errors = page.locator('[data-test$="-error"]');
    this.passwordError = page.getByTestId('password-error');
  }

  async goto() {
    await this.page.goto('/auth/register');
  }

  async fill(u: NewUser) {
    const p = this.page;
    await p.getByTestId('first-name').fill(u.firstName);
    await p.getByTestId('last-name').fill(u.lastName);
    await p.getByTestId('dob').fill(u.dob);
    await p.getByTestId('street').fill(u.street);
    await p.getByTestId('house_number').or(p.getByLabel(/house number/i)).first().fill(u.houseNumber);
    await p.getByTestId('postal_code').fill(u.postalCode);
    await p.getByTestId('city').fill(u.city);
    await p.getByTestId('state').fill(u.state);
    await p.getByTestId('country').selectOption({ label: u.country });
    await p.getByTestId('phone').fill(u.phone);
    await p.getByTestId('email').fill(u.email);
    await p.getByTestId('password').fill(u.password);
  }
}
