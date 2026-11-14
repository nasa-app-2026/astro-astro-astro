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
  await expect(page.getByRole('heading', { name: /pick your next mission/i })).toBeVisible();
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

test('directory cards are visible on launch and chapters receive the full viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const cards = page.locator('.chapter-card');
  await expect(cards).toHaveCount(7);
  await expect(cards.first()).toBeEnabled();
  const directoryFits = await cards.evaluateAll((items) => items.every((item) => {
    const box = item.getBoundingClientRect();
    return box.top >= 0 && box.bottom <= window.innerHeight;
  }));
  expect(directoryFits).toBe(true);

  await page.locator('[data-chapter="survival"]').click();
  await expect(page.locator('.topbar')).toBeHidden();
  const layout = await page.locator('#chapter-view').evaluate((view) => ({
    top: view.getBoundingClientRect().top,
    height: view.getBoundingClientRect().height,
    viewport: window.innerHeight,
    backHeight: view.querySelector('.chapter-toolbar')!.getBoundingClientRect().height,
  }));
  expect(layout.top).toBe(0);
  expect(layout.height).toBeGreaterThanOrEqual(layout.viewport);
  expect(layout.backHeight).toBeLessThan(60);
  await expect(page.getByRole('region', { name: 'Survival mission' })).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(cards).toHaveCount(7);
});

test('mission directory works at a narrow viewport with keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const cards = page.locator('.chapter-card');
  await expect(cards).toHaveCount(7);
  expect(await cards.evaluateAll((items) => items.every((item) => item.getBoundingClientRect().bottom <= window.innerHeight))).toBe(true);
  await page.locator('[data-chapter="sustainability"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'sustainability');
  await expect(page.locator('#chapter-view')).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
});
