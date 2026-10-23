import { test, expect } from '../src/fixtures/test';
import { PRODUCTS_PER_PAGE } from '../src/utils/constants';

test.describe('Suite 3 — Product catalogue', { tag: '@catalog' }, () => {
  test('TC-CAT-01: search returns products matching the term', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('Pliers');

    await expect(homePage.searchResultCount).toHaveText("4 products found for 'Pliers'");
    await expect(homePage.productNames).toHaveCount(4);

    const names = await homePage.productNamesText();
    for (const name of names) {
      expect(name.toLowerCase()).toContain('pliers');
    }
  });

  test('TC-CAT-02: search without matches shows the empty state', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('zzzznotfound');

    await expect(homePage.searchResultCount).toHaveText("0 products found for 'zzzznotfound'");
    await expect(homePage.noResults).toHaveText('There are no products found.');
    await expect(homePage.productNames).toHaveCount(0);
  });

  test('TC-CAT-03: resetting the search restores the full catalogue', async ({ homePage }) => {
    await homePage.open();
    await homePage.search('Pliers');
    await expect(homePage.productNames).toHaveCount(4);

    await homePage.resetSearch();

    await expect(homePage.searchInput).toHaveValue('');
    await expect(homePage.productNames).toHaveCount(PRODUCTS_PER_PAGE);
  });

  test('TC-CAT-04: category filter narrows the catalogue to Pliers products', async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.filterByCategory('Pliers');

    await expect(homePage.productNames).toHaveCount(5);

    const names = await homePage.productNamesText();
    expect(names).toEqual(
      expect.arrayContaining([
        'Combination Pliers',
        'Pliers',
        'Bolt Cutters',
        'Long Nose Pliers',
        'Slip Joint Pliers',
      ]),
    );
  });

  test('TC-CAT-05: sorting by price ascending orders the visible products', async ({
    homePage,
  }) => {
    await homePage.open();
    await homePage.sortBy('Price (Low - High)');

    await expect
      .poll(async () => {
        const prices = await homePage.productPricesNumber();
        return prices.every((price, index) => index === 0 || prices[index - 1] <= price);
      })
      .toBe(true);

    const prices = await homePage.productPricesNumber();
    expect(prices).toHaveLength(PRODUCTS_PER_PAGE);
    expect(prices[0]).toBeLessThan(prices[prices.length - 1]);
  });

  test('TC-CAT-06: pagination moves to the next page of products', async ({ homePage }) => {
    await homePage.open();
    const firstPageNames = await homePage.productNamesText();
    await expect(homePage.activePage).toHaveText('1');

    await homePage.nextPage();

    await expect(homePage.activePage).toHaveText('2');
    await expect(homePage.productNames.first()).not.toHaveText(firstPageNames[0]);

    const secondPageNames = await homePage.productNamesText();
    expect(secondPageNames).not.toEqual(firstPageNames);
    expect(secondPageNames).toHaveLength(PRODUCTS_PER_PAGE);
  });

  test('TC-CAT-07: product detail shows description, price, specs and purchase action', async ({
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
    await expect(productPage.specRows.first()).toBeVisible();
    expect(await productPage.specRows.count()).toBeGreaterThan(0);
    await expect(productPage.addToCartButton).toBeEnabled();
  });
});
