import { describe, expect, it } from 'vitest';
import { chapters } from './game/chapters/catalog';
import { missionDirectory } from './missionDirectory';

describe('mission directory', () => {
  it('offers every registered chapter as a distinct, named choice immediately', () => {
    const entries = missionDirectory(chapters);
    expect(entries).toHaveLength(6);
    expect(entries[0].chapter.id).toBe('survival');
    expect(new Set(entries.map(({ chapter }) => chapter.id))).toEqual(new Set(chapters.map(({ id }) => id)));
    expect(new Set(entries.map(({ accessibleName }) => accessibleName)).size).toBe(6);
    expect(entries.every(({ chapter, accessibleName }) => accessibleName.includes(chapter.title))).toBe(true);
    expect(entries.every(({ accessibleName }) => !/\bMISSION\s*\d+/i.test(accessibleName))).toBe(true);
  });

  it('shuffles the other chapters without changing the catalog', () => {
    const original = chapters.map(({ id }) => id);
    const first = missionDirectory(chapters, () => 0).map(({ chapter }) => chapter.id);
    const second = missionDirectory(chapters, () => 0.999).map(({ chapter }) => chapter.id);
    expect(first[0]).toBe('survival');
    expect(second[0]).toBe('survival');
    expect(first).not.toEqual(second);
    expect(chapters.map(({ id }) => id)).toEqual(original);
  });
});
