import { describe, expect, it } from 'vitest';
import { allFacts, getSource, textSources } from '../facts';
import { food } from '../facts/food';
import { chapter5Data } from '../data/chapter5/data-screen';
import { buildDataSourcesModel } from './model';
import { createDataSourcesInput } from './sourceData';

const input = createDataSourcesInput();

describe('where our data comes from model', () => {
  it('lists every source once in catalog order and puts DONKI first in NASA challenge data', () => {
    const model = buildDataSourcesModel(input);
    const listedKeys = model.allSources.map((source) => source.key);
    const rowKeys = model.allSourcesRows.flatMap((row) => row.kind === 'source' ? [row.source.key] : []);

    expect(listedKeys).toEqual(input.sources.map((source) => source.key));
    expect(rowKeys).toEqual(input.sources.map((source) => source.key));
    expect(new Set(listedKeys).size).toBe(input.sources.length);
    expect(model.nasaChallengeSources[0]?.key).toBe('SRC-006');
    expect(model.nasaChallengeSources[0]?.archivedNotLive).toBe(true);
    expect(model.nasaChallengeSources.filter((source) => source.archivedNotLive)).toHaveLength(1);
  });

  it('resolves every fact source key from the fact catalog', () => {
    const missing = [...new Set([...allFacts, ...Object.values(food)].flatMap((fact) => fact.sources))]
      .filter((key) => !getSource(key));
    expect(missing, `Missing source keys used by facts: ${missing.join(', ')}`).toEqual([]);
  });

  it('includes every Chapter 5 text and game-data source in its filter', () => {
    const model = buildDataSourcesModel(input, 5);
    const listed = new Set(model.allSources.map((source) => source.key));
    const expected = new Set([
      ...(textSources['chapters.chapter5'] ?? []),
      ...chapter5Data().sources.map((source) => source.key),
    ]);
    const missing = [...expected].filter((key) => !listed.has(key));
    expect(missing, `Chapter 5 sources missing from filter: ${missing.join(', ')}`).toEqual([]);
  });

  it('places every local image and sound in credited media or Needs a credit', () => {
    const model = buildDataSourcesModel(input);
    const classified = new Set([
      ...model.creditedMedia.map((asset) => `${asset.kind}:${asset.fileName}`),
      ...model.mediaNeedingCredit.map((asset) => `${asset.kind}:${asset.fileName}`),
    ]);
    const missing = input.mediaFiles
      .filter((asset) => !classified.has(`${asset.kind}:${asset.fileName}`))
      .map((asset) => asset.fileName);
    expect(missing, `Local media not listed: ${missing.join(', ')}`).toEqual([]);
    expect(classified.size).toBe(input.mediaFiles.length);
  });
});
