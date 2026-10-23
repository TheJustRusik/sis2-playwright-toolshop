import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  get navHome(): Locator {
    return this.page.getByTestId('nav-home');
  }

  get navCart(): Locator {
    return this.page.getByTestId('nav-cart');
  }

  get cartBadge(): Locator {
    return this.page.getByTestId('cart-quantity');
  }

  get navMenu(): Locator {
    return this.page.getByTestId('nav-menu');
  }

  get navSignIn(): Locator {
    return this.page.getByTestId('nav-sign-in');
  }

  protected async openPath(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async openCart(): Promise<void> {
    await this.navCart.click();
    await expect(this.page).toHaveURL(/\/checkout$/);
  }

  async signOut(): Promise<void> {
    await this.navMenu.click();
    await this.page.getByTestId('nav-sign-out').click();
    await expect(this.page).toHaveURL(/\/auth\/login$/);
  }
}
