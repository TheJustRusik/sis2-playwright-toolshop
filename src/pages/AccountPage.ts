import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class AccountPage extends BasePage {
  get pageTitle(): Locator {
    return this.page.getByTestId('page-title');
  }

  get invoicesLink(): Locator {
    return this.page.getByTestId('nav-invoices');
  }

  get invoiceRows(): Locator {
    return this.page.locator('table tbody tr');
  }

  async open(): Promise<void> {
    await this.openPath('/account');
    await expect(this.page).toHaveURL(/\/account$/);
    await expect(this.pageTitle).toHaveText('My account');
  }

  async openInvoices(): Promise<void> {
    await this.invoicesLink.click();
    await expect(this.page).toHaveURL(/\/account\/invoices$/);
    await expect(this.pageTitle).toHaveText('Invoices');
  }
}
