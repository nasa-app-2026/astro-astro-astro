import { describe, expect, it } from 'vitest';
import { chapters } from './catalog';
import { chapter5Facts } from '../../data/chapter5/facts';
import { allFacts, lifeSupport } from '../../facts';
import { food } from '../../facts/food';
import type { Fact } from '../../facts/types';
import { equatorBriefing, factText } from '../../data/chapter5/site';
import { power } from '../../facts/power';
import { regions } from '../../data/chapter5/regions';
import { initialChapter5State, chooseRegion } from '../../rules/chapter5/state';
import { settings, hoursPerDay } from '../../data/chapter5/settings';
import { gaugeModel } from '../../rules/chapter5/gauges';
import type { ResourceId } from '../../data/chapter5/gauges';
import { intoTheDark } from '../../data/chapter5/challenges/into-the-dark';
import { advanceIntoTheDark, isDark, replayToMorning, startIntoTheDark } from '../../rules/chapter5/into-the-dark';
import { linkEnergyProblem } from '../../rules/chapter5/log';

it('records decisions and links the largest earlier energy costs to a later low-energy day', () => {
  let state = startIntoTheDark();
  state = advanceIntoTheDark(state, { oxygenKg: 2, action: 'lab' });
  state = advanceIntoTheDark(state, { oxygenKg: 0, action: 'rest' });
  state = advanceIntoTheDark(state, { oxygenKg: 0, action: 'lab' });
  expect(state.log[0]).toMatchObject({ day: 1, actionEnergy: 15, oxygenEnergy: 28, decision: { oxygenKg: 2, action: 'lab' } });
  expect(state.log[0].changes).toHaveLength(3);
  const linked = linkEnergyProblem(state.log, 3);
  expect(linked[0].links).toContainEqual({ day: 3, resource: 'energy' });
  expect(linked[1].links).toEqual([]);
  expect(state.log[0].links).toEqual([]);
});

describe('Into the dark challenge', () => {
  it('uses a two-day dark example and labels the quiet dose as a training assumption', () => {
    expect(intoTheDark.darkDays).toEqual([3, 4]);
    expect(intoTheDark.gauges).toMatchObject({ main: ['energy', 'air'], extra: 'dose', scienceGoal: 5 });
    expect(isDark(3)).toBe(true);
    expect(isDark(4)).toBe(true);
    expect(isDark(2)).toBe(false);
    expect(settings.quietDosePerDay).toBe(0.9);
  });

  it('accounts for breathing, oxygen making, solar input, heating, and action cost with reasons', () => {
    const first = advanceIntoTheDark(startIntoTheDark(), { oxygenKg: 1, action: 'lab' });
    expect(first).toMatchObject({ day: 2, energy: 113, air: 7.4, dose: 0.9, science: 1 });
    const [energy, air, dose] = first.lastResult!.changes;
    expect(energy.because).toContain('solar added 50 kWh');
    expect(energy.because).toContain('oxygen making used 14 kWh');
    expect(air.because).toContain('2 astronauts each breathe 0.8 kg');
    expect(dose.because).toContain('not a sourced Moon dose');
    expect(first.lastResult!.scienceBecause).toContain('because');
    const second = advanceIntoTheDark(first, { oxygenKg: 0, action: 'rest' });
    const third = advanceIntoTheDark(second, { oxygenKg: 0, action: 'rest' });
    expect(third.energy).toBe(71);
    expect(third.lastResult!.changes[0].because).toContain('dark-day heating used 36 kWh');
    expect(third.lastResult!.scienceBecause).toContain('costs a day of possible science');
  });

  it('completes a careful six-day script and ends a no-oxygen script safely', () => {
    let careful = startIntoTheDark();
    for (const decision of [
      { oxygenKg: 0, action: 'lab' }, { oxygenKg: 0, action: 'rest' },
      { oxygenKg: 0, action: 'rest' }, { oxygenKg: 0, action: 'rest' },
      { oxygenKg: 1, action: 'moonwalk' }, { oxygenKg: 1, action: 'moonwalk' },
    ] as const) careful = advanceIntoTheDark(careful, decision);
    expect(careful).toMatchObject({ day: 7, energy: 17, air: 0.4, science: 5, ending: 'complete' });
    expect(careful.history).toHaveLength(6);

    let lazy = startIntoTheDark();
    while (!lazy.ending) lazy = advanceIntoTheDark(lazy, { oxygenKg: 0, action: 'rest' });
    expect(lazy.ending).toBe('air');
    expect(lazy.lastResult!.day).toBe(5);
    expect(lazy.lastResult!.endingBecause).toContain('because');
  });

  it('rebuilds a retry morning by replaying decisions and rejects invalid choices', () => {
    let state = startIntoTheDark();
    state = advanceIntoTheDark(state, { oxygenKg: 0, action: 'lab' });
    state = advanceIntoTheDark(state, { oxygenKg: 1, action: 'rest' });
    const morning = replayToMorning(state.history, 3);
    expect(morning).toEqual({ ...state, lastResult: null });
    expect(replayToMorning([...state.history, { day: 3, decision: { oxygenKg: 2, action: 'lab' } }], 3)).toEqual(morning);
    expect(() => advanceIntoTheDark(morning, { oxygenKg: 3, action: 'rest' })).toThrow('Invalid oxygen');
  });

  it('ends safely when energy reaches zero and preserves an exact retry morning', () => {
    let state = startIntoTheDark();
    for (let day = 1; day <= 3; day++) state = advanceIntoTheDark(state, { oxygenKg: 2, action: 'lab' });
    expect(state.ending).toBe('energy');
    expect(state.energy).toBe(0);
    expect(state.lastResult!.endingBecause).toContain('because');
    const morning = replayToMorning(state.history, 3);
    expect(morning.day).toBe(3);
    expect(morning.energy).toBe(78);
    expect(morning.ending).toBeNull();
  });
});

