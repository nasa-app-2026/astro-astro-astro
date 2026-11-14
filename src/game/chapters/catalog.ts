export interface ChapterInfo {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly stage: string;
  readonly focus: readonly string[];
  readonly summary: string;
}

// Keep this list stable. Each teammate implements only their own scene file.
export const chapters: readonly ChapterInfo[] = [
  { id: 'flyby', number: 1, title: 'Flyby test', stage: 'Exploration', focus: ['Radiation', 'Communication'], summary: 'Circle the Moon and return to Earth.' },
  { id: 'robots', number: 2, title: 'Robots go first', stage: 'Exploration', focus: ['Communication', 'Power'], summary: 'Scout the landing area with robotic helpers.' },
  { id: 'firstLanding', number: 3, title: 'First landing', stage: 'Establishing a presence', focus: ['Life support', 'Radiation'], summary: 'Land, explore, and bring the crew home.' },
  { id: 'building', number: 4, title: 'Building the outpost', stage: 'Establishing a presence', focus: ['Power', 'Radiation'], summary: 'Deliver supplies and build a safe shelter.' },
  { id: 'survival', number: 5, title: 'Survival', stage: 'Survival', focus: ['Power', 'Life support', 'Radiation'], summary: 'Keep the crew safe through a two-week stay.' },
  { id: 'expansion', number: 6, title: 'Expansion', stage: 'Expansion', focus: ['Food', 'Power', 'Communication'], summary: 'Grow the outpost with rovers and gardens.' },
  { id: 'sustainability', number: 7, title: 'Sustainability', stage: 'Sustainability', focus: ['Life support', 'Food', 'Power'], summary: 'Make more of what the outpost needs on the Moon.' },
];
