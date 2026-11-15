import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';

for (const age of ['7-9', '10-12'] as const) {
  test(`data sources screen filters Chapter 5 and returns to the directory for ages ${age}`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    await enterDirectory(page, age);
    const directoryButton = page.getByRole('button', { name: /where our data comes from/i });
    await directoryButton.focus();
    await page.keyboard.press('Enter');
    const view = page.locator('#data-sources-view');
    await expect(view).toBeVisible();
    await expect(view.getByRole('heading', { name: 'Where our data comes from' })).toBeVisible();
    await expect(view.getByRole('heading', { name: 'NASA data in this game' })).toBeVisible();
    await expect(view.getByRole('heading', { name: 'All our sources' })).toBeVisible();

    if (age === '7-9') {
      await expect(view.getByText('These are the real places our facts and pictures come from')).toBeVisible();
      await expect(view.getByText('(not fully checked)')).toHaveCount(0);
    } else {
      await expect(view.getByText('These are the real places our facts and pictures come from')).toHaveCount(0);
      await expect(view.getByText('(not fully checked)').first()).toBeVisible();
    }

    const sourceFilter = view.getByLabel('Show sources for:');
    await sourceFilter.focus();
    for (let step = 0; step < 5; step += 1) await page.keyboard.press('ArrowDown');
    await expect(sourceFilter).toHaveValue('5');
    await expect(view.locator('.ds-section[aria-labelledby="nasa-data-title"] [data-source-key="SRC-006"]')).toBeVisible();
    await expect(view.locator('.ds-section[aria-labelledby="nasa-data-title"] h3'))
      .toHaveText('DONKI Space Weather Database');
    await expect(view.locator('.ds-section[aria-labelledby="nasa-data-title"]')
      .getByText('Archived, not live')).toBeVisible();
    await expect(view.locator('.ds-section[aria-labelledby="nasa-data-title"] a').first())
      .toHaveAttribute('target', '_blank');

    const mediaSummary = view.locator('#pictures-and-sounds > summary');
    await mediaSummary.focus();
    await page.keyboard.press('Enter');
    const picturesSummary = view.locator('#pictures-and-sounds details.ds-media-kind > summary').first();
    await picturesSummary.focus();
    await page.keyboard.press('Enter');
    await expect(view.locator('#pictures-and-sounds details.ds-media-kind[open] .ds-media').first()).toBeVisible();
    await expect(view.getByRole('heading', { name: 'Game numbers' })).toBeVisible();
    await expect(view.getByText('Made up to make the game playable')).toBeVisible();

    const backButton = view.getByRole('button', { name: '← Back' });
    await backButton.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#home')).toBeVisible();
    await expect(view).toBeHidden();
    await expect(page.locator('#app')).toHaveAttribute('data-screen', 'home');
    expect(consoleErrors, `Browser console errors for age ${age}: ${consoleErrors.join(' | ')}`).toEqual([]);
  });
}
