import { Page, Locator } from '@playwright/test';

export class ContactPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly subject: Locator;
  readonly message: Locator;
  readonly submit: Locator;
  readonly errors: Locator;
  readonly success: Locator;

  constructor(private page: Page) {
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
    this.subject = page.getByTestId('subject');
    this.message = page.getByTestId('message');
    this.submit = page.getByTestId('contact-submit');
    this.errors = page.locator('[data-test$="-error"]');
    this.success = page.locator('.alert-success');
  }

  async goto() {
    await this.page.goto('/contact');
  }
}
