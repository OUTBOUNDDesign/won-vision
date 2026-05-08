import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const isLocal = baseURL.startsWith('http://localhost');

export default defineConfig({
  testDir: './tests/visual',
  webServer: isLocal
    ? {
        command: 'npm run build && npm start',
        port: 3000,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
  ],
});
