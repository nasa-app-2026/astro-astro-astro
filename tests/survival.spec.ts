import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

test('Survival opens as a blank chapter and returns to the directory', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="survival"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'survival');
  await expect(page.locator('#chapter-label')).toHaveText('Survival');
  await expect(page.locator('#game-container canvas')).toBeVisible();
  await expect(page.locator('#chapter-view > :not(.chapter-toolbar)')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /scientific research|make oxygen|save water/i })).toHaveCount(0);
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(page.locator('#home')).toBeVisible();
});
