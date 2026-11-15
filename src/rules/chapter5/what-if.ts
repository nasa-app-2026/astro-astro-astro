import { settings } from '../../data/chapter5/settings';
import { startIntoTheDark, advanceIntoTheDark, type DarkState, type ActionId } from './into-the-dark';
import { startStormAlert, advanceStormAlert, type StormState, type StormAction } from './storm-alert';
import { startContact, advanceContact, type ContactState, type ContactAction } from './can-you-hear-us';
import { startFreshFood, advanceFreshFood, type FoodState, type FoodAction } from './fresh-food';
import { startIceToAir, advanceIceToAir, type IceState, type IceAction } from './ice-to-air';
import type { TrainingAttempt, TrainingChoice } from './training-replay';
import type { TrainingChallenge } from './training';

export type ReplayState = DarkState | StormState | ContactState | FoodState | IceState;
export type ReplaySummary = Readonly<{ gauges: readonly { name: string; value: number; unit: string }[]; science: number }>;
export type FairReplay = Readonly<{ state: ReplayState; summary: ReplaySummary; usedChoices: readonly TrainingChoice[]; fallbackDays: readonly number[]; seed: number }>;
export const challengeActions: Readonly<Record<TrainingChallenge, readonly string[]>> = {
  'Into the dark': ['lab', 'moonwalk', 'rest'], 'Storm alert': ['lab', 'moonwalk', 'rest', 'build', 'shelter'],
  'Can you hear us?': ['lab', 'send', 'relay', 'rest'], 'Fresh food': ['lamps', 'rest'], 'Ice to air': ['dig', 'split', 'lab', 'rest'],
};
export function alternatives(attempt: TrainingAttempt, day: number): TrainingChoice[] {
  const original = attempt.choices[day - 1];
  if (!original) throw new Error('No decision recorded for this day');
  return [
    ...challengeActions[attempt.challenge].filter(action => action !== original.action).map(action => ({ ...original, action })),
    ...((attempt.challenge === 'Into the dark' || attempt.challenge === 'Storm alert') ? settings.oxygenChoices.filter(oxygen => oxygen !== original.oxygen).map(oxygen => ({ ...original, oxygen })) : []),
  ];
}
export function replayAttempt(attempt: TrainingAttempt, change?: Readonly<{ day: number; choice: TrainingChoice }>, morning?: number): FairReplay {
  if (change && !alternatives(attempt, change.day).some(choice => choice.action === change.choice.action && choice.oxygen === change.choice.oxygen)) throw new Error('Change exactly one choice on a recorded day');
  const seed = attempt.plan?.seed ?? settings.stormChallengeSeed;
  let state: ReplayState;
  switch (attempt.challenge) {
    case 'Into the dark': state = startIntoTheDark(); break;
    case 'Storm alert': if (!attempt.plan) throw new Error('Missing storm planning choices'); state = startStormAlert(attempt.plan); break;
    case 'Can you hear us?': state = startContact(attempt.region, seed); break;
    case 'Fresh food': state = startFreshFood(); break;
    case 'Ice to air': state = startIceToAir(attempt.region, seed); break;
  }
  const apply = (choice: TrainingChoice): ReplayState => {
    switch (attempt.challenge) {
      case 'Into the dark': return advanceIntoTheDark(state as DarkState, { action: choice.action as ActionId, oxygenKg: choice.oxygen });
      case 'Storm alert': return advanceStormAlert(state as StormState, choice.oxygen, choice.action as StormAction);
      case 'Can you hear us?': return advanceContact(state as ContactState, choice.action as ContactAction);
      case 'Fresh food': return advanceFreshFood(state as FoodState, choice.action as FoodAction);
      case 'Ice to air': return advanceIceToAir(state as IceState, choice.action as IceAction);
    }
  };
  const ended = () => attempt.challenge === 'Storm alert' ? (state as StormState).ended : attempt.challenge === 'Can you hear us?' ? (state as ContactState).ended : Boolean((state as DarkState | FoodState | IceState).ending);
  const usedChoices: TrainingChoice[] = [], fallbackDays: number[] = [];
  const limit = Math.min(attempt.choices.length, morning === undefined ? attempt.choices.length : morning - 1);
  for (let i = 0; i < limit; i++) {
    if (ended()) break;
    let choice = change?.day === i + 1 ? change.choice : attempt.choices[i];
    try { state = apply(choice); }
    catch (error) {
      if (!change || i + 1 <= change.day) throw error;
      choice = { ...choice, action: 'rest' };
      state = apply(choice);
      fallbackDays.push(i + 1);
    }
    usedChoices.push(choice);
  }
  if (morning !== undefined && usedChoices.length !== morning - 1) throw new Error('The original challenge ended before this morning');
  const gauge = (name: string, value: number, unit: string) => ({ name, value, unit });
  let summary: ReplaySummary;
  switch (attempt.challenge) {
    case 'Into the dark': { const s = state as DarkState; summary = { gauges: [gauge('Energy', s.energy, 'kWh'), gauge('Air', s.air, 'kg'), gauge('Dose', s.dose, 'mSv')], science: s.science }; break; }
    case 'Storm alert': { const s = state as StormState; summary = { gauges: [gauge('Dose', s.stormDose, 'mSv'), gauge('Energy', s.base.energy, 'kWh'), gauge('Air', s.base.air, 'kg')], science: s.science }; break; }
    case 'Can you hear us?': { const s = state as ContactState; summary = { gauges: [gauge('Data to send', s.waiting, 'points'), gauge('Energy', s.energy, 'kWh'), gauge('Dose', s.dose, 'mSv')], science: s.sent }; break; }
    case 'Fresh food': { const s = state as FoodState; summary = { gauges: [gauge('Food', s.food, 'kg'), gauge('Energy', s.energy, 'kWh'), gauge('Water', s.water, 'litres')], science: s.science }; break; }
    case 'Ice to air': { const s = state as IceState; summary = { gauges: [gauge('Air', s.air, 'kg'), gauge('Energy', s.energy, 'kWh'), gauge('Dose', s.dose, 'mSv')], science: s.science }; break; }
  }
  return { state, summary, usedChoices, fallbackDays, seed };
}
