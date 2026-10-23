export const API_BASE_URL = 'https://api.practicesoftwaretesting.com';

/** Password that satisfies the demo app's strength + breach checks. */
export const DEFAULT_PASSWORD = 'Sis2!Playwright#2026';

/** Number of products rendered per catalogue page. */
export const PRODUCTS_PER_PAGE = 9;

export const PAYMENT_METHODS = {
  bankTransfer: 'bank-transfer',
  cashOnDelivery: 'cash-on-delivery',
  creditCard: 'credit-card',
  buyNowPayLater: 'buy-now-pay-later',
  giftCard: 'gift-card',
} as const;

export const SHIPPING_ADDRESS = {
  country: 'NL',
  postalCode: '1011AB',
  houseNumber: '42',
  street: 'Test Street',
  city: 'Amsterdam',
  state: 'Noord-Holland',
} as const;
