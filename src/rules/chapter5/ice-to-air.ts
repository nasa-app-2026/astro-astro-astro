import { lifeSupport } from '../../facts/lifeSupport';
import { radiation } from '../../facts/radiation';
import { settings } from '../../data/chapter5/settings';
import { iceToAir } from '../../data/chapter5/challenges/ice-to-air';
import { stormArchive } from '../../data/chapter5/storms';
import type { RegionId } from '../../data/chapter5/regions';
import { isDark } from './into-the-dark';
import { scheduleAlerts, stormImpact, type ScheduledAlert } from './storms';

export type IceAction = 'dig' | 'split' | 'lab' | 'rest';
export type IceState = Readonly<{ region: RegionId; day: number; air: number; energy: number; ice: number; dose: number; science: number; ending: 'air' | 'energy' | 'space-weather' | 'complete' | null; alerts: readonly ScheduledAlert[]; unknownDose: boolean; message: string }>;
const round = (value: number) => Number(value.toFixed(4));
export function startIceToAir(region: RegionId, seed: number, alerts?: readonly ScheduledAlert[]): IceState {
  const month = stormArchive.months.find(entry => entry.month === '2024-05')!;
  return { region, day: 1, air: settings.iceStartingAir, energy: settings.iceStartingEnergy, ice: 0, dose: 0, science: 0, ending: null, alerts: alerts ?? scheduleAlerts(month, iceToAir.lengthDays, seed), unknownDose: false, message: '' };
}
export function advanceIceToAir(state: IceState, action: IceAction): IceState {
  if (state.ending) throw new Error('Challenge already ended');
  if (action === 'split' && state.ice < iceToAir.waterPerBatch) throw new Error('Not enough ice to make oxygen');
  const dug = action === 'dig' ? settings.icePerDig * (state.region === 'haworth' ? settings.haworthIceMultiplier : 1) : 0;
  const oxygen = action === 'split' ? settings.oxygenPerSplit : 0;
  const used = settings.crewCount * lifeSupport.oxygenPerDay.value;
  const airRaw = round(state.air + oxygen - used);
  const cost = action === 'dig' ? settings.moonwalkCost : action === 'split' ? iceToAir.energyPerBatch : action === 'lab' ? settings.labScienceCost : 0;
  const energyRaw = state.energy + (isDark(state.day) ? -settings.extraHeatingPerDarkDay : settings.solarPerSunnyDay) - settings.baseUsePerDay - cost;
  let eventDose = 0, unknown = false, high = false;
  for (const alert of state.alerts.filter(item => item.arrivalDay === state.day)) {
    if (alert.kind === 'unknown') { unknown = true; continue; }
    if (alert.kind !== 'storm' || !alert.level) continue;
    const impact = stormImpact(alert.level, false, action === 'dig');
    eventDose += impact.dose;
    high ||= impact.ended;
  }
  const ending = high ? 'space-weather' : airRaw <= 0 ? 'air' : energyRaw <= 0 ? 'energy' : state.day === iceToAir.lengthDays ? 'complete' : null;
  const explanation = action === 'dig' ? `Dug ${round(dug)} kg of ice on a moonwalk; it used ${cost} kWh.` : action === 'split' ? `Melted ${round(iceToAir.waterPerBatch)} kg of ice into water and made ${oxygen} kg oxygen; splitting and melting used ${cost} kWh.` : action === 'lab' ? `Lab science used ${cost} kWh.` : 'The crew rested.';
  return { ...state, day: state.day + 1, air: Math.max(0, airRaw), energy: Math.max(0, energyRaw), ice: round(state.ice + dug - (action === 'split' ? iceToAir.waterPerBatch : 0)), science: state.science + (action === 'lab' ? settings.labScienceGain : 0), dose: round(state.dose + radiation.doseBusySun.value + eventDose), ending, unknownDose: state.unknownDose || unknown, message: `${explanation} The two astronauts used ${used} kg of oxygen.${eventDose ? ` Space weather added ${eventDose} mSv (game estimate).` : ''}${unknown ? ' Some event doses are unknown and excluded.' : ''}` };
}
