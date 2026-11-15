import { intoTheDark } from '../../data/chapter5/challenges/into-the-dark';
import { advanceIntoTheDark, startIntoTheDark, type DayDecision, type DayRecord, type DarkState } from './into-the-dark';

export type TurningPoint = Readonly<{ day: number; original: DayDecision; alternative: DayDecision; result: DarkState }>;

/** Replay the observed decisions with exactly one oxygen or action choice changed. */
export function findTurningPoint(history: readonly DayRecord[]): TurningPoint | null {
  if (!history.length) return null;
  const replay = (changedDay: number, alternative?: DayDecision) => {
    let state = startIntoTheDark();
    for (const record of history) {
      if (state.ending) break;
      const decision = record.day === changedDay && alternative ? alternative : record.decision;
      state = advanceIntoTheDark(state, decision);
    }
    return state;
  };
  const baseline = replay(0);
  if (baseline.ending === 'complete' && baseline.science >= intoTheDark.scienceGoal) return null;
  // Completion is preferable to an early return, then days completed and science.
  const better = (a: DarkState, b: DarkState) => {
    const aComplete = a.ending === 'complete';
    const bComplete = b.ending === 'complete';
    if (aComplete !== bComplete) return aComplete;
    if (a.day !== b.day) return a.day > b.day;
    if (Boolean(a.ending) !== Boolean(b.ending)) return !a.ending;
    return a.science > b.science;
  };
  let best: TurningPoint | null = null;
  for (const record of history) {
    const candidates: DayDecision[] = [
      ...intoTheDark.oxygenChoices.filter(oxygenKg => oxygenKg !== record.decision.oxygenKg).map(oxygenKg => ({ ...record.decision, oxygenKg })),
      ...intoTheDark.actions.filter(action => action.id !== record.decision.action).map(action => ({ ...record.decision, action: action.id })),
    ];
    for (const alternative of candidates) {
      const result = replay(record.day, alternative);
      if (better(result, best?.result ?? baseline)) best = { day: record.day, original: record.decision, alternative, result };
    }
  }
  return best;
}
