import { test, expect, APIRequestContext } from '@playwright/test';

const API = 'https://api.practicesoftwaretesting.com';
const PASSWORD = 'Str0ng!Pass#2026';

/** Registers a fresh user through the API and returns a token.
 *  Shared seeded accounts (customer@...) get locked (423) by other students,
 *  so every test creates its own user. */
async function registerAndLogin(request: APIRequestContext) {
  const email = `api.tester.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

  const reg = await request.post(`${API}/users/register`, {
    data: {
      first_name: 'Api',
      last_name: 'Tester',
      dob: '1999-05-15',
      phone: '7071234567',
      email,
      password: PASSWORD,
      address: {
        street: 'Abay Ave 10',
        city: 'Almaty',
        state: 'Almaty',
        country: 'KZ',
        postal_code: '050000',
      },
    },
  });
  expect(reg.status(), `register failed: ${await reg.text()}`).toBe(201);

  const login = await request.post(`${API}/users/login`, { data: { email, password: PASSWORD } });
  expect(login.status(), `login failed: ${await login.text()}`).toBe(200);
  const { access_token } = await login.json();
  return access_token as string;
}

async function firstProductId(request: APIRequestContext) {
  const res = await request.get(`${API}/products`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.data[0].id as string;
}

async function createCart(request: APIRequestContext, token: string) {
  const res = await request.post(`${API}/carts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status(), `create cart failed: ${await res.text()}`).toBe(201);
  const { id } = await res.json();
  return id as string;
}

test.describe('Toolshop cart API', () => {
  // 1. Happy path
  test('adding a product to a cart succeeds', async ({ request }) => {
    const token = await registerAndLogin(request);
    const productId = await firstProductId(request);
    const cartId = await createCart(request, token);

    const res = await request.post(`${API}/carts/${cartId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: productId, quantity: 2 },
    });

    console.log('Add item status:', res.status(), await res.text());
    expect([200, 201]).toContain(res.status());
  });

  // 2. Negative: wrong type — must be a 4xx, never a 500
  test('quantity as a string is rejected with a 4xx, not a 500', async ({ request }) => {
    const token = await registerAndLogin(request);
    const productId = await firstProductId(request);
    const cartId = await createCart(request, token);

    const res = await request.post(`${API}/carts/${cartId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: productId, quantity: 'abc' },
    });

    console.log('Wrong type status:', res.status(), await res.text());
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  // 3. Side effect: read back what was created
  test('added item is actually stored in the cart', async ({ request }) => {
    const token = await registerAndLogin(request);
    const productId = await firstProductId(request);
    const cartId = await createCart(request, token);

    await request.post(`${API}/carts/${cartId}`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: productId, quantity: 2 },
    });

    const res = await request.get(`${API}/carts/${cartId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    const item = body.cart_items.find((i: any) => i.product_id === productId);
    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
  });

  // 4. Authorization: user A tries to read user B's cart
  test("a user cannot read another user's cart", async ({ request }) => {
    test.fail(true, "Known defect BUG-001: cart readable by another user");
    const tokenB = await registerAndLogin(request);
    const productId = await firstProductId(request);
    const cartOfB = await createCart(request, tokenB);
    await request.post(`${API}/carts/${cartOfB}`, {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { product_id: productId, quantity: 1 },
    });

    const tokenA = await registerAndLogin(request);
    const res = await request.get(`${API}/carts/${cartOfB}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });

    console.log("Status when A reads B's cart:", res.status());
    // Ожидание: 401/403/404. Если тест упал с 200 — это находка, оформляйте баг-репорт.
    expect([401, 403, 404]).toContain(res.status());
  });
});
