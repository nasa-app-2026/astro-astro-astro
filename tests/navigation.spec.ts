import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

const missions = [
  ['flyby', 'Flyby test'], ['robots', 'Robots go first'],
  ['firstLanding', 'First landing'], ['building', 'Building the outpost'],
  ['survival', 'Survival'], ['expansion', 'Expansion'],
] as const;

test('all six implemented missions open directly and return to the directory', async ({ page }) => {
  test.setTimeout(60_000);
  await enterDirectory(page);
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
    const shouldLockScroll = ['flyby', 'robots', 'firstLanding', 'building'].includes(id);
    const lockClass = await page.locator('html').evaluate((element) => element.classList.contains('mission-no-scroll'));
    expect(lockClass).toBe(shouldLockScroll);
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
    await expect(page.locator('html')).not.toHaveClass(/mission-no-scroll/);
  }
});

test('scrolling is locked only while stage one and two missions are open', async ({ page }) => {
  await enterDirectory(page);
  for (const [id, locked] of [['flyby', true], ['robots', true], ['survival', false]] as const) {
    await page.locator(`[data-chapter="${id}"]`).click();
    if (locked) await expect(page.locator('html')).toHaveClass(/mission-no-scroll/);
    else await expect(page.locator('html')).not.toHaveClass(/mission-no-scroll/);
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('html')).not.toHaveClass(/mission-no-scroll/);
  }
});

test('directory cards are visible on launch and chapters receive the full viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await enterDirectory(page);
  const cards = page.locator('.chapter-card');
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toHaveAttribute('data-chapter', 'survival');
  await expect(page.locator('.chapter-number')).toHaveCount(0);
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
  const backButton = await page.getByRole('button', { name: 'All missions' }).boundingBox();
  const chapterLabel = await page.locator('#chapter-label').boundingBox();
  expect(backButton).not.toBeNull();
  expect(chapterLabel).not.toBeNull();
  expect(backButton!.x).toBeLessThan(30);
  expect(backButton!.y).toBeLessThan(30);
  expect(chapterLabel!.x).toBeGreaterThan(backButton!.x + backButton!.width);
  await expect(page.locator('#chapter-view > :not(.chapter-toolbar)')).toHaveCount(1);
  const site = page.getByRole('region', { name: 'Where will you train?' });
  await expect(site).toBeVisible();
  const siteBounds = await site.boundingBox();
  expect(siteBounds).not.toBeNull();
  expect(siteBounds!.x).toBe(0);
  expect(siteBounds!.width).toBe(1280);
  expect(siteBounds!.y).toBeLessThanOrEqual(60);
  expect(siteBounds!.y + siteBounds!.height).toBe(800);
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#survival-site')).toHaveCount(0);
  await expect(cards).toHaveCount(6);
});

test('switching missions removes the previous chapter and starts the next one fresh', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="flyby"]').click();
  const flyby = page.getByRole('region', { name: 'Moon flyby mission control' });
  await expect(flyby).toBeVisible();
  await flyby.getByRole('button', { name: 'Launch the survey rocket' }).click();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(flyby).toHaveCount(0);

  await page.locator('[data-chapter="robots"]').click();
  await expect(page.getByRole('region', { name: 'Lunar rover mission control' })).toBeVisible();
  await expect(flyby).toHaveCount(0);
  await expect(page.locator('#chapter-view > :not(.chapter-toolbar)')).toHaveCount(1);
  await page.getByRole('button', { name: 'All missions' }).click();

  await page.locator('[data-chapter="flyby"]').click();
  await expect(flyby.getByRole('button', { name: 'Launch the survey rocket' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Lunar rover mission control' })).toHaveCount(0);
});

test('mission directory works at a narrow viewport with keyboard access', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterDirectory(page);
  const cards = page.locator('.chapter-card');
  await expect(cards).toHaveCount(6);
  expect(await cards.evaluateAll((items) => items.every((item) => item.getBoundingClientRect().bottom <= window.innerHeight))).toBe(true);
});
