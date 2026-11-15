import type { Fact } from './types';
import { radiation } from './radiation';
import { storms } from './storms';
import { power } from './power';
import { lifeSupport } from './lifeSupport';
import { communication } from './communication';
import { moonPlaces } from './moonPlaces';
import { missions } from './missions';

export type { Fact, FactLabel } from './types';
export { LABEL_WORDS } from './types';

export { 
  radiation, 
  storms, 
  power, 
  lifeSupport, 
  communication, 
  moonPlaces, 
  missions 
};

export const allFacts: readonly Fact[] = [
  ...Object.values(radiation),
  ...Object.values(storms),
  ...Object.values(power),
  ...Object.values(lifeSupport),
  ...Object.values(communication),
  ...Object.values(moonPlaces),
  ...Object.values(missions),
];
