import { chapter5Facts, type Chapter5FactId } from './facts';
import type { AgeRange } from '../../playerProfile';

export const equatorBriefingFactIds = [
  'power.equatorNight',
  'power.nightCold',
  'power.batteriesForNight',
] as const satisfies readonly Chapter5FactId[];

/** Before onboarding, use the simpler wording; scientific values never change. */
export function factText(id: Chapter5FactId, ageRange: AgeRange | null): string {
  const fact = chapter5Facts[id];
  return ageRange === '10-12' ? fact.older : fact.young;
}

export function equatorBriefing(ageRange: AgeRange | null) {
  return equatorBriefingFactIds.map((id) => ({
    id,
    text: factText(id, ageRange),
    sources: chapter5Facts[id].sources,
    label: chapter5Facts[id].label,
  }));
}
