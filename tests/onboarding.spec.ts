import { expect, test } from '@playwright/test';

test('splash and required age selection lead to the mission directory', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Junior Astronaut Mission Trainer' })).toBeVisible();
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
  await page.goto('/');
  await expect(page.locator('#app')).toHaveAttribute('data-screen', 'splash');
  await expect(page.getByRole('heading', { name: 'Choose your age range' })).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#splash-screen')).toBeHidden();
});
