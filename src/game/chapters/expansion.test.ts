import { describe, expect, it } from 'vitest';
import { isExpansionGameplayActive } from './expansion/mission';
import { getExpansionResourceState } from './expansion/visuals';

describe('Expansion mission briefing', () => {
    it('keeps the mission simulation paused until the briefing is dismissed', () => {
        expect(isExpansionGameplayActive('intro')).toBe(false);
        expect(isExpansionGameplayActive('collect')).toBe(true);
        expect(isExpansionGameplayActive('build')).toBe(true);
        expect(isExpansionGameplayActive('complete')).toBe(false);
        expect(isExpansionGameplayActive('failed')).toBe(false);
    });
});

describe('Expansion resource display', () => {
    it('shows warnings at the existing suit, oxygen, and radiation limits', () => {
        expect(getExpansionResourceState('suitIntegrity', 60)).toBe('normal');
        expect(getExpansionResourceState('suitIntegrity', 59)).toBe('warning');
        expect(getExpansionResourceState('oxygen', 25)).toBe('normal');
        expect(getExpansionResourceState('oxygen', 24)).toBe('danger');
        expect(getExpansionResourceState('radiationDose', 44)).toBe('normal');
        expect(getExpansionResourceState('radiationDose', 45)).toBe('danger');
    });

    it('does not signal a warning for power or healthy resources', () => {
        expect(getExpansionResourceState('energy', 1)).toBe('normal');
        expect(getExpansionResourceState('oxygen', 100)).toBe('normal');
        expect(getExpansionResourceState('suitIntegrity', 100)).toBe('normal');
        expect(getExpansionResourceState('radiationDose', 0)).toBe('normal');
    });
});
