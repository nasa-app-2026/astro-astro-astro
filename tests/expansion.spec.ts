import { expect, test, type Locator, type Page } from '@playwright/test';

type CanvasBounds = { x: number; y: number; width: number; height: number };

async function openExpansion(page: Page) {
  await page.goto('/');
  await page.locator('[data-chapter="expansion"]').click();

  const canvas = page.locator('#game-container canvas');
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'expansion');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'intro');
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '0');

  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Expansion canvas is not visible');
  return { canvas, bounds };
}

async function clickCanvas(page: Page, bounds: CanvasBounds, x: number, y: number) {
  await page.mouse.click(
    bounds.x + bounds.width * x / 1024,
    bounds.y + bounds.height * y / 640
  );
}

async function clickTile(page: Page, bounds: CanvasBounds, x: number, y: number) {
  await clickCanvas(page, bounds, 24 + x * 64 + 32, 188 + y * 64 + 32);
}

async function walk(
  page: Page,
  bounds: CanvasBounds,
  path: Array<[number, number]>
) {
  for (const [x, y] of path) {
    await clickTile(page, bounds, x, y);
  }
}

async function beginOrder(page: Page, bounds: CanvasBounds) {
  await clickCanvas(page, bounds, 512, 467);
  await expect(page.locator('#game-container canvas')).toHaveAttribute('data-expansion-phase', 'order');
}

async function confirmRecommendedOrder(page: Page, bounds: CanvasBounds) {
  const canvas = page.locator('#game-container canvas');
  await clickCanvas(page, bounds, 700, 564);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'delivery');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect', { timeout: 15000 });
}

async function collectCargo(page: Page, bounds: CanvasBounds) {
  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');

  await walk(page, bounds, [
    [2, 3], [3, 3], [3, 2], [4, 2], [5, 2], [6, 2],
    [5, 2], [5, 3], [5, 4], [6, 4], [7, 4], [7, 3], [7, 2]
  ]);
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '7');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'build');
}

async function triggerRandomFlare(page: Page, canvas: Locator) {
  const baseTime = await page.evaluate(() => Date.now());
  const interval = Number(await canvas.getAttribute('data-expansion-next-flare'));
  expect(interval).toBeGreaterThanOrEqual(20);
  expect(interval).toBeLessThanOrEqual(40);

  const flareTime = baseTime + interval * 1000;
  await page.clock.setFixedTime(flareTime);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'hazard');
  await expect(canvas).toHaveAttribute('data-expansion-hazard', 'warning');
  return flareTime;
}

test('Expansion orders cargo, builds with collected materials, and returns to the directory', async ({ page }) => {
  test.setTimeout(90000);
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '84');
  await expect(canvas).toHaveAttribute('data-expansion-order-buildable', '3');
  await expect(canvas).toHaveAttribute('data-expansion-order-valid', 'true');

  await clickCanvas(page, bounds, 462, 422);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '96');
  await expect(canvas).toHaveAttribute('data-expansion-order-crates', '8');
  await clickCanvas(page, bounds, 462, 422);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '96');
  await expect(canvas).toHaveAttribute('data-expansion-order-crates', '8');
  await clickCanvas(page, bounds, 384, 422);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '84');
  await expect(canvas).toHaveAttribute('data-expansion-order-crates', '7');

  await clickCanvas(page, bounds, 384, 383);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '74');
  await expect(canvas).toHaveAttribute('data-expansion-order-buildable', '2');
  await expect(canvas).toHaveAttribute('data-expansion-order-valid', 'false');
  await clickCanvas(page, bounds, 700, 564);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'order');
  await clickCanvas(page, bounds, 462, 383);
  await expect(canvas).toHaveAttribute('data-expansion-order-cost', '84');
  await expect(canvas).toHaveAttribute('data-expansion-order-valid', 'true');

  await confirmRecommendedOrder(page, bounds);
  await page.clock.setFixedTime(await page.evaluate(() => Date.now()));
  await expect(canvas).toHaveAttribute('data-expansion-cargo-crates', '7');
  await collectCargo(page, bounds);
  await expect(canvas).toHaveAttribute('data-expansion-inventory', JSON.stringify({
    solarPanel: 2,
    wiringKit: 1,
    frameKit: 1,
    habitatPanel: 2,
    waterSystem: 1,
    antennaKit: 1,
    electronicsKit: 1,
    shieldPanel: 0
  }));

  await walk(page, bounds, [[7, 3], [7, 4], [6, 4], [5, 4], [4, 4]]);
  await clickTile(page, bounds, 3, 4);
  await clickTile(page, bounds, 3, 3);

  const selectBuilding = async (index: number) => {
    await clickCanvas(page, bounds, 838, 369 + index * 31);
  };
  const clickBuilding = async (index: number, x: number, y: number) => {
    await selectBuilding(index);
    await clickTile(page, bounds, x, y);
  };

  await selectBuilding(0);
  await clickTile(page, bounds, 3, 3);
  await expect(canvas).toHaveAttribute('data-expansion-builds', '0');
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(260);
  await page.keyboard.up('ArrowDown');
  await clickTile(page, bounds, 3, 3);
  await expect(canvas).toHaveAttribute('data-expansion-builds', '1');
  await clickBuilding(1, 5, 3);
  await clickBuilding(2, 4, 2);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'complete');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(canvas).not.toHaveAttribute('data-expansion-phase', /.+/);
}, { timeout: 60000 });

