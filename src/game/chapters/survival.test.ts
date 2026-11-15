import { describe, expect, it } from 'vitest';
import { chapters } from './catalog';

describe('Survival chapter reset', () => {
  it('keeps Chapter 5 directly addressable while its gameplay is being rebuilt', () => {
    const survival = chapters.find((chapter) => chapter.id === 'survival');
    expect(survival?.number).toBe(5);
    expect(survival?.title).toBe('Survival');
  });
});
