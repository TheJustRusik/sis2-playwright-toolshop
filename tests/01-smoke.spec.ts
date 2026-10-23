import { test, expect } from '../src/fixtures/test';
import { PRODUCTS_PER_PAGE } from '../src/utils/constants';

test.describe('Suite 1 — Smoke', { tag: '@smoke' }, () => {
  test('TC-SMOKE-01: home page loads with catalogue and search controls', async ({ page, homePage }) => {
    await homePage.open();

    await expect(page).toHaveTitle(/Practice Software Testing/);
    await expect(homePage.productNames).toHaveCount(PRODUCTS_PER_PAGE);
    await expect(homePage.searchInput).toBeVisible();
    await expect(homePage.searchSubmit).toBeVisible();
    await expect(homePage.sortSelect).toBeVisible();
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navSignIn).toBeVisible();
  });

  test('TC-SMOKE-02: product detail page exposes core purchase information', async ({
    page,
    homePage,
    productPage,
  }) => {
    await homePage.open();
    await homePage.openProduct();

    await expect(page).toHaveURL(/\/product\//);
    await expect(productPage.name).not.toBeEmpty();
    await expect(productPage.unitPrice).toHaveText(/^\d+\.\d{2}$/);
    await expect(productPage.description).not.toBeEmpty();
    await expect(productPage.addToCartButton).toBeEnabled();
    await expect(productPage.specRows.first()).toBeVisible();
    expect(await productPage.specRows.count()).toBeGreaterThan(0);
  });

  test('TC-SMOKE-03: category navigation opens the matching catalogue', async ({
    page,
    homePage,
  }) => {
    await homePage.open();
    await homePage.openCategory('nav-hand-tools');

    await expect(page).toHaveURL(/\/category\/hand-tools$/);
    await expect(page.getByTestId('page-title')).toHaveText('Category: Hand Tools');
    await expect(homePage.productNames).toHaveCount(PRODUCTS_PER_PAGE);
  });
});
