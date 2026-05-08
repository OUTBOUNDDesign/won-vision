import { test, expect } from '@playwright/test';

test('book-schedule page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/book/schedule');
  // Page redirects to /book when cart is empty; either title is acceptable.
  await expect(page).toHaveTitle(/Schedule|Book a shoot/);
  expect(errors).toEqual([]);
});
