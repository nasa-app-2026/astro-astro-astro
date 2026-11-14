import type { Fact } from './types';

export const storms = {
  noaaScale: {
    id: "storms.noaaScale",
    value: 5,
    unit: "levels",
    label: "rule",
    sources: ["SRC-R17B-01"],
    credit: "NOAA space weather scales",
    young: "📻 Radiation storms are graded from S1 to S5. Each level up means 10 times more fast particles!",
    older: "NOAA rates solar radiation storms on 5 levels, from S1 (minor) to S5 (extreme). Each level means ten times more fast protons than the one before."
  },
  stormCountsPerCycle: {
    id: "storms.stormCountsPerCycle",
    value: 50,
    unit: "S1 storms",
    label: "estimate",
    sources: ["SRC-R17B-01"],
    credit: "NOAA",
    young: "🔢 In one 11-year Sun cycle there are about 50 small S1 storms, but fewer than one giant S5!",
    older: "In an 11-year solar cycle there are about 50 S1, 25 S2, 10 S3, 3 S4 and fewer than one S5 storm."
  },
  s3NoSpacewalks: {
    id: "storms.s3NoSpacewalks",
    value: 3,
    label: "rule",
    sources: ["SRC-R17B-01"],
    credit: "NOAA",
    young: "🚫 At level S3, NOAA says astronauts should stay inside and skip spacewalks.",
    older: "At S3, NOAA says astronauts should avoid spacewalks. At S4 and S5, anyone on a spacewalk gets a dose a crew cannot avoid."
  },
  measuredNearEarth: {
    id: "storms.measuredNearEarth",
    label: "known",
    sources: ["SRC-R17B-03"],
    credit: "NOAA GOES",
    young: "🛰️ Storm levels are measured by a satellite near Earth, not at the Moon.",
    older: "The S level is measured by a GOES satellite near Earth, not at the Moon. There is no official formula that turns an S level into a dose at the Moon."
  },
  august1972: {
    id: "storms.august1972",
    value: 1972,
    label: "known",
    sources: ["SRC-R17B-05"],
    credit: "NASA records",
    young: "💥 The biggest storm of the space age struck in August 1972, between two Apollo Moon trips. Phew, nobody was on the Moon!",
    older: "The biggest storm of the space age, in August 1972, came between Apollo 16 and 17. Estimates for an astronaut on the Moon with little shielding are far over NASA's 250 mSv storm limit."
  },
  noApolloStorm: {
    id: "storms.noApolloStorm",
    label: "known",
    sources: ["SRC-R17B-05"],
    credit: "NASA Apollo records",
    young: "🍀 No big solar storm ever hit an Apollo crew. Lucky!",
    older: "No big solar storm hit an Apollo crew during their missions."
  },
  october1989: {
    id: "storms.october1989",
    value: 1989,
    label: "known",
    sources: ["SRC-R17B-04", "SRC-R17G-06"],
    credit: "NOAA solar proton event list",
    young: "💥 In October 1989, a monster storm hit with one of the biggest particle counts ever recorded!",
    older: "In October 1989 one of the strongest proton storms on record peaked at about 40,000 pfu (NOAA list). A model of a shielded astronaut gives about 80 mGy on the Moon's surface."
  },
  halloween2003: {
    id: "storms.halloween2003",
    value: 2003,
    label: "known",
    sources: ["SRC-R17B-04"],
    credit: "NOAA solar proton event list",
    young: "🎃 Spooky! The Halloween storms of 2003 were some of the strongest ever.",
    older: "The Halloween storms of October 2003 peaked at about 29,500 pfu on NOAA's list, one of the largest proton storms on record."
  },
  september2017: {
    id: "storms.september2017",
    value: 2017,
    label: "measured",
    sources: ["SRC-R17D-05", "SRC-R17D-06", "SRC-R17D-21", "SRC-R17B-04"],
    credit: "NASA DONKI",
    young: "💥 In September 2017 the Sun fired two huge X-class flares and a radiation storm up to level S3. It's in NASA's DONKI storm diary!",
    older: "NASA's DONKI lists X9.3 and X8.2 flares and nine solar particle records in 4-13 September 2017, with a radiation storm up to S3."
  },
  may2024: {
    id: "storms.may2024",
    value: 2024,
    label: "measured",
    sources: ["SRC-R17D-06", "SRC-R17D-07"],
    credit: "NASA DONKI",
    young: "☀️ In May 2024 a giant storm painted auroras across the sky. NASA's DONKI recorded it!",
    older: "In 8-14 May 2024 the \"Gannon storm\" brought a G5 geomagnetic storm and 14 solar particle records in DONKI. It was mostly a geomagnetic storm, not a big radiation storm."
  }
} as const satisfies Record<string, Fact>;