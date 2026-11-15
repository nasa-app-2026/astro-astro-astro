import { describe, expect, it } from 'vitest';
import { allFacts, lifeSupport, moonPlaces, radiation, storms } from './index';
import { food } from './food';

describe('facts catalog after moving into src', () => {
  it('keeps the updated catalogs as well-formed, uniquely identified facts', () => {
    for (const catalog of [food, radiation, moonPlaces]) {
      const facts = Object.values(catalog);
      expect(new Set(facts.map((fact) => fact.id)).size).toBe(facts.length);
      for (const fact of facts) {
        expect(fact.id).toBeTruthy();
        expect(fact.sources.length).toBeGreaterThan(0);
        expect(fact.young).toBeTruthy();
        expect(fact.older).toBeTruthy();
      }
    }
    expect(radiation.artemis1ShieldingVariation.sources).toContain('SRC-R04-04');
    expect(radiation.doseQuietSun.value).toBe(0.9);
    expect(radiation.doseBusySun.value).toBe(0.4);
    expect(radiation.shelterMass.range).toEqual([1.3, 1.6]);
    expect(food.gramsPerKwh.unit).toBe('grams per kWh');
    expect(radiation.artemis2DosesNotOut.older).not.toContain('alert levels');
  });
  it('keeps the chapter facts importable with their source metadata', () => {
    expect(allFacts).toContain(lifeSupport.oxygenPerDay);
    expect(allFacts).toContain(radiation.careerLimit);
    expect(allFacts).toContain(storms.august1972);
    expect(food).toBeDefined();
    expect(allFacts.every((fact) => fact.id && fact.sources.length > 0 && fact.credit)).toBe(true);
  });
});
