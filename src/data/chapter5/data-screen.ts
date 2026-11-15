import { chapter5Facts } from './facts';
import { settings } from './settings';
import { stormArchive } from './storms';
import { mediaSourceKey, sources } from '../../facts/sources';

// Chapter 5 currently uses picture placeholders and no picture or sound assets.
export const chapter5Media: readonly string[] = [];

export function chapter5Data() {
  const facts = Object.values(chapter5Facts);
  const keys = new Set([...facts.flatMap(fact => [...fact.sources]), ...stormArchive.sourceKeys, ...chapter5Media.map(id => {
    const key = mediaSourceKey[id];
    if (!key) throw new Error(`Missing media source: ${id}`);
    return key;
  })]);
  const rankedSources = sources.filter(source => keys.has(source.key));
  const missing = [...keys].filter(key => !rankedSources.some(source => source.key === key));
  if (missing.length) throw new Error(`Missing fact sources: ${missing.join(', ')}`);
  const gameNumbers = Object.entries(settings).map(([name, value]) => ({
    name, value, derived: name === 'extraHeatingPerDarkDay' || name === 'quietDosePerDay',
  }));
  return { facts, sources: rankedSources, gameNumbers, archive: stormArchive };
}
