import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:8080' },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
