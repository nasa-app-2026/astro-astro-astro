import { settings } from '../../data/chapter5/settings';
import { stormArchive } from '../../data/chapter5/storms';
import { stormAlert } from '../../data/chapter5/challenges/storm-alert';
import { advanceIntoTheDark, startIntoTheDark, type ActionId, type DarkState } from './into-the-dark';
import { dailyDose, scheduleAlerts, stormImpact, type ScheduledAlert, type StormLevel } from './storms';

export type Sun = 'busy' | 'quiet';
export type Cargo = 'shelter' | 'science';
export type StormAction = ActionId | 'build' | 'shelter';
export type Plan = Readonly<{ sun: Sun; cargo: Cargo; region: string; seed: number }>;
export type StormState = Readonly<{ plan: Plan; base: DarkState; alerts: readonly ScheduledAlert[]; built: boolean; totalDose: number; stormDose: number; science: number; ended: boolean; ending: string | null; lastMessage: string; safetyPraise: boolean; unknownDose: boolean }>;

export function prediction(plan: Plan) {
  return { cosmic: Number((dailyDose(plan.sun) * stormAlert.lengthDays).toFixed(settings.displayDecimals)), maxStorm: Math.max(...Object.values(settings.stormDose)), limit: stormAlert.stormLimit };
}
export function startStormAlert(plan: Plan, overrideAlerts?: readonly ScheduledAlert[]): StormState {
  const month = stormArchive.months.find(item => item.month === (plan.sun === 'busy' ? '2024-05' : '2019-12'))!;
  const alerts = overrideAlerts ?? scheduleAlerts(month, stormAlert.lengthDays, plan.seed);
  return { plan, base: startIntoTheDark(), alerts, built: plan.cargo === 'shelter', totalDose: 0, stormDose: 0, science: 0, ended: false, ending: null, lastMessage: '', safetyPraise: false, unknownDose: false };
}
export function advanceStormAlert(state: StormState, oxygenKg: number, action: StormAction): StormState {
  if (state.ended) throw new Error('Challenge already ended');
  const day = state.base.day;
  const incoming = state.alerts.filter(alert => alert.arrivalDay === day);
  const warned = state.alerts.some(alert => alert.warningDay === day || alert.arrivalDay === day);
  if (action === 'shelter' && !warned) throw new Error('No alert today');
  if (action === 'build' && state.built) throw new Error('Shelter already built');
  const baseAction: ActionId = action === 'build' || action === 'shelter' ? 'rest' : action;
  const base = advanceIntoTheDark(state.base, { oxygenKg, action: baseAction });
  const built = state.built || action === 'build';
  const onMoonwalk = action === 'moonwalk';
  let dose = 0;
  let tooHigh = false;
  let unknown = false;
  let smallOrFalse = false;
  const outcomes: string[] = [];
  for (const alert of incoming) {
    if (alert.kind === 'unknown') { unknown = true; outcomes.push('A linked particle event has an unknown level.'); continue; }
    if (alert.kind === 'false-alarm') { smallOrFalse = true; outcomes.push('An alert had no linked particle event in the archive.'); continue; }
    const level = alert.level as StormLevel;
    const impact = stormImpact(level, built && (action === 'shelter' || onMoonwalk), onMoonwalk);
    const addedWalk = onMoonwalk && state.plan.region === 'mons-mouton' ? settings.stormDose[level] * (settings.moutonWalkBackDoseFraction - settings.walkBackDoseFraction) : 0;
    const eventDose = impact.dose + addedWalk;
    outcomes.push(`${level}: ${eventDose} mSv (game estimate).`);
    dose += eventDose;
    tooHigh ||= eventDose > stormAlert.stormLimit;
    if (settings.stormDose[level] <= settings.stormDose.S1) smallOrFalse = true;
  }
  const cosmic = dailyDose(state.plan.sun);
  const totalDose = Number((state.totalDose + cosmic + dose).toFixed(settings.displayDecimals));
  const science = state.science + (base.science - state.base.science) + (action === 'lab' && state.plan.cargo === 'science' ? settings.extraKitScience : 0);
  const ending = tooHigh ? 'Mission ended early, crew safe.' : base.ending === 'air' ? 'Mission ended early: the crew flew home before the air ran out.' : base.ending === 'energy' ? 'Mission ended early: the base ran out of energy, and the crew flew home safely.' : base.ending === 'complete' ? 'Challenge complete!' : null;
  return { ...state, base, built, science, totalDose, stormDose: dose, ended: ending !== null, ending, unknownDose: state.unknownDose || unknown, safetyPraise: state.safetyPraise || (action === 'shelter' && smallOrFalse), lastMessage: `Day ${day}: ${outcomes.join(' ')} Dose increased ${cosmic} mSv because of the daily cosmic-ray estimate${dose ? ` and ${dose} mSv from space weather (game estimate)` : ''}.${unknown ? ' Unknown event doses are not included.' : ''}${action === 'build' ? ' The crew stacked water bags around the bunks to build the shelter.' : ''}${action === 'shelter' ? ' The crew took shelter instead of doing science.' : ''}` };
}
