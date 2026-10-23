import { test, expect } from '../src/fixtures/test';
import { uniqueEmail } from '../src/api/users';
import { PAYMENT_METHODS } from '../src/utils/constants';

test.describe('Suite 5 — Checkout (end-to-end)', { tag: '@checkout' }, () => {
  test('TC-CHK-01: registered customer completes an order and receives an invoice', async ({
    page,
    loginPage,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
    accountPage,
    testUser,
  }) => {
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL(/\/account$/);

    await homePage.open();
    await homePage.openProduct();
    await productPage.addToCart();
    await productPage.openCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.proceedAsSignedInCustomer();
    await checkoutPage.completeBillingAddressIfNeeded();
    await checkoutPage.proceedToPayment();

    // The payment action must stay disabled until a method is chosen.
    await expect(checkoutPage.finishButton).toBeDisabled();

    await checkoutPage.payWith(PAYMENT_METHODS.cashOnDelivery);
    const invoice = await checkoutPage.confirmOrder();

    expect(invoice).toMatch(/^INV-\d+$/);
    await expect(page.getByTestId('cart-quantity')).toHaveCount(0);

    // Evidence for the submission package.
    await page.screenshot({ path: 'screenshots/checkout-confirmation.png', fullPage: true });
    await test.info().attach('checkout-confirmation', {
      path: 'screenshots/checkout-confirmation.png',
      contentType: 'image/png',
    });

    await accountPage.open();
    await accountPage.openInvoices();
    await expect(accountPage.invoiceRows.filter({ hasText: invoice })).toHaveCount(1);
  });

  test('TC-CHK-02: guest customer completes an order without an account', async ({
    page,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
  }) => {
    const guest = {
      email: uniqueEmail('guest.sis2'),
      firstName: 'Guest',
      lastName: 'Tester',
    };

    await homePage.open();
    await homePage.openProduct();
    await productPage.addToCart();
    await productPage.openCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.proceedAsGuest(guest);
    await checkoutPage.completeBillingAddressIfNeeded();
    await checkoutPage.proceedToPayment();
    await checkoutPage.payWith(PAYMENT_METHODS.cashOnDelivery);

    const invoice = await checkoutPage.confirmOrder();
    expect(invoice).toMatch(/^INV-\d+$/);
    await expect(page.getByText(/Thanks for your order!/)).toBeVisible();
  });

  test('TC-CHK-03: payment cannot be submitted without a payment method', async ({
    page,
    loginPage,
    homePage,
    productPage,
    cartPage,
    checkoutPage,
    testUser,
  }) => {
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL(/\/account$/);

    await homePage.open();
    await homePage.openProduct();
    await productPage.addToCart();
    await productPage.openCart();

    await cartPage.proceedToCheckout();
    await checkoutPage.proceedAsSignedInCustomer();
    await checkoutPage.completeBillingAddressIfNeeded();
    await checkoutPage.proceedToPayment();

    await expect(checkoutPage.finishButton).toBeDisabled();

    await checkoutPage.paymentMethodSelect.selectOption(PAYMENT_METHODS.cashOnDelivery);
    await expect(checkoutPage.finishButton).toBeEnabled();
  });
});
