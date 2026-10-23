import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';

test.describe('Suite 3: Product details and shopping cart', () => {
  let home: HomePage;
  let product: ProductPage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    product = new ProductPage(page);
    await home.goto();
  });

  test('TC-10 Product details page shows name, price and Add to cart', async ({ page }) => {
    const listedName = (await home.productNames.first().textContent())!.trim();
    await home.openProduct(0);
    await expect(page).toHaveURL(/\/product\//);
    await expect(product.name).toHaveText(listedName);
    await expect(product.price).toHaveText(/\d+\.\d{2}/);
    await expect(product.addToCart).toBeEnabled();
  });

  test('TC-11 Adding a product updates the cart badge', async () => {
    await home.openProduct(0);
    await product.addToCart.click();
    await expect(product.toast).toContainText('Product added to shopping cart');
    await expect(product.cartQuantity).toHaveText('1');
  });

  test('TC-12 Increase quantity before adding to cart', async () => {
    await home.openProduct(0);
    await product.increaseQty.click();
    await product.increaseQty.click();
    await expect(product.quantity).toHaveValue('3');
    await product.addToCart.click();
    await expect(product.cartQuantity).toHaveText('3');
  });

  test('TC-13 Added product appears in the cart with correct quantity', async ({ page }) => {
    await home.openProduct(0);
    const name = (await product.name.textContent())!.trim();
    await product.addToCart.click();
    await expect(product.cartQuantity).toHaveText('1');

    const cart = new CartPage(page);
    await cart.open();
    await expect(cart.productTitles.first()).toContainText(name);
    await expect(cart.productQuantities.first()).toHaveValue('1');
    await expect(cart.proceed).toBeVisible();
  });
});
