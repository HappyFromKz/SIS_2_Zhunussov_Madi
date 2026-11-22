import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true, // shards split tests, not whole files
  forbidOnly: isCI, // a forgotten test.only fails CI
  retries: isCI ? 2 : 1, // a flaky test is marked flaky, not red
  workers: 2, // public demo site is slow; 4 parallel workers caused ERR_ABORTED on page.goto
  reporter: isCI
    ? [
        ['list'],
        ['blob'], // for merging shards
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    // `||` (not `??`): in CI an unset repository variable arrives as an empty string
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    navigationTimeout: 30_000,
    testIdAttribute: 'data-test',
    trace: isCI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
