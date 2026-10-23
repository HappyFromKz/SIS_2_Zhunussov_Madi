import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchCaption: Locator;
  readonly sortSelect: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly productCards: Locator;

  constructor(private page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.searchCaption = page.getByTestId('search-caption');
    this.sortSelect = page.getByTestId('sort');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.productCards = page.locator('a.card');
  }

  async goto() {
    await this.page.goto('/');
    await this.productNames.first().waitFor();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  async filterByCategory(category: string) {
    await this.page.getByLabel(category, { exact: true }).check();
  }

  async getNames(): Promise<string[]> {
    return (await this.productNames.allTextContents()).map((t) => t.trim());
  }

  async getPrices(): Promise<number[]> {
    const raw = await this.productPrices.allTextContents();
    return raw.map((t) => parseFloat(t.replace(/[^0-9.]/g, '')));
  }

  async openProduct(index = 0) {
    await this.productCards.nth(index).click();
  }
}
