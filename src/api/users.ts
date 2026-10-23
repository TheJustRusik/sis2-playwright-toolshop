import { randomUUID } from 'node:crypto';
import { request } from '@playwright/test';
import { API_BASE_URL, DEFAULT_PASSWORD } from '../utils/constants';

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export function uniqueEmail(prefix = 'qa.sis2'): string {
  return `${prefix}.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}

/**
 * Registers a disposable customer through the public API.
 *
 * The shared demo account shipped in the docs
 * (customer@practicesoftwaretesting.com / welcome01) is frequently locked
 * ("too many failed attempts") because every visitor uses it. Creating a
 * unique user per test keeps suites independent and avoids that shared state.
 */
export async function createTestUser(prefix = 'qa.sis2'): Promise<TestUser> {
  const user: TestUser = {
    email: uniqueEmail(prefix),
    password: DEFAULT_PASSWORD,
    firstName: 'Qa',
    lastName: 'Tester',
  };

  const api = await request.newContext({
    baseURL: API_BASE_URL,
    extraHTTPHeaders: { Accept: 'application/json' },
  });

  try {
    const response = await api.post('/users/register', {
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        password: user.password,
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
      },
    });

    if (response.status() !== 201) {
      throw new Error(
        `Could not create test user (HTTP ${response.status()}): ${await response.text()}`,
      );
    }
  } finally {
    await api.dispose();
  }

  return user;
}
