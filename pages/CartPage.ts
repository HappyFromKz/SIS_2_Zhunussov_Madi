import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly productTitles: Locator;
  readonly productQuantities: Locator;
  readonly proceed: Locator;

  constructor(private page: Page) {
    this.productTitles = page.getByTestId('product-title');
    this.productQuantities = page.getByTestId('product-quantity');
    this.proceed = page.getByTestId('proceed-1');
  }

  async open() {
    await this.page.getByTestId('nav-cart').click();
    await this.page.waitForURL(/\/checkout/);
  }
}
