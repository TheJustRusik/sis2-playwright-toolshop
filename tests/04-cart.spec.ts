import { test, expect } from '../src/fixtures/test';

/** Adds the first product on the home page and opens the cart step. */
async function addFirstProductToCart(
  homePage: import('../src/pages/HomePage').HomePage,
  productPage: import('../src/pages/ProductPage').ProductPage,
  cartPage: import('../src/pages/CartPage').CartPage,
) {
  await homePage.open();
  const name = (await homePage.productNamesText())[0];
  const price = (await homePage.productPricesNumber())[0];

  await homePage.openProduct();
  await productPage.addToCart();
  await productPage.openCart();

  return { name, price };
}

test.describe('Suite 4 — Shopping cart', { tag: '@cart' }, () => {
  test('TC-CART-01: adding a product updates the badge and cart contents', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    const { name, price } = await addFirstProductToCart(homePage, productPage, cartPage);

    await expect(cartPage.productTitles).toHaveText(name);
    await expect(cartPage.total).toHaveText(`$${price.toFixed(2)}`);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-02: changing quantity recalculates line price, total and badge', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    const { price } = await addFirstProductToCart(homePage, productPage, cartPage);

    await cartPage.setQuantity(3);

    await expect(cartPage.linePrices.first()).toHaveText(`$${(price * 3).toFixed(2)}`);
    await expect(cartPage.total).toHaveText(`$${(price * 3).toFixed(2)}`);
    await expect(cartPage.cartBadge).toHaveText('3');
  });

  test('TC-CART-03: removing the only product empties the cart', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    await addFirstProductToCart(homePage, productPage, cartPage);

    await cartPage.removeItem();

    await expect(cartPage.emptyMessage).toBeVisible();
    await expect(cartPage.productTitles).toHaveCount(0);
    await expect(cartPage.cartBadge).toHaveCount(0);
    await expect(page.getByTestId('proceed-1')).toHaveCount(0);
  });

  test('TC-CART-04: cart contents survive a page reload', async ({
    page,
    homePage,
    productPage,
    cartPage,
  }) => {
    const { name, price } = await addFirstProductToCart(homePage, productPage, cartPage);

    await page.reload();

    await expect(cartPage.productTitles).toHaveText(name);
    await expect(cartPage.total).toHaveText(`$${price.toFixed(2)}`);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('TC-CART-05: quantity chosen on the product page is carried into the cart', async ({
    homePage,
    productPage,
    cartPage,
  }) => {
    await homePage.open();
    const price = (await homePage.productPricesNumber())[0];

    await homePage.openProduct();
    await productPage.setQuantity(2);
    await productPage.addToCart();
    await productPage.openCart();

    const quantityInput = await cartPage.quantityInput();
    await expect(quantityInput).toHaveValue('2');
    await expect(cartPage.total).toHaveText(`$${(price * 2).toFixed(2)}`);
    await expect(cartPage.cartBadge).toHaveText('2');
  });
});
