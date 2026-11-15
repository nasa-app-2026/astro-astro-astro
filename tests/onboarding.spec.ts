import { expect, test } from '@playwright/test';

test('splash and required age selection lead to the mission directory', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#splash-screen h1')).toHaveText('Junior Astronaut Mission Trainer');
  await expect(page.locator('#splash-skip')).toBeVisible();
  await expect(page.locator('#home')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Continue', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByRole('heading', { name: 'Choose your age range' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
  await expect(page.locator('#home')).toBeHidden();
  await page.getByLabel('10 to 12 years old').check();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('.chapter-card')).toHaveCount(7);
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'home');
});

test('splash advances to age selection after three seconds', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'splash');
  await expect(page.locator('#app')).toHaveAttribute('data-splash-ready', 'true');
  await expect(page.locator('#game-container canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose your age range' })).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#splash-screen')).toBeHidden();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
});

test('Skip works before image loading finishes and leaves only the menu scene', async ({ page }) => {
  await page.route('**/earthset-artemis2.jpg*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await route.continue();
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'age');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await page.waitForTimeout(3200);
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'age');
});

test('splash Skip stays tappable on a narrow portrait screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#app')).toHaveAttribute('data-splash-ready', 'true');
  const canvas = await page.locator('#game-container canvas').boundingBox();
  expect(canvas?.height).toBeGreaterThanOrEqual(667);
  expect(canvas?.x).toBeLessThan(0);
  expect((canvas?.x ?? 0) + (canvas?.width ?? 0)).toBeGreaterThan(375);
  const skip = page.getByRole('button', { name: 'Skip' });
  await expect(skip).toBeInViewport();
  await skip.click();
  await expect(page.getByRole('heading', { name: 'Choose your age range' })).toBeVisible();
});

