import { settings } from '../../data/chapter5/settings';
import { canYouHearUs, contactDays } from '../../data/chapter5/challenges/can-you-hear-us';
import { stormArchive } from '../../data/chapter5/storms';
import type { RegionId } from '../../data/chapter5/regions';
import { radiation } from '../../facts/radiation';
import { scheduleAlerts, stormImpact, type ScheduledAlert } from './storms';
import { isDark } from './into-the-dark';

export type ContactAction = 'lab' | 'send' | 'relay' | 'rest';
export type ContactState = Readonly<{ region: RegionId; day: number; energy: number; waiting: number; sent: number; dose: number; relay: boolean; ended: boolean; ending: 'complete' | 'energy' | 'space-weather' | null; message: string; unknownDose: boolean; alerts: readonly ScheduledAlert[] }>;
export function startContact(region: RegionId, seed: number, alerts?: readonly ScheduledAlert[]): ContactState {
  const month = stormArchive.months.find(entry => entry.month === '2024-05')!;
  return { region, day: 1, energy: settings.contactStartingEnergy, waiting: 0, sent: 0, dose: 0, relay: false, ended: false, ending: null, message: '', unknownDose: false, alerts: alerts ?? scheduleAlerts(month, canYouHearUs.lengthDays, seed) };
}
export function contactWarning(state: ContactState): boolean {
  return contactDays(state.region).includes(state.day) && state.alerts.some(alert => alert.warningDay === state.day);
}
export function advanceContact(state: ContactState, action: ContactAction): ContactState {
  if (state.ended) throw new Error('Challenge already ended');
  const inView = contactDays(state.region).includes(state.day);
  if (action === 'send' && !inView && !state.relay) throw new Error('No Earth contact or booked relay');
  if (action === 'relay' && state.relay) throw new Error('Relay already booked');
  const cost = action === 'lab' ? settings.labScienceCost : action === 'send' ? settings.sendDataCost : action === 'relay' ? settings.relayBookingCost : 0;
  const energy = Math.max(0, state.energy + (isDark(state.day) ? -settings.extraHeatingPerDarkDay : settings.solarPerSunnyDay) - settings.baseUsePerDay - cost);
  const waiting = action === 'send' ? 0 : state.waiting + (action === 'lab' ? settings.contactDataPerLab : 0);
  const sent = state.sent + (action === 'send' ? state.waiting : 0);
  const relay = action === 'relay' ? true : action === 'send' && !inView ? false : state.relay;
  let stormDose = 0, unknown = false, stormEnding = false;
  for (const alert of state.alerts.filter(entry => entry.arrivalDay === state.day)) {
    if (alert.kind === 'unknown') { unknown = true; continue; }
    if (alert.kind === 'storm' && alert.level) {
      const impact = stormImpact(alert.level, false, false);
      stormDose += impact.dose;
      stormEnding ||= impact.ended;
    }
  }
  const dose = Number((state.dose + radiation.doseBusySun.value + stormDose).toFixed(settings.displayDecimals));
  const ending = stormEnding ? 'space-weather' : energy === 0 ? 'energy' : state.day === canYouHearUs.lengthDays ? 'complete' : null;
  const ended = ending !== null;
  const weather = !inView && stormDose > 0 ? 'We could not hear Mission Control today. ' : '';
  const message = `${weather}${action === 'send' ? `Sent ${state.waiting} data points to Earth.` : action === 'lab' ? 'Collected one data point; it is waiting to send.' : action === 'relay' ? 'Booked one relay transmission for a blocked day.' : 'The crew rested.'}${unknown ? ' Some particle-event doses are unknown and excluded.' : ''}${stormDose ? ` Space weather added ${stormDose} mSv (game estimate).` : ''}`;
  return { ...state, day: state.day + 1, energy, waiting, sent, relay, dose, ended, ending, message, unknownDose: state.unknownDose || unknown };
}
