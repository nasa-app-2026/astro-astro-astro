import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

test('pilot the rocket from the launch pad and watch its live camera move', async ({ page }) => {
  test.setTimeout(60_000);
  await enterDirectory(page);
  await page.locator('[data-chapter="flyby"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'flyby');
  await expect(page.getByRole('img', { name: /rocket camera showing earth, moon, .*ship position/i })).toBeVisible();
  await expect(page.locator('#flyby-ship')).toBeVisible();
  await expect(page.locator('#flyby-ship text')).toHaveText('SURVEY • 01');
  expect(Number(await page.locator('#flyby-earth > circle').getAttribute('r'))).toBe(60);
  expect(Number(await page.locator('#flyby-moon > circle').getAttribute('r'))).toBe(20);
  const missionGrid = await page.locator('.flyby-panel .mission-grid').boundingBox();
  const camera = await page.locator('.flyby-panel .camera').boundingBox();
  const telemetry = await page.locator('.flyby-panel .telemetry').boundingBox();
  expect(camera?.width).toBeGreaterThan((missionGrid?.width ?? 0) * 0.5);
  expect(camera?.height).toBeGreaterThan((missionGrid?.height ?? 0) * 0.9);
  expect(telemetry?.height).toBeLessThan(50);
  expect(telemetry!.y).toBeGreaterThan(camera!.y + camera!.height * 0.75);
  await expect(page.locator('#flyby-live-camera')).toHaveAttribute('viewBox', '0 0 1000 200');
  await expect(page.locator('#flyby-orbit-guide')).toHaveCount(1);
  await expect(page.locator('.flyby-panel .first-person')).toHaveCount(0);
  await expect(page.locator('#flyby-action-dock')).toBeInViewport();
  await expect(page.locator('#fuel-fill')).toBeInViewport();
  await expect(page.locator('#battery-store')).toBeInViewport();

  await page.locator('#fuel-fill').evaluate((input: HTMLInputElement) => {
    input.value = '90';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#battery-store').evaluate((input: HTMLInputElement) => {
    input.value = '75';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.getByText(/complete one full circuit/i)).toBeVisible();
  await expect(page.locator('#flyby-orbit-guide')).toHaveCount(1);
  await expect(page.locator('#flyby-orbit-label')).toContainText('REQUIRED LUNAR ORBIT');
  await expect(page.locator('#flyby-time')).toHaveCount(0);
  const startingPosition = await page.locator('#flyby-position').textContent();
  await page.getByRole('button', { name: /launch the survey rocket/i }).click();
  await expect(page.locator('#flyby-ship')).toHaveAttribute('transform', /scale\(\.42\)/);
  await expect(page.locator('#flyby-fuel')).toHaveText('90%');
  await expect(page.locator('#flyby-battery')).toHaveText('75%');
  await page.keyboard.press('p');
  await expect(page.locator('#flyby-message')).toContainText('Crater photographs unavailable here');
  await page.keyboard.press('r');
  await expect(page.locator('#flyby-message')).toContainText('Radiation readings unavailable here');
  await page.keyboard.press('s');
  await expect(page.locator('#flyby-message')).toContainText('Sunlight readings unavailable here');
  await page.keyboard.press('g');
  await expect(page.locator('#flyby-message')).toContainText('Lunar gravity reading unavailable here');
  await expect(page.locator('#flyby-action-dock')).toBeInViewport();
  await expect(page.locator('#flyby-action-dock')).toHaveCSS('position', 'relative');
  await expect(page.getByRole('button', { name: /Crater photographs/i })).toBeInViewport();
  const thrusterButton = page.getByRole('button', { name: 'Thrust up' });
  for (let pulse = 0; pulse < 8; pulse += 1) {
    await thrusterButton.click();
  }

  await expect(page.locator('#flyby-position')).not.toHaveText(startingPosition ?? '');
  await expect(page.locator('#flyby-speed')).not.toHaveText('0.0 m/s');
  await expect(page.locator('#flyby-camera-state')).toContainText('LIVE');
  const rocket = await page.locator('#flyby-ship').boundingBox();
  const earth = await page.locator('#flyby-earth').boundingBox();
  const liveCamera = await page.locator('#flyby-live-camera').boundingBox();
  const liveTelemetry = await page.locator('.flyby-panel .telemetry').boundingBox();
  expect(rocket).not.toBeNull();
  expect(earth).not.toBeNull();
  expect(rocket!.x).toBeGreaterThanOrEqual(liveCamera!.x);
  expect(rocket!.x + rocket!.width).toBeLessThanOrEqual(liveCamera!.x + liveCamera!.width);
  expect(rocket!.y + rocket!.height).toBeLessThan(liveTelemetry!.y);
  expect(earth!.y + earth!.height).toBeLessThan(liveTelemetry!.y);
  await expect(page.getByText(/release to brake/i)).toBeVisible();

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
});
