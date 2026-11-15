import { openMission } from './helpers/onboarding';
import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function enterDirectory(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('input[name="ageRange"][value="7-9"]').check();
  await page.getByRole('button', { name: 'Continue to missions' }).click();
}

async function holdUntil(page: Page, key: string, condition: () => Promise<void>): Promise<void> {
  await page.keyboard.down(key);
  try {
    await condition();
  } finally {
    await page.keyboard.up(key);
  }
}

async function steerIntoRange(
  page: Page,
  canvas: ReturnType<Page['locator']>,
  attribute: string,
  minimum: number,
  maximum: number,
): Promise<void> {
  for (let adjustment = 0; adjustment < 3; adjustment += 1) {
    const position = Number(await canvas.getAttribute(attribute));
    if (position >= minimum && position <= maximum) return;

    if (position < minimum) {
      await holdUntil(page, 'ArrowRight', () => expect.poll(
        async () => Number(await canvas.getAttribute(attribute)),
        { timeout: 20_000 },
      ).toBeGreaterThanOrEqual(minimum));
    } else {
      await holdUntil(page, 'ArrowLeft', () => expect.poll(
        async () => Number(await canvas.getAttribute(attribute)),
        { timeout: 20_000 },
      ).toBeLessThanOrEqual(maximum));
    }
  }

  const position = Number(await canvas.getAttribute(attribute));
  expect(position, `${attribute} should settle within its target range`).toBeGreaterThanOrEqual(minimum);
  expect(position, `${attribute} should settle within its target range`).toBeLessThanOrEqual(maximum);
}

test('operate the crane and excavator to build the outpost, then return to missions', async ({ page }) => {
  test.setTimeout(90_000);
  await enterDirectory(page);
  await openMission(page, 'building');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'building');
  await expect(page.locator('[data-mission-panel="building"]')).toBeVisible();
  await expect(page.locator('#game-container canvas')).toHaveAttribute('data-building-background', 'earth');
  for (const component of [
    '#earth-background',
    '#crane-boom',
    '#crane-operator-cab',
    '#crane-outriggers',
    '#crane-hook-block',
    '#excavator-tracks',
    '#excavator-cab',
    '#excavator-hydraulic',
    '#habitat-module',
    '#habitat-airlock',
    '#solar-array-left',
    '#solar-array-right',
    '#shelter-berm',
    '#printer-feed-hopper',
  ]) {
    await expect(page.locator(component)).toBeVisible();
  }

  const canvas = page.locator('#game-container canvas');
  const shieldKit = page.getByRole('button', { name: /storm-shield kit/i });
  await shieldKit.click();
  await expect(canvas).toHaveAttribute('data-building-phase', 'building');
  await expect(page.locator('#building-cargo')).toHaveText('11.5 / 12 t');

  await page.getByRole('button', { name: /operate mobile crane/i }).click();
  await expect(canvas).toHaveAttribute('data-building-machine', 'crane');
  const parkedCraneTransform = await page.locator('#crane-part').getAttribute('transform');
  await holdUntil(page, 'ArrowLeft', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-crane-x')),
    { timeout: 20_000 },
  ).toBeLessThan(69));
  await steerIntoRange(page, canvas, 'data-building-crane-x', 55, 69);
  expect(await page.locator('#crane-part').getAttribute('transform')).not.toBe(parkedCraneTransform);
  await holdUntil(page, 'ArrowDown', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-crane-cable')),
    { timeout: 20_000 },
  ).toBeGreaterThanOrEqual(65));
  await page.keyboard.press('Space');
  await expect(page.locator('#building-power')).toHaveText('33');
  await expect(page.locator('#building-status')).toContainText('Habitat set down');

  await holdUntil(page, 'ArrowLeft', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-crane-x')),
    { timeout: 20_000 },
  ).toBeLessThan(29));
  await steerIntoRange(page, canvas, 'data-building-crane-x', 15, 29);
  await holdUntil(page, 'ArrowDown', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-crane-cable')),
    { timeout: 20_000 },
  ).toBeGreaterThanOrEqual(65));
  await page.keyboard.press('Space');
  await expect(page.locator('#building-power')).toHaveText('50');
  await expect(page.locator('#step-solar')).toHaveClass(/done/);

  await page.getByRole('button', { name: /operate excavator/i }).click();
  await expect(canvas).toHaveAttribute('data-building-machine', 'excavator');
  const parkedExcavatorTransform = await page.locator('#excavator-part').getAttribute('transform');
  await holdUntil(page, 'ArrowLeft', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-excavator-x')),
    { timeout: 20_000 },
  ).toBeLessThan(69));
  await steerIntoRange(page, canvas, 'data-building-excavator-x', 51, 69);
  await holdUntil(page, 'ArrowDown', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-bucket-depth')),
    { timeout: 20_000 },
  ).toBeGreaterThanOrEqual(70));
  await expect(page.locator('#excavator-part')).not.toHaveAttribute('transform', parkedExcavatorTransform ?? '');
  await page.keyboard.press('Space');
  await expect(canvas).toHaveAttribute('data-building-bucket-loaded', 'true');
  await expect(page.locator('#building-power')).toHaveText('44');

  await holdUntil(page, 'ArrowLeft', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-excavator-x')),
    { timeout: 20_000 },
  ).toBeLessThan(29));
  await steerIntoRange(page, canvas, 'data-building-excavator-x', 11, 29);
  await holdUntil(page, 'ArrowUp', () => expect.poll(
    async () => Number(await canvas.getAttribute('data-building-bucket-depth')),
    { timeout: 20_000 },
  ).toBeLessThanOrEqual(25));
  await page.keyboard.press('Space');
  await expect(canvas).toHaveAttribute('data-building-bucket-loaded', 'false');
  await expect(page.locator('#building-regolith')).toHaveText('1 / 3');
  await page.getByRole('button', { name: 'Park machine' }).click();
  await page.getByRole('button', { name: /build storm shelter/i }).click();

  await expect(canvas).toHaveAttribute('data-building-phase', 'complete');
  await expect(canvas).toHaveAttribute('data-building-shelter', 'true');
  await expect(page.locator('#building-complete')).toBeVisible();
  await expect(page.locator('#building-status')).toContainText('Outpost complete');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(canvas).not.toHaveAttribute('data-building-phase', /.+/);
});
