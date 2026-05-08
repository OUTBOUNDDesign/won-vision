import { test, expect } from '@playwright/test';

test('book-checkout page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  // Seed sessionStorage with a cart so the page doesn't auto-redirect to /book.
  await page.addInitScript(() => {
    sessionStorage.setItem('wv-cart', JSON.stringify([{ name: 'Test', price: 100, img: '' }]));
  });
  await page.goto('/book/checkout');
  await expect(page).toHaveTitle(/Checkout/);
  expect(errors).toEqual([]);
});
