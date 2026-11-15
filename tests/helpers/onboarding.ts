import type { Page } from '@playwright/test';

export async function enterDirectory(page: Page, age: '7-9' | '10-12' = '7-9'): Promise<void> {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Skip' }).click();
  await page.locator(`input[name="ageRange"][value="${age}"]`).check();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
}

export async function openMission(page: Page, id: string): Promise<void> {
  await page.locator(`[data-chapter="${id}"]`).click();
  await page.getByRole('button', { name: /continue to mission/i }).click();
}
