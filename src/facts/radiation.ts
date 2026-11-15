import type { Fact } from './types';

export const radiation = {
  artemisIBodyDose: {
    id: "radiation.artemisIBodyDose",
    range: [0.96, 1.24],
    unit: "mSv per day",
    label: "measured",
    sources: ["SRC-R15A-08"],
    credit: "NASA Artemis I radiation detectors (2022)",
    young: "☀️ On the way to the Moon, detectors inside the Artemis I capsule soaked up 0.96 to 1.24 mSv of energy every day!",
    older: "Detectors inside Orion on Artemis I measured 0.96 to 1.24 mSv per day from cosmic rays on the way to and around the Moon."
  },
  issBodyDose: {
    id: "radiation.issBodyDose",
    value: 0.7,
    unit: "mSv per day",
    label: "measured",
    sources: ["SRC-R15A-08"],
    credit: "NASA Artemis I radiation study (2022)",
    young: "🛰️ On the space station, astronauts get about 0.7 mSv a day. Earth's magnetic field still helps protect them there.",
    older: "The same Artemis I study lists about 0.7 mSv per day on the International Space Station, which is still partly protected by Earth's magnetic field."
  },
  artemisIRange: {
    id: "radiation.artemisIRange",
    range: [27, 35],
    unit: "mSv per day",
    label: "measured",
    sources: ["SRC-R04-04"],
    credit: "NASA and DLR, Artemis I (2024 results)",
    young: "📊 Over the whole Artemis I mission (about 25 days), the dose was 27 to 35 mSv, depending on where the detector sat inside Orion.",
    older: "The whole 25-day Artemis I trip protected spots inside Orion."
  },
  doseVariesInside: {
    id: "radiation.doseVariesInside",
    value: 4,
    unit: "times",
    label: "measured",
    sources: ["SRC-R04-04"],
    credit: "NASA and DLR, Artemis I (2024 results)",
    young: "📉 Inside Orion, the best-protected spot got 4 times less radiation than the worst spot. Where you sit matters!",
    older: "Artemis I results showed the dose varied about 4 times between the best and worst radiation sensors."
  },
  artemisIAluminum: {
    id: "radiation.artemisIAluminum",
    label: "known",
    sources: ["SRC-R04-43", "SRC-R04-44", "SRC-R15A-04"],
    credit: "NASA Artemis I",
    young: "🛡️ Artemis I flew two torso models, Helga and Zohar, packed with radiation detectors (only Zohar wore a protective vest, so the two could be compared). It included a full-size dummy, Commander Moonikin Campos, packed with radiation sensors.",
    older: "Artemis I flew two female torso phantoms, Helga and Zohar, packed with radiation sensors (only Zohar wore a protective vest, so the two could be compared). It carried a full-size dummy, Commander Moonikin Campos, packed with radiation sensors."
  },
  transatlanticFlight: {
    id: "radiation.transatlanticFlight",
    value: 0.08,
    unit: "mSv",
    label: "known",
    sources: ["SRC-R15A-05"],
    credit: "UK Health Security Agency",
    young: "✈️ A long flight across the Atlantic gives about 0.08 mSv. One day near the Moon is 60 times as much!",
    older: "A long flight gives about 0.08 mSv (UK Health Security Agency). One day near the Moon is roughly 15 times as much. Flight is calculated..."
  },
  surfaceHalf: {
    id: "radiation.surfaceHalf",
    value: 0.5,
    label: "assumption",
    sources: ["SRC-R17C-06", "SRC-R17C-07"],
    credit: "NASA radiation model",
    young: "🪐 Standing on the Moon cuts your radiation by about half (50%), because the Moon blocks everything from below. NASA models use exactly half; it is an assumption, not a measurement.",
    older: "No detector from NASA or its partners has measured radiation on the surface itself yet. Measurements in lunar orbit (LRO, Artemis I) agree with the 'half of open space' rule."
  },
  careerLimit: {
    id: "radiation.careerLimit",
    value: 600,
    unit: "mSv",
    label: "plan",
    sources: ["SRC-R15A-01"],
    credit: "NASA",
    young: "🏠 NASA's rule: an astronaut's whole career must stay under 600 mSv. The same for every astronaut of any age or sex.",
    older: "NASA's career limit is 600 mSv, the same for every astronaut of any age or sex."
  },
  stormLimit: {
    id: "radiation.stormLimit",
    value: 250,
    unit: "mSv",
    label: "rule",
    sources: ["SRC-R15A-04", "SRC-R15A-15", "SRC-R17C-01"],
    credit: "NASA",
    young: "🚨 NASA's golden rule: if you could avoid some radiation, must stay under 250 mSv. NASA also follows 'as low as reasonably achievable'; avoid any dose that can be avoided, even under the limits.",
    older: "If a storm gives a dose over the storm limit of 250 mSv, it is called a radiation storm; find shelter."
  },
  galacticCosmicRays: {
    id: "radiation.galacticCosmicRays",
    label: "known",
    sources: ["SRC-R04-11", "SRC-R15C-01"],
    credit: "NASA",
    young: "☄️ Cosmic rays come from far outside our solar system. They are always there and zoom through walls almost as if they weren't there. Galactic cosmic rays are the main radiation problem for a Moon base.",
    older: "Galactic cosmic rays come from outside the solar system. They are always present, very energetic, and very hard to block, but predictable, so planners calculate their dose in advance."
  },
  solarParticleEvents: {
    id: "radiation.solarParticleEvents",
    label: "known",
    sources: ["SRC-R04-11"],
    credit: "NASA",
    young: "💥 Solar particle events are bursts of fast protons from the Sun. They are rare and hard to predict, and can give a big dose in hours, but they are mostly blocked by thick walls. Thick walls make a shower of particles that adds to the dose.",
    older: "Solar particle events are bursts of fast protons from the Sun. They are rare and hard to predict, and can give a big dose in hours, but they are mostly blocked by thick walls. Thick walls make a shower of particles that adds to the dose."
  },
  wallsCutCosmicRays: {
    id: "radiation.wallsCutCosmicRays",
    value: 10,
    unit: "%",
    label: "estimate",
    sources: ["SRC-R15A-14"],
    credit: "NASA",
    young: "🛡️ Habitat walls will cut cosmic-ray dose by only about 1% on average.",
    older: "Normal spacecraft walls cut cosmic rays by only about 1%. They are really hard to stop; even a 10% cut needs a heavy shield."
  },
  suitStormShield: {
    id: "radiation.suitStormShield",
    label: "known",
    sources: ["SRC-R15A-04"],
    credit: "NASA",
    young: "🚀 A spacesuit can't stop a solar storm. If a storm is coming, moonwalkers must go back inside.",
    older: "Space weather forecasts give a very high level of protection: astronauts can retreat to a storm shelter with a few hours' warning, safe inside at least 10 grams per square centimetre."
  },
  carrington: {
    id: "radiation.carrington",
    range: [15, 18],
    unit: "hours",
    label: "known",
    sources: ["SRC-R04-11"],
    credit: "NASA",
    young: "⏰ The fastest giant cloud from the Sun reaches us in 15 to 18 hours. Sometimes it takes days, which gives more warning.",
    older: "The fastest coronal mass ejections can arrive in as little as 15 to 18 hours; slower ones take several days."
  },
  noaaForecast: {
    id: "radiation.noaaForecast",
    label: "known",
    sources: ["SRC-R12V-19"],
    credit: "NOAA",
    young: "🔮 You can't predict exactly when the next big storm will happen. Forecasts give probabilities, not dates.",
    older: "NOAA's Space Weather Prediction Center puts out watches and warnings. Forecasts only give chances, not certainty."
  },
  solarCycle: {
    id: "radiation.solarCycle",
    value: 11,
    unit: "years",
    label: "known",
    sources: ["SRC-R12V-18"],
    credit: "NASA",
    young: "🔄 The Sun has busy and quiet years in a cycle that lasts about 11 years. Solar maximum is the busiest point of the cycle.",
    older: "The Sun goes through busy and quiet years in a cycle of about 11 years. The last solar maximum (the busiest point of the cycle) was in October 2024."
  },
  lunarSolarMax: {
    id: "radiation.lunarSolarMax",
    range: [27, 2000],
    unit: "mSv",
    label: "estimate",
    sources: ["SRC-R19-2-03"],
    credit: "NASA and Shanghai Observatory, one study (2022)",
    young: "🔮 The Sun is calm from 2027 to 2030, but a small storm can still give a big dose.",
    older: "One study predicts the Sun getting quieter from 2027 to 2030, which cuts cosmic rays. They say the Moon's surface gets about 0.4 mSv a day."
  },
  doseSunburst: {
    id: "radiation.doseSunburst",
    value: 4,
    unit: "mSv per day",
    label: "estimate",
    sources: ["SRC-R19-2-02"],
    credit: "NASA estimate (draft paper)",
    young: "☀️ Scientists predict the Sun will be about 0.4 mSv a day when the Sun is quiet, maybe 0.4 mSv a day on the surface at solar maximum. But big solar storms are more common when the Sun is busy, so there is no time with no danger.",
    older: "NASA estimate (draft paper): about 0.9 mSv per day on the surface at solar minimum, about twice the busy-Sun dose. But big solar storms are more common when the Sun is busy, so there is no time with no danger."
  },
  noSafeLaunchDate: {
    id: "radiation.noSafeLaunchDate",
    label: "known",
    sources: ["SRC-R17C-01", "SRC-R12V-20"],
    credit: "NASA",
    young: "🚀 NASA doesn't pick launch dates to avoid radiation. It watches the Sun all the time and shelters the crew if a storm comes.",
    older: "NASA does not choose Moon launch dates to avoid radiation. Artemis II's dates depend on launch windows, not radiation."
  },
  modelAccuracy: {
    id: "radiation.modelAccuracy",
    range: [3, 4],
    unit: "%",
    label: "measured",
    sources: ["SRC-R12V-21", "SRC-R19-2-21"],
    credit: "NASA",
    young: "🎯 NASA's models predicted the cosmic-ray dose inside Orion on Artemis I to within about 3-4% of what the detectors measured.",
    older: "NASA's models predicted the cosmic-ray dose inside Orion on Artemis I to within about 3-4% of what the detectors measured."
  },
  orionStormShield: {
    id: "radiation.orionStormShield",
    value: 150,
    unit: "g/cm²",
    label: "estimate",
    sources: ["SRC-R04-34", "SRC-R15A-04"],
    credit: "NASA",
    young: "📦 Orion's storm shelter is built from bags and supplies. It takes about 1 hour to build, and it can shield a big storm's dose to about 150 mSv, under NASA's 250 mSv storm limit.",
    older: "NASA's model predicted the Orion shelter's dose to about 150 mSv, under NASA's 250 mSv storm limit."
  },
  stormShelter: {
    id: "radiation.stormShelter",
    range: [1, 1.6],
    unit: "tonnes",
    label: "estimate",
    sources: ["SRC-R04-34"],
    credit: "NASA",
    young: "🏠 In a storm, Orion's crew builds a storm shelter in the central cabin from storage bags and supplies. It takes about 1 hour to build, and it can shield a big storm's dose to about 150 mSv, under NASA's 250 mSv storm limit.",
    older: "In a storm, Orion's crew builds a storm shelter in the central cabin from storage bags and supplies. It takes about 1 hour to build, and it can shield a big storm's dose to about 150 mSv, under NASA's 250 mSv storm limit."
  },
  aluminumShield: {
    id: "radiation.aluminumShield",
    range: [1, 1.6],
    unit: "tonnes",
    label: "estimate",
    sources: ["SRC-R12V-21", "SRC-R19-2-18"],
    credit: "NASA",
    young: "🛡️ A shelter that held a big storm's dose for 4 crew needs about 1.3 to 1.6 tonnes, mostly soil, water and food supplies, or about 10 g/cm² of aluminium.",
    older: "The best shield is the spacecraft itself: a sphere of 5 g/cm² is the best at stopping protons. Aluminium is the weakest common choice; water is a super shield. Heavy materials are good for radiation but heavy for a small ship."
  },
  hydrogenShielding: {
    id: "radiation.hydrogenShielding",
    value: 10,
    unit: "g/cm²",
    label: "estimate",
    sources: ["SRC-R15A-15"],
    credit: "NASA",
    young: "💧 Hydrogen-rich materials such as water, and polyethylene plastic block space radiation best. To measure shielding, 10 g/cm² is about 10 cm of aluminium or about 7 cm of loose soil (approx).",
    older: "Shields are measured by how much stuff is in the way: 10 g/cm² is about 10 cm of aluminium or about 7 cm of loose soil (approx)."
  },
  soilShielding: {
    id: "radiation.soilShielding",
    label: "one-study",
    sources: ["SRC-R17A-15"],
    credit: "NASA study",
    young: "🪨 Even more than 1 metre of Moon soil only cuts cosmic rays by about a quarter (one study).",
    older: "One metre of lunar soil cuts cosmic rays by about a quarter. Even 1 metre of soil cuts cosmic rays by about a quarter (one study)."
  },
  artemis2Sensors: {
    id: "radiation.artemis2Sensors",
    label: "known",
    sources: ["SRC-R15A-15"],
    credit: "NASA Artemis II (2026)",
    young: "📟 Artemis II had 6 radiation sensors in the cabin, plus a personal one on every astronaut.",
    older: "Artemis II had 6 radiation sensors in the cabin, plus a personal one on every astronaut. Orion's 6 radiation sensors measure total dose, how fast the dose arrives, and the mix of radiation in the cabin and personal dosimeter for each astronaut watched the dose, with two alert levels: a caution, then an alarm."
  },
  vanAllen: {
    id: "radiation.vanAllen",
    value: 1958,
    label: "known",
    sources: ["SRC-R04-21"],
    credit: "NASA",
    young: "🔔 Have you heard of the Van Allen belts, found in 1958?",
    older: "The Van Allen belts are two doughnut-shaped zones where Earth's magnetic field traps particles. James Van Allen discovered them in 1958 using Explorer 1. Moon missions cross them quickly."
  }
} as const satisfies Record<string, Fact>;