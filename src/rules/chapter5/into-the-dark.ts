import { lifeSupport } from '../../facts/lifeSupport';
import { intoTheDark } from '../../data/chapter5/challenges/into-the-dark';
import { settings } from '../../data/chapter5/settings';
import { linkEnergyProblem, type DecisionLogEntry } from './log';

export type ActionId = typeof intoTheDark.actions[number]['id'];
export type DayDecision = Readonly<{ oxygenKg: number; action: ActionId }>;
export type DayRecord = Readonly<{ day: number; decision: DayDecision }>;
export type Ending = 'air' | 'energy' | 'complete';
export type GaugeChange = Readonly<{ gauge: 'energy' | 'air' | 'dose'; before: number; after: number; because: string }>;
export type DayResult = Readonly<{ day: number; changes: readonly GaugeChange[]; scienceChange: number; scienceBecause: string; ending: Ending | null; endingBecause: string | null }>;
export type DarkState = Readonly<{ day: number; energy: number; air: number; dose: number; science: number; history: readonly DayRecord[]; log: readonly DecisionLogEntry[]; ending: Ending | null; lastResult: DayResult | null }>;

export const isDark = (day: number): boolean => intoTheDark.darkDays.includes(day as 3 | 4);

export function startIntoTheDark(): DarkState {
  return { day: 1, energy: intoTheDark.startingEnergy, air: intoTheDark.startingAir, dose: 0, science: 0, history: [], log: [], ending: null, lastResult: null };
}

export function advanceIntoTheDark(state: DarkState, decision: DayDecision): DarkState {
  if (state.ending || state.day > intoTheDark.lengthDays) throw new Error('Challenge already ended');
  if (!intoTheDark.oxygenChoices.some((amount) => amount === decision.oxygenKg)) throw new Error('Invalid oxygen choice');
  const action = intoTheDark.actions.find((item) => item.id === decision.action);
  if (!action) throw new Error('Invalid action');

  const dark = isDark(state.day);
  const solar = dark ? 0 : settings.solarPerSunnyDay;
  const heating = dark ? settings.extraHeatingPerDarkDay : 0;
  const oxygenEnergy = decision.oxygenKg * lifeSupport.oxygenEnergyModel.value;
  const energyRaw = state.energy + solar - settings.baseUsePerDay - heating - oxygenEnergy - action.energy;
  const energy = Math.max(0, energyRaw);
  const breathing = intoTheDark.crewCount * lifeSupport.oxygenPerDay.value;
  const airRaw = round(state.air + decision.oxygenKg - breathing);
  const air = Math.max(0, airRaw);
  const dose = round(state.dose + settings.quietDosePerDay);
  const science = state.science + action.science;
  const ending: Ending | null = airRaw <= 0 ? 'air' : energyRaw <= 0 ? 'energy' : state.day === intoTheDark.lengthDays ? 'complete' : null;
  const endingBecause = ending === 'air'
    ? `because ${intoTheDark.crewCount} astronauts needed ${breathing} kg of oxygen today and the supply would run out.`
    : ending === 'energy'
      ? `because the base needed more energy than its available supply today.`
      : null;
  const result: DayResult = {
    day: state.day,
    changes: [
      { gauge: 'energy', before: state.energy, after: energy, because: `Energy changed from ${format(state.energy)} to ${format(energy)} kWh because solar added ${solar} kWh, the base used ${settings.baseUsePerDay} kWh, ${dark ? `dark-day heating used ${heating} kWh` : 'extra heating used 0 kWh'}, oxygen making used ${oxygenEnergy} kWh, and ${action.title} used ${action.energy} kWh.` },
      { gauge: 'air', before: state.air, after: air, because: `Air changed from ${format(state.air)} to ${format(air)} kg because making added ${decision.oxygenKg} kg and ${intoTheDark.crewCount} astronauts each breathe ${lifeSupport.oxygenPerDay.value} kg a day (${format(breathing)} kg total).` },
      { gauge: 'dose', before: state.dose, after: dose, because: `Dose rose ${settings.quietDosePerDay} mSv because this training example uses the catalog's quiet-Sun estimate.` },
    ],
    scienceChange: action.science,
    scienceBecause: `Science gained ${action.science} point${action.science === 1 ? '' : 's'} because you chose ${action.title}.${action.id === 'rest' ? ' Rest gives the crew a break but costs a day of possible science.' : ''}`,
    ending,
    endingBecause,
  };
  const entry: DecisionLogEntry = { challenge: intoTheDark.title, day: state.day, decision, changes: result.changes, science: action.science, actionName: action.title, actionEnergy: action.energy, oxygenEnergy, links: [] };
  const entries = [...state.log, entry];
  const log = energy <= intoTheDark.startingEnergy * settings.gaugeLowFraction ? linkEnergyProblem(entries, state.day) : entries;
  return { day: state.day + 1, energy, air, dose, science, history: [...state.history, { day: state.day, decision }], log, ending, lastResult: result };
}

export function replayToMorning(history: readonly DayRecord[], morning: number): DarkState {
  if (!Number.isInteger(morning) || morning < 1 || morning > intoTheDark.lengthDays) throw new Error('Invalid retry day');
  let state = startIntoTheDark();
  for (const record of history.filter((entry) => entry.day < morning)) {
    if (record.day !== state.day) throw new Error('Decision history is out of order');
    state = advanceIntoTheDark(state, record.decision);
    if (state.ending) throw new Error('Cannot replay beyond an ending');
  }
  if (state.day !== morning) throw new Error('Missing decisions before retry day');
  return { ...state, lastResult: null };
}

function format(value: number): string { return Number(value.toFixed(settings.displayDecimals)).toString(); }
function round(value: number): number { return Number(value.toFixed(settings.displayDecimals)); }
