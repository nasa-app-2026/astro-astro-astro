import { expect, test } from '@playwright/test';
import { enterDirectory } from './helpers/onboarding';
import { power } from '../src/facts/power';
import { regions } from '../src/data/chapter5/regions';
import { chapter5Facts } from '../src/data/chapter5/facts';
import { LABEL_WORDS } from '../src/facts/types';

test('the same choices produce the same saved game state in both age modes', async ({ browser }) => {
  test.setTimeout(90_000);
  const results: unknown[] = [];
  for (const age of ['7-9', '10-12'] as const) {
    const page = await browser.newPage();
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole' }).click();
    await page.getByRole('button', { name: 'Choose Haworth' }).click();
    await page.getByRole('button', { name: 'Begin Into the dark' }).click();
    for (let day = 1; day <= 5; day++) {
      await page.locator(`[data-action="${day === 1 ? 'lab' : 'rest'}"]`).click();
      if (day < 5) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
    }
    await page.getByRole('button', { name: 'Go on to the next challenge anyway' }).click();
    results.push(await page.evaluate(() => JSON.parse(localStorage.getItem('junior-astronaut-chapter5-progress-v1')!)));
    await page.close();
  }
  expect(results[0]).toEqual(results[1]);
});

test('younger Mons Mouton planning avoids percentages', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
  await enterDirectory(page, '7-9');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Mons Mouton' }).click();
  await page.getByRole('button', { name: 'Begin Storm alert' }).click();
  await expect(page.getByText('Mons Mouton has rough ground. The longer walk back adds more radiation.')).toBeVisible();
  await expect(page.locator('#survival-site')).not.toContainText(/\d\s*%/);
});

test('younger what-if results use bars and no percentages', async ({ page }) => {
  await enterDirectory(page, '7-9');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Into the dark' }).click();
  for (let day = 1; day <= 5; day++) {
    await page.locator('[data-action="rest"]').click();
    if (day < 5) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
  }
  const comparison = page.getByRole('region', { name: /What if day/ });
  await comparison.getByRole('button', { name: 'Compare choices' }).click();
  await expect(comparison.locator('.survival-what-if-columns progress')).toHaveCount(8);
  await expect(comparison).not.toContainText(/\d\s*%/);
  await expect(comparison.getByRole('combobox')).toHaveCount(0);
});

