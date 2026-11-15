import { describe, expect, it } from 'vitest';
import { sources, getSource, mediaSourceKey, textFacts, textSources } from './index';
import { sources1 } from './sources1';
import { sources2 } from './sources2';
import { sources3 } from './sources3';
import { sources4 } from './sources4';

describe('Generated source catalog', () => {
  it('keeps the supplied ranking, part boundaries, and unique source keys', () => {
    expect([sources1.length, sources2.length, sources3.length, sources4.length]).toEqual([36, 41, 43, 34]);
    expect(sources).toHaveLength(154);
    expect(new Set(sources.map(source => source.key)).size).toBe(154);
    expect(sources[0].key).toBe('SRC-006');
    expect(sources[sources.length - 1]?.key).toBe('SRC-R15B-10');
  });

  it('resolves known sources and preserves verification, provenance, and optional fields', () => {
    expect(getSource('SRC-006')).toMatchObject({ title: 'DONKI Space Weather Database', group: 'nasaChallengeResource', checked: 'read', challengeResource: 'DONKI (Space Weather Database)' });
    expect(getSource('SRC-R17B-04')).toMatchObject({ organisation: 'NOAA SESC, hosted by NASA GSFC SDAC', url: 'https://umbra.nascom.nasa.gov/SEP/' });
    expect(getSource('not-a-source')).toBeUndefined();
    expect(sources.every(source => source.key && source.title && source.organisation && Array.isArray(source.topics) && Array.isArray(source.usedBy))).toBe(true);
  });

  it('preserves the supplied media and text mappings and resolves their source keys', () => {
    expect(mediaSourceKey['solar-flare-sept2017']).toBe('MEDIA-NASA-IMAGES');
    expect(textFacts['resources.lifeSupport']).toContain('lifeSupport.oxygenPerDay');
    expect(textSources['chapters.chapter5']).toContain('SRC-006');
    for (const key of Object.values(mediaSourceKey)) expect(getSource(key)).toBeDefined();
    for (const keys of Object.values(textSources)) for (const key of keys) expect(getSource(key)).toBeDefined();
  });
});