describe('Survival chapter reset', () => {
  it('keeps Chapter 5 directly addressable while its gameplay is being rebuilt', () => {
    const survival = chapters.find((chapter) => chapter.id === 'survival');
    expect(survival?.number).toBe(5);
    expect(survival?.title).toBe('Survival');
  });
});

describe('P4 settings and gauge text', () => {
  it('keeps requested energy costs and converts the heating fact from kW to kWh', () => {
    expect(settings).toMatchObject({ baseUsePerDay: 28, solarPerSunnyDay: 50, labScienceCost: 15, moonwalkCost: 10 });
    expect(power.emptyBaseHeating.unit).toBe('kW');
    expect(settings.extraHeatingPerDarkDay).toBe(power.emptyBaseHeating.value * hoursPerDay);
    expect(settings.extraHeatingPerDarkDay).toBe(36);
  });

  it.each([
    ['energy', 120, 200, 'Available', '120 kWh'],
    ['air', 8, 10, '5 days left', '8 kg of oxygen'],
    ['dose', 1, 10, 'Low', '1 mSv'],
    ['food', 18, 20, '5 days left', '18 kg'],
    ['water', 25, 30, 'Available', '25 litres'],
    ['data', 3, 10, 'Waiting to send', '3 points'],
  ] as const)('formats %s for both age modes without changing its bar', (id, value, capacity, youngText, olderAmount) => {
    const young = gaugeModel(id, { value, capacity }, '7-9', 2);
    const older = gaugeModel(id, { value, capacity }, '10-12', 2);
    expect(young.text).toBe(youngText);
    expect(older.text).toBe(`${olderAmount} · ${youngText}`);
    expect(older.fraction).toBe(young.fraction);
  });

  it('calculates supply duration from the crew and facts, and rounds down', () => {
    const air = lifeSupport.oxygenPerDay.value * 3 * 2.56;
    expect(gaugeModel('air', { value: air, capacity: 10 }, '7-9', 3).text).toBe('2.5 days left');
    const packedFood = food.packedFoodPerDay.value * 3 * 2;
    expect(gaugeModel('food', { value: packedFood, capacity: 20 }, null, 3).text).toBe('2 days left');
    expect(gaugeModel('air', { value: 0.01, capacity: 10 }, '7-9', 2).text).toBe('Less than a day left');
  });

  it('clamps bars while preserving an above-capacity amount and rejects invalid inputs', () => {
    expect(gaugeModel('energy', { value: 220, capacity: 200 }, '10-12', 2)).toMatchObject({ fraction: 1, text: '220 kWh · Available' });
    expect(gaugeModel('air', { value: -1, capacity: 10 }, '7-9', 2)).toMatchObject({ fraction: 0, text: '0 days left' });
    expect(gaugeModel('dose', { value: 9, capacity: 10 }, '7-9', 2).text).toBe('High');
    expect(gaugeModel('data', { value: 0, capacity: 10 }, '7-9', 2).text).toBe('Nothing queued');
    for (const id of ['air', 'food'] as ResourceId[]) {
      expect(() => gaugeModel(id, { value: 1, capacity: 0 }, '7-9', 2)).toThrow();
      expect(() => gaugeModel(id, { value: NaN, capacity: 10 }, '7-9', 2)).toThrow();
      expect(() => gaugeModel(id, { value: 1, capacity: 10 }, '7-9', 0)).toThrow();
    }
  });
});

