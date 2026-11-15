import { radiation } from '../../facts/radiation';
import { settings } from '../../data/chapter5/settings';
import type { ArchiveMonth } from '../../data/chapter5/storms';

export type StormLevel = keyof typeof settings.stormDose;
export type ScheduledAlert = Readonly<{ flareId: string; warningDay: number; arrivalDay: number; kind: 'storm' | 'false-alarm' | 'unknown'; level: StormLevel | null }>;

/** Deterministic training schedule: preserve event order, spreading a month's flares across mission days. */
export function scheduleAlerts(month: ArchiveMonth, days: number, seed: number): ScheduledAlert[] {
  if (!Number.isInteger(days) || days < 1 || !Number.isInteger(seed)) throw new Error('Invalid schedule inputs');
  let state = seed >>> 0;
  return month.flares.map((flare, index) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const arrivalDay = Math.min(days, Math.floor(index * days / month.flares.length) + 1);
    const linked = month.seps.filter(sep => flare.linkedSepIds.includes(sep.id));
    const known = linked.find(sep => sep.noaaFlareId === flare.id && sep.level !== 'unknown' && sep.level !== 'S5');
    return { flareId: flare.id, arrivalDay, warningDay: Math.max(1, arrivalDay - (state % 2)), kind: linked.length === 0 ? 'false-alarm' : known ? 'storm' : 'unknown', level: known ? known.level as StormLevel : null };
  });
}

export function stormImpact(level: StormLevel | 'unknown' | null, shelterBuilt: boolean, onMoonwalk: boolean) {
  if (level === null) return { dose: 0, ended: false, label: 'False alarm: no storm dose.' };
  if (level === 'unknown') throw new Error('Cannot calculate a storm dose without a known level');
  const raw = settings.stormDose[level];
  if (raw === undefined) throw new Error('No game estimate exists for this storm level');
  const dose = raw * (shelterBuilt ? settings.shelterDoseFraction : settings.protectedRoomDoseFraction) + (onMoonwalk ? raw * settings.walkBackDoseFraction : 0);
  return { dose, ended: dose > radiation.stormLimit.value, label: `Game estimate: ${dose} mSv.${dose > radiation.stormLimit.value ? ' Mission ended early, crew safe.' : ''}` };
}

export function dailyDose(sun: 'busy' | 'quiet'): number {
  return sun === 'busy' ? radiation.doseBusySun.value : radiation.doseQuietSun.value;
}

export function archiveLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  if (!year || !monthNumber || monthNumber > 12) throw new Error('Invalid archive month');
  const name = new Intl.DateTimeFormat('en', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(year, monthNumber - 1)));
  return `Storms from real NASA data, ${name} ${year}, moved onto your mission days`;
}

export function careerDoseSummary(total: number, age: '7-9' | '10-12'): string {
  if (!Number.isFinite(total) || total < 0) throw new Error('Invalid mission dose');
  const part = age === '10-12' ? `${Number((total / radiation.careerLimit.value * 100).toFixed(settings.displayDecimals))}%` : 'a tiny part';
  return `NASA's rule: a whole career must stay under ${radiation.careerLimit.value} mSv. Your training used ${part} of that.`;
}
