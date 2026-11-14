/**
 * Real solar particle event references for the Survival chapter.
 *
 * Dose values are only included where the cited study reports a relevant
 * quantity. Skin dose, absorbed dose, and effective dose are different
 * quantities; don't present them as interchangeable mSv values.
 */
export type StormReference = {
  id: string;
  name: string;
  dates: string;
  intensity: string;
  lunarDose: {
    value: number;
    unit: 'mSv';
    quantity: string;
    conditions: string;
    status: 'published-estimate';
  };
  sources: readonly string[];
};

export const survivalStorms: readonly StormReference[] = [
  {
    id: 'february1956',
    name: 'February 1956 solar particle event',
    dates: '1956-02-23 to 1956-02-25',
    intensity: 'One of five major historical SPEs modeled in the 2026 study.',
    lunarDose: { value: 453, unit: 'mSv', quantity: 'modeled whole-body dose equivalent', conditions: 'Spacesuit-equivalent shielding (4.1 g/cm² aluminum), dose on the Moon; modeled estimate, not a direct astronaut measurement.', status: 'published-estimate' },
    sources: ['Blunier et al. (2026), Table 2: https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025SW004662'],
  },
  {
    id: 'november1960',
    name: 'November 1960 solar particle event',
    dates: '1960-11-12 to 1960-11-15',
    intensity: 'One of five major historical SPEs modeled in the 2026 study.',
    lunarDose: { value: 375, unit: 'mSv', quantity: 'modeled whole-body dose equivalent', conditions: 'Spacesuit-equivalent shielding (4.1 g/cm² aluminum), dose on the Moon; modeled estimate, not a direct astronaut measurement.', status: 'published-estimate' },
    sources: ['Blunier et al. (2026), Table 2: https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025SW004662'],
  },
  {
    id: 'july2000',
    name: 'July 2000 solar particle event',
    dates: '2000-07-14',
    intensity: 'One of five major historical SPEs modeled in the 2026 study.',
    lunarDose: { value: 447, unit: 'mSv', quantity: 'modeled whole-body dose equivalent', conditions: 'Spacesuit-equivalent shielding (4.1 g/cm² aluminum), dose on the Moon; modeled estimate using Hu spectrum. A second model gives 240 mSv.', status: 'published-estimate' },
    sources: ['Blunier et al. (2026), Table 2 and section 3.1: https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025SW004662'],
  },
  {
    id: 'august1972',
    name: 'August 1972 solar particle event',
    dates: '1972-08-04',
    intensity: 'Historically extreme; exact NOAA S-scale category is not specified in these facts.',
    lunarDose: {
      value: 670,
      unit: 'mSv',
      quantity: 'modeled whole-body dose equivalent',
      conditions: 'Spacesuit-equivalent shielding (4.1 g/cm² aluminum), dose on the Moon. A separate NASA-cited historical estimate gives 600 rem skin dose equivalent, which is a different quantity.',
      status: 'published-estimate',
    },
    sources: [
      'NASA, What We Learned About the Moon: Radiation (citing NCRP Report 98, p. 48): https://www.nasa.gov/wp-content/uploads/static/history/alsj/WOTM/WOTM-Radiation.html',
      'NASA Technical Memorandum 104471: https://ntrs.nasa.gov/api/citations/19910018297/downloads/19910018297.pdf',
    ],
  },
  {
    id: 'october1989',
    name: 'October 1989 solar proton event',
    dates: '1989-10',
    intensity: 'NOAA list peak in the facts file: about 40,000 pfu.',
    lunarDose: {
      value: 443,
      unit: 'mSv',
      quantity: 'modeled whole-body dose equivalent',
      conditions: 'Spacesuit-equivalent shielding (4.1 g/cm² aluminum), 19–21 October series, Hu spectrum. An alternative SEPEM model gives 219 mSv.',
      status: 'published-estimate',
    },
    sources: [
      'Blunier et al. (2026), modeled whole-body dose equivalent: 443 mSv for 19–21 October (Hu spectrum) or 219 mSv (SEPEM), spacesuit-equivalent shielding: https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2025SW004662',
      'NASA Space Math, Dosage Curves for Solar Proton Events (unshielded accumulated dose, about 1380 rem, and example shielding scenarios): https://science.nasa.gov/wp-content/uploads/2023/09/Radiation_Math.pdf',
      'NASA Technical Memorandum 104471: https://ntrs.nasa.gov/api/citations/19910018297/downloads/19910018297.pdf',
    ],
  },
];

/** Suggested concise day-log copy for the game. Dose is the modeled exposed
 * astronaut result; shelter outcomes should be separately modeled and labeled. */
export const stormDayReading = (storm: StormReference, sheltered: boolean): string => {
  const dose = storm.lunarDose;
  if (dose.unit !== 'mSv') return `Storm impact: ${storm.name}.`;
  const received = sheltered ? Math.round(dose.value * 0.5) : dose.value;
  const outcome = sheltered ? 'Shelter chosen; simulated gameplay dose:' : 'Shelter not chosen; modeled dose:';
  return `Storm impact: ${storm.name}. ${outcome} ${received} mSv.`;
};
