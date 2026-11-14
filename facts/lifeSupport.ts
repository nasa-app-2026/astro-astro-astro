import type { Fact } from './types';

export const lifeSupport = {
  oxygenPerDay: {
    id: "lifeSupport.oxygenPerDay",
    value: 0.8,
    unit: "kg per astronaut per day",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "🫁 Every astronaut breathes in about 0.8 kg of oxygen a day. That's like a big bottle of fizzy drink, made of gas!",
    older: "NASA planning numbers: each astronaut breathes in about 0.8 kg of oxygen a day."
  },
  co2PerDay: {
    id: "lifeSupport.co2PerDay",
    value: 1,
    unit: "kg per astronaut per day",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "😮‍💨 Each astronaut breathes out about 1 kg of carbon dioxide a day. Machines have to clean it out of the air!",
    older: "Each astronaut breathes out about 1 kg of carbon dioxide a day, which machines must remove."
  },
  waterPerDay: {
    id: "lifeSupport.waterPerDay",
    value: 2.5,
    unit: "litres per astronaut per day",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "💧 Each astronaut needs about 2.5 litres of water a day to drink and mix into food.",
    older: "Astronauts need about 2.5 litres for drinking and food."
  },
  washingWater: {
    id: "lifeSupport.washingWater",
    range: [3, 10],
    unit: "litres per astronaut per day",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "🚿 Washing uses 3 litres a day with space-station-style washing, or up to 10 litres with showers and laundry.",
    older: "Washing water: about 3 litres a day with space-station-style washing, up to 10 litres with showers, laundry and dish washing."
  },
  bodyHeat: {
    id: "lifeSupport.bodyHeat",
    value: 140,
    unit: "watts",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "💡 Every astronaut gives off about 140 watts of heat, like a bright old light bulb!",
    older: "Each astronaut gives off about 140 watts of heat all day, which the habitat must get rid of."
  },
  splitWater: {
    id: "lifeSupport.splitWater",
    label: "known",
    sources: ["SRC-R04-35"],
    credit: "NASA ISS",
    young: "💨 On the space station, oxygen is made by splitting water with electricity!",
    older: "On the ISS, oxygen is made by splitting water with electricity (electrolysis). Another machine removes carbon dioxide, and the Sabatier machine turns some of it back into water."
  },
  oxygenEnergyMinimum: {
    id: "lifeSupport.oxygenEnergyMinimum",
    range: [4, 5],
    unit: "kWh per kg",
    label: "estimate",
    sources: ["SRC-R17A-03"],
    credit: "NASA",
    young: "🔌 Making 1 kg of oxygen takes at least 4 to 5 kWh of electricity. Real machines need even more!",
    older: "Making 1 kg of oxygen by splitting water uses just over 1 kg of water and at least 4 to 5 kWh of electricity."
  },
  oxygenEnergyModel: {
    id: "lifeSupport.oxygenEnergyModel",
    value: 14,
    unit: "kWh per kg",
    label: "estimate",
    sources: ["SRC-R17F-01"],
    credit: "NASA-hosted model (Chitwood et al. 2018)",
    young: "🔋 A 2018 computer model of the space station's oxygen machine needs about 14 kWh per kg of oxygen. That's about what a home uses in half a day!",
    older: "A NASA-hosted computer model of the space station's oxygen machine needs about 14 kWh per kg of oxygen (a model of the 1998 design, not a measurement)."
  },
  issOxygenMachine: {
    id: "lifeSupport.issOxygenMachine",
    value: 5.4,
    unit: "kg per day",
    label: "known",
    sources: ["SRC-R17A-03"],
    credit: "NASA ISS",
    young: "🌬️ The space station's oxygen machine normally makes about 5.4 kg of oxygen a day, and up to about 9 kg.",
    older: "On the ISS the air and water machines use about 5 kW, and keeping the right temperature uses about 9 kW more (a one-day average)."
  },
  issLifeSupportPower: {
    id: "lifeSupport.issLifeSupportPower",
    value: 5,
    unit: "kW",
    label: "measured",
    sources: ["SRC-R04-34"],
    credit: "NASA ISS",
    young: "🔌 The space station recycles about 98% of its water, even from sweat and pee!",
    older: "The ISS recycles about 90% of its water, including from urine, sweat and breath."
  },
  waterRecycling: {
    id: "lifeSupport.waterRecycling",
    value: 98,
    unit: "%",
    label: "measured",
    sources: ["SRC-R04-34"],
    credit: "NASA ISS",
    young: "🚰 The space station recycles about 98% of its water, even from sweat and pee!",
    older: "The ISS recycles about 90% of its water, including from urine, sweat and breath."
  },
  habitatAir: {
    id: "lifeSupport.habitatAir",
    value: 8.2,
    unit: "psi",
    label: "plan",
    sources: ["SRC-R04-38"],
    credit: "NASA",
    young: "🎈 Moon homes may use lower air pressure, 8.2 psi, with extra oxygen. It makes getting ready for a moonwalk quicker!",
    older: "Moon habitat air is testing 8.2 psi with 34% oxygen for Moon missions (the ISS uses 14.7 psi with 21%). Lower pressure speeds up moonwalk preparation; the extra oxygen raises fire risk."
  },
  moonSoilOxygen: {
    id: "lifeSupport.moonSoilOxygen",
    range: [40, 45],
    unit: "%",
    label: "estimate",
    sources: ["SRC-R04-36"],
    credit: "NASA",
    young: "🪨 Moon soil is about 40-45% oxygen by mass (approximate), locked inside minerals.",
    older: "Moon rocks are 40 to 45% oxygen! It's locked inside the minerals, and scientists are learning how to get it out: in 2026 NASA used super-hot focused sunlight to heat pretend Moon soil, a first step to making oxygen from it. It was a test on Earth, not on the Moon."
  },
  oxygenFromSunlight: {
    id: "lifeSupport.oxygenFromSunlight",
    value: 2026,
    label: "known",
    sources: ["SRC-R04-36"],
    credit: "NASA",
    young: "☀️ In 2026 NASA used concentrated sunlight to heat simulated Moon soil and make carbon monoxide, which can be turned into oxygen. It was a test on Earth, not on the Moon."
  },
  suitsSpaceship: {
    id: "lifeSupport.suitsSpaceship",
    label: "known",
    sources: ["SRC-R05-23", "SRC-R05-24"],
    credit: "NASA Apollo",
    young: "👨‍🚀 A spacesuit is like a person! It's backpack gives oxygen, power and cooling water.",
    older: "A spacesuit gives oxygen, removes carbon dioxide, keeps the right pressure and controls temperature. Apollo's backpack (PLSS) carried a battery and cooling water."
  },
  apolloSuitHours: {
    id: "lifeSupport.apolloSuitHours",
    value: 7,
    unit: "hours",
    label: "plan",
    sources: ["SRC-R05-25"],
    credit: "NASA Apollo",
    young: "🔋 Apollo's backpack lasted about 7 hours of oxygen (approximate). When the cooling water ran out, the moonwalk had to end."
  },
  axeHours: {
    id: "lifeSupport.axeHours",
    value: 8,
    unit: "hours",
    label: "measured",
    sources: ["SRC-R04-38"],
    credit: "Axiom Space (company claim)",
    young: "👨‍🚀 The new Artemis suit, the AxEMU, is designed for moonwalks of up to 8 hours.",
    older: "Axiom says its AxEMU suit supports moonwalks of up to 8 hours, with boots insulated for the very cold south pole. First Moon use planned on Artemis IV (2028)."
  },
  apollo17Moonwalks: {
    id: "lifeSupport.apollo17Moonwalks",
    value: 22,
    unit: "hours",
    label: "known",
    sources: ["SRC-R05-18"],
    credit: "NASA Apollo 17",
    young: "🌕 Apollo 17's astronauts spent about 22 hours walking on the Moon over three moonwalks!",
    older: "Apollo 17 (1972) had three moonwalks of about 7.2, 7.6 and 7.3 hours, about 22 hours in total."
  },
  buddyHose: {
    id: "lifeSupport.buddyHose",
    label: "known",
    sources: ["SRC-R05-23"],
    credit: "NASA Apollo",
    young: "🤝 Astronauts always went out in pairs. An emergency oxygen bottle gave about 75 minutes to get back to the Lander.",
    older: "From Apollo 14, partners carried a \"buddy\" hose to share cooling water."
  },
  orionLivingSpace: {
    id: "lifeSupport.orionLivingSpace",
    value: 9,
    unit: "cubic metres",
    label: "known",
    sources: ["SRC-R05-28"],
    credit: "NASA Artemis II",
    young: "🚀 Four Artemis II astronauts share about 9 cubic metres (330 cubic feet) of living space, about as much as a small van.",
    older: "Orion gave the four Artemis II astronauts about 9 cubic metres (about 330 cubic feet) of living space, about the size of a minivan. With four crew and two suitcases, it was tight."
  },
  artemis2ToiletFix: {
    id: "lifeSupport.artemis2ToiletFix",
    label: "known",
    sources: ["SRC-R05-29"],
    credit: "NASA Artemis II",
    young: "🚽 On day one of Artemis II, the toilet showed a fault light. The crew and Mission Control fixed it together.",
    older: "On Artemis II's first day, the toilet showed a fault light; the crew and Mission Control fixed it together."
  },
  meteoroidSpeed: {
    id: "lifeSupport.meteoroidSpeed",
    range: [20, 72],
    unit: "km per second",
    label: "known",
    sources: ["SRC-R04-49"],
    credit: "NASA Apollo",
    young: "☄️ With no atmosphere, meteoroids hit the Moon at 20 to over 72 km per second. Even a 5 kg one can dig a crater over 9 m wide!",
    older: "With no atmosphere, meteoroids hit the Moon at 20 to over 72 km per second. Even a 5 kg one can dig a crater over 9 m wide."
  },
  sharpDust: {
    id: "lifeSupport.sharpDust",
    label: "known",
    sources: ["SRC-R04-49"],
    credit: "NASA Apollo",
    young: "🌑 Moon dust is like tiny pieces of glass. On Apollo it damaged boots and sample-box seals, jammed equipment and gave astronauts stuffy noses.",
    older: "Moon dust is sharp and clingy. On Apollo it damaged boots and sample-box seals, jammed equipment and gave astronauts stuffy noses."
  }
} as const satisfies Record<string, Fact>;