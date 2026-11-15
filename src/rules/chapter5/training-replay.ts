import { startIntoTheDark, advanceIntoTheDark, type ActionId } from './into-the-dark';
import { startStormAlert, advanceStormAlert, type Plan, type StormAction } from './storm-alert';
import { startContact, advanceContact, type ContactAction } from './can-you-hear-us';
import { startFreshFood, advanceFreshFood, type FoodAction } from './fresh-food';
import { startIceToAir, advanceIceToAir, type IceAction } from './ice-to-air';
import { settings } from '../../data/chapter5/settings';
import type { RegionId } from '../../data/chapter5/regions';
import type { TrainingChallenge } from './training';

export type TrainingChoice = Readonly<{ action: string; oxygen: number }>;
export type TrainingAttempt = Readonly<{ challenge: TrainingChallenge; region: RegionId; choices: readonly TrainingChoice[]; plan?: Plan }>;
type Outcome = { days: number; completed: boolean; safe: boolean; science: number };
function replay(attempt: TrainingAttempt, changed: number, alternate?: TrainingChoice): Outcome {
  let dark = startIntoTheDark();
  let storm = attempt.plan ? startStormAlert(attempt.plan) : null;
  let contact = startContact(attempt.region, settings.stormChallengeSeed);
  let food = startFreshFood();
  let ice = startIceToAir(attempt.region, settings.stormChallengeSeed);
  let outcome: Outcome = { days: 0, completed: false, safe: true, science: 0 };
  for (let index = 0; index < attempt.choices.length; index++) {
    const choice = index === changed && alternate ? alternate : attempt.choices[index];
    try {
      switch (attempt.challenge) {
        case 'Into the dark': dark = advanceIntoTheDark(dark, { action: choice.action as ActionId, oxygenKg: choice.oxygen }); outcome = { days: dark.day - 1, completed: dark.ending === 'complete', safe: !dark.ending || dark.ending === 'complete', science: dark.science }; break;
        case 'Storm alert': if (!storm) throw new Error('Missing plan'); storm = advanceStormAlert(storm, choice.oxygen, choice.action as StormAction); outcome = { days: storm.base.day - 1, completed: storm.ending === 'Challenge complete!', safe: !storm.ended || storm.ending === 'Challenge complete!', science: storm.science }; break;
        case 'Can you hear us?': contact = advanceContact(contact, choice.action as ContactAction); outcome = { days: contact.day - 1, completed: contact.ending === 'complete', safe: !contact.ending || contact.ending === 'complete', science: contact.sent }; break;
        case 'Fresh food': food = advanceFreshFood(food, choice.action as FoodAction); outcome = { days: food.day - 1, completed: food.ending === 'complete', safe: !food.ending || food.ending === 'complete', science: food.science }; break;
        case 'Ice to air': ice = advanceIceToAir(ice, choice.action as IceAction); outcome = { days: ice.day - 1, completed: ice.ending === 'complete', safe: !ice.ending || ice.ending === 'complete', science: ice.science }; break;
      }
    } catch {
      if (index === changed) return { days: -1, completed: false, safe: false, science: 0 };
      const rest = { action: 'rest', oxygen: choice.oxygen };
      const replacement = { ...attempt, choices: attempt.choices.map((item, i) => i === index ? rest : item) };
      return replay(replacement, changed, alternate);
    }
    if ((attempt.challenge === 'Into the dark' && dark.ending) || (attempt.challenge === 'Storm alert' && storm?.ended) || (attempt.challenge === 'Can you hear us?' && contact.ended) || (attempt.challenge === 'Fresh food' && food.ending) || (attempt.challenge === 'Ice to air' && ice.ending)) break;
  }
  return outcome;
}
export function bestTrainingChange(attempts: readonly TrainingAttempt[]) {
  const actions: Record<TrainingChallenge, readonly string[]> = { 'Into the dark': ['lab', 'moonwalk', 'rest'], 'Storm alert': ['lab', 'moonwalk', 'rest', 'build', 'shelter'], 'Can you hear us?': ['lab', 'send', 'relay', 'rest'], 'Fresh food': ['lamps', 'rest'], 'Ice to air': ['dig', 'split', 'lab', 'rest'] };
  let best: { challenge: TrainingChallenge; day: number; choice: TrainingChoice; gain: number } | null = null;
  for (const attempt of attempts) {
    const baseline = replay(attempt, -1);
    const rank = (o: Outcome) => ((o.completed ? settings.challengeDays + 1 : o.days) * 2 + Number(o.safe)) * (settings.scienceGoal + 1) + Math.min(o.science, settings.scienceGoal);
    for (let index = 0; index < attempt.choices.length; index++) {
      const original = attempt.choices[index];
      const options = [...actions[attempt.challenge].filter(action => action !== original.action).map(action => ({ ...original, action })), ...((attempt.challenge === 'Into the dark' || attempt.challenge === 'Storm alert') ? settings.oxygenChoices.filter(oxygen => oxygen !== original.oxygen).map(oxygen => ({ ...original, oxygen })) : [])];
      for (const choice of options) {
        const gain = rank(replay(attempt, index, choice)) - rank(baseline);
        if (gain > (best?.gain ?? 0)) best = { challenge: attempt.challenge, day: index + 1, choice, gain };
      }
    }
  }
  return best;
}
