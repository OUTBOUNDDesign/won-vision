import { test, expect } from '@playwright/test';

test('home page renders without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto('/');
  await expect(page).toHaveTitle(/Won Vision/);
  expect(errors).toEqual([]);
});

test('home page contains hero copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toContainText('Won Vision');
});
