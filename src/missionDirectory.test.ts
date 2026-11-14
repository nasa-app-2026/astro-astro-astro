import { describe, expect, it } from 'vitest';
import { chapters } from './game/chapters/catalog';
import { missionDirectory } from './missionDirectory';

describe('mission directory', () => {
  it('offers every registered chapter as a distinct, named choice immediately', () => {
    const entries = missionDirectory(chapters);
    expect(entries).toHaveLength(7);
    expect(entries.map(({ chapter }) => chapter.id)).toEqual(chapters.map(({ id }) => id));
    expect(new Set(entries.map(({ accessibleName }) => accessibleName)).size).toBe(7);
    expect(entries.every(({ chapter, accessibleName }) => accessibleName.includes(chapter.title))).toBe(true);
  });
});
