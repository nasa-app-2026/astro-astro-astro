import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

test('choose a lunar site and pilot the second cargo rocket from Earth', async ({ page }) => {
  test.setTimeout(60_000);
  await enterDirectory(page);
  await page.locator('[data-chapter="robots"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'robots');
  await expect(page.getByRole('button', { name: /select shadowed crater/i })).toBeVisible();
  await page.getByRole('button', { name: /select shadowed crater/i }).click();
  await page.getByRole('button', { name: /launch the rover rocket/i }).click();

  await expect(page.getByRole('img', { name: /live view of the cargo rocket traveling from earth to the moon/i })).toBeVisible();
  await expect(page.locator('#cargo-target')).toHaveText('Shadowed crater');
  const startingPosition = await page.locator('#cargo-position').textContent();
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.up('ArrowUp');

  const updatedPosition = await page.locator('#cargo-position').textContent();
  expect(updatedPosition).not.toBe(startingPosition);
  await expect(page.locator('#cargo-fuel')).not.toHaveText('100%');
  await expect(page.locator('#cargo-flight-path')).not.toHaveAttribute('points', '');

  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('[data-chapter="firstLanding"]')).toBeEnabled();
});
