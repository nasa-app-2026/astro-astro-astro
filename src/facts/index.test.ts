import { describe, expect, it } from 'vitest';
import { allFacts, lifeSupport, radiation, storms } from './index';
import { food } from './food';

describe('facts catalog after moving into src', () => {
  it('keeps the chapter facts importable with their source metadata', () => {
    expect(allFacts).toContain(lifeSupport.oxygenPerDay);
    expect(allFacts).toContain(radiation.careerLimit);
    expect(allFacts).toContain(storms.august1972);
    expect(food).toBeDefined();
    expect(allFacts.every((fact) => fact.id && fact.sources.length > 0 && fact.credit)).toBe(true);
  });
});
