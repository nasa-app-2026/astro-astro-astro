import { expect, it } from 'vitest';
import { allFacts, getSource } from './index';
import { food } from './food';

it('resolves fact source references, apart from the three awaiting source verification', () => {
  const missing = [...allFacts, ...Object.values(food)]
    .flatMap(fact => fact.sources
      .filter(key => !getSource(key))
      .map(key => `${fact.id}: ${key}`))
    .sort();

  // These claims need verified supporting sources before their IDs can be corrected.
  expect(missing).toEqual([
    'moonPlaces.malpertCliff: SRC-R18-1-10',
    'power.winterWarning: SRC-R17A-15',
    'radiation.artemisSensors: SRC-R14-05',
  ]);
});
