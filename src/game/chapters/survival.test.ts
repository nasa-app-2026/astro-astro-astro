import { describe, expect, it } from 'vitest';
import { newMission, takeDay } from './survival/game';

describe('Survival mission', () => {
  it('uses daily resources and awards research', () => {
    const m = newMission(() => 0);
    const next = takeDay(m, 'research');
    expect(next.day).toBe(2);
    expect(next.research).toBe(1);
    expect(next.oxygen).toBeCloseTo(10.4);
    expect(next.water).toBe(20);
    expect(next.power).toBe(407);
  });
  it('halves storm dose when the crew shelters', () => {
    const m = newMission(() => 0);
    const storm = m.storms[0];
    const before = { ...m, day: storm.day, storms: [{ ...storm, falseAlarm: false }], sheltered: true };
    const next = takeDay(before, 'shelter');
    expect(next.radiation).toBeCloseTo(1.1 + storm.event.lunarDose.value! / 2);
  });
});
