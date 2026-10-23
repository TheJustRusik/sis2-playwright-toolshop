import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  get productCards(): Locator {
    return this.page.locator('a[data-test^="product-"]');
  }

  get productNames(): Locator {
    return this.page.getByTestId('product-name');
  }

  get productPrices(): Locator {
    return this.page.getByTestId('product-price');
  }

  get searchInput(): Locator {
    return this.page.getByTestId('search-query');
  }

  get searchSubmit(): Locator {
    return this.page.getByTestId('search-submit');
  }

  get searchReset(): Locator {
    return this.page.getByTestId('search-reset');
  }

  get searchTerm(): Locator {
    return this.page.getByTestId('search-term');
  }

  get searchResultCount(): Locator {
    return this.page.getByTestId('search-result-count');
  }

  get noResults(): Locator {
    return this.page.getByTestId('no-results');
  }

  get sortSelect(): Locator {
    return this.page.getByTestId('sort');
  }

  get activePage(): Locator {
    return this.page.locator('.page-item.active');
  }

  get paginationNext(): Locator {
    return this.page.getByTestId('pagination-next');
  }

  async open(): Promise<void> {
    await this.openPath('/');
    await expect(this.productNames.first()).toBeVisible();
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
    await expect(this.searchTerm).toHaveText(term);
  }

  async resetSearch(): Promise<void> {
    await this.searchReset.click();
    await expect(this.productNames).toHaveCount(9);
  }

  async sortBy(label: string): Promise<void> {
    await this.sortSelect.selectOption({ label });
  }

  async filterByCategory(name: string): Promise<void> {
    await this.page.getByRole('checkbox', { name, exact: true }).check();
  }

  async openProduct(index = 0): Promise<void> {
    await this.productCards.nth(index).click();
    await expect(this.page).toHaveURL(/\/product\//);
  }

  async openCategory(testId: string): Promise<void> {
    const link = this.page.getByTestId(testId);
    if (!(await link.isVisible())) {
      await this.page.getByTestId('nav-categories').click();
      await expect(link).toBeVisible();
    }
    await link.click();
  }

  async nextPage(): Promise<void> {
    await this.paginationNext.click();
  }

  async productNamesText(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((name) => name.trim());
  }

  async productPricesNumber(): Promise<number[]> {
    const prices = await this.productPrices.allInnerTexts();
    return prices.map((price) => Number(price.replace(/[^0-9.]/g, '')));
  }
}
