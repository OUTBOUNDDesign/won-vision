import { test, expect } from '@playwright/test';

test('book page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/book');
  await expect(page).toHaveTitle(/Book a shoot/);
  expect(errors).toEqual([]);
});

test('book page wires Next button to /book/checkout', async ({ page }) => {
  await page.goto('/book');
  // Cart is empty, but cards add items. Click the first service card to enable Next.
  await page.locator('.svc-card').first().click();
  // Listen for the navigation triggered by the cart's Next button.
  const next = page.locator('#cartNext');
  await expect(next).toBeEnabled();
  await Promise.all([
    page.waitForURL('**/book/checkout'),
    next.click(),
  ]);
  expect(page.url()).toContain('/book/checkout');
});
