import { describe, expect, it } from 'vitest';
import { getPlayerProfile, setAgeRange } from './playerProfile';

describe('shared player profile', () => {
  it('makes the selected age available to every chapter without replacing existing snapshots', () => {
    const before = getPlayerProfile();
    setAgeRange('7-9');
    expect(getPlayerProfile().ageRange).toBe('7-9');
    setAgeRange('10-12');
    expect(getPlayerProfile().ageRange).toBe('10-12');
    expect(before).not.toBe(getPlayerProfile());
  });
});