test('Expansion ends the mission if the astronaut misses the solar flare shelter deadline', async ({ page }) => {
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await confirmRecommendedOrder(page, bounds);
  const eventStart = await page.evaluate(() => Date.now());
  await page.clock.setFixedTime(eventStart);
  await collectCargo(page, bounds);

  const flareTime = await triggerRandomFlare(page, canvas);
  await expect(canvas).toHaveAttribute('data-expansion-hazard-timer', '3');
  await page.clock.setFixedTime(flareTime + 3000);
  await expect(canvas).toHaveAttribute('data-expansion-hazard', 'exposed', { timeout: 5000 });
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'failed');
  await expect.poll(async () => Number(await canvas.getAttribute('data-expansion-radiation-dose')))
    .toBe(100);
  await expect.poll(async () => Number(await canvas.getAttribute('data-expansion-suit-integrity')))
    .toBeLessThan(60);
}, { timeout: 60000 });

test('Expansion can trigger a random flare during cargo pickup and resume collection at the outpost', async ({ page }) => {
  test.setTimeout(60000);
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await confirmRecommendedOrder(page, bounds);
  await page.clock.setFixedTime(await page.evaluate(() => Date.now()));

  const flareTime = await triggerRandomFlare(page, canvas);
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '0');
  await walk(page, bounds, [[2, 3], [3, 3]]);
  await page.clock.setFixedTime(flareTime + 3000);
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');
  await expect(canvas).toHaveAttribute('data-expansion-hazard', 'protected');
  await expect(canvas).toHaveAttribute('data-expansion-supplies', '0');
});

test('Expansion order terminal and confirmation are keyboard accessible', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-chapter="expansion"]').click();

  const canvas = page.locator('#game-container canvas');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'intro');
  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'order');
  await page.keyboard.press('Enter');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'delivery');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(canvas).not.toHaveAttribute('data-expansion-phase', /.+/);
});

test('Expansion cargo lander approaches, deploys its gear, and settles onto the pad', async ({ page }) => {
  test.setTimeout(30000);
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await clickCanvas(page, bounds, 700, 564);

  await expect(canvas).toHaveAttribute('data-expansion-phase', 'delivery');
  await expect(canvas).toHaveAttribute('data-expansion-lander-phase', 'approach');
  await expect(canvas).toHaveAttribute('data-expansion-lander-phase', 'descent');
  await expect(canvas).toHaveAttribute('data-expansion-lander-phase', 'touchdown');
  await expect(canvas).toHaveAttribute('data-expansion-lander-phase', 'landed');
  await expect(canvas).toHaveAttribute('data-expansion-phase', 'collect');
});

test('Expansion presents the delivered lunar cargo as an illustrated overhead map', async ({ page }) => {
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await confirmRecommendedOrder(page, bounds);
  await page.waitForTimeout(1000);
  await page.clock.pauseAt(new Date('2026-01-01T00:00:00Z'));
  await expect(canvas).toHaveScreenshot('expansion-overhead-field.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.04
  });
});

test('Expansion keeps remaining material counts visible in the bottom stock meter', async ({ page }) => {
  test.setTimeout(60000);
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await confirmRecommendedOrder(page, bounds);
  await page.clock.setFixedTime(await page.evaluate(() => Date.now()));
  await collectCargo(page, bounds);
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now())));
  await expect(canvas).toHaveScreenshot('expansion-material-meter.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.04
  });
});

test('Expansion shows the randomly timed solar flare warning over the lunar map', async ({ page }) => {
  const { canvas, bounds } = await openExpansion(page);
  await beginOrder(page, bounds);
  await confirmRecommendedOrder(page, bounds);
  await page.clock.setFixedTime(await page.evaluate(() => Date.now()));
  await collectCargo(page, bounds);
  const flareTime = await triggerRandomFlare(page, canvas);
  await page.clock.pauseAt(new Date(flareTime));
  await expect(canvas).toHaveScreenshot('expansion-solar-flare-warning.png', {
    animations: 'disabled',
    maxDiffPixelRatio: 0.04
  });
}, { timeout: 60000 });
