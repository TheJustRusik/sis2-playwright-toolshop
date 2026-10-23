import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  get form(): Locator {
    return this.page.getByTestId('login-form');
  }

  get emailInput(): Locator {
    return this.page.getByTestId('email');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('password');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('login-submit');
  }

  get errorMessage(): Locator {
    return this.page.getByTestId('login-error');
  }

  async open(): Promise<void> {
    await this.openPath('/auth/login');
    await expect(this.form).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
