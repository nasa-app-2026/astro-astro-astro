import { describe, expect, it } from 'vitest';
import { chapters } from './catalog';

describe('chapter catalog', () => {
  it('defines six ordered, independently addressable missions', () => {
    expect(chapters).toHaveLength(6);
    expect(chapters.map((chapter) => chapter.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(new Set(chapters.map((chapter) => chapter.id)).size).toBe(6);
    expect(chapters.every((chapter) => chapter.title && chapter.stage && chapter.summary)).toBe(true);
  });

  it('keeps each mission focused on two or three of the five resource areas', () => {
    const areas = new Set(['Life support', 'Radiation', 'Power', 'Food', 'Communication']);
    for (const chapter of chapters) {
      expect(chapter.focus.length).toBeGreaterThanOrEqual(2);
      expect(chapter.focus.length).toBeLessThanOrEqual(3);
      expect(chapter.focus.every((focus) => areas.has(focus))).toBe(true);
    }
    expect(new Set(chapters.flatMap((chapter) => chapter.focus))).toEqual(areas);
  });

  it('provides player-facing, unnumbered briefings for every playable mission', () => {
    for (const chapter of chapters) {
      expect(chapter.briefing.length).toBeGreaterThan(30);
      expect(chapter.story.length).toBeGreaterThanOrEqual(2);
      expect(chapter.story.every((fact) => fact.length > 30)).toBe(true);
      expect(chapter.challenge.length).toBeGreaterThan(30);
      expect(`${chapter.briefing} ${chapter.story.join(' ')} ${chapter.challenge}`).not.toMatch(/chapter\s*\d+|stage\s*\d+/i);
    }
  });
});
