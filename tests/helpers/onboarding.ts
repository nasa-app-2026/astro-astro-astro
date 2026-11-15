import type { Page } from '@playwright/test';

export async function enterDirectory(page: Page, age: '7-9' | '10-12' = '7-9'): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.locator(`input[name="ageRange"][value="${age}"]`).check();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
}
