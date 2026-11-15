import type { RegionId } from '../../data/chapter5/regions';

export type Chapter5State = Readonly<{ chosenRegion: RegionId | null }>;

export function initialChapter5State(): Chapter5State {
  return { chosenRegion: null };
}

export function chooseRegion(state: Chapter5State, region: RegionId): Chapter5State {
  return { ...state, chosenRegion: region };
}