test('what-if compares the same challenge and branches from the chosen morning', async ({ page }) => {
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Into the dark' }).click();
  for (let day = 1; day <= 5; day++) {
    await page.locator('[data-action="rest"]').click();
    if (day < 5) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
  }
  await page.locator('.survival-day-cards button').nth(2).click();
  const detail = page.getByRole('region', { name: 'Day details' });
  await detail.getByRole('button', { name: 'What if?' }).click();
  const comparison = page.getByRole('region', { name: 'What if day 3' });
  await comparison.getByRole('button', { name: 'Compare choices' }).click();
  await expect(comparison.getByRole('heading', { name: 'What you did' })).toBeVisible();
  await expect(comparison).toContainText('Same storms, same dark spell. Only Day 3 changed.');
  await expect(comparison.locator('.survival-what-if-columns section')).toHaveCount(2);
  await comparison.getByRole('button', { name: 'Try it for real from Day 3' }).click();
  await expect(page.getByRole('heading', { name: 'Into the dark' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Day 3 of 6' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('junior-astronaut-chapter5-progress-v1')!));
  expect(saved.attempts[0].choices).toHaveLength(5);
});

test('source catalog resolves a source displayed in the equator briefing', async ({ page }) => {
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the equator', exact: true }).click();
  const item = page.locator('[data-fact-id="power.equatorNight"]');
  const sourceKey = power.equatorNight.sources[0];
  await expect(item).toContainText(sourceKey);
  const source = await page.evaluate(async (key) => {
    const path = '/src/facts/sources.ts';
    const registry = await import(path);
    return registry.getSource(key);
  }, sourceKey);
  expect(source.key).toBe(sourceKey);
  expect(source.title).toBeTruthy();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
});

for (const age of ['7-9', '10-12'] as const) {
  test(`first training follows all five challenges and reaches the final debrief for ${age}`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const longText = new Set<string>();
    const audit = async () => {
      const facts = await page.evaluate(async () => {
        const path = '/src/data/chapter5/site.ts';
        const { factText } = await import(path);
        const profilePath = '/src/playerProfile.ts';
        const { getPlayerProfile } = await import(profilePath);
        return [...document.querySelectorAll<HTMLElement>('#survival-site [data-fact-id]')].map(element => ({ actual: element.querySelector('p')?.textContent, expected: factText(element.dataset.factId, getPlayerProfile().ageRange) }));
      });
      for (const fact of facts) expect(fact.actual).toBe(fact.expected);
      if (age === '7-9') {
        await expect(page.locator('#survival-site')).not.toContainText(/\d\s*%/);
        const long = await page.locator('#survival-site p').allTextContents();
        for (const text of long) if (text.split(/(?<!\d)[.!?](?!\d)/).filter(part => part.trim()).length > 2) longText.add(text);
      } else await expect(page.locator('[data-age-tip]')).toHaveCount(0);
    };
    if (age === '7-9') await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('Storage disabled'); }; });
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await audit();
    await page.getByRole('button', { name: 'Near the equator' }).click();
    await audit();
    await page.getByRole('button', { name: 'Back to site choice' }).click();
    await page.getByRole('button', { name: 'Near the south pole' }).click();
    await audit();
    await page.getByRole('button', { name: 'Choose Haworth' }).click();
    await expect(page.getByRole('button', { name: 'Begin Storm alert' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Begin Into the dark' }).click();
    await audit();
    await expect(page.locator('[data-age-tip]')).toHaveCount(age === '7-9' ? 1 : 0);
    await expect(page.getByRole('navigation', { name: 'Training progress' })).toContainText('Ice to air');
    for (let day = 1; day <= 6; day++) {
      await page.getByRole('combobox', { name: 'Make oxygen today (kg)' }).selectOption(day >= 5 ? '1' : '0');
      await page.locator(`[data-action="${day === 1 ? 'lab' : day >= 5 ? 'moonwalk' : 'rest'}"]`).click();
      await audit();
      if (day < 6) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
    }
    await page.getByRole('button', { name: 'Next challenge' }).click();
    await expect(page.getByRole('heading', { name: 'Plan Storm alert' })).toBeVisible();
    await page.getByRole('button', { name: 'Quiet Sun' }).click();
    await audit();
    await page.getByRole('button', { name: 'Start Storm alert' }).click();
    for (let day = 1; day <= 6; day++) {
      await page.getByRole('combobox', { name: 'Make oxygen today (kg)' }).selectOption(day >= 5 ? '1' : '0');
      await page.getByRole('button', { name: 'Rest', exact: true }).click();
      await audit();
    }
    await page.getByRole('button', { name: 'Next challenge' }).click();
    for (let day = 1; day <= 5; day++) { await page.getByRole('button', { name: /Lab science/ }).click(); await audit(); }
    await page.getByRole('button', { name: /Send data/ }).click();
    await audit();
    await page.getByRole('button', { name: 'Next challenge' }).click();
    for (let day = 1; day <= 6; day++) { await page.getByRole('button', { name: day <= 3 ? 'Run the grow lamps' : 'Rest', exact: true }).click(); await audit(); }
    await page.getByRole('button', { name: 'Next challenge' }).click();
    for (const action of ['Dig ice', 'Melt and split', 'Rest', 'Rest', 'Melt and split', 'Rest']) { await page.getByRole('button', { name: action, exact: true }).click(); await audit(); }
    await page.getByRole('button', { name: 'Next challenge' }).click();
    await expect(page.getByRole('heading', { name: 'Training debrief' })).toBeVisible();
    await audit();
    await page.getByRole('button', { name: 'Where our data comes from' }).click();
    await expect(page.getByRole('heading', { name: 'Where our data comes from' })).toBeVisible();
    await expect(page.getByText('This game was made by students, not by NASA.')).toBeVisible();
    await expect(page.locator('[data-source-key="SRC-006"] a')).toHaveAttribute('href', /DONKI/);
    await expect(page.locator('[data-source-key="SRC-R17B-04"]')).toHaveCount(1);
    await expect(page.locator('[data-fact-id="moonPlaces.malpertCliff"]')).toHaveCount(1);
    await expect(page.locator('[data-setting="baseUsePerDay"]')).toContainText('made up to make it playable');
    await expect(page.getByText(/Archived, not live:/)).toContainText('2024-05');
    await page.getByRole('button', { name: 'Back to training debrief' }).click();
    await expect(page.getByText('Science used energy.')).toBeVisible();
    if (age === '10-12') {
      await expect(page.getByText('Energy makes oxygen.')).toBeVisible();
      await page.getByRole('button', { name: '🔋' }).click();
      await expect(page.getByText(/Your recorded result:/)).toBeVisible();
    } else await expect(page.getByRole('button', { name: '🔋' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Choose a challenge to replay' }).click();
    await expect(page.getByRole('button', { name: 'Begin Fresh food' })).toBeVisible();
    if (age === '10-12') {
      await page.reload();
      await page.getByRole('button', { name: 'Skip' }).click();
      await page.locator(`input[name="ageRange"][value="${age}"]`).check();
      await page.getByRole('button', { name: 'Continue to missions' }).click();
      await page.locator('[data-chapter="survival"]').click();
      await page.getByRole('button', { name: 'Near the south pole' }).click();
      await page.getByRole('button', { name: 'Choose Haworth' }).click();
      await expect(page.getByRole('button', { name: 'Begin Ice to air' })).toBeVisible();
    }
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
    await expect(page.locator('[data-chapter="survival"]')).toBeVisible();
    expect(errors).toEqual([]);
    if (age === '7-9') {
      await test.info().attach('young-text-over-two-sentences', { body: JSON.stringify([...longText], null, 2), contentType: 'application/json' });
    }
  });
}

test('Ice to air digs and splits oxygen through a six-day challenge', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Ice to air' }).click();
  await expect(page.getByRole('list', { name: 'Example light pattern' })).toContainText('Day 3: dark');
  await expect(page.getByText(/Haworth had the most ice-friendly ground/)).toBeVisible();
  for (const action of ['Dig ice', 'Melt and split', 'Rest', 'Rest', 'Melt and split', 'Rest']) {
    await page.getByRole('button', { name: action, exact: true }).click();
  }
  await expect(page.getByText('Challenge complete!')).toBeVisible();
  await page.getByRole('button', { name: 'Back to challenges' }).click();
});

test('Fresh food compares the plant harvest with the crew food use', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Fresh food' }).click();
  for (let day = 1; day <= 6; day++) {
    await page.getByRole('button', { name: day <= 3 ? 'Run the grow lamps' : 'Rest', exact: true }).click();
  }
  await expect(page.getByText('Challenge complete!')).toBeVisible();
  await expect(page.getByText(/plants grew 93.6 g/)).toBeVisible();
  await expect(page.locator('[data-fact-id="food.cropAreaFullDiet"]')).toBeVisible();
  await page.getByRole('button', { name: 'Back to challenges' }).click();
});

test('Can you hear us sends science on a contact day', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Can you hear us?' }).click();
  await expect(page.getByRole('list', { name: 'Earth contact timeline' })).toContainText('Day 6: Earth in view');
  for (let day = 1; day <= 5; day++) await page.getByRole('button', { name: /Lab science/ }).click();
  await page.getByRole('button', { name: /Send data/ }).click();
  await expect(page.getByText(/Data sent to Earth: 5/)).toBeVisible();
  await expect(page.getByText(/Science goal reached/)).toBeVisible();
  await page.getByRole('button', { name: 'Back to challenges' }).click();
});

test('Storm alert planning and quiet challenge reach the debrief', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
  await enterDirectory(page, '10-12');
  await page.locator('[data-chapter="survival"]').click();
  await page.getByRole('button', { name: 'Near the south pole' }).click();
  await page.getByRole('button', { name: 'Choose Haworth' }).click();
  await page.getByRole('button', { name: 'Begin Storm alert' }).click();
  await page.getByRole('button', { name: 'Quiet Sun' }).click();
  await expect(page.getByText(/Predicted cosmic rays: 5.4 mSv/)).toBeVisible();
  await page.getByRole('button', { name: 'Start Storm alert' }).click();
  for (let day = 1; day <= 6; day++) {
    await expect(page.getByText(`Day ${day} of 6. Shelter built.`)).toBeVisible();
    await page.getByRole('combobox', { name: 'Make oxygen today (kg)' }).selectOption(day >= 5 ? '1' : '0');
    await page.getByRole('button', { name: 'Rest', exact: true }).click();
  }
  await expect(page.getByText('Challenge complete!')).toBeVisible();
  await expect(page.getByText(/Debrief: planned cosmic dose/)).toBeVisible();
  await page.getByRole('button', { name: 'Back to challenges' }).click();
});

test('P8 archived storm rules load in the game without changing Survival navigation', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="survival"]').click();
  const data = await page.evaluate(async () => {
    const dataPath = '/src/data/chapter5/storms.ts';
    const rulesPath = '/src/rules/chapter5/storms.ts';
    const { stormArchive } = await import(dataPath);
    const { scheduleAlerts, stormImpact } = await import(rulesPath);
    const schedule = scheduleAlerts(stormArchive.months[0], 6, 42);
    return { months: stormArchive.months.length, hasUnknown: schedule.some((entry: { kind: string }) => entry.kind === 'unknown'), dose: stormImpact('S4', true, false).dose };
  });
  expect(data).toEqual({ months: 2, hasUnknown: true, dose: 150 });
  await expect(page.getByRole('heading', { name: 'Where will you train?' })).toBeVisible();
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
});

