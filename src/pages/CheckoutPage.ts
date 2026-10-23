import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { SHIPPING_ADDRESS } from '../utils/constants';

export interface GuestDetails {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Steps 2–4 of the /checkout stepper: SIGN IN → BILLING ADDRESS → PAYMENT →
 * confirmation. All steps share the /checkout URL and are toggled client-side.
 */
export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get proceedFromSignIn(): Locator {
    return this.page.getByTestId('proceed-2');
  }

  get proceedFromGuestSignIn(): Locator {
    return this.page.getByTestId('proceed-2-guest');
  }

  get guestTab(): Locator {
    return this.page.getByRole('tab', { name: 'Continue as Guest' });
  }

  get guestEmailInput(): Locator {
    return this.page.getByTestId('guest-email');
  }

  get guestFirstNameInput(): Locator {
    return this.page.getByTestId('guest-first-name');
  }

  get guestLastNameInput(): Locator {
    return this.page.getByTestId('guest-last-name');
  }

  get guestSubmit(): Locator {
    return this.page.getByTestId('guest-submit');
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

  get proceedFromAddress(): Locator {
    return this.page.getByTestId('proceed-3');
  }

  get paymentMethodSelect(): Locator {
    return this.page.getByTestId('payment-method');
  }

  get finishButton(): Locator {
    return this.page.getByTestId('finish');
  }

  get paymentSuccessMessage(): Locator {
    return this.page.getByTestId('payment-success-message');
  }

  get orderConfirmation(): Locator {
    return this.page.getByText(/Thanks for your order! Your invoice number is INV-/);
  }

  async proceedAsSignedInCustomer(): Promise<void> {
    await this.proceedFromSignIn.click();
    await expect(this.countrySelect).toBeVisible();
  }

  async proceedAsGuest(details: GuestDetails): Promise<void> {
    await this.guestTab.click();
    await this.guestEmailInput.fill(details.email);
    await this.guestFirstNameInput.fill(details.firstName);
    await this.guestLastNameInput.fill(details.lastName);
    await this.guestSubmit.click();

    await expect(this.page.getByText(`Continuing as guest: ${details.firstName} ${details.lastName}`)).toBeVisible();
    await this.proceedFromGuestSignIn.click();
    await expect(this.countrySelect).toBeVisible();
  }

  /**
   * Registered customers get their address pre-filled. Guests must provide it.
   * The app auto-completes street/city/state from country + postcode + number.
   */
  async completeBillingAddressIfNeeded(): Promise<void> {
    await expect(this.countrySelect).toBeVisible();

    if ((await this.streetInput.inputValue()).trim().length > 0) {
      return;
    }

    await this.countrySelect.selectOption(SHIPPING_ADDRESS.country);
    await this.postalCodeInput.fill(SHIPPING_ADDRESS.postalCode);
    await this.houseNumberInput.fill(SHIPPING_ADDRESS.houseNumber);

    try {
      await expect
        .poll(async () => (await this.streetInput.inputValue()).trim().length, { timeout: 6_000 })
        .toBeGreaterThan(0);
    } catch {
      // Fallback values below keep the flow moving if the lookup is offline.
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
  }

  async proceedToPayment(): Promise<void> {
    await this.proceedFromAddress.click();
    await expect(this.paymentMethodSelect).toBeVisible();
  }

  async payWith(method: string): Promise<void> {
    await this.paymentMethodSelect.selectOption(method);
    await expect(this.finishButton).toBeEnabled();
    await this.finishButton.click();
    await expect(this.paymentSuccessMessage).toBeVisible({ timeout: 20_000 });
  }

  /**
   * After a successful payment the button changes to "Confirm". The invoice is
   * only created after this second click.
   */
  async confirmOrder(): Promise<string> {
    await this.finishButton.click();
    await expect(this.orderConfirmation).toBeVisible({ timeout: 20_000 });

    const body = await this.page.locator('body').innerText();
    const invoice = body.match(/INV-\d+/)?.[0];
    if (!invoice) {
      throw new Error('Order confirmation did not contain an invoice number.');
    }
    return invoice;
  }
}
