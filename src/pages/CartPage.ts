import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Step 1 of the /checkout stepper. The application does not expose a /cart
 * route: the cart icon links straight to /checkout and this page object covers
 * the "CART" step only.
 */
export class CartPage extends BasePage {
  get rows(): Locator {
    return this.page.locator('table tbody tr');
  }

  get productTitles(): Locator {
    return this.page.getByTestId('product-title');
  }

  get linePrices(): Locator {
    return this.page.getByTestId('line-price');
  }

  get total(): Locator {
    return this.page.getByTestId('cart-total');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('The cart is empty. Nothing to display.');
  }

  async open(): Promise<void> {
    await this.openPath('/checkout');
  }

  async quantityInput(index = 0): Promise<Locator> {
    return this.rows.nth(index).getByTestId('product-quantity');
  }

  async setQuantity(quantity: number, index = 0): Promise<void> {
    const input = await this.quantityInput(index);
    await input.fill(String(quantity));
    await input.blur();
  }

  async removeItem(index = 0): Promise<void> {
    // The remove control is an icon-only anchor and has no data-test hook.
    await this.rows.nth(index).locator('a.btn-danger').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.page.getByTestId('proceed-1').click();
    await expect(
      this.page.getByTestId('proceed-2').or(this.page.getByRole('tab', { name: 'Continue as Guest' })),
    ).toBeVisible();
  }
}
