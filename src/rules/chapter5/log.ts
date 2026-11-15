import type { DayDecision, GaugeChange } from './into-the-dark';

export type DecisionLogEntry = Readonly<{
  challenge: string; day: number; decision: DayDecision;
  changes: readonly GaugeChange[]; science: number; actionName: string;
  actionEnergy: number; oxygenEnergy: number;
  links: readonly { day: number; resource: 'energy' }[];
}>;

/** Link a low-energy result to the largest actual earlier discretionary costs, including ties. */
export function linkEnergyProblem(entries: readonly DecisionLogEntry[], problemDay: number): DecisionLogEntry[] {
  const earlier = entries.filter(entry => entry.day < problemDay);
  const maximum = Math.max(0, ...earlier.map(entry => entry.actionEnergy + entry.oxygenEnergy));
  if (maximum === 0) return [...entries];
  return entries.map(entry => entry.day < problemDay && entry.actionEnergy + entry.oxygenEnergy === maximum
    && !entry.links.some(link => link.day === problemDay && link.resource === 'energy')
    ? { ...entry, links: [...entry.links, { day: problemDay, resource: 'energy' as const }] } : entry);
}
