import { expect, test } from '@playwright/test';

test('Survival shows resources, advances a day, and returns to the directory', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-chapter="survival"]').click();
  const mission = page.getByRole('region', { name: 'Survival mission' });
  await expect(mission.getByText('Day 1 of 14')).toBeVisible();
  await expect(mission.getByText('Oxygen: 12.0 kg')).toBeVisible();
  await mission.getByRole('button', { name: /scientific research/i }).click();
  await expect(mission.getByText('Day 2 of 14')).toBeVisible();
  await expect(mission.getByText('Research: 1 points')).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(mission).toHaveCount(0);
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
});
