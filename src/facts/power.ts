import type { Fact } from './types';

export const power = {
  lunarDay: {
    id: "power.lunarDay",
    value: 29.5,
    unit: "Earth days",
    label: "known",
    sources: ["SRC-R04-47"],
    credit: "NASA",
    young: "🌗 One Moon day, from sunrise to sunrise, lasts about 29.5 Earth days!",
    older: "A full lunar day-night cycle lasts about 29.5 Earth days."
  },
  equatorNight: {
    id: "power.equatorNight",
    value: 14,
    unit: "Earth days",
    label: "known",
    sources: ["SRC-R04-47", "SRC-R04-29"],
    credit: "NASA",
    young: "🌙 Near the Moon's middle, night lasts about 14 Earth days. That's two weeks with no sunshine!",
    older: "Near the equator the night lasts nearly two weeks (about 14 Earth days), so solar panels make no power for that long."
  },
  nightCold: {
    id: "power.nightCold",
    value: -173,
    unit: "°C",
    label: "measured",
    sources: ["SRC-R04-07"],
    credit: "NASA LRO Diviner",
    young: "🥶 Moon nights near the equator drop to about -173 °C. Brrr! Machines need heaters to survive.",
    older: "Night near the equator falls to about -173 °C, so machines need power for heaters as well as for work."
  },
  dayHot: {
    id: "power.dayHot",
    value: 127,
    unit: "°C",
    label: "measured",
    sources: ["SRC-R04-07"],
    credit: "NASA LRO Diviner",
    young: "🔥 In the daytime the ground can heat up to about 127 °C. Hotter than boiling water!",
    older: "Sunny ground near the equator reaches about 127 °C, hotter than boiling water."
  },
  sunlightPower: {
    id: "power.sunlightPower",
    value: 1361,
    unit: "watts per m²",
    label: "measured",
    sources: ["SRC-R17A-07"],
    credit: "NASA",
    young: "☀️ Every square metre of sunlight on the Moon carries about 1,361 watts of power!",
    older: "Sunlight at the Moon brings about 1,361 watts per square metre."
  },
  solarCellEfficiency: {
    id: "power.solarCellEfficiency",
    value: 30,
    unit: "%",
    label: "known",
    sources: ["SRC-R17A-09"],
    credit: "NASA",
    young: "🔋 The best space solar cells turn about 30% of sunlight into electricity.",
    older: "The best space solar cells turn about 30% of sunlight into electricity (up to 34%)."
  },
  sunLowAtPole: {
    id: "power.sunLowAtPole",
    value: 1.5,
    unit: "degrees",
    label: "known",
    sources: ["SRC-R17C-03", "SRC-R17C-04"],
    credit: "NASA LRO",
    young: "📐 At the south pole the Sun never climbs high. It rolls around the edge of the sky, never more than 1.5 degrees up, like a torch circling a room!",
    older: "Near the poles the Sun never rises more than about 1.5 degrees above the horizon. It circles the horizon once every lunar day, with no ordinary sunrise or sunset."
  },
  ridgeSunshine: {
    id: "power.ridgeSunshine",
    range: [86, 92],
    unit: "%",
    label: "estimate",
    sources: ["SRC-R17C-02", "SRC-R17C-07", "SRC-R17C-10"],
    credit: "NASA LRO studies",
    young: "☀️ The sunniest south pole ridges are lit 86 to 92% of the time. That's about 9 days out of 10!",
    older: "The best polar ridges are lit about 86-92% of the time at ground level (studies differ), and up to about 96% for a panel 10 m up."
  },
  darkSpells: {
    id: "power.darkSpells",
    range: [1.5, 5],
    unit: "days",
    label: "estimate",
    sources: ["SRC-R17C-02", "SRC-R17C-07"],
    credit: "NASA LRO studies",
    young: "🌑 On the best ridges, the longest dark spell lasts only about 1.5 to 5 days, not 2 whole weeks!",
    older: "On the sunniest ridges near Shackleton crater, the longest dark spell is only about 1.5 to 5 days. There is no 14-day night there."
  },
  neverAlwaysSunny: {
    id: "power.neverAlwaysSunny",
    label: "known",
    sources: ["SRC-R17C-05"],
    credit: "NASA",
    young: "🚫 No place on the Moon is sunny all the time. Even the best ridges are dark about 1 day in 10.",
    older: "No place is lit all the time (\"peaks of eternal light\" is a myth). Even the best ridges are dark about one tenth of the time."
  },
  lightPatternsExample: {
    id: "power.lightPatternsExample",
    label: "known",
    sources: ["SRC-R19-2-06", "SRC-R19-2-09", "SRC-R19-2-14"],
    credit: "NASA studies",
    young: "📐 How much sun you get depends on exactly where you stand, how tall your panel is and the time of year. Our game's pattern is just an example!",
    older: "Sunlight depends on the exact spot (a few metres matter), the panel's height and the year, so any light pattern in the game is an example, not a forecast."
  },
  tallSolarArray: {
    id: "power.tallSolarArray",
    value: 10,
    unit: "kW",
    label: "plan",
    sources: ["SRC-R17A-11"],
    credit: "NASA design",
    young: "🔌 NASA's tall solar panel design aims to make 10 kW from 36 m² of panels, standing high so hills don't shade it.",
    older: "NASA's tall solar array design aims for 10 kW from 36 m² of panels, at least 10 m up so hills do not shade it."
  },
  mastHeight: {
    id: "power.mastHeight",
    value: 20,
    unit: "metres",
    label: "plan",
    sources: ["SRC-R04-33"],
    credit: "NASA",
    young: "📏 NASA is testing solar panels on masts up to about 20 metres tall, like giant flagpoles!",
    older: "NASA is testing tall vertical solar panels on masts up to about 20 metres high to catch the low Sun at the pole."
  },
  batteriesForNight: {
    id: "power.batteriesForNight",
    value: 22000,
    unit: "kg",
    label: "estimate",
    sources: ["SRC-R17A-10"],
    credit: "NASA",
    young: "🔋 Running a base on batteries through one 14-day equator night would need about 22,000 kg of batteries. That's about as heavy as 4 elephants!",
    older: "Keeping a 10 kW base running through the 354-hour equator night would need about 22,000 kg of lithium-ion batteries. Fuel cells could cut that about in half (a target, not yet flown)."
  },
  storageMakesHeavier: {
    id: "power.storageMakesHeavier",
    value: 14,
    unit: "times",
    label: "estimate",
    sources: ["SRC-R17A-01"],
    credit: "NASA planning book (BVAD)",
    young: "🏋️ Adding night-time storage makes a solar power system about 14 times heavier!",
    older: "Adding night-time storage makes a solar power system about 14 times heavier for each kW."
  },
  fuelCells: {
    id: "power.fuelCells",
    label: "known",
    sources: ["SRC-R04-29"],
    credit: "NASA Glenn",
    young: "🔋 A fuel cell is like a rechargeable battery that uses water: sunlight splits the water, and at night the gases join back up to make electricity!",
    older: "Regenerative fuel cells split water into hydrogen and oxygen in sunlight, then join them back into water at night, making electricity and heat. NASA Glenn is testing one about as long as a car."
  },
  emptyBaseHeating: {
    id: "power.emptyBaseHeating",
    value: 1.5,
    unit: "kW",
    label: "estimate",
    sources: ["SRC-R17A-12"],
    credit: "NASA",
    young: "🔥 Even an empty base needs about 1.5 kW of heating in the dark, like a big electric heater left on.",
    older: "Even an empty habitat needs about 1.5 kW of heating in the dark. Over a 100-hour polar dark spell that adds up to 155 kWh, depending on clever choices such as folding the radiators."
  },
  robotNightHeat: {
    id: "power.robotNightHeat",
    value: 100,
    unit: "watts",
    label: "estimate",
    sources: ["SRC-R17A-13"],
    credit: "NASA",
    young: "🤖 A small robot lander needs about 100 watts of heat all night just to stay alive.",
    older: "A small robot lander needs about 100 watts of heat all night just to survive."
  },
  blueGhostNight: {
    id: "power.blueGhostNight",
    value: 14,
    unit: "days",
    label: "measured",
    sources: ["SRC-R17A-14"],
    credit: "NASA CLPS, Firefly Blue Ghost",
    young: "🌙 The Blue Ghost lander worked for about 14 days, then a few hours into the freezing night.",
    older: "Most robot landers were not built to survive the night. Firefly's Blue Ghost (2025) worked for about 14 days, then a few hours into the night."
  },
  fissionPower: {
    id: "power.fissionPower",
    value: 40,
    unit: "kW",
    label: "plan",
    sources: ["SRC-R04-27"],
    credit: "NASA Fission Surface Power",
    young: "⚛️ NASA plans a small nuclear power station of at least 40 kW, enough for about 30 homes, working day and night!",
    older: "NASA's Fission Surface Power project aims for at least 40 kW, enough for about 30 homes, for ten years, day and night."
  },
  reactorTarget: {
    id: "power.reactorTarget",
    value: 2030,
    label: "plan",
    sources: ["SRC-R04-28"],
    credit: "NASA and US Department of Energy",
    young: "⚛️ NASA plans to have a Moon nuclear reactor ready by 2030.",
    older: "In January 2026 the US Department of Energy agreed to work toward a lunar reactor by 2030 (check the latest news)."
  },
  winterWarning: {
    id: "power.winterWarning",
    label: "one-study",
    sources: ["SRC-R17A-15"],
    credit: "One NASA engineer's planning paper",
    young: "🥶 One NASA engineer says crews shouldn't stay at the pole during the dark winter spells. Too cold and too many batteries needed!",
    older: "One NASA rule of thumb: crews should not be at a polar base during the dark winter spells (heavy batteries or nuclear power needed; dangerous cold). This is one planning paper, not an Artemis rule."
  },
  dustPanel: {
    id: "power.dustPanel",
    label: "known",
    sources: ["SRC-R04-49"],
    credit: "NASA",
    young: "🌪️ Moon dust is clingy. It can coat solar panels and wear down power connectors.",
    older: "Moon dust is sharp and clingy. It can coat solar panels and wear down connectors."
  }
} as const satisfies Record<string, Fact>;