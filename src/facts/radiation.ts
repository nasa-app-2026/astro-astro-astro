import type { Fact } from '../types';

export const radiation = {
  artemis1DailyDose: {
    id: "radiation.artemis1DailyDose",
    range: [0.96, 1.24],
    unit: "mSv per day",
    label: "measured",
    sources: ["SRC-R1SA-08"],
    credit: "NASA Artemis I radiation detectors (2022)",
    young: "On the way to the Moon, detectors inside the Artemis I capsule soaked up 0.96 to 1.24 mSv of radiation every day",
    older: "Detectors inside Orion on Artemis I measured 0.96 to 1.24 mSv per day from cosmic rays on the way to and around the Moon."
  },
  issDailyDose: {
    id: "radiation.issDailyDose",
    value: 0.7,
    unit: "mSv per day",
    label: "measured",
    sources: ["SRC-R1SA-08"],
    credit: "NASA Artemis I radiation study",
    young: "On the space station, astronauts get about 0.7 mSv a day. Earth's magnetic field still helps protect them there.",
    older: "The same Artemis I study puts the space station's daily dose at about 0.7 mSv per day of ionizing radiation. ISS astronauts stay inside a magnetic shell that is still partly protected by Earth's magnetic field."
  },
  artemis1TripDose: {
    id: "radiation.artemis1TripDose",
    range: [27, 35],
    unit: "mSv",
    label: "measured",
    sources: ["SRC-R1SA-08"],
    credit: "NASA Artemis I radiation study (2022)",
    young: "The whole Artemis I mission (about 25 days), the dose was 27 to 35 mSv, depending on where the detector sat inside Orion.",
    older: "Over the whole Artemis I mission (about 25 days), the dose was 27 to 35 mSv, depending on where the detector sat inside Orion."
  },
  sources: ["SRC-R04-04"],
  credit: "NASA and DLR, Artemis I (2024) results",
  young: "Inside Orion, the best-protected spot got 4 times less radiation than the worst spot, where you sit matters.",
  older: "Artemis I results showed the dose varied about 4 times between the best- and worst-protected spots inside Orion.",
  artemis1Dummies: {
    id: "radiation.artemis1Dummies",
    label: "known",
    sources: ["SRC-R04-03"],
    credit: "NASA Artemis I",
    young: "Artemis I carried no people. Instead it flew pretend astronauts called Helga, Zohar and Commander Moonikin Campos, plus a full-size dummy torso.",
    older: "Artemis I carried two torso models, Helga and Zohar, wearing protective vests, so the mission could compare radiation with and without that extra shielding."
  },
  artemis1Phantoms: {
    id: "radiation.artemis1Phantoms",
    label: "known",
    sources: ["SRC-R04-04"],
    credit: "NASA Artemis I",
    young: "Two torso models, Helga and Zohar, wore protective vests, so the mission could compare radiation with and without that extra shielding.",
    older: "Artemis I carried two torso models, Helga and Zohar, wearing protective vests, so the mission could compare radiation with and without that extra shielding."
  },
  transitFlight: {
    id: "radiation.transitFlight",
    value: 0.08,
    unit: "mSv",
    label: "estimate",
    sources: ["SRC-R17C-28"],
    credit: "UK Health Security Agency",
    young: "A long flight across the Atlantic gives about 0.08 mSv. One day near the Moon is more than 10 of those flights!",
    older: "A flight across the Atlantic gives about 0.08 mSv. So Artemis I's daily dose was roughly 12 such flights (calculated)."
  },
  surfaceHalf: {
    id: "radiation.surfaceHalf",
    value: 50,
    unit: "%",
    label: "estimate",
    sources: ["SRC-R17G-06", "SRC-R19-11"],
    credit: "NASA radiation models",
    young: "Standing on the Moon cuts your radiation by about half (50%) because the Moon itself is a giant shield under your feet!",
    older: "On the surface you get about half (50%) the radiation of open space, because the Moon blocks everything from below. NASA models use exactly half. It is an assumption, not a measurement."
  },
  noSurfaceMeasurement: {
    id: "radiation.noSurfaceMeasurement",
    label: "known",
    sources: ["SRC-R19-11"],
    credit: "NASA",
    young: "No astronaut has yet measured radiation on the Moon's surface yet. Maybe Artemis astronauts will be first!",
    older: "No detector from NASA or its partners has measured radiation on the surface itself yet. Measurements in lunar orbit (LRO, Artemis I) agree with the 'half of open space' rule."
  },
  careerLimit: {
    id: "radiation.careerLimit",
    value: 600,
    unit: "mSv",
    label: "rule",
    sources: ["SRC-R04-01"],
    credit: "NASA-STD-3001",
    young: "NASA's rule: an astronaut's whole career must stay under 600 mSv.",
    older: "NASA's career limit is less than 600 mSv, the same for every astronaut of any age or sex."
  },
  stormLimit: {
    id: "radiation.stormLimit",
    value: 250,
    unit: "mSv",
    label: "rule",
    sources: ["SRC-R04-01"],
    credit: "NASA-STD-3001",
    young: "NASA limits the dose from a single solar storm to 250 mSv.",
    older: "NASA limits the dose from a single solar storm to 250 mSv."
  },
  asLowAsPossible: {
    id: "radiation.asLowAsPossible",
    label: "rule",
    sources: ["SRC-R04-01"],
    credit: "NASA-STD-3001",
    young: "NASA's golden rule: if you can avoid some radiation, avoid it!",
    older: "NASA also follows 'as low as reasonably achievable': avoid any dose that can be avoided, even under the limits."
  },
  cosmicRays: {
    id: "radiation.cosmicRays",
    label: "known",
    sources: ["SRC-R04-13", "SRC-R17G-01"],
    credit: "NASA",
    young: "Cosmic rays come from far beyond our solar system. They are always there and zoom through walls almost as if they weren't there!",
    older: "Galactic cosmic rays come from outside the solar system. They are always present, very energetic and very hard to block, but predictable, so planners calculate their dose in advance."
  },
  solarStorms: {
    id: "radiation.solarStorms",
    label: "known",
    sources: ["SRC-R04-15", "SRC-R17G-01"],
    credit: "NASA",
    young: "Solar storms are surprise bursts of particles from the Sun. They are rare and hard to predict, and can give a big dose in hours, but they are much easier to block than cosmic rays.",
    older: "Solar storms are surprise bursts of particles from the Sun. They are rare and hard to predict, and can give a big dose in hours, but they are much easier to block than cosmic rays."
  },
  wallsCutCosmicRays: {
    id: "radiation.wallsCutCosmicRays",
    value: 10,
    unit: "%",
    label: "plan",
    sources: ["SRC-R19-06"],
    credit: "NASA (draft paper)",
    young: "Habitat walls only stop about 10% of cosmic rays, so a moonwalk adds hardly any extra cosmic-ray dose.",
    older: "NASA hopes habitat walls will cut cosmic-ray dose by only about 10% (draft NASA paper). So a moonwalk adds only a tiny bit of extra cosmic-ray dose."
  },
  shieldingCutsCosmicRays: {
    id: "radiation.shieldingCutsCosmicRays",
    value: 7,
    unit: "%",
    label: "estimate",
    sources: ["SRC-R17G-01"],
    credit: "NASA",
    young: "Normal spacecraft walls cut cosmic rays by only about 7%, they are really hard to stop!",
    older: "NASA says normal shielding cuts cosmic-ray dose by only about 7% on average."
  },
  suitNoStormShield: {
    id: "radiation.suitNoStormShield",
    label: "known",
    sources: ["SRC-R19-05"],
    credit: "NASA",
    young: "A spacesuit can't stop a solar storm. If a storm is coming, moonwalkers must head back inside!",
    older: "Storm shelter is not in a spacesuit, so the real danger comes from being caught out on a moonwalk."
  },
  backInsideTime: {
    id: "radiation.backInsideTime",
    value: 2,
    unit: "hours",
    label: "rule",
    sources: ["SRC-R19-05"],
    credit: "NASA design guidance",
    young: "When an alarm sounds, moonwalkers should be back behind shielding within about 2 hours.",
    older: "NASA design guidance says real-time alarms give a 'very high level of protection' if the moonwalk ends and the crew is back behind shielding within about 2 hours."
  },
  crewAlarm: {
    id: "radiation.crewAlarm",
    range: [15, 18],
    unit: "hours",
    label: "known",
    sources: ["SRC-R04-11"],
    credit: "NASA",
    young: "The fastest giant clouds from the Sun reach us in 15 to 18 hours. Slower ones take a few days.",
    older: "The fastest giant clouds from the Sun reach us in 15-18 hours, slower ones take several days."
  },
  noExactForecast: {
    id: "radiation.noExactForecast",
    label: "known",
    sources: ["SRC-R04-11"],
    credit: "NASA",
    young: "Nobody can say exactly when the next big solar storm will come. Forecasts only give chances.",
    older: "Nobody can predict exactly when the next big storm will happen. Space weather forecasts give probabilities, not dates."
  },
  solarCycle: {
    id: "radiation.solarCycle",
    value: 11,
    unit: "years",
    label: "known",
    sources: ["SRC-R19-01", "SRC-R19-1-04"],
    credit: "NASA and NOAA",
    young: "The Sun has busy and quiet years, in a cycle that lasts about 11 years!",
    older: "The Sun goes through busy and quiet years in a cycle of about 11 years."
  },
  lastSolarMax: {
    id: "radiation.lastSolarMax",
    value: 2024,
    label: "measured",
    sources: ["SRC-R19-1-01", "SRC-R19-1-04"],
    credit: "NASA and NOAA",
    young: "The Sun was at its busiest in October 2024!",
    older: "The last solar maximum (the busiest point of the cycle) was in October 2024."
  },
  quietSunAhead: {
    id: "radiation.quietSunAhead",
    range: [2027, 2030],
    label: "estimate",
    sources: ["SRC-R19-1-03"],
    credit: "NASA prediction",
    young: "The Sun is getting quieter from 2027 to 2030.",
    older: "The Sun is getting quieter from 2027 to 2030."
  },
  doseBusySun: {
    id: "radiation.doseBusySun",
    value: 0.4,
    unit: "mSv per day",
    label: "estimate",
    sources: ["SRC-R19-1-06"],
    credit: "NASA estimate (draft paper)",
    young: "When the Sun is busy, it pushes cosmic rays away. That's the Moon's surface got about 0.4 mSv a day.",
    older: "A NASA estimate (draft paper) about 0.4 mSv per day on the Moon's surface at solar maximum, because a busy Sun pushes cosmic rays away."
  },
  doseQuietSun: {
    id: "radiation.doseQuietSun",
    value: 0.9,
    unit: "mSv per day",
    label: "estimate",
    sources: ["SRC-R19-1-06"],
    credit: "NASA estimate (draft paper)",
    young: "When the Sun is quiet, more cosmic rays sneak in. That's about 0.9 mSv a day.",
    older: "A NASA estimate (draft paper) about 0.9 mSv per day on the surface at solar minimum, about twice the busy-Sun dose. But big solar storms are more common when the Sun is busy, so there is no time with no danger."
  },
  noLaunchChance: {
    id: "radiation.noSafelaunchChance",
    label: "known",
    sources: ["SRC-R19-1-22"],
    credit: "NASA",
    young: "NASA doesn't pick a launch date to dodge radiation. It watches the Sun all the time and shelters the crew if a storm comes.",
    older: "NASA does not choose Moon launch dates to avoid radiation. Artemis II's dates depend on eclipse length, the path home, supplies, weather and the range. NASA watches the Sun constantly instead."
  },
  modelAccuracy: {
    id: "radiation.modelAccuracy",
    range: [3, 4],
    unit: "%",
    label: "measured",
    sources: ["SRC-R19-1-12"],
    credit: "NASA",
    young: "NASA's computer predicted Artemis I's cosmic-ray dose so well that it was only 3 to 4% off!",
    older: "NASA's model predicted the cosmic-ray dose inside Orion on Artemis I to within about 3-4% of what the detectors measured (on the space station, about 10%)."
  },
  orionShelter: {
    id: "radiation.orionShelter",
    label: "known",
    sources: ["SRC-R04-04"],
    credit: "NASA and DLR, Artemis I",
    young: "In Orion, the crew builds a fort from bags and supplies. It takes about 1 hour to build it, and they can stay in it for up to a day.",
    older: "In Orion, the crew builds a storm shelter in the central cabin from storage bags and supplies. It takes about 1 hour to build, and NASA says it can keep a big storm's dose to about 150 mSv, safely under the limit."
  },
  artemis1ShelterDose: {
    id: "radiation.artemis1ShelterDose",
    value: 150,
    unit: "mSv",
    label: "measured",
    sources: ["SRC-R04-04"],
    credit: "NASA and DLR, Artemis I",
    young: "Hiding in Orion's shelter would keep even a big storm's dose to about 150 mSv, safely under the limit.",
    older: "Artemis I results showed the shelter could keep a big storm's dose to about 150 mSv, under NASA's 250 mSv storm limit."
  },
  shelterMass: {
    id: "radiation.shelterMass",
    range: [1.3, 1.6],
    unit: "tonnes",
    label: "estimate",
    sources: ["SRC-R19-2-17", "SRC-R19-2-10"],
    credit: "NASA study",
    young: "A shelter that halves a big storm's dose for 4 astronauts weighs 1.3 to 1.6 tonnes. That's about as heavy as a car!",
    older: "In a NASA study of a deep-space home for 4 crew, shelters that halved a big storm dose needed 1.3 to 1.6 tonnes of mostly water, food and supplies onboard."
  },
  waterBlanket: {
    id: "radiation.watershield",
    label: "known",
    sources: ["SRC-R17G-02", "SRC-R17G-03"],
    credit: "NASA",
    young: "Water is a super shield! It's full of hydrogen, which is great at stopping space particles.",
    older: "For the same weight, hydrogen-rich materials such as water and polyethylene block space radiation best. Aluminum is the weakest common choice."
  },
  shieldingMeasure: {
    id: "radiation.shieldingMeasure",
    value: 10,
    unit: "g/cm2",
    label: "estimate",
    sources: ["SRC-R17G-01"],
    credit: "NASA",
    young: "Shielding is measured by how much stuff is in the way. 10 g/cm2 is about 10 cm of water or 7 cm of Moon soil.",
    older: "Shielding is measured in g/cm2 (how much mass is above a square centimetre of surface). 10 g/cm2 is about 10 cm of water or 7 cm of Moon soil. Even more than 1 metre of soil gives only a modest extra reduction."
  },
  soilBarelyStopsCosmicRays: {
    id: "radiation.soilBarelyStopsCosmicRays",
    value: 1,
    unit: "metre",
    label: "one-study",
    sources: ["SRC-R17B-15"],
    credit: "DLR study (2024)",
    young: "Even 1 metre of Moon soil only cuts cosmic rays by about a quarter (one study).",
    older: "One study (German DLR, 2024) found more than 1 metre of Moon soil cuts cosmic-ray dose by only about a quarter."
  },
  artemisSensors: {
    id: "radiation.artemisSensors",
    value: 6,
    unit: "sensors",
    label: "known",
    sources: ["SRC-R14-05"],
    credit: "NASA Artemis II (2026)",
    young: "Artemis II had 6 radiation sensors in the cabin, plus a personal one on every astronaut.",
    older: "On Artemis II, 6 radiation sensors in the Orion cabin and a personal dosimeter on each astronaut watched the dose, with two alert levels: a caution at 10 mSv and a warning at 75 mSv."
  },
  artemis2DosesNotOut: {
    id: "radiation.artemis2DosesNotOut",
    label: "known",
    sources: ["SRC-R19-1-21"],
    credit: "NASA",
    young: "NASA hasn't told us yet how much radiation the Artemis II astronauts got (checked 10 Nov 2026).",
    older: "NASA has not yet published the Artemis II crew's doses or its alert levels (checked 10 Nov 2026)."
  },
  vanAllenBelts: {
    id: "radiation.vanAllenBelts",
    value: 1958,
    label: "known",
    sources: ["SRC-R04-13"],
    credit: "NASA",
    young: "Earth has two doughnut-shaped radiation zones called the Van Allen belts, found in 1958!",
    older: "The Van Allen belts are two doughnut-shaped zones where Earth's magnetic field traps particles. James Van Allen discovered them in 1958 using Explorer 1. Moon missions cross them quickly."
  }
} as const satisfies Record<string, Fact>;