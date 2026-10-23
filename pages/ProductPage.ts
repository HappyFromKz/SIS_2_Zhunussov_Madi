import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly quantity: Locator;
  readonly increaseQty: Locator;
  readonly decreaseQty: Locator;
  readonly addToCart: Locator;
  readonly cartQuantity: Locator;
  readonly toast: Locator;

  constructor(private page: Page) {
    this.name = page.getByTestId('product-name');
    this.price = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.increaseQty = page.getByTestId('increase-quantity');
    this.decreaseQty = page.getByTestId('decrease-quantity');
    this.addToCart = page.getByTestId('add-to-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.toast = page.getByRole('alert');
  }
}