test('Survival loads its fact adapter and returns to the directory', async ({ page }) => {
  await enterDirectory(page);
  await page.locator('[data-chapter="survival"]').click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'survival');
  await expect(page.locator('#chapter-label')).toHaveText('Survival');
  // Keep P1's browser import and attribution checks alongside the P2 screen.
  const facts = await page.evaluate(async () => {
    const modulePath = '/src/data/chapter5/facts.ts';
    const { chapter5Facts } = await import(modulePath);
    return {
      oxygen: chapter5Facts['lifeSupport.oxygenPerDay'],
      food: chapter5Facts['food.plantPower'],
      unresolved: chapter5Facts['food.gramsPerWh'],
    };
  });
  expect(facts.oxygen.unit).toBe('kg per astronaut per day');
  expect(facts.oxygen.young).toBeTruthy();
  expect(facts.oxygen.older).toBeTruthy();
  expect(facts.oxygen.sources).not.toEqual([]);
  expect(facts.food.unit).toBe('kW per m²');
  expect(facts.unresolved).toBeUndefined();
  await expect(page.locator('#game-container canvas')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Where will you train?' })).toBeVisible();
  await expect(page.getByRole('button', { name: /scientific research|make oxygen|save water/i })).toHaveCount(0);
  await page.getByRole('button', { name: 'All missions' }).click();
  await expect(page.locator('#app')).toHaveAttribute('data-active-scene', 'menu');
  await expect(page.locator('#home')).toBeVisible();
  await expect(page.locator('#survival-site')).toHaveCount(0);
});

