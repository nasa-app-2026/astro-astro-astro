export const trainingOrder = ['Into the dark', 'Storm alert', 'Can you hear us?', 'Fresh food', 'Ice to air'] as const;
export type TrainingChallenge = typeof trainingOrder[number];
export type TrainingEntry = Readonly<{ challenge: TrainingChallenge; day: number; action: string; oxygen: number; energyUsed: number; description: string; changes: string; science: number; links?: readonly number[] }>;
export type TrainingProgress = Readonly<{ completed: readonly TrainingChallenge[]; finished: boolean }>;
export const initialTrainingProgress = (): TrainingProgress => ({ completed: [], finished: false });
export function finishChallenge(progress: TrainingProgress, name: TrainingChallenge): TrainingProgress {
  const completed = progress.completed.includes(name) ? [...progress.completed] : [...progress.completed, name];
  return { completed, finished: trainingOrder.every(item => completed.includes(item)) };
}
export function nextChallenge(progress: TrainingProgress): TrainingChallenge | null {
  return trainingOrder.find(name => !progress.completed.includes(name)) ?? null;
}
export function bigConnections(entries: readonly TrainingEntry[]): string[] {
  const result: string[] = [];
  if (entries.some(entry => ['lab', 'moonwalk', 'lamps'].includes(entry.action) && entry.energyUsed > 0)) result.push('Science used energy.');
  if (entries.some(entry => entry.oxygen > 0 || entry.action === 'split')) result.push('Energy makes oxygen.');
  if (entries.some(entry => entry.action === 'shelter' || entry.action === 'build')) result.push('Sheltering cost a day of science.');
  if (entries.some(entry => entry.action === 'send')) result.push('Science reached Earth when data was sent.');
  return result.slice(0, 3);
}
export const trainingStorageKey = 'junior-astronaut-chapter5-progress-v1';
