import { expect, test } from '@playwright/test';

test('pilot the rocket from the launch pad and watch its live camera move', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.locator('[data-chapter="flyby"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'flyby');
  await expect(page.getByRole('img', { name: /rocket camera showing earth, moon, and ship position/i })).toBeVisible();

  await page.locator('#fuel-fill').evaluate((input: HTMLInputElement) => {
    input.value = '90';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#battery-store').evaluate((input: HTMLInputElement) => {
    input.value = '75';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.locator('#mission-time').selectOption('120');
  const startingPosition = await page.locator('#flyby-position').textContent();
  await page.getByRole('button', { name: /launch the survey rocket/i }).click();
  await expect(page.locator('#flyby-fuel')).toHaveText('90%');
  await expect(page.locator('#flyby-battery')).toHaveText('75%');
  await expect(page.locator('#flyby-time')).toHaveText('120 min');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowUp');

  await expect(page.locator('#flyby-position')).not.toHaveText(startingPosition ?? '');
  await expect(page.locator('#flyby-speed')).not.toHaveText('0.0 m/s');
  await expect(page.locator('#flyby-camera-state')).toContainText('LIVE');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
});
