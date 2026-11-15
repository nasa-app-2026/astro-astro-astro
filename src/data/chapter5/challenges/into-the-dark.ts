import { radiation } from '../../../facts/radiation';
import { settings } from '../settings';

export const intoTheDark = {
  id: 'into-the-dark',
  title: 'Into the dark',
  lengthDays: settings.challengeDays,
  darkDays: settings.darkDays,
  startingEnergy: settings.startingEnergy,
  startingAir: settings.startingAir,
  scienceGoal: settings.scienceGoal,
  crewCount: settings.crewCount,
  oxygenChoices: settings.oxygenChoices,
  gauges: { main: ['energy', 'air'], extra: 'dose', scienceGoal: settings.scienceGoal },
  doseGaugeCapacity: radiation.careerLimit.value,
  actions: [
    { id: 'lab', title: 'Lab science', science: settings.labScienceGain, energy: settings.labScienceCost },
    { id: 'moonwalk', title: 'Moonwalk for science', science: settings.moonwalkScienceGain, energy: settings.moonwalkCost },
    { id: 'rest', title: 'Rest', science: 0, energy: 0 },
  ],
  tips: [
    'Solar panels add energy only on sunny days.',
    'Making oxygen uses energy; the crew breathes every day.',
    'This light pattern is an example, not a forecast.',
  ],
} as const;
