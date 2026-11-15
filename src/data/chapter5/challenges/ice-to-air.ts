import { settings } from '../settings';
import { lifeSupport } from '../../../facts/lifeSupport';

export const iceToAir = {
  title: 'Ice to air', lengthDays: settings.challengeDays,
  gauges: { main: ['air', 'energy'], extra: 'dose', scienceGoal: settings.experimentScience },
  waterPerBatch: Number((settings.waterPerOxygen * settings.oxygenPerSplit).toFixed(settings.displayDecimals)),
  energyPerBatch: settings.oxygenPerSplit * lifeSupport.oxygenEnergyModel.value + settings.iceMeltCost,
} as const;
