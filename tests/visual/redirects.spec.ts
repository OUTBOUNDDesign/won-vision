import { test, expect } from '@playwright/test';

const redirects = [
  { from: '/index.html',             to: '/' },
  { from: '/book.html',              to: '/book' },
  { from: '/book-checkout.html',     to: '/book/checkout' },
  { from: '/book-schedule.html',     to: '/book/schedule' },
  { from: '/book-confirmation.html', to: '/book/confirmation' },
  { from: '/gallery.html',           to: '/gallery' },
];

for (const r of redirects) {
  test(`redirect ${r.from} → ${r.to}`, async ({ page }) => {
    // Seed sessionStorage so book sub-pages don't client-side redirect to /book
    // when there's no cart/booking state. We only care that the Next.js redirect
    // itself lands on the correct destination URL.
    await page.addInitScript(() => {
      sessionStorage.setItem(
        'wv-cart',
        JSON.stringify([{ name: 'Test', price: 100, img: '' }])
      );
      sessionStorage.setItem(
        'wv-booking',
        JSON.stringify({ slot: '2030-01-01T10:00', address: 'Test' })
      );
    });
    const response = await page.goto(r.from, { waitUntil: 'commit' });
    expect(response?.status()).toBe(200);
    expect(new URL(page.url()).pathname).toBe(r.to);
  });
}
