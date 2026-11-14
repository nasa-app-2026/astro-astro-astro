import { survivalStorms, type StormReference } from './storm-data';
export type Action = 'research' | 'water' | 'oxygen' | 'both' | 'savePower' | 'shelter';
type Spell = { start: number; end: number; warning: number };
type Storm = { day: number; event: StormReference; falseAlarm: boolean };
export type Mission = { day: number; oxygen: number; water: number; power: number; radiation: number; research: number; spells: Spell[]; storms: Storm[]; sheltered: boolean; log: string; ended: boolean };
export function newMission(random = Math.random): Mission {
  const pick = (n: number) => Math.floor(random() * n);
  const spells: Spell[] = [];
  for (let i = 0, count = 1 + pick(3); i < count; i++) {
    const candidates: Spell[] = [];
    for (let start = 3; start <= 14; start++) for (let length = 1; length <= 3 && start + length - 1 <= 14; length++) {
      const end = start + length - 1;
      if (spells.every(s => end + 1 < s.start || start > s.end + 1)) candidates.push({ start, end, warning: Math.min(start - 1, 1 + pick(3)) });
    }
    if (candidates.length) spells.push(candidates[pick(candidates.length)]);
  }
  const storms: Storm[] = [];
  for (let i = 0, count = 1 + pick(2); i < count; i++) {
    const days = Array.from({ length: 13 }, (_, j) => j + 2).filter(day => storms.every(s => Math.abs(s.day - day) > 1));
    storms.push({ day: days[pick(days.length)], event: survivalStorms[pick(survivalStorms.length)], falseAlarm: random() < 0.25 });
  }
  return { day: 1, oxygen: 12, water: 25, power: 400, radiation: 0, research: 0, spells, storms, sheltered: false, log: 'The crew has arrived. Choose today’s work.', ended: false };
}
export function takeDay(m: Mission, action: Action): Mission {
  if (m.ended) return m;
  const incoming = m.storms.find(s => s.day === m.day);
  if (action === 'shelter' && !incoming) return m;
  const cost = action === 'research' || action === 'water' || action === 'oxygen' ? 15 : action === 'both' ? 30 : 0;
  const dark = m.spells.some(s => m.day >= s.start && m.day <= s.end);
  const power = m.power + (dark ? 0 : 50) + (action === 'savePower' && !dark ? 15 : 0);
  if (power < 28 + cost) return { ...m, log: 'Not enough power for that choice. Choose another action.' };
  const recycle = action === 'water' || action === 'both';
  const makeOxygen = action === 'oxygen' || action === 'both';
  const water = m.water - (recycle ? 0.4 : 5) - (makeOxygen ? 1.2 : 0) - (action === 'savePower' ? 0.5 : 0);
  const oxygen = m.oxygen - 1.6 + (makeOxygen ? 15 / 14 : 0) - (action === 'savePower' ? 0.2 : 0);
  const safe = action === 'shelter';
  const dose = incoming && !incoming.falseAlarm ? incoming.event.lunarDose.value! * (safe ? 0.5 : 1) : 0;
  const log = incoming ? incoming.falseAlarm ? 'False alarm: the storm missed the Moon.' : `${incoming.event.name} arrived. ${safe ? 'Shelter halved the simulated dose' : 'The crew was exposed'}: ${dose.toFixed(1)} mSv.` : action === 'shelter' ? 'The crew prepared the shelter and paused other work.' : 'The crew completed today’s work.';
  const ended = water <= 0 || oxygen <= 0 || m.radiation + 1.1 + dose >= 600 || m.day === 14;
  return { ...m, day: m.day + 1, oxygen: Math.max(0, oxygen), water: Math.max(0, water), power: power - 28 - cost, radiation: m.radiation + 1.1 + dose, research: m.research + (action === 'research' ? 1 : 0), sheltered: false, log, ended };
}
