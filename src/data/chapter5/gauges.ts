export const gaugeDefinitions = {
  energy: { title: 'Energy', icon: '⚡', unit: 'kWh' },
  air: { title: 'Air', icon: '🫁', unit: 'kg of oxygen' },
  dose: { title: 'Dose', icon: '☀️', unit: 'mSv' },
  food: { title: 'Food', icon: '🍱', unit: 'kg' },
  water: { title: 'Water', icon: '💧', unit: 'litres' },
  data: { title: 'Data to send', icon: '📡', unit: 'points' },
} as const;

export type ResourceId = keyof typeof gaugeDefinitions;
export type GaugeReading = Readonly<{ value: number; capacity: number }>;

/** Supplied by each future challenge's data file. Science is a separate goal. */
export type ChallengeGaugeConfig = Readonly<{
  main: readonly [ResourceId, ResourceId];
  extra: ResourceId;
  scienceGoal: number;
}>;
