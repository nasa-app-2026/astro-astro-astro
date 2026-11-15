import { expect, it } from 'vitest';
import { allFacts, getSource } from './index';
import { food } from './food';

it('resolves fact source references, apart from the two awaiting source verification', () => {
  const missing = [...allFacts, ...Object.values(food)]
    .flatMap(fact => fact.sources
      .filter(key => !getSource(key))
      .map(key => `${fact.id}: ${key}`))
    .sort();

  // These claims need verified supporting sources before their IDs can be corrected.
  expect(missing).toEqual([
    'power.winterWarning: SRC-R17A-15',
    'radiation.artemisSensors: SRC-R14-05',
  ]);
});

it('attributes the distant cliff to the LROC observation without placing it on the massif', () => {
  const fact = allFacts.find(item => item.id === 'moonPlaces.malpertCliff');
  expect(fact?.sources).toContain('SRC-R18-1-18');
  expect(getSource('SRC-R18-1-18')?.url).toBe('https://lroc.im-ldi.com/images/1294');
  expect(fact?.young).toContain('in the distance');
  expect(fact?.older).toContain('in the distance');
});