for (const age of ['7-9', '10-12'] as const) {
  test(`decision log opens and closes without changing the challenge for ${age}`, async ({ page }) => {
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole', exact: true }).click();
    await page.getByRole('button', { name: 'Choose Haworth', exact: true }).click();
    await page.getByRole('button', { name: 'Begin Into the dark' }).click();
    await page.locator('[data-action="lab"]').click();
    const sidebar = page.getByRole('complementary', { name: 'Challenge resources' });
    const before = await sidebar.innerText();
    const button = page.getByRole('button', { name: '💡 Log' });
    await button.click();
    const log = page.getByRole('region', { name: 'Decision log' });
    await expect(log).toContainText('Day 1');
    await expect(log).toContainText('Lab science');
    if (age === '10-12') await expect(log).toContainText('15 kWh');
    await button.click();
    await expect(log).toBeHidden();
    expect(await sidebar.innerText()).toBe(before);
    await expect(page.getByRole('heading', { name: 'Day 1 results' })).toBeVisible();
  });
  test(`Into the dark plays six days and reaches the debrief for age ${age}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('junior-astronaut-chapter5-progress-v1', 'complete'));
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole', exact: true }).click();
    await page.getByRole('button', { name: 'Choose Haworth', exact: true }).click();
    await page.getByRole('button', { name: 'Begin Into the dark' }).click();
    await expect(page.getByRole('heading', { name: 'Into the dark' })).toBeVisible();
    await expect(page.getByText('An example, not a forecast.', { exact: false })).toBeVisible();
    const sidebar = page.getByRole('complementary', { name: 'Challenge resources' });
    await expect(sidebar.locator('.survival-gauge')).toHaveCount(3);
    for (const day of [1, 2, 3, 4, 5, 6]) {
      await expect(page.getByRole('heading', { name: `Day ${day} of 6` })).toBeVisible();
      await page.getByRole('combobox', { name: 'Make oxygen today (kg)' }).selectOption(day >= 5 ? '1' : '0');
      await page.locator(`[data-action="${day === 1 ? 'lab' : day >= 5 ? 'moonwalk' : 'rest'}"]`).click();
      await expect(page.getByRole('heading', { name: `Day ${day} results` })).toBeVisible();
      await expect(page.locator('[data-gauge="energy"]')).toContainText('because');
      await expect(page.locator('[data-gauge="air"]')).toContainText('because');
      await expect(page.locator('[data-gauge="dose"]')).toContainText('training example');
      if (day < 6) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
    }
    await expect(page.getByRole('heading', { name: 'Challenge complete!' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Challenge debrief' })).toBeVisible();
    await expect(page.getByText(/★/)).toBeVisible();
    const cards = page.locator('.survival-day-cards button');
    if (age === '10-12') {
      await expect(cards).toHaveCount(6);
      await cards.first().click();
      await expect(page.getByRole('heading', { name: 'What did I do?' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'What could I try?' })).toBeVisible();
    } else await expect(cards).toHaveCount(0);
    await expect(page.getByText('Science reached: 5 of 5 points.')).toBeVisible();
    await page.getByRole('button', { name: 'Back to challenges' }).click();
    await expect(page.getByRole('heading', { name: 'Choose a training challenge' })).toBeVisible();
    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#survival-site')).toHaveCount(0);
  });

  test(`Into the dark safely ends and retries from day 5 for age ${age}`, async ({ page }) => {
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole', exact: true }).click();
    await page.getByRole('button', { name: 'Choose Haworth', exact: true }).click();
    await page.getByRole('button', { name: 'Begin Into the dark' }).click();
    for (const day of [1, 2, 3, 4, 5]) {
      await page.locator('[data-action="rest"]').click();
      if (day < 5) await page.getByRole('button', { name: `Continue to day ${day + 1}` }).click();
    }
    await expect(page.getByRole('heading', { name: 'Mission ended early: the crew flew home before the air ran out.' })).toBeVisible();
    await expect(page.getByText(/because 2 astronauts needed/)).toBeVisible();
    await page.getByRole('button', { name: 'Try again from day 5' }).click();
    await expect(page.getByRole('heading', { name: 'Day 5 of 6' })).toBeVisible();
    await page.getByRole('combobox', { name: 'Make oxygen today (kg)' }).selectOption('1');
    await page.locator('[data-action="rest"]').click();
    await expect(page.getByRole('heading', { name: 'Day 5 results' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue to day 6' }).click();
    await expect(page.getByRole('heading', { name: 'Day 6 of 6' })).toBeVisible();
  });

  test(`P4 sidebar renders only its configured gauges for ${age}`, async ({ page }) => {
    await enterDirectory(page, age);
    // Component fixture only: P5 will provide actual challenge data and mounting.
    const mount = async (alternate: boolean) => page.evaluate(async ({ alternate }) => {
      const sidebarPath = '/src/game/chapters/survival/sidebar.ts';
      const profilePath = '/src/playerProfile.ts';
      const { renderSidebar } = await import(sidebarPath);
      const { getPlayerProfile } = await import(profilePath);
      document.querySelector<HTMLElement>('#app')!.hidden = true;
      let host = document.querySelector<HTMLElement>('#sidebar-fixture');
      if (!host) { host = document.createElement('main'); host.id = 'sidebar-fixture'; document.body.append(host); }
      const challenge = alternate
        ? { main: ['food', 'water'], extra: 'data', scienceGoal: 5 }
        : { main: ['energy', 'air'], extra: 'dose', scienceGoal: 5 };
      renderSidebar(host, challenge, {
        energy: { value: 120, capacity: 200 }, air: { value: 8, capacity: 10 }, dose: { value: 1, capacity: 10 },
        food: { value: 18, capacity: 20 }, water: { value: 25, capacity: 30 }, data: { value: 3, capacity: 10 },
      }, alternate ? 5 : 2, getPlayerProfile().ageRange, 2);
    }, { alternate });
    await mount(false);
    const sidebar = page.getByRole('complementary', { name: 'Challenge resources' });
    await expect(sidebar).toBeVisible();
    await expect(sidebar.locator('.survival-gauge')).toHaveCount(3);
    await expect(sidebar.locator('.main')).toHaveCount(2);
    await expect(sidebar.locator('.extra')).toHaveCount(1);
    await expect(sidebar.locator('[data-resource="food"]')).toHaveCount(0);
    await expect(sidebar.locator('[data-resource="air"] p')).toHaveText(age === '7-9' ? '5 days left' : '8 kg of oxygen · 5 days left');
    await expect(sidebar.locator('[data-resource="energy"] p')).toHaveText(age === '7-9' ? 'Available' : '120 kWh · Available');
    await expect(sidebar.getByRole('progressbar', { name: 'Science goal', exact: true })).toHaveAttribute('value', '2');
    expect(await sidebar.locator('.main progress').first().evaluate((bar) => bar.getBoundingClientRect().height)).toBeGreaterThan(await sidebar.locator('.extra progress').evaluate((bar) => bar.getBoundingClientRect().height));
    await mount(true);
    await expect(page.locator('.survival-sidebar')).toHaveCount(1);
    await expect(sidebar.locator('.survival-gauge')).toHaveCount(3);
    await expect(sidebar.locator('[data-resource="energy"]')).toHaveCount(0);
    await expect(sidebar.locator('[data-resource="food"] p')).toHaveText(age === '7-9' ? '5 days left' : '18 kg · 5 days left');
    await expect(sidebar.getByRole('progressbar', { name: 'Science goal', exact: true })).toHaveAttribute('value', '5');
    await expect(sidebar.locator('.survival-science-goal p')).toHaveText(age === '7-9' ? 'Goal reached!' : '5 / 5 science points');
    await expect(sidebar.locator('.survival-science-goal')).not.toHaveClass(/survival-gauge/);
  });

  test(`site choice and both routes work for age ${age}`, async ({ page }) => {
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the equator', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Why look beyond the equator?' })).toBeVisible();
    for (const fact of [power.equatorNight, power.nightCold, power.batteriesForNight]) {
      const item = page.locator(`[data-fact-id="${fact.id}"]`);
      await expect(item.locator('p')).toHaveText(age === '7-9' ? fact.young : fact.older);
      for (const source of fact.sources) await expect(item).toContainText(source);
    }
    await expect(page.getByText("NASA is looking at the south pole instead. Let's go there!", { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose a south pole region' })).toHaveCount(0);
    await expect(page.locator('#survival-site button')).toHaveCount(1);
    await page.getByRole('button', { name: 'Back to site choice' }).click();
    const south = page.getByRole('button', { name: 'Near the south pole', exact: true });
    await expect(south).toHaveAttribute('data-recommended', 'true');
    await expect(south).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: 'Choose a south pole region' })).toBeVisible();
    await expect(page.locator('.survival-region-card')).toHaveCount(4);

    await page.getByRole('button', { name: 'All missions' }).click();
    await expect(page.locator('#survival-site')).toHaveCount(0);
    await page.locator('[data-chapter="survival"]').click();
    await expect(page.getByRole('heading', { name: 'Where will you train?' })).toBeVisible();
    await expect(south).not.toHaveAttribute('data-recommended', 'true');
    await south.click();
    await expect(page.getByRole('heading', { name: 'Choose a south pole region' })).toBeVisible();
    await expect(page.locator('[data-fact-id="power.equatorNight"]')).toHaveCount(0);
  });

  test(`each south pole region reaches challenge selection for age ${age}`, async ({ page }) => {
    await enterDirectory(page, age);
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole', exact: true }).click();
    await expect(page.getByText('Check before using: no final landing site has been chosen.')).toBeVisible();
    await expect(page.locator('.survival-light-note')).toContainText('Every region uses the same light pattern');
    for (const region of regions) {
      const card = page.getByRole('article', { name: region.name, exact: true });
      await expect(card.getByText('Picture coming soon')).toBeVisible();
      for (const id of region.factIds) {
        const fact = chapter5Facts[id];
        const displayed = card.locator(`[data-fact-id="${id}"]`);
        const expected = age === '7-9' && id === 'moonPlaces.iceFriendlyGround'
          ? '🔭 One study found Haworth had the most ice-friendly ground of the regions it compared.'
          : age === '7-9' ? fact.young : fact.older;
        await expect(displayed.locator('p')).toHaveText(expected);
        await expect(displayed.locator('strong')).toHaveText(LABEL_WORDS[fact.label]);
      }
      if (region.id === 'nobile-rim-2') {
        await expect(card.getByText('This study describes one spot, not the whole region.')).toBeVisible();
      }
      await card.getByRole('button', { name: `Choose ${region.name}`, exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Choose a training challenge' })).toBeVisible();
      await expect(page.getByText(`Chosen region: ${region.name}`, { exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Begin Into the dark' })).toBeVisible();
      await page.getByRole('button', { name: 'Back to regions' }).click();
      await expect(card.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: 'All missions' }).click();
    await page.locator('[data-chapter="survival"]').click();
    await page.getByRole('button', { name: 'Near the south pole', exact: true }).click();
    await expect(page.locator('.survival-region-card button[aria-pressed="true"]')).toHaveCount(0);
  });
}
