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
    const shouldLockScroll = ['flyby', 'robots', 'firstLanding', 'building'].includes(id);
    expect(await page.locator('html').evaluate((element) => element.classList.contains('mission-no-scroll'))).toBe(shouldLockScroll);
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
    await expect(page.locator('html')).not.toHaveClass(/mission-no-scroll/);
  }
});

test('scrolling is locked only for stage one and two missions', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => { document.documentElement.scrollTop = 500; });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await page.evaluate(() => { document.documentElement.scrollTop = 0; });

  for (const id of ['flyby', 'firstLanding', 'survival']) {
    await page.locator(`[data-chapter="${id}"]`).click();
    const locked = id !== 'survival';
    const hasLock = await page.locator('html').evaluate((element) => element.classList.contains('mission-no-scroll'));
    expect(hasLock).toBe(locked);
    if (locked) {
      await page.mouse.wheel(0, 900);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
    }
    await page.getByRole('button', { name: 'All missions' }).click();
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
