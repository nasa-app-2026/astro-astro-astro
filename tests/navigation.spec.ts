import { expect, test } from '@playwright/test';

const missions = [
  ['flyby', 'Flyby test'], ['robots', 'Robots go first'],
  ['firstLanding', 'First landing'], ['building', 'Building the outpost'],
  ['survival', 'Survival'], ['expansion', 'Expansion'],
  ['sustainability', 'Sustainability'],
] as const;

test('all seven missions open directly and return to the directory', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /build a home/i })).toBeVisible();
  await expect(page.locator('#game-container canvas')).toBeVisible();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');

  for (const [id, title] of [...missions].reverse()) {
    const card = page.locator(`[data-chapter="${id}"]`);
    await expect(card).toBeEnabled();
    await card.click();
    await expect(page.locator('#chapter-view')).toBeVisible();
    await expect(page.locator('#chapter-label')).toContainText(title);
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', id);
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  }
});

test('mission directory works at a narrow viewport with keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.locator('[data-chapter="sustainability"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'sustainability');
  await expect(page.locator('#chapter-view')).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
});
