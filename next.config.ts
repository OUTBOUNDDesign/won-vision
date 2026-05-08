import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/index.html',             destination: '/',                  permanent: true },
      { source: '/book.html',              destination: '/book',              permanent: true },
      { source: '/book-checkout.html',     destination: '/book/checkout',     permanent: true },
      { source: '/book-schedule.html',     destination: '/book/schedule',     permanent: true },
      { source: '/book-confirmation.html', destination: '/book/confirmation', permanent: true },
      { source: '/gallery.html',           destination: '/gallery',           permanent: true },
    ];
  },
};

export default config;
