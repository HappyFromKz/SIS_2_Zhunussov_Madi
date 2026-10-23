import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Suite 2: Product search, filter and sorting', () => {
  let home: HomePage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    await home.goto();
  });

  test('TC-05 Search returns only matching products', async () => {
    await home.search('pliers');
    await expect(home.searchCaption).toContainText('pliers');
    await expect
      .poll(async () => {
        const names = await home.getNames();
        return names.length > 0 && names.every((n) => n.toLowerCase().includes('pliers'));
      })
      .toBe(true);
  });

  test('TC-06 Search with no matches shows empty result', async ({ page }) => {
    await home.search('zzzxxqqnonexistent');
    await expect(page.getByText('There are no products found.')).toBeVisible();
    await expect(home.productNames).toHaveCount(0);
  });

  test('TC-07 Sort by price low → high', async () => {
    await home.sortSelect.selectOption('price,asc');
    await expect
      .poll(async () => {
        const prices = await home.getPrices();
        return prices.length > 1 && prices.every((p, i) => i === 0 || prices[i - 1] <= p);
      })
      .toBe(true);
  });

  test('TC-08 Sort by name Z → A', async () => {
    await home.sortSelect.selectOption('name,desc');
    await expect
      .poll(async () => {
        const names = await home.getNames();
        const sorted = [...names].sort((a, b) => b.localeCompare(a));
        return names.length > 1 && JSON.stringify(names) === JSON.stringify(sorted);
      })
      .toBe(true);
  });

  test('TC-09 Category filter "Hammer" shows only hammers', async () => {
    await home.filterByCategory('Hammer');
    await expect
      .poll(async () => {
        const names = await home.getNames();
        return names.length > 0 && names.every((n) => n.toLowerCase().includes('hammer'));
      })
      .toBe(true);
  });
});
