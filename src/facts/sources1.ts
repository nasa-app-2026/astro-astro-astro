// Generated from docs/knowledge/sources-list.md; run node scripts/generate-source-catalog.mjs.
export type SourceGroup = 'nasaChallengeResource' | 'nasa' | 'nasaMedia' | 'partner' | 'other' | 'media';
export type SourceChecked = 'read' | 'searchResultOnly' | 'notVerified' | 'other' | 'unknown';
export interface Source { key: string; title: string; organisation: string; url?: string; group: SourceGroup; challengeResource?: string; licence?: string; checked: SourceChecked; topics: readonly string[]; usedBy: readonly string[]; }
export const GROUP_WORDS: Record<SourceGroup, string> = { nasaChallengeResource: '🚀 NASA data named in the challenge', nasa: '🚀 NASA', nasaMedia: '🖼️ NASA pictures and sounds', partner: '🤝 Other space and science agencies', other: '🌎 Other sources', media: '🎨 Free game art and sounds' };

export const sources1: readonly Source[] = [
  {
    "key": "SRC-006",
    "title": "DONKI Space Weather Database",
    "organisation": "NASA Moon to Mars Space Weather Analysis Office",
    "url": "https://ccmc.gsfc.nasa.gov/DONKI/",
    "group": "nasaChallengeResource",
    "challengeResource": "DONKI (Space Weather Database)",
    "checked": "read",
    "topics": [
      "chapters",
      "game data"
    ],
    "usedBy": [
      "chapters.chapter5",
      "game.chapter5StormArchive"
    ]
  },
  {
    "key": "SRC-R17D-06",
    "title": "DONKI SEP JSON, Sept 2017 and May 2024 (and HTTP 400 for Apr–Jul 2024)",
    "organisation": "NASA CCMC",
    "url": "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/SEP?startDate=2017-09-01&endDate=2017-09-15",
    "group": "nasaChallengeResource",
    "challengeResource": "DONKI (Space Weather Database)",
    "checked": "read",
    "topics": [
      "storms"
    ],
    "usedBy": [
      "storms.may2024",
      "storms.september2017"
    ]
  },
  {
    "key": "SRC-R17D-05",
    "title": "DONKI FLR JSON, 2017-09-06 to 2017-09-10",
    "organisation": "NASA CCMC",
    "url": "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/FLR?startDate=2017-09-06&endDate=2017-09-10",
    "group": "nasaChallengeResource",
    "challengeResource": "DONKI (Space Weather Database)",
    "checked": "read",
    "topics": [
      "storms"
    ],
    "usedBy": [
      "storms.september2017"
    ]
  },
  {
    "key": "SRC-R17D-07",
    "title": "DONKI GST JSON, 8–15 May 2024",
    "organisation": "NASA CCMC",
    "url": "https://ccmc.gsfc.nasa.gov/DONKI/WS/get/GST?startDate=2024-05-08&endDate=2024-05-15",
    "group": "nasaChallengeResource",
    "challengeResource": "DONKI (Space Weather Database)",
    "checked": "read",
    "topics": [
      "storms"
    ],
    "usedBy": [
      "storms.may2024"
    ]
  },
  {
    "key": "SRC-R15A-08",
    "title": "George et al., Space radiation measurements during the Artemis I lunar mission, Nature 634, 2024",
    "organisation": "NASA, DLR, ESA et al.",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11446838/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "radiation",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter1",
      "radiation.artemis1DailyDose",
      "radiation.artemis1TripDose",
      "radiation.issDailyDose",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R04-01",
    "title": "NASA-STD-3001 Technical Brief: Design for Ionizing Radiation Protection (OCHMO-TB-020 Rev E, 27 Dec 2022)",
    "organisation": "NASA OCHMO",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.asLowAsPossible",
      "radiation.careerLimit",
      "radiation.stormLimit",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R17A-01",
    "title": "NASA, Life Support Baseline Values and Assumptions Document, NASA/TP-2015-218570/Rev1, Jan 2018",
    "organisation": "NASA",
    "url": "https://ntrs.nasa.gov/api/citations/20180001338/downloads/20180001338.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "food",
      "lifeSupport",
      "power",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter6",
      "food.cropAreaFullDiet",
      "food.gramsPerKwh",
      "food.plantPower",
      "food.plantWater",
      "lifeSupport.bodyHeat",
      "lifeSupport.co2PerDay",
      "lifeSupport.issLifeSupportPower",
      "lifeSupport.oxygenPerDay",
      "lifeSupport.washingWater",
      "lifeSupport.waterPerDay",
      "power.storageMakesHeavier",
      "resources.food",
      "resources.lifeSupport"
    ]
  },
  {
    "key": "SRC-R17B-04",
    "title": "Solar Proton Events affecting the Earth environment, 1976–present",
    "organisation": "NOAA SESC, hosted by NASA GSFC SDAC",
    "url": "https://umbra.nascom.nasa.gov/SEP/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "game data",
      "storms"
    ],
    "usedBy": [
      "game.chapter5StormArchive",
      "storms.halloween2003",
      "storms.october1989",
      "storms.september2017"
    ]
  },
  {
    "key": "SRC-R17C-02",
    "title": "Mazarico et al. 2011, Illumination conditions of the lunar polar regions using LOLA topography, Icarus 211 (abstract)",
    "organisation": "NASA NTRS",
    "url": "https://ntrs.nasa.gov/citations/20120010094",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "moonPlaces",
      "power",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter5",
      "chapters.chapter7",
      "moonPlaces.shadowArea",
      "power.darkSpells",
      "power.ridgeSunshine",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R18-1-01",
    "title": "NASA Provides Update on Artemis III Moon Landing Regions (28 Oct 2024)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "moonPlaces"
    ],
    "usedBy": [
      "chapters.chapter3",
      "moonPlaces.nineRegions"
    ]
  },
  {
    "key": "SRC-R04-07",
    "title": "Earth's Moon: Facts",
    "organisation": "NASA Science",
    "url": "https://science.nasa.gov/moon/facts/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces",
      "power",
      "resources"
    ],
    "usedBy": [
      "moonPlaces.farSideNotDark",
      "moonPlaces.gravity",
      "moonPlaces.noDustStorms",
      "power.dayHot",
      "power.nightCold",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R04-09",
    "title": "LCROSS mission page",
    "organisation": "NASA Science",
    "url": "https://science.nasa.gov/mission/lcross/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "moonPlaces"
    ],
    "usedBy": [
      "chapters.chapter2",
      "moonPlaces.lcross"
    ]
  },
  {
    "key": "SRC-R04-08",
    "title": "Ten Cool Things Seen in the First Year of LRO",
    "organisation": "NASA SVS",
    "url": "https://svs.gsfc.nasa.gov/10595",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces"
    ],
    "usedBy": [
      "moonPlaces.coldestPlace"
    ]
  },
  {
    "key": "SRC-R19-1-21",
    "title": "To Protect Artemis II Astronauts, NASA Experts Keep Eyes on Sun (16 Mar 2026)",
    "organisation": "NASA Science",
    "url": "https://science.nasa.gov/missions/artemis/artemis-2/to-protect-artemis-ii-astronauts-nasa-experts-keep-eyes-on-sun/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.artemis2DosesNotOut",
      "radiation.noSafeLaunchDate",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R05-01",
    "title": "NASA's Artemis II Crew Eclipses Record for Farthest Human Spaceflight (6 Apr 2026)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/news-release/nasas-artemis-ii-crew-eclipses-record-for-farthest-human-spaceflight/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "communication",
      "missions",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter1",
      "communication.artemis2Blackout",
      "missions.artemis2",
      "resources.communication"
    ]
  },
  {
    "key": "SRC-R19-1-06",
    "title": "Simonsen, L. C., Moon 2 Mars Space Radiation Protection: \"Buying Down\" Risks to Crew (ASCEND 2025 draft)",
    "organisation": "NASA HQ (NTRS 20250006168)",
    "url": "https://ntrs.nasa.gov/api/citations/20250006168/downloads/ASCEND%20Simonsen%20draft%201.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.doseBusySun",
      "radiation.doseQuietSun",
      "radiation.wallsCutCosmicRays",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R04-44",
    "title": "NASA's SOFIA Discovers Water on Sunlit Surface of Moon (26 Oct 2020)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/news-release/nasas-sofia-discovers-water-on-sunlit-surface-of-moon/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces"
    ],
    "usedBy": [
      "moonPlaces.waterInSunnySoil"
    ]
  },
  {
    "key": "SRC-R04-34",
    "title": "NASA Achieves Water Recovery Milestone on International Space Station (20 Jun 2023)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "lifeSupport",
      "resources"
    ],
    "usedBy": [
      "lifeSupport.waterRecycling",
      "resources.lifeSupport"
    ]
  },
  {
    "key": "SRC-R19-1-05",
    "title": "NASA-STD-3001 Technical Brief OCHMO-TB-020 Rev E, Design for Ionizing Radiation Protection (27 Dec 2022)",
    "organisation": "NASA OCHMO",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "radiation"
    ],
    "usedBy": [
      "chapters.chapter3",
      "radiation.backInsideTime",
      "radiation.noSurfaceMeasurement",
      "radiation.suitNoStormShield"
    ]
  },
  {
    "key": "SRC-R15B-11",
    "title": "NASA Laser Terminal Enhances Views During Artemis II Mission (28 Apr 2026)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/missions/artemis/artemis-2/nasa-laser-terminal-enhances-views-during-artemis-ii-mission/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "communication",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter1",
      "communication.artemis2Laser",
      "resources.communication"
    ]
  },
  {
    "key": "SRC-R17A-07",
    "title": "NASA NSSDC Moon Fact Sheet",
    "organisation": "NASA NSSDC",
    "url": "https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "power",
      "resources"
    ],
    "usedBy": [
      "power.sunlightPower",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R19-1-01",
    "title": "NASA, NOAA: Sun Reaches Maximum Phase in 11-Year Solar Cycle (15 Oct 2024)",
    "organisation": "NASA Science",
    "url": "https://science.nasa.gov/science-research/heliophysics/NASA-noaa-sun-reaches-maximum-phase-in-11-year-solar-cycle/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation"
    ],
    "usedBy": [
      "radiation.lastSolarMax",
      "radiation.solarCycle"
    ]
  },
  {
    "key": "SRC-R19-1-12",
    "title": "Slaba, T. C. et al., Validated space radiation exposure predictions from earth to mars during Artemis-I, npj Microgravity 11:6 (11 Feb 2025)",
    "organisation": "NASA Langley et al. (PMC)",
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11814067/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.modelAccuracy",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R05-18",
    "title": "Apollo 17: Mission Details",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/missions/apollo/apollo-17-mission-details/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "lifeSupport"
    ],
    "usedBy": [
      "lifeSupport.apollo17Moonwalks"
    ]
  },
  {
    "key": "SRC-R17A-14",
    "title": "NASA release on Blue Ghost Mission 1, 18 March 2025",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/news-release/nasa-science-continues-after-fireflys-first-moon-mission-concludes/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "power"
    ],
    "usedBy": [
      "power.blueGhostNight"
    ]
  },
  {
    "key": "SRC-R17C-06",
    "title": "Moon Base: environment",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/reference/moonbase-environment/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces"
    ],
    "usedBy": [
      "moonPlaces.shadowCraterCold"
    ]
  },
  {
    "key": "SRC-R05-09",
    "title": "Artemis II splashdown coverage (10 Apr 2026): NASA \"Artemis II Return to Earth\" gallery; Fox Weather; SpacePolicyOnline",
    "organisation": "NASA / media",
    "url": "https://www.nasa.gov/gallery/return-to-earth/",
    "group": "nasa",
    "checked": "searchResultOnly",
    "topics": [
      "chapters",
      "communication",
      "missions",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter1",
      "communication.artemis2Blackout",
      "missions.artemis2",
      "resources.communication"
    ]
  },
  {
    "key": "SRC-R04-36",
    "title": "Sunlight Extracts Oxygen From Regolith Using Solar Chemistry (13 Feb 2026)",
    "organisation": "NASA JSC",
    "url": "https://www.nasa.gov/centers-and-facilities/johnson/sunlight-extracts-oxygen-from-regolith-using-solar-chemistry/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "lifeSupport",
      "moonPlaces",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter7",
      "lifeSupport.moonSoilOxygen",
      "lifeSupport.oxygenFromSunlight",
      "moonPlaces.iceUses",
      "resources.lifeSupport"
    ]
  },
  {
    "key": "SRC-R17D-21",
    "title": "September 2017's Intense Solar Activity Viewed From Space; GLE 72 papers",
    "organisation": "NASA; arXiv 1903.05428",
    "url": "https://www.nasa.gov/missions/goes/september-2017s-intense-solar-activity-viewed-from-space/",
    "group": "nasa",
    "checked": "searchResultOnly",
    "topics": [
      "storms"
    ],
    "usedBy": [
      "storms.september2017"
    ]
  },
  {
    "key": "SRC-R17G-01",
    "title": "OCHMO-TB-020 Design for Ionizing Radiation Protection, Rev E (27 Dec 2022)",
    "organisation": "NASA OCHMO",
    "url": "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.cosmicRays",
      "radiation.shieldingCutsCosmicRays",
      "radiation.shieldingMeasure",
      "radiation.solarStorms",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R04-47",
    "title": "Moon Phases",
    "organisation": "NASA Science",
    "url": "https://science.nasa.gov/moon/moon-phases/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces",
      "power",
      "resources"
    ],
    "usedBy": [
      "moonPlaces.farSideNotDark",
      "power.equatorNight",
      "power.lunarDay",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R15B-02",
    "title": "Space Food System Overview (X. Wu, ISS/Artemis Food System Manager, 2025)",
    "organisation": "NASA NTRS",
    "url": "https://ntrs.nasa.gov/api/citations/20250004456/downloads/ISS%20Food%20System%20Overview%20-%20ION%20052025.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "food",
      "resources"
    ],
    "usedBy": [
      "food.allFoodFromEarth",
      "food.foodShelfLife",
      "food.issMenu",
      "resources.food"
    ]
  },
  {
    "key": "SRC-R19-2-01",
    "title": "Illumination Conditions of the Lunar Polar Regions Using LOLA Topography (Mazarico, Neumann, Smith, Zuber, Torrence; Icarus 211, 2011) – NTRS record",
    "organisation": "NASA NTRS / Icarus",
    "url": "https://ntrs.nasa.gov/citations/20120010094",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "moonPlaces",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter5",
      "moonPlaces.polarSummer",
      "moonPlaces.polarWinter",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R19-2-09",
    "title": "Lunar Environment and Lunar Power Needs (H. J. Fincannon, NASA Glenn; NTRS 20205002224)",
    "organisation": "NASA NTRS",
    "url": "https://ntrs.nasa.gov/api/citations/20205002224/downloads/Lunar%20Environment%20and%20Lunar%20Power%20Needs_2.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "moonPlaces",
      "power",
      "resources"
    ],
    "usedBy": [
      "moonPlaces.lunarEclipse",
      "power.lightPatternIsExample",
      "power.winterWarning",
      "resources.power"
    ]
  },
  {
    "key": "SRC-R04-15",
    "title": "Lunar Radiation talk (Clowdsley, NASA Langley, NTRS 20210009760)",
    "organisation": "NASA NTRS",
    "url": "https://ntrs.nasa.gov/api/citations/20210009760/downloads/Clowdsley_Lunar_Radiation_Talk_v2.pdf",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "radiation",
      "resources"
    ],
    "usedBy": [
      "radiation.cosmicRays",
      "radiation.solarStorms",
      "resources.radiation"
    ]
  },
  {
    "key": "SRC-R04-27",
    "title": "Fission Surface Power (page updated 8 Sep 2025)",
    "organisation": "NASA",
    "url": "https://www.nasa.gov/exploration-systems-development-mission-directorate/fission-surface-power/",
    "group": "nasa",
    "checked": "read",
    "topics": [
      "chapters",
      "power",
      "resources"
    ],
    "usedBy": [
      "chapters.chapter6",
      "power.fissionPower",
      "resources.power"
    ]
  }
];
