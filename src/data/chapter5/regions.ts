import type { Chapter5FactId } from './facts';

type Region = Readonly<{
  id: string;
  name: string;
  factIds: readonly Chapter5FactId[];
  note?: string;
  effect: Readonly<{
    name: string;
    challenge: string;
    rule: 'nearbyIce' | 'shelterWalk' | 'earthContact';
    change: 'more' | 'longer' | 'most-days' | 'about-one-third';
    basedOn: Chapter5FactId;
    description: string;
  }>;
}>;

export const regions = [
  {
    id: 'haworth', name: 'Haworth',
    factIds: ['moonPlaces.haworth', 'moonPlaces.iceFriendlyGround'],
    // Game rule, made up for fun
    effect: { name: 'Nearby ice', challenge: 'Ice to air', rule: 'nearbyIce', change: 'more', basedOn: 'moonPlaces.iceFriendlyGround', description: 'More ice nearby in the “Ice to air” challenge.' },
  },
  {
    id: 'mons-mouton', name: 'Mons Mouton',
    factIds: ['moonPlaces.monsMouton', 'missions.im2Tipped', 'missions.viper'],
    // Game rule, made up for fun
    effect: { name: 'Longer shelter walk', challenge: 'Radiation', rule: 'shelterWalk', change: 'longer', basedOn: 'missions.im2Tipped', description: 'Rough ground makes the walk back to shelter longer during space weather.' },
  },
  {
    id: 'malapart-massif', name: 'Malapart Massif',
    factIds: ['moonPlaces.malpertCliff', 'moonPlaces.malpertEarthView'],
    note: 'The fact catalog calls this Malpert Massif. “Most days” is a training rule; the source gives no number of days.',
    // Game rule, made up for fun
    effect: { name: 'Frequent Earth contact', challenge: 'Can you hear us?', rule: 'earthContact', change: 'most-days', basedOn: 'moonPlaces.malpertEarthView', description: 'Earth is in view on most days in the “Can you hear us?” challenge.' },
  },
  {
    id: 'nobile-rim-2', name: 'Nobile Rim 2',
    factIds: ['moonPlaces.nobileRim2EarthView'],
    note: 'This study describes one spot, not the whole region.',
    // Game rule, made up for fun
    effect: { name: 'Limited Earth contact', challenge: 'Can you hear us?', rule: 'earthContact', change: 'about-one-third', basedOn: 'moonPlaces.nobileRim2EarthView', description: 'Earth is in view about one-third of the time in the “Can you hear us?” challenge.' },
  },
] as const satisfies readonly Region[];

export type RegionId = typeof regions[number]['id'];
