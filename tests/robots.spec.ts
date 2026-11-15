import { expect, test } from '@playwright/test';

test('choose a lunar site, pilot the cargo rocket with natural arrow directions, and return home', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.locator('[data-chapter="robots"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'robots');
  await expect(page.locator('#rover-action-dock')).toBeInViewport();
  await expect(page.locator('#rover-action-dock')).toHaveCSS('position', 'relative');
  await expect(page.getByRole('button', { name: /select shadowed crater/i })).toBeVisible();
  await page.getByRole('button', { name: /select shadowed crater/i }).click();
  await expect(page.locator('#rover-surface-view')).toHaveAttribute('data-site', 'shadowedCrater');
  await expect(page.locator('#sunny-ridge-terrain')).toHaveCount(1);
  await expect(page.locator('#shadow-crater-terrain')).toHaveCount(1);
  await page.getByRole('button', { name: /launch the rover rocket/i }).click();

  await expect(page.getByRole('img', { name: /live view of the cargo rocket traveling from earth to the moon/i })).toBeVisible();
  await expect(page.locator('#rover-parking-pad')).toHaveCount(1);
  await expect(page.locator('#rover-parking-label')).toHaveText('PARK HERE');
  await expect(page.locator('#rover-park-status')).toHaveText('return to pad');
  await expect(page.locator('#cargo-flight-view .view-title')).toContainText('LIVE CARGO ROCKET FLIGHT');
  expect(await page.locator('#cargo-starfield circle').count()).toBeGreaterThan(10);
  expect(await page.locator('#cargo-asteroids path').count()).toBeGreaterThan(0);
  await expect(page.locator('#cargo-target')).toHaveText('Shadowed crater');
  const flightCamera = await page.locator('#cargo-flight-view svg').boundingBox();
  expect(flightCamera?.width).toBeGreaterThan(900);
  expect(flightCamera?.height).toBeGreaterThan(220);
  const flightStats = await page.locator('#cargo-flight-view .telemetry').boundingBox();
  expect(flightStats?.height).toBeLessThan(45);
  expect((flightStats?.y ?? 0) + (flightStats?.height ?? 0)).toBeLessThan(flightCamera!.y + flightCamera!.height);
  await expect(page.locator('#rover-surface-view [aria-label*="Top-down lunar terrain for the shadowed crater"]')).toHaveCount(1);
  await expect(page.locator('#rover-surface-view')).toBeHidden();
  const startingPosition = await page.locator('#cargo-position').textContent();
  const startingY = Number(startingPosition?.split(',')[1]);
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(300);
  await page.keyboard.up('ArrowUp');
  await expect.poll(async () => Number((await page.locator('#cargo-position').textContent())?.split(',')[1])).toBeLessThan(startingY);
  const keyedPosition = await page.locator('#cargo-position').textContent();
  const thrustButton = page.getByRole('button', { name: 'Thrust cargo rocket up' });
  for (let pulse = 0; pulse < 12; pulse += 1) {
    await thrustButton.click();
  }

  const updatedPosition = await page.locator('#cargo-position').textContent();
  const updatedY = Number(updatedPosition?.split(',')[1]);
  expect(updatedPosition).not.toBe(keyedPosition);
  expect(updatedY).toBeLessThan(Number(keyedPosition?.split(',')[1]));
  await expect(page.locator('#cargo-fuel')).not.toHaveText('100%');
  await expect(page.locator('#cargo-flight-path')).not.toHaveAttribute('points', '');
  await expect(page.locator('#cargo-hint')).toContainText(/let go to auto-brake/i);

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('[data-chapter="firstLanding"]')).toBeEnabled();
});
