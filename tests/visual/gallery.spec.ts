import { test, expect } from '@playwright/test';

test('gallery page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  await page.goto('/gallery');
  await expect(page).toHaveTitle(/Gallery/);
  expect(errors).toEqual([]);
});
