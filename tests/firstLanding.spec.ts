import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function enterFirstLandingDirectory(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('input[name="ageRange"][value="7-9"]').check();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
}

test('First landing controls the descent, starts an astronaut EVA, and allows a return to the directory', async ({ page }) => {
  test.setTimeout(90_000);
  await enterFirstLandingDirectory(page);
  await page.locator('[data-chapter="firstLanding"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'firstLanding');
  await expect(page.locator('#chapter-view')).toBeVisible();

  const canvas = page.locator('#game-container canvas');
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Game canvas is not visible');
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'intro');
  await expect(canvas).toHaveAttribute('data-first-landing-background', 'earth');
  await expect(canvas).toHaveAttribute('data-first-landing-build-site', 'empty');
  await page.keyboard.down('ArrowUp');
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + bounds.height * 548 / 640);
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'descent');
  await expect.poll(async () => Number(await canvas.getAttribute('data-first-landing-start-altitude-m'))).toBeGreaterThan(150);

  await page.keyboard.down('ArrowRight');
  await expect(canvas).toHaveAttribute('data-first-landing-descent-speed', /\d+/);
  await expect.poll(async () => Number(await canvas.getAttribute('data-first-landing-descent-speed')), {
    timeout: 10000,
  }).toBeLessThan(25);
  await expect.poll(async () => Number(await canvas.getAttribute('data-first-landing-x')), {
    timeout: 15000,
  }).toBeGreaterThan(635);
  await page.keyboard.up('ArrowRight');
  await expect.poll(async () => {
    const speed = await canvas.getAttribute('data-first-landing-descent-speed');
    return speed === null ? Number.POSITIVE_INFINITY : Number(speed);
  }, { timeout: 15000 }).toBeLessThan(25);
  await page.keyboard.up('ArrowUp');
  let engineOn = false;
  for (let frame = 0; frame < 300; frame += 1) {
    if (await canvas.getAttribute('data-first-landing-phase') !== 'descent') break;
    const speed = Number(await canvas.getAttribute('data-first-landing-descent-speed'));
    if (!engineOn && speed > 20) {
      await page.keyboard.down('ArrowUp');
      engineOn = true;
    } else if (engineOn && speed < 8) {
      await page.keyboard.up('ArrowUp');
      engineOn = false;
    }
    await page.waitForTimeout(50);
  }
  if (engineOn) await page.keyboard.up('ArrowUp');
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'landed', { timeout: 15000 });

  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'eva');
  await expect(canvas).toHaveAttribute('data-first-landing-character', 'astronaut');
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => Math.abs(Number(await canvas.getAttribute('data-first-landing-walk-phase'))))
    .toBeGreaterThan(0.1);
  const gaitBeforeNextStep = await canvas.getAttribute('data-first-landing-walk-phase');
  await page.waitForTimeout(120);
  expect(await canvas.getAttribute('data-first-landing-walk-phase')).not.toBe(gaitBeforeNextStep);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('ArrowUp');
  await expect.poll(async () => Number(await canvas.getAttribute('data-first-landing-walk-phase'))).toBe(0);
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'eva');
  const oxygenBeforeWait = Number(await canvas.getAttribute('data-first-landing-oxygen'));
  await page.waitForTimeout(2500);
  const oxygenAfterWait = Number(await canvas.getAttribute('data-first-landing-oxygen'));
  expect(oxygenBeforeWait - oxygenAfterWait).toBeGreaterThan(4.5);

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(page.locator('#home')).toBeVisible();
  await expect(canvas).not.toHaveAttribute('data-first-landing-phase', /.+/);
});

test('First landing resets its mission state after leaving and reopening', async ({ page }) => {
  await enterFirstLandingDirectory(page);
  const canvas = page.locator('#game-container canvas');
  const openMission = async () => {
    await page.locator('[data-chapter="firstLanding"]').click();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'firstLanding');
    await expect(page.locator('#chapter-label')).toContainText('First landing');
    await expect(canvas).toHaveAttribute('data-first-landing-phase', 'intro');
  };
  const leaveMission = async () => {
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  };

  await openMission();
  await page.keyboard.press('Enter');
  await leaveMission();

  await openMission();
  await expect(canvas).toHaveAttribute('data-first-landing-phase', 'intro');
  await leaveMission();
});
