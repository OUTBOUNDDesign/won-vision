// tests/intake.spec.ts
import { test, expect } from '@playwright/test';

test.describe('@requires-auth editor intake', () => {
  test.skip(!process.env.E2E_EDITOR_SESSION_COOKIE, 'set E2E_EDITOR_SESSION_COOKIE to run');

  test('admin can reach intake list', async ({ page, context }) => {
    await context.addCookies([{
      name: '__session',
      value: process.env.E2E_EDITOR_SESSION_COOKIE!,
      domain: new URL(process.env.E2E_BASE_URL || 'http://localhost:3000').hostname,
      path: '/',
    }]);
    await page.goto((process.env.E2E_BASE_URL || 'http://localhost:3000') + '/admin/editor');
    await expect(page.getByRole('heading', { name: 'Editor intake' })).toBeVisible();
    await expect(page.getByRole('link', { name: '+ New property' })).toBeVisible();
  });
});

test('unauthenticated user is redirected from intake', async ({ page }) => {
  const base = process.env.E2E_BASE_URL || 'http://localhost:3000';
  const resp = await page.goto(base + '/admin/editor');
  expect(resp?.status()).toBeLessThan(500);
  await expect(page).toHaveURL(/sign-in/);
});
