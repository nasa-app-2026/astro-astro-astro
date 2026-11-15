import type { Fact } from './types';
export const moonPlaces = {
    gravity: {
        id: "moonPlaces.gravity",
        value: 6,
        label: "known",
        sources: ["SRC-R04-07"],
        credit: "NASA",
        young: "🌑 Moon gravity is one sixth of Earth's (you'd weigh 6 times less), so astronauts bounce!",
        older: "Gravity on the Moon is about one sixth of Earth's: you would weigh 6 times less. There is gravity; it is just weaker."
    },
    noDustStorms: {
        id: "moonPlaces.noDustStorms",
        label: "known",
        sources: ["SRC-R04-07"],
        credit: "NASA",
        young: "🚫 There's no air on the Moon, so no wind and no dust storms!",
        older: "With no air there is no wind and no weather, so no dust storms. Dust is thrown up by meteor impacts, not wind."
    },
    poleSeasonSwing: {
        id: "moonPlaces.poleSeasonSwing",
        value: 3,
        unit: "degrees",
        label: "known",
        sources: ["SRC-R19-2-10"],
        credit: "NASA",
        young: "🌗 At the pole, the Sun's height changes by only 3 degrees in a whole year. On Earth it's 47!",
        older: "At the pole, the Sun's height at the horizon changes by only about 3 degrees in total (1.5 above to 1.5 below the horizon). On Earth it is 47 degrees."
    },
    moonSeasons: {
        id: "moonPlaces.moonSeasons",
        value: 346.6,
        unit: "Earth days",
        label: "known",
        sources: ["SRC-R19-2-11"],
        credit: "NASA",
        young: "🌓 The Moon's seasons repeat every 346.6 days, a bit shorter than our year!",
        older: "The Moon's seasons repeat every 346.6 Earth days, so polar summer and winter come about 19 days earlier on our calendar each year (calculated)."
    },
    polarSummer: {
        id: "moonPlaces.polarSummer",
        value: 240,
        unit: "days",
        label: "one-study",
        sources: ["SRC-R19-2-01", "SRC-R19-2-06"],
        credit: "Studies of NASA LRO data",
        young: "☀️ One study found a tiny sunny spot near Shackleton crater that stays lit for about 240 days in a row in summer!",
        older: "One study found a tiny sunny spot near Shackleton crater that stays lit for about 240 days in a row (another study: 4 to 9 months). These spots are only a few hundred metres across."
    },
    polarWinter: {
        id: "moonPlaces.polarWinter",
        label: "known",
        sources: ["SRC-R19-2-01", "SRC-R19-2-06"],
        credit: "Studies of NASA LRO data",
        young: "❄️ In polar winter, short dark spells come back every month, from a few hours to a few days.",
        older: "In polar winter, short dark spells of hours to a few days return each month until summer returns."
    },
    lunarEclipse: {
        id: "moonPlaces.lunarEclipse",
        value: 2,
        unit: "times a year",
        label: "known",
        sources: ["SRC-R19-2-08", "SRC-R19-2-09"],
        credit: "NASA",
        young: "🌑 About 2 times a year Earth's shadow can cover the Moon, and even a sunny ridge goes dark for a few hours!",
        older: "About 2 times a year, Earth's shadow can cover the Moon (a lunar eclipse), darkening even a sunny ridge for a few hours."
    },
    shadowCratersCold: {
        id: "moonPlaces.shadowCratersCold",
        label: "measured",
        sources: ["SRC-R17C-06"],
        credit: "NASA LRO",
        young: "🧊 Some craters near the poles never see the Sun and get as cold as about -203 °C!",
        older: "NASA says some permanently shadowed regions reach about -203 °C."
    },
    coldestPlace: {
        id: "moonPlaces.coldestPlace",
        value: -248,
        unit: "°C",
        label: "measured",
        sources: ["SRC-R04-08"],
        credit: "NASA LRO Diviner",
        young: "🥶 The coldest spot ever measured on the Moon was about -248 °C, in a crater near the north pole. One of the coldest places in the solar system!",
        older: "The coldest measured spot, about -248 °C, was in Hermite Crater near the north pole, among the coldest places in the solar system."
    },
    shadowArea: {
        id: "moonPlaces.shadowArea",
        value: 16000,
        unit: "km²",
        label: "measured",
        sources: ["SRC-R17C-02"],
        credit: "NASA LRO LOLA",
        young: "🌒 Near the south pole, about 16,000 km² of ground never sees the Sun. That's where ice can hide!",
        older: "LOLA mapping gives about 16,000 km² of permanently shadowed ground near the south pole, the only places where ice can last."
    },
    ice: {
        id: "moonPlaces.ice",
        value: 2009,
        label: "measured",
        sources: ["SRC-R04-09"],
        credit: "NASA LCROSS",
        young: "💧 In 2009 NASA crashed a rocket part into a dark crater on purpose, and found water ice in the dust cloud!",
        older: "On 9 October 2009, NASA's LCROSS crashed into Cabeus crater near the south pole; the plume contained water ice."
    },
    drierThanSahara: {
        id: "moonPlaces.drierThanSahara",
        value: 100,
        unit: "times",
        label: "known",
        sources: ["SRC-R04-42"],
        credit: "NASA",
        young: "🏜️ Even with ice in some craters, the Moon is about 100 times drier than the Sahara Desert!",
        older: "The Moon is about 100 times drier than the Sahara, even though ice exists in dark polar craters."
    },
    waterInSunnySoil: {
        id: "moonPlaces.waterInSunnySoil",
        value: 350,
        unit: "ml",
        label: "measured",
        sources: ["SRC-R04-44"],
        credit: "NASA",
        young: "💧 Sunny Moon soil holds a tiny bit of water: about one 350 ml bottle's worth in a cubic metre of soil!",
        older: "In sunlit Clavius crater, water stuck to dust grains is 100 to 412 parts per million: about a 350 ml bottle in a cubic metre of soil."
    },
    iceUses: {
        id: "moonPlaces.iceUses",
        label: "known",
        sources: ["SRC-R04-36", "SRC-R04-43"],
        credit: "NASA",
        young: "🚀 Moon ice could become drinking water, oxygen to breathe and rocket fuel!",
        older: "Ice could give drinking water, oxygen (by splitting water) and hydrogen and oxygen for rocket fuel. Using local materials is called ISRU."
    },
    iceUnknowns: {
        id: "moonPlaces.iceUnknowns",
        label: "known",
        sources: ["SRC-R04-45"],
        credit: "NASA",
        young: "❓ Nobody knows yet how much ice there is, how deep it goes, or where it came from, and whether it can be dug up at a sensible cost.",
        older: "Nobody knows yet how much ice there is, how deep it goes, where it came from, or whether it can be dug up at a sensible cost."
    },
    nineRegions: {
        id: "moonPlaces.nineRegions",
        value: 9,
        unit: "regions",
        label: "known",
        sources: ["SRC-R18-1-01", "SRC-R18-1-03"],
        credit: "NASA (Oct 2024)",
        young: "📍 In 2024 NASA picked 9 possible landing areas near the south pole. The final spot isn't chosen yet!",
        older: "In October 2024 NASA named 9 candidate regions near the south pole. No final landing site has been chosen (checked 10 Nov 2025)."
    },
    haworth: {
        id: "moonPlaces.haworth",
        value: 3,
        unit: "billion years",
        label: "one-study",
        sources: ["SRC-R18-1-15", "SRC-R18-1-16"],
        credit: "One 2026 study",
        young: "🕰️ The floor of Haworth crater has probably been dark for over 3 billion years. A perfect freezer for ice!",
        older: "One 2026 study: Haworth crater's floor has probably been dark for over 3 billion years, a top place to look for ice."
    },
    monsMouton: {
        id: "moonPlaces.monsMouton",
        value: 6,
        unit: "km high",
        label: "known",
        sources: ["SRC-R18-1-31", "SRC-R18-1-32"],
        credit: "NASA",
        young: "🏔️ Mons Mouton is a flat-topped Moon mountain about 6 km high, named after NASA mathematician Melba Roy Mouton!",
        older: "Mons Mouton is a flat-topped mountain about 6 km high and nearly 100 km across, named after NASA mathematician Melba Roy Mouton."
    },
    malpertCliff: {
        id: "moonPlaces.malpertCliff",
        value: 3500,
        unit: "metres",
        label: "known",
        sources: ["SRC-R18-1-10"],
        credit: "NASA",
        young: "🧗 Malpert Massif has a giant cliff about 3,500 metres tall!",
        older: "Malpert Massif is a huge mountain block, over 5,000 m above its base, with a cliff of about 3,500 metres."
    },
    iceFriendlyGround: {
        id: "moonPlaces.iceFriendlyGround",
        range: [7, 30],
        unit: "%",
        label: "one-study",
        sources: ["SRC-R18-2-05"],
        credit: "Moye and colleagues (2025, one study)",
        young: "🔭 One study found ice-friendly ground (cold, gentle slopes, walkable) from 7% (de Gerlache Rim 2) to 30% (Haworth) of each candidate region.",
        older: "One study (Moye 2025) estimates \"ice-friendly ground\" (cold, gentle slopes, walkable) from 7% (de Gerlache Rim 2) to 30% (Haworth) of each candidate region."
    },
    malpertEarthView: {
        id: "moonPlaces.malpertEarthView",
        label: "known",
        sources: ["SRC-R18-1-22"],
        credit: "NASA",
        young: "📡 Malpert Massif has \"exceptional Earth visibility\", useful for a communication site.",
        older: "NASA describes Malpert Massif as having \"exceptional Earth visibility\", useful for a communication site. NASA gives no number of hours or days."
    },
    nobileRim2EarthView: {
        id: "moonPlaces.nobileRim2EarthView",
        label: "one-study",
        sources: ["SRC-R18-2-07"],
        credit: "Peña-Asensio and colleagues (2025, one study)",
        young: "📡 One study found a spot on Nobile Rim 2 where Earth is in view about one third of the time (1 out of every 3).",
        older: "One study (Peña-Asensio 2025) found that the best-ranked landing spot on Nobile Rim 2 has direct contact with Earth about one-third of the time. That is one spot, not the whole region, and the same study ranked it the best spot of all it compared."
    },
    regolithDepth: {
        id: "moonPlaces.regolithDepth",
        range: [4, 6],
        unit: "metres",
        label: "one-study",
        sources: ["SRC-R04-16"],
        credit: "NASA-funded study (2026)",
        young: "⛏️ The Moon's loose soil is about 4 to 6 metres deep, deeper in the highlands.",
        older: "A NASA-funded study (2026) gives regolith about 4 to 6 metres deep in the maria (dark plains) and about 6 metres in the highlands."
    },
    farSideNotDark: {
        id: "moonPlaces.farSideNotDark",
        label: "known",
        sources: ["SRC-R04-07", "SRC-R04-47"],
        credit: "NASA",
        young: "🌗 The \"dark side\" isn't dark! The far side gets just as much sunshine. We just never see it from Earth.",
        older: "The far side gets as much sunlight as the near side. We see only one side because the Moon spins once for each trip around Earth."
    },
} as const satisfies Record<string, Fact>;
