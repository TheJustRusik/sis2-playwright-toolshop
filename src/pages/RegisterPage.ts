import { expect, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { DEFAULT_PASSWORD, SHIPPING_ADDRESS } from '../utils/constants';

export interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export class RegisterPage extends BasePage {
  get firstNameInput(): Locator {
    return this.page.getByTestId('first-name');
  }

  get lastNameInput(): Locator {
    return this.page.getByTestId('last-name');
  }

  get dobInput(): Locator {
    return this.page.getByTestId('dob');
  }

  get countrySelect(): Locator {
    return this.page.getByTestId('country');
  }

  get postalCodeInput(): Locator {
    return this.page.getByTestId('postal_code');
  }

  get houseNumberInput(): Locator {
    return this.page.getByTestId('house_number');
  }

  get streetInput(): Locator {
    return this.page.getByTestId('street');
  }

  get cityInput(): Locator {
    return this.page.getByTestId('city');
  }

  get stateInput(): Locator {
    return this.page.getByTestId('state');
  }

  get phoneInput(): Locator {
    return this.page.getByTestId('phone');
  }

  get emailInput(): Locator {
    return this.page.getByTestId('email');
  }

  get passwordInput(): Locator {
    return this.page.getByTestId('password');
  }

  get submitButton(): Locator {
    return this.page.getByTestId('register-submit');
  }

  async open(): Promise<void> {
    await this.openPath('/auth/register');
    await expect(this.firstNameInput).toBeVisible();
    // Countries are fetched asynchronously after the form renders.
    await expect
      .poll(() => this.countrySelect.locator('option').count(), { timeout: 15_000 })
      .toBeGreaterThan(20);
  }

  async register(data: RegistrationData): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.dobInput.fill('1992-03-10');
    await this.countrySelect.selectOption(SHIPPING_ADDRESS.country);

    await this.postalCodeInput.fill(SHIPPING_ADDRESS.postalCode);
    await this.houseNumberInput.fill(SHIPPING_ADDRESS.houseNumber);

    // The app auto-completes street/city/state from country + postcode +
    // house number. Give the lookup a moment, then fill any gaps.
    try {
      await expect
        .poll(async () => (await this.streetInput.inputValue()).trim().length, { timeout: 6_000 })
        .toBeGreaterThan(0);
    } catch {
      // Fallback: the lookup can be unavailable for a country/format.
    }

    const fallbackAddress = [
      [this.streetInput, SHIPPING_ADDRESS.street],
      [this.cityInput, SHIPPING_ADDRESS.city],
      [this.stateInput, SHIPPING_ADDRESS.state],
    ] as const;

    for (const [input, fallback] of fallbackAddress) {
      if (!(await input.inputValue()).trim()) {
        await input.fill(fallback);
      }
    }

    await this.phoneInput.fill('0612345678');
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password ?? DEFAULT_PASSWORD);
    await this.submitButton.click();

    await expect(this.page).toHaveURL(/\/auth\/login$/);
  }
}
