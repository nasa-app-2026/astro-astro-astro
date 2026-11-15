import { settings } from '../settings';
import { radiation } from '../../../facts/radiation';

export const stormAlert = {
  title: 'Storm alert', lengthDays: settings.challengeDays,
  gauges: { main: ['dose', 'energy'], extra: 'air', scienceGoal: settings.scienceGoal },
  stormLimit: radiation.stormLimit.value,
} as const;
