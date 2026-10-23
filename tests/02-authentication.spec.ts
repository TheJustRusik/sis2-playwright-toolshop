import { test, expect } from '../src/fixtures/test';
import { uniqueEmail } from '../src/api/users';
import { DEFAULT_PASSWORD } from '../src/utils/constants';

test.describe('Suite 2 — Authentication', { tag: '@auth' }, () => {
  test('TC-AUTH-01: valid credentials sign the customer in', async ({
    page,
    loginPage,
    accountPage,
    testUser,
  }) => {
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);

    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toContainText(
      `${testUser.firstName} ${testUser.lastName}`,
    );
  });

  test('TC-AUTH-02: invalid password is rejected with an error', async ({
    page,
    loginPage,
    testUser,
  }) => {
    await loginPage.open();
    await loginPage.login(testUser.email, 'WrongPassword!123');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
  });

  test('TC-AUTH-03: a new customer can register and then sign in', async ({
    page,
    registerPage,
    loginPage,
    accountPage,
  }) => {
    const newUser = {
      email: uniqueEmail('qa.register'),
      password: DEFAULT_PASSWORD,
      firstName: 'New',
      lastName: 'Customer',
    };

    await registerPage.open();
    await registerPage.register(newUser);

    // Successful registration redirects to the login page.
    await expect(page).toHaveURL(/\/auth\/login$/);

    await loginPage.login(newUser.email, newUser.password);
    await expect(page).toHaveURL(/\/account$/);
    await expect(accountPage.pageTitle).toHaveText('My account');
    await expect(page.getByTestId('nav-menu')).toContainText('New Customer');
  });

  test('TC-AUTH-04: sign-out ends the session and protects the account route', async ({
    page,
    loginPage,
    testUser,
  }) => {
    await loginPage.open();
    await loginPage.login(testUser.email, testUser.password);
    await expect(page).toHaveURL(/\/account$/);

    await loginPage.signOut();

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.navSignIn).toBeVisible();

    await page.goto('/account');
    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.form).toBeVisible();
  });

  test('TC-AUTH-05: anonymous visitor is redirected away from /account', async ({
    page,
    loginPage,
  }) => {
    await page.goto('/account');

    await expect(page).toHaveURL(/\/auth\/login$/);
    await expect(loginPage.form).toBeVisible();
  });
});
