import { test, expect } from '@playwright/test';
import { uniqueEmail } from '../src/api/users';
import { DEFAULT_PASSWORD } from '../src/utils/constants';

const registrationPayload = (email: string) => ({
  first_name: 'Api',
  last_name: 'Tester',
  email,
  password: DEFAULT_PASSWORD,
  address: {
    street: 'Test Street',
    house_number: '42',
    city: 'Amsterdam',
    state: 'Noord-Holland',
    country: 'Netherlands',
    postal_code: '1011AB',
  },
  phone: '0612345678',
  dob: '1990-05-15',
});

test.describe('Suite 6 — API', { tag: '@api' }, () => {
  test('TC-API-01: products endpoint returns a paginated catalogue', async ({ request }) => {
    const response = await request.get('/products?page=1');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.current_page).toBe(1);
    expect(body.per_page).toBe(9);
    expect(body.total).toBeGreaterThanOrEqual(9);
    expect(body.data).toHaveLength(9);

    const product = body.data[0];
    expect(product).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        price: expect.any(Number),
        in_stock: expect.any(Boolean),
        co2_rating: expect.any(String),
      }),
    );
  });

  test('TC-API-02: product can be retrieved by id', async ({ request }) => {
    const list = await (await request.get('/products?page=1')).json();
    const expected = list.data[0];

    const response = await request.get(`/products/${expected.id}`);
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(expected.id);
    expect(product.name).toBe(expected.name);
    expect(product.price).toBe(expected.price);
  });

  test('TC-API-03: unknown product id returns 404', async ({ request }) => {
    const response = await request.get('/products/does-not-exist');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual({ message: 'Requested item not found' });
  });

  test('TC-API-04: product search returns matching items', async ({ request }) => {
    const response = await request.get('/products/search?q=pliers');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.total).toBe(4);
    expect(body.data).toHaveLength(4);
    for (const product of body.data) {
      expect(product.name.toLowerCase()).toContain('pliers');
    }
  });

  test('TC-API-05: product search with no matches returns an empty list', async ({
    request,
  }) => {
    const response = await request.get('/products/search?q=zzzznotfound');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.total).toBe(0);
    expect(body.data).toEqual([]);
  });

  test('TC-API-06: register, login and retrieve the authenticated profile', async ({
    request,
  }) => {
    const email = uniqueEmail('api.sis2');

    const register = await request.post('/users/register', {
      data: registrationPayload(email),
    });
    expect(register.status()).toBe(201);
    expect((await register.json()).email).toBe(email);

    const login = await request.post('/users/login', {
      data: { email, password: DEFAULT_PASSWORD },
    });
    expect(login.status()).toBe(200);

    const token = await login.json();
    expect(token.token_type).toBe('bearer');
    expect(token.access_token).toEqual(expect.any(String));

    const me = await request.get('/users/me', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    expect(me.status()).toBe(200);
    expect((await me.json()).email).toBe(email);
  });

  test('TC-API-07: duplicate registration is rejected', async ({ request }) => {
    const email = uniqueEmail('api.dup');

    const first = await request.post('/users/register', { data: registrationPayload(email) });
    expect(first.status()).toBe(201);

    const duplicate = await request.post('/users/register', { data: registrationPayload(email) });
    expect(duplicate.status()).toBe(409);

    const body = await duplicate.json();
    expect(body.email[0]).toContain('already exists');
  });

  test('TC-API-08: invalid credentials and anonymous access are rejected', async ({
    request,
  }) => {
    const badLogin = await request.post('/users/login', {
      data: { email: uniqueEmail('api.nobody'), password: 'WrongPassword!123' },
    });
    expect(badLogin.status()).toBe(401);

    const me = await request.get('/users/me');
    expect(me.status()).toBe(401);
    expect((await me.json()).message).toBe('Unauthorized');
  });

  test('TC-API-09: cart can be created, read and deleted', async ({ request }) => {
    const create = await request.post('/carts');
    expect(create.status()).toBe(201);

    const { id } = await create.json();
    expect(id).toEqual(expect.any(String));

    const get = await request.get(`/carts/${id}`);
    expect(get.status()).toBe(200);
    expect((await get.json()).id).toBe(id);

    const remove = await request.delete(`/carts/${id}`);
    expect(remove.status()).toBe(204);
  });
});