describe('Survival equator briefing', () => {
  it.each(['7-9', '10-12'] as const)('uses the three required facts and %s wording', (age) => {
    const briefing = equatorBriefing(age);
    expect(briefing.map((entry) => entry.id)).toEqual([
      'power.equatorNight', 'power.nightCold', 'power.batteriesForNight',
    ]);
    const expectedFacts = [power.equatorNight, power.nightCold, power.batteriesForNight];
    expect(briefing.map((entry) => entry.text)).toEqual(expectedFacts.map((fact) => age === '7-9' ? fact.young : fact.older));
    expect(briefing.map((entry) => entry.sources)).toEqual(expectedFacts.map((fact) => fact.sources));
  });

  it('uses simpler wording before an age has been selected', () => {
    expect(factText('power.equatorNight', null)).toBe(power.equatorNight.young);
  });
});

describe('Chapter 5 fact adapter', () => {
  it('retains the original catalog objects and their attribution for every dependency', () => {
    const catalog: readonly Fact[] = [...allFacts, ...Object.values(food)];
    for (const [id, fact] of Object.entries(chapter5Facts)) {
      expect(fact).toBe(catalog.find((entry) => entry.id === id));
      expect(fact.young.trim()).not.toBe('');
      expect(fact.older.trim()).not.toBe('');
      expect(fact.sources).not.toEqual([]);
      expect(fact.label).toBeTruthy();
    }
  });

  it('keeps oxygen consumption, production energy and minimum ranges distinct', () => {
    expect(chapter5Facts['lifeSupport.oxygenPerDay']).toBe(lifeSupport.oxygenPerDay);
    expect(chapter5Facts['lifeSupport.oxygenPerDay'].unit).toBe('kg per astronaut per day');
    expect(chapter5Facts['lifeSupport.oxygenEnergyModel']).toBe(lifeSupport.oxygenEnergyModel);
    expect(chapter5Facts['lifeSupport.oxygenEnergyModel'].unit).toBe('kWh per kg');
    expect(chapter5Facts['lifeSupport.oxygenEnergyMinimum'].range).toBe(lifeSupport.oxygenEnergyMinimum.range);
    expect(chapter5Facts['lifeSupport.oxygenEnergyMinimum']).not.toHaveProperty('value');
  });

  it('includes direct food imports without inventing missing facts or numeric values', () => {
    expect(chapter5Facts['food.plantPower']).toBe(food.plantPower);
    expect(chapter5Facts['food.plantPower'].unit).toBe('kW per m²');
    expect(chapter5Facts['food.leaf']).not.toHaveProperty('value');
    expect(Object.keys(chapter5Facts)).not.toContain('food.gramsPerWh');
    expect(Object.keys(chapter5Facts)).not.toContain('radiation.radiation.shelter');
    expect(Object.keys(chapter5Facts)).not.toContain('moonPlaces.mapertEarthView');
  });
});

describe('South pole regions', () => {
  it('references existing source facts for every card and named training effect', () => {
    for (const region of regions) {
      for (const id of [...region.factIds, region.effect.basedOn]) {
        expect(allFacts.some((fact) => fact.id === id)).toBe(true);
        expect(chapter5Facts[id].id).toBe(id);
      }
      expect(region.effect.name).not.toBe('');
      expect(region.effect.rule).toBeTruthy();
    }
  });

  it('stores each region without changing the previous state or applying effects', () => {
    const initial = initialChapter5State();
    for (const region of regions) {
      const selected = chooseRegion(initial, region.id);
      expect(selected).toEqual({ chosenRegion: region.id });
      expect(initial.chosenRegion).toBeNull();
    }
    expect(initialChapter5State().chosenRegion).toBeNull();
  });
});
