import { expect, test } from '@playwright/test';

test('pilot the rocket from the launch pad and watch its live camera move', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.locator('[data-chapter="flyby"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'flyby');
  await expect(page.getByRole('img', { name: /rocket camera showing earth, moon, .*ship position/i })).toBeVisible();
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
  await expect(page.getByText(/no mission clock or orbit quota/i)).toBeVisible();
  await expect(page.locator('#flyby-orbits')).toHaveCount(0);
  await expect(page.locator('#flyby-time')).toHaveCount(0);
  const startingPosition = await page.locator('#flyby-position').textContent();
  await page.getByRole('button', { name: /launch the survey rocket/i }).click();
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
  await expect(page.locator('#flyby-action-dock')).toHaveCSS('position', 'fixed');
  await expect(page.getByRole('button', { name: /Crater photographs/i })).toBeInViewport();
  const thrusterButton = page.getByRole('button', { name: 'Thrust up' });
  for (let pulse = 0; pulse < 8; pulse += 1) {
    await thrusterButton.click();
  }

  await expect(page.locator('#flyby-position')).not.toHaveText(startingPosition ?? '');
  await expect(page.locator('#flyby-speed')).not.toHaveText('0.0 m/s');
  await expect(page.locator('#flyby-camera-state')).toContainText('LIVE');
  await expect(page.getByText(/release to brake/i)).toBeVisible();

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
});
