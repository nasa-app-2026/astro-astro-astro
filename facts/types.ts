export type FactLabel = 'measured' | 'rule' | 'estimate' | 'plan' | 'one-study' | 'known';

export const LABEL_WORDS: Record<FactLabel, string> = {
  measured: '📏 Measured',
  rule: '📜 NASA rule',
  estimate: "🧪 Scientists' estimate",
  plan: '📝 Plan (can change)',
  'one-study': '🔬 One study',
  known: '✅ Known fact',
};

export interface Fact {
  id: string;
  value?: number;
  range?: readonly [number, number];
  unit?: string;
  label: FactLabel;
  sources: readonly string[];
  credit: string;
  young: string;
  older: string;
}