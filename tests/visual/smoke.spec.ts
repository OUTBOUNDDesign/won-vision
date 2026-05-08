import { test, expect } from '@playwright/test';

const routes = [
  { path: '/',                  title: /Won Vision/ },
  { path: '/book',              title: /Book a shoot/ },
  { path: '/book/checkout',     title: /Checkout|Book a shoot/ },
  { path: '/book/schedule',     title: /Schedule|Checkout|Book a shoot/ },
  { path: '/book/confirmation', title: /Booking confirmed|Schedule|Checkout|Book a shoot/ },
  { path: '/gallery',           title: /Gallery/ },
];

for (const r of routes) {
  test(`smoke ${r.path} renders 200, has title, no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const text = msg.text();
      // Ignore network 404s on third-party trackers/pixels — not page-breaking JS errors
      if (text.includes('Failed to load resource')) return;
      errors.push(text);
    });

    if (r.path === '/book/checkout') {
      await page.addInitScript(() => {
        sessionStorage.setItem('wv-cart', JSON.stringify([{ id: 'photo', label: 'Photography', price: 0 }]));
        sessionStorage.setItem('wv-booking', JSON.stringify({ tier: 'photo' }));
      });
    }
    if (r.path === '/book/schedule' || r.path === '/book/confirmation') {
      await page.addInitScript(() => {
        sessionStorage.setItem('wv-cart', JSON.stringify([{ id: 'photo', label: 'Photography', price: 0 }]));
        sessionStorage.setItem('wv-booking', JSON.stringify({ tier: 'photo', address: '1 Test St' }));
      });
    }

    const response = await page.goto(r.path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(r.title);
    expect(errors).toEqual([]);
  });
}
