import { test, expect } from '@playwright/test';

test('admin: unauthenticated user is redirected to sign-in', async ({ page }) => {
  const response = await page.goto('/admin');
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).pathname).toMatch(/\/admin\/sign-in/);
});

test('admin: deep route also redirects to sign-in when unauthenticated', async ({ page }) => {
  await page.goto('/admin/properties/anything');
  expect(new URL(page.url()).pathname).toMatch(/\/admin\/sign-in/);
});

test('admin sign-in page renders', async ({ page }) => {
  await page.goto('/admin/sign-in');
  await expect(page).toHaveTitle(/Editor sign-in/);
  await expect(page.locator('text=/sign in/i').first()).toBeVisible();
});

test('admin pages have noindex robots meta', async ({ page }) => {
  await page.goto('/admin/sign-in');
  const robots = await page.locator('meta[name="robots"]').getAttribute('content');
  expect(robots).toMatch(/noindex/);
});
