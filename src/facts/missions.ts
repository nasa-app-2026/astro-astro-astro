import type { Fact } from './types';

export const missions = {
  artemis1: {
    id: "missions.artemis1",
    value: 2022,
    label: "known",
    sources: ["SRC-R05-08"],
    credit: "NASA Artemis I",
    young: "🚀 In 2022, Artemis I flew around the Moon and back with no people on board, a test run of about 25 days!",
    older: "Artemis I (16 Nov to 11 Dec 2022) flew SLS and Orion around the Moon and back with no crew, about 25.5 days."
  },
  artemis2: {
    id: "missions.artemis2",
    value: 2026,
    label: "known",
    sources: ["SRC-R05-01", "SRC-R05-09"],
    credit: "NASA Artemis II",
    young: "👨‍🚀 In April 2026, Artemis II flew 4 astronauts around the Moon, farther from Earth than any humans before!",
    older: "Artemis II (1 to 10 April 2026) flew Reid Wiseman, Victor Glover, Christina Koch and Jeremy Hansen around the Moon, setting a record of about 406,800 km from Earth. No landing."
  },
  artemis3: {
    id: "missions.artemis3",
    value: 2027,
    label: "plan",
    sources: ["SRC-R05-02", "SRC-R05-03"],
    credit: "NASA Artemis III",
    young: "🚀 Artemis III is planned for 2027, will practise docking with Moon landers close to Earth. No landing!",
    older: "Artemis III is now a crew test flight in Earth orbit, planned for 2027, to practise docking with test versions of the Starship and Blue Moon landers."
  },
  artemis4: {
    id: "missions.artemis4",
    value: 2028,
    label: "plan",
    sources: ["SRC-R05-02", "SRC-R05-04", "SRC-R14A-09"],
    credit: "NASA",
    young: "🌙 The first Artemis Moon landing is planned for 2028, near the south pole. Two astronauts land and two wait in orbit!",
    older: "The first Artemis landing is now Artemis IV, planned for 2028 near the south pole. Four launch in Orion; two land and two stay in Orion."
  },
  twoMoonwalks: {
    id: "missions.twoMoonwalks",
    value: 2,
    unit: "hours each",
    label: "plan",
    sources: ["SRC-R14A-09"],
    credit: "NASA",
    young: "👣 On the first landing, NASA plans two moonwalks of about 2 hours each.",
    older: "NASA targets two moonwalks of about 2 hours each during several days on the surface."
  },
  sls: {
    id: "missions.sls",
    value: 98,
    unit: "metres",
    label: "known",
    sources: ["SRC-R14A-05"],
    credit: "NASA SLS",
    young: "🚀 The SLS rocket is about 98 metres tall, taller than the Statue of Liberty!",
    older: "SLS is about 98 metres tall and pushes with more force than Apollo's Saturn V."
  },
  orion: {
    id: "missions.orion",
    value: 21,
    unit: "days",
    label: "known",
    sources: ["SRC-R14A-06"],
    credit: "NASA Orion",
    young: "🚀 Orion carries 4 astronauts for up to 21 days. Its European Service Module gives power, air, water and the main engine.",
    older: "Orion carries four astronauts for up to 21 days. Its European Service Module gives power, air, water and the main engine."
  },
  heatShield: {
    id: "missions.heatShield",
    value: 2700,
    unit: "°C",
    label: "known",
    sources: ["SRC-R14A-06"],
    credit: "NASA Orion",
    young: "🔥 Coming home, Orion's heat shield gets hotter than 2,700 °C!",
    older: "Orion hits the air at about 40,000 km/h coming home; its 5-metre heat shield gets hotter than 2,700 °C and slowly burns away to carry the heat off."
  },
  gatewayPaused: {
    id: "missions.gatewayPaused",
    value: 2026,
    label: "known",
    sources: ["SRC-R05-05", "SRC-R05-43"],
    credit: "NASA",
    young: "🛑 NASA paused its plan for a space station around the Moon (Gateway) in March 2026, to focus on a base on the surface. NASA has not called it cancelled.",
    older: "On 24 March 2026 NASA paused Gateway \"in its current form\" to focus on the Moon surface. NASA has not called it cancelled."
  },
  moonBasePhases: {
    id: "missions.moonBasePhases",
    value: 3,
    unit: "phases",
    label: "plan",
    sources: ["SRC-R14A-18", "SRC-R14C-02"],
    credit: "NASA Moon Base plan",
    young: "🏗️ NASA's Moon Base plan has 3 steps: robots test and learn (to 2029), build and expand (2029-2032), live and work on the Moon (2032 onwards).",
    older: "NASA's Moon Base plan has 3 phases: experiment and learn (to 2029), build and expand (2029-2032), live and work on the Moon (2032 onwards)."
  },
  pressurisedRover: {
    id: "missions.pressurisedRover",
    value: 28,
    unit: "days",
    label: "plan",
    sources: ["SRC-R14A-18", "SRC-R14C-04"],
    credit: "JAXA and NASA",
    young: "🚐 Japan is building a pressurised rover, a camper van for the Moon, for trips of up to 28 days!",
    older: "Japan's pressurised rover, a small home on wheels, is planned for trips of up to 28 days without spacesuits inside."
  },
  terrainVehicles: {
    id: "missions.terrainVehicles",
    value: 10,
    unit: "km",
    label: "plan",
    sources: ["SRC-R14A-19"],
    credit: "NASA",
    young: "🚙 NASA's new Moon buggies should drive 10 km on one charge with two astronauts!",
    older: "NASA's Lunar Terrain Vehicle should carry two suited astronauts up to 10 km on one charge with up to 80 kg of rocks and tools (design goals)."
  },
  viper: {
    id: "missions.viper",
    value: 2027,
    label: "plan",
    sources: ["SRC-R18-1-39", "SRC-R18-1-39"],
    credit: "NASA VIPER",
    young: "🤖 A ice-hunting rover VIPER is planned to land on Mons Mouton in late 2027!",
    older: "NASA revived VIPER in Sept 2025; Blue Origin is to deliver it to Mons Mouton in late 2027 for a 100-day ice-mapping mission."
  },
  im2Tipped: {
    id: "missions.im2Tipped",
    value: 2025,
    label: "known",
    sources: ["SRC-R18-1-37"],
    credit: "NASA CLPS",
    young: "🤕 In March 2025, the IM-2 robot lander landed on Mons Mouton but tipped over. Landing on the Moon is hard!",
    older: "IM-2 (Athena) landed on Mons Mouton on 6 March 2025 but ended up on its side and stopped working the next day."
  },
  blueGhostSuccess: {
    id: "missions.blueGhostSuccess",
    value: 2025,
    label: "known",
    sources: ["SRC-R14C-18"],
    credit: "NASA CLPS, Firefly",
    young: "✅ In 2025 the Blue Ghost lander touched down perfectly and worked for about 14 days!",
    older: "Blue Ghost 1 (March 2025) was a full success and worked about 14 days."
  },
  clps: {
    id: "missions.clps",
    label: "known",
    sources: ["SRC-R12V-01"],
    credit: "NASA CLPS",
    young: "📦 NASA pays companies to deliver its experiments to the Moon, like a space delivery service!",
    older: "Through CLPS, NASA pays US companies to carry its instruments to the Moon instead of building every lander itself."
  },
  smallLanderCargo: {
    id: "missions.smallLanderCargo",
    range: [100, 625],
    unit: "kg",
    label: "estimate",
    sources: ["SRC-R19-2-26", "SRC-R19-2-27", "SRC-R19-2-28"],
    credit: "Company figures",
    young: "📦 Small robot landers carry about 100 to 625 kg, from a few suitcases up to about a small car!",
    older: "Small robot landers carry about 100 to 625 kg to the surface (company figures)."
  },
  blueMoonMk1Cargo: {
    id: "missions.blueMoonMk1Cargo",
    value: 3,
    unit: "tonnes",
    label: "plan",
    sources: ["SRC-R19-2-21"],
    credit: "Blue Origin (company figure)",
    young: "🌙 Blue Origin's Blue Moon Mark 1 lander can carry about 3 tonnes, says the company.",
    older: "Blue Moon Mark 1 can carry about 3 tonnes (company figure, see note in 'results')."
  },
  bigCargoLanders: {
    id: "missions.bigCargoLanders",
    range: [12, 15],
    unit: "tonnes",
    label: "plan",
    sources: ["SRC-R19-2-23", "SRC-R19-2-25"],
    credit: "NASA",
    young: "🚚 NASA plans big cargo landers that carry 12 to 15 tonnes, about the weight of 2 elephants!",
    older: "NASA plans larger cargo landers that can land 12 to 15 tonnes from Artemis VII onwards, for example Japan's pressurised rover or a 'surface habitat'."
  },
  artemisAccords: {
    id: "missions.artemisAccords",
    value: 78,
    unit: "nations",
    label: "known",
    sources: ["SRC-R12V-13"],
    credit: "NASA Artemis Accords",
    young: "🤝 78 countries have signed the Artemis Accords, promising to explore space peacefully together!",
    older: "The Artemis Accords are shared principles for peaceful, open space exploration. Set up in 2020. 78 nations had signed by 28 Oct 2026."
  },
  partners: {
    id: "missions.partners",
    label: "known",
    sources: ["SRC-R12V-16", "SRC-R12V-17"],
    credit: "NASA partner page",
    young: "🤝 Canada, Europe, Japan and the UAE all help build Artemis!",
    older: "NASA's partner page lists Canada's CSA (Canadarm3), ESA (Orion's service module), JAXA (the pressurised rover) and the UAE's MBRSC (the Gateway airlock)."
  }
} as const satisfies Record<string, Fact>;