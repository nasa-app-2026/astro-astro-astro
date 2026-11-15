import type { AgeRange } from '../../../playerProfile';
import type { ChallengeGaugeConfig, GaugeReading, ResourceId } from '../../../data/chapter5/gauges';
import { gaugeModel } from '../../../rules/chapter5/gauges';
import './sidebar.css';

/** Render from the current challenge's data; rebuilding replaces the previous gauges. */
export function renderSidebar(
  host: HTMLElement,
  challenge: ChallengeGaugeConfig,
  readings: Partial<Record<ResourceId, GaugeReading>>,
  science: number,
  age: AgeRange | null,
  crewCount: number,
): void {
  const ids = [...challenge.main, challenge.extra];
  if (challenge.main.length !== 2 || new Set(ids).size !== 3) throw new Error('A challenge needs exactly three distinct gauges');
  if (!Number.isFinite(challenge.scienceGoal) || challenge.scienceGoal <= 0 || !Number.isFinite(science)) {
    throw new Error('Science needs a finite score and positive goal');
  }
  const sidebar = document.createElement('aside');
  sidebar.className = 'survival-sidebar';
  sidebar.setAttribute('aria-label', 'Challenge resources');
  for (const id of ids) {
    const reading = readings[id];
    if (!reading) throw new Error(`Missing reading: ${id}`);
    const model = gaugeModel(id, reading, age, crewCount);
    const gauge = document.createElement('section');
    gauge.className = challenge.main.includes(id) ? 'survival-gauge main' : 'survival-gauge extra';
    gauge.dataset.resource = id;
    const title = document.createElement('h3');
    title.textContent = `${model.icon} ${model.title}`;
    const bar = document.createElement('progress');
    bar.max = 1;
    bar.value = model.fraction;
    bar.setAttribute('aria-label', model.title);
    bar.setAttribute('aria-valuetext', model.text);
    const text = document.createElement('p');
    text.textContent = model.text;
    gauge.append(title, bar, text);
    sidebar.append(gauge);
  }
  const goal = document.createElement('section');
  goal.className = 'survival-science-goal';
  const title = document.createElement('h3');
  title.textContent = '📈 Science goal';
  const progress = document.createElement('progress');
  progress.max = challenge.scienceGoal;
  progress.value = Math.min(challenge.scienceGoal, Math.max(0, science));
  progress.setAttribute('aria-label', 'Science goal');
  const text = document.createElement('p');
  text.textContent = age === '10-12' ? `${Math.max(0, science)} / ${challenge.scienceGoal} science points` : science >= challenge.scienceGoal ? 'Goal reached!' : 'Keep exploring!';
  progress.setAttribute('aria-valuetext', text.textContent);
  goal.append(title, progress, text);
  sidebar.append(goal);
  host.replaceChildren(sidebar);
}
