import { power } from '../../facts/power';

// Unit conversion: one Earth day contains 24 hours.
export const hoursPerDay = 24;

export const settings = Object.freeze({
  baseUsePerDay: 28, // Game rule, made up for fun — kWh
  solarPerSunnyDay: 50, // Game rule, made up for fun — kWh
  labScienceCost: 15, // Game rule, made up for fun — kWh
  moonwalkCost: 10, // Game rule, made up for fun — kWh
  // Real: 1.5 kW of heating for 24 hours = 36 kWh (using the catalog estimate).
  extraHeatingPerDarkDay: power.emptyBaseHeating.value * hoursPerDay,
  gaugeLowFraction: 0.25, // Game rule, made up for fun — display threshold only
  gaugeHighFraction: 0.75, // Game rule, made up for fun — display threshold only
  displayDecimals: 1, // Game rule, made up for fun — presentation precision
  challengeDays: 6, // Game rule, made up for fun
  darkDays: [3, 4], // Game rule, made up for fun — one two-day example
  startingEnergy: 120, // Game rule, made up for fun — kWh
  startingAir: 8, // Game rule, made up for fun — kg
  scienceGoal: 5, // Game rule, made up for fun — points
  crewCount: 2, // Game rule, made up for fun — astronauts
  labScienceGain: 1, // Game rule, made up for fun — points
  moonwalkScienceGain: 2, // Game rule, made up for fun — points
  oxygenChoices: [0, 1, 2], // Game rule, made up for fun — kg
  quietDosePerDay: 0.9, // Game rule, made up for fun — mSv/day; unsourced training assumption
});
