import { settings } from '../settings';
import type { RegionId } from '../regions';

export const canYouHearUs = {
  title: 'Can you hear us?', lengthDays: settings.challengeDays,
  gauges: { main: ['data', 'energy'], extra: 'dose', scienceGoal: settings.scienceGoal },
} as const;

export function contactDays(region: RegionId): readonly number[] {
  return region === 'malapart-massif' ? settings.contactMalpert : region === 'nobile-rim-2' ? settings.contactNobile : settings.contactDefault;
}
