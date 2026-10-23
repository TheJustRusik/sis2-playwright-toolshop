import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  get name(): Locator {
    return this.page.getByTestId('product-name');
  }

  get unitPrice(): Locator {
    return this.page.getByTestId('unit-price');
  }

  get description(): Locator {
    return this.page.getByTestId('product-description');
  }

  get quantityInput(): Locator {
    return this.page.getByTestId('quantity');
  }

  get addToCartButton(): Locator {
    return this.page.getByTestId('add-to-cart');
  }

  get addToCartToast(): Locator {
    return this.page.getByText('Product added to shopping cart.');
  }

  get specRows(): Locator {
    return this.page.getByTestId('spec-row');
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.addToCartToast).toBeVisible();
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await expect(this.quantityInput).toHaveValue(String(quantity));
  }

  async unitPriceNumber(): Promise<number> {
    const value = await this.unitPrice.innerText();
    return Number(value.replace(/[^0-9.]/g, ''));
  }
}
