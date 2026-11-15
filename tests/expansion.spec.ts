import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

test('Expansion keeps its supply-and-build mission playable and returns to the directory', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="expansion"]').click();

  const canvas = page.locator('#game-container canvas');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'expansion');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'intro');
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '0');

  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Expansion canvas is not visible');

  await page.waitForTimeout(500);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'intro');
  await page.mouse.click(
    bounds.x + bounds.width * 512 / 1024,
    bounds.y + bounds.height * 467 / 640
  );
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');

  const clickTile = async (x: number, y: number) => {
    await page.mouse.click(
      bounds.x + bounds.width * (24 + x * 64 + 32) / 1024,
      bounds.y + bounds.height * (188 + y * 64 + 32) / 640
    );
  };
  const walk = async (path: Array<[number, number]>) => {
    for (const [x, y] of path) await clickTile(x, y);
  };

  await walk([[2, 3], [2, 2], [2, 1]]);
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '1');
  await walk([[3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [7, 2]]);
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '2');
  await walk([[8, 2], [8, 3], [8, 4], [8, 5]]);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'build');

  const clickBuilding = async (index: number, x: number, y: number) => {
    await page.mouse.click(
      bounds.x + bounds.width * 838 / 1024,
      bounds.y + bounds.height * (369 + index * 31) / 640
    );
    await clickTile(x, y);
  };

  await clickBuilding(0, 3, 3);
  await expect(canvas).toHaveAttribute('data-expansion-builds', '1');
  await clickBuilding(1, 5, 3);
  await clickBuilding(2, 4, 2);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'complete');
  await expect(canvas).toHaveAttribute('data-expansion-builds', '3');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(canvas).not.toHaveAttribute('data-expansion-phase', /.+/);
});

test('Expansion briefing can be started with the keyboard', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="expansion"]').click();

  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'intro');
  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(canvas).not.toHaveAttribute('data-expansion-phase', /.+/);
});
