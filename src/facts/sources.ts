// Generated from docs/knowledge/sources-list.md; run node scripts/generate-source-catalog.mjs.
import { sources1 } from './sources1';
import { sources2 } from './sources2';
import { sources3 } from './sources3';
import { sources4 } from './sources4';
import type { Source } from './sources1';
export type { Source, SourceGroup, SourceChecked } from './sources1';
export { GROUP_WORDS } from './sources1';

export const sources: readonly Source[] = [...sources1, ...sources2, ...sources3, ...sources4];
const index = new Map(sources.map(source => [source.key, source]));
export function getSource(key: string): Source | undefined { return index.get(key); }
export const mediaSourceKey: Readonly<Record<string, string>> = {
  "airlock-door": "MEDIA-FREESOUND",
  "airlock-hiss": "MEDIA-FREESOUND",
  "ambience-space-drone": "MEDIA-OPENGAMEART",
  "apollo11-bootprint": "MEDIA-NASA-IMAGES",
  "apollo11-lander-exit": "MEDIA-NASA-IMAGES",
  "apollo11-moonwalker": "MEDIA-NASA-IMAGES",
  "apollo15-rover": "MEDIA-NASA-IMAGES",
  "astronaut-drawn": "MEDIA-OPENGAMEART",
  "cc0-sound-library": "MEDIA-OPENGAMEART",
  "celebration-small-step": "MEDIA-NASA-SOUNDS",
  "computer-beeps": "MEDIA-KENNEY",
  "construction-clangs": "MEDIA-KENNEY",
  "crescent-earth-artemis2": "MEDIA-NASA-IMAGES",
  "eagle-has-landed": "MEDIA-NASA-SOUNDS",
  "eagle-has-landed-long": "MEDIA-NASA-SOUNDS",
  "earthrise-apollo8": "MEDIA-NASA-IMAGES",
  "earthset-artemis2": "MEDIA-NASA-IMAGES",
  "engine-burn": "MEDIA-OPENGAMEART",
  "engine-test-sls": "MEDIA-NASA-SOUNDS",
  "flare-and-cme-july2017": "MEDIA-NASA-IMAGES",
  "footsteps-boots-gravel": "MEDIA-FREESOUND",
  "footsteps-boots-gravel-long": "MEDIA-FREESOUND",
  "footsteps-mixed-surfaces": "MEDIA-OPENGAMEART",
  "footsteps-sand": "MEDIA-OPENGAMEART",
  "footsteps-slow-gravel": "MEDIA-FREESOUND",
  "greenhouse-chime": "MEDIA-KENNEY",
  "habitat-footsteps-metal": "MEDIA-OPENGAMEART",
  "houston-problem": "MEDIA-NASA-SOUNDS",
  "isometric-moon-tiles": "MEDIA-OPENGAMEART",
  "jingles": "MEDIA-KENNEY",
  "lander-sprites": "MEDIA-OPENGAMEART",
  "landing-thud": "MEDIA-KENNEY",
  "launch-commentary-sts135": "MEDIA-NASA-SOUNDS",
  "launch-countdown-apollo11": "MEDIA-NASA-SOUNDS",
  "launch-countdown-sts135": "MEDIA-NASA-SOUNDS",
  "launch-roar-atlas": "MEDIA-NASA-SOUNDS",
  "launch-roar-shuttle": "MEDIA-NASA-SOUNDS",
  "liftoff-sts26": "MEDIA-NASA-SOUNDS",
  "machines-sci-fi-pack": "MEDIA-OPENGAMEART",
  "moon-colour-map": "MEDIA-NASA-SVS",
  "moon-height-map": "MEDIA-NASA-SVS",
  "moon-limb-artemis2": "MEDIA-NASA-IMAGES",
  "music-calm-loop": "MEDIA-OPENGAMEART",
  "music-calm-loop-2": "MEDIA-OPENGAMEART",
  "one-small-step": "MEDIA-NASA-SOUNDS",
  "orion-earth-moon-artemis1": "MEDIA-NASA-IMAGES",
  "orion-selfie-artemis1": "MEDIA-NASA-IMAGES",
  "oxygen-from-soil-test": "MEDIA-NASA-IMAGES",
  "planets": "MEDIA-KENNEY",
  "power-down": "MEDIA-KENNEY",
  "power-up": "MEDIA-KENNEY",
  "radio-message-in": "MEDIA-NASA-SOUNDS",
  "radio-message-in-2": "MEDIA-NASA-SOUNDS",
  "radio-roger-beep": "MEDIA-FREESOUND",
  "radio-squelch": "MEDIA-FREESOUND",
  "radio-static": "MEDIA-FREESOUND",
  "radio-walkie-beep": "MEDIA-FREESOUND",
  "regolith-3d-printing": "MEDIA-NASA-IMAGES",
  "retro-blips": "MEDIA-KENNEY",
  "robot-arm-servo": "MEDIA-FREESOUND",
  "robot-servo-long": "MEDIA-FREESOUND",
  "robot-servo-short": "MEDIA-FREESOUND",
  "rocket-launch-8bit": "MEDIA-OPENGAMEART",
  "rocket-launch-sfx": "MEDIA-OPENGAMEART",
  "rover-hum": "MEDIA-OPENGAMEART",
  "rover-motor": "MEDIA-FREESOUND",
  "satellite-beep": "MEDIA-NASA-SOUNDS",
  "simple-space": "MEDIA-KENNEY",
  "sls-liftoff": "MEDIA-NASA-IMAGES",
  "sls-on-pad": "MEDIA-NASA-IMAGES",
  "small-flare-cme-jan2018": "MEDIA-NASA-IMAGES",
  "solar-flare-sept2017": "MEDIA-NASA-IMAGES",
  "south-pole-mosaic": "MEDIA-NASA-IMAGES",
  "south-pole-topography": "MEDIA-NASA-IMAGES",
  "space-kit-3d": "MEDIA-KENNEY",
  "ui-click": "MEDIA-KENNEY",
  "ui-panels-plain": "MEDIA-KENNEY",
  "ui-panels-sci-fi": "MEDIA-KENNEY",
  "ui-switch": "MEDIA-KENNEY",
  "veggie-greens-iss": "MEDIA-NASA-IMAGES",
  "viper-rover-test": "MEDIA-NASA-IMAGES",
  "viper-rover-test-2": "MEDIA-NASA-IMAGES"
};
export const textFacts: Readonly<Record<string, readonly string[]>> = {
  "resources.lifeSupport": [
    "lifeSupport.oxygenPerDay",
    "lifeSupport.co2PerDay",
    "lifeSupport.waterPerDay",
    "lifeSupport.splitWater",
    "lifeSupport.oxygenEnergyModel",
    "lifeSupport.waterRecycling",
    "lifeSupport.moonSoilOxygen"
  ],
  "resources.radiation": [
    "radiation.wallsCutCosmicRays",
    "radiation.solarStorms",
    "radiation.artemis1DailyDose",
    "radiation.transatlanticFlight",
    "radiation.surfaceHalf",
    "radiation.careerLimit",
    "radiation.stormLimit",
    "radiation.cmeArrival",
    "radiation.artemis1ShelterDose",
    "radiation.waterBestShield",
    "radiation.shelterMass",
    "radiation.doseBusySun",
    "radiation.doseQuietSun",
    "radiation.noSafeLaunchDate",
    "radiation.modelAccuracy",
    "radiation.artemis2Sensors"
  ],
  "resources.power": [
    "power.sunlightPower",
    "power.solarCellEfficiency",
    "power.equatorNight",
    "power.nightCold",
    "power.batteriesForNight",
    "power.sunLowAtPole",
    "power.ridgeSunshine",
    "moonPlaces.polarWinter",
    "moonPlaces.polarSummer",
    "moonPlaces.lunarEclipse",
    "power.emptyBaseHeating",
    "power.fissionPower"
  ],
  "resources.food": [
    "food.allFoodFromEarth",
    "food.foodShelfLife",
    "food.veggie",
    "food.leaf",
    "food.apolloSoilPlants",
    "food.plantPower",
    "food.gramsPerKwh"
  ],
  "resources.communication": [
    "communication.radioDelay",
    "communication.marsDelay",
    "communication.farSide",
    "communication.poleHillsBlock",
    "communication.artemis2Blackout",
    "communication.relaySatellites",
    "communication.lunaNet",
    "communication.moonlight",
    "communication.artemis2Laser",
    "communication.decideAlone"
  ],
  "chapters.chapter1": [
    "radiation.artemis1Dummies",
    "radiation.artemis1DailyDose",
    "radiation.transatlanticFlight",
    "communication.artemis2Blackout",
    "communication.artemis2Laser"
  ],
  "chapters.chapter2": [
    "moonPlaces.lcross",
    "missions.im2Tipped",
    "missions.viper",
    "communication.poleHillsBlock"
  ],
  "chapters.chapter3": [
    "missions.artemis4",
    "moonPlaces.nineRegions",
    "lifeSupport.suitIsSpaceship",
    "radiation.suitNoStormShield",
    "radiation.backInsideTime"
  ],
  "chapters.chapter4": [
    "missions.smallLanderCargo",
    "missions.blueMoonMk1Cargo",
    "missions.bigCargoLanders",
    "radiation.shelterMass"
  ],
  "chapters.chapter5": [
    "power.sunLowAtPole",
    "power.ridgeSunshine",
    "moonPlaces.polarWinter"
  ],
  "chapters.chapter6": [
    "missions.pressurisedRover",
    "food.leaf",
    "food.apolloSoilPlants",
    "food.plantPower",
    "communication.relaySatellites",
    "power.fissionPower"
  ],
  "chapters.chapter7": [
    "moonPlaces.haworth",
    "moonPlaces.shadowArea",
    "moonPlaces.iceUses",
    "lifeSupport.splitWater",
    "lifeSupport.moonSoilOxygen"
  ]
};
export const textSources: Readonly<Record<string, readonly string[]>> = {
  "resources.lifeSupport": [
    "SRC-R17A-01",
    "SRC-R04-35",
    "SRC-R17F-01",
    "SRC-R04-34",
    "SRC-R04-36"
  ],
  "resources.radiation": [
    "SRC-R19-1-06",
    "SRC-R04-15",
    "SRC-R17G-01",
    "SRC-R15A-08",
    "SRC-R17C-28",
    "SRC-R17G-06",
    "SRC-R19-1-11",
    "SRC-R04-01",
    "SRC-R04-11",
    "SRC-R04-04",
    "SRC-R17G-02",
    "SRC-R17G-03",
    "SRC-R19-2-17",
    "SRC-R19-2-18",
    "SRC-R19-1-21",
    "SRC-R19-1-22",
    "SRC-R19-1-12",
    "SRC-R14D-15"
  ],
  "resources.power": [
    "SRC-R17A-07",
    "SRC-R17A-09",
    "SRC-R04-47",
    "SRC-R04-29",
    "SRC-R04-07",
    "SRC-R17A-10",
    "SRC-R17C-03",
    "SRC-R17C-04",
    "SRC-R17C-02",
    "SRC-R17C-07",
    "SRC-R17C-10",
    "SRC-R19-2-01",
    "SRC-R19-2-06",
    "SRC-R19-2-08",
    "SRC-R19-2-09",
    "SRC-R17A-12",
    "SRC-R04-27",
    "SRC-R17A-11"
  ],
  "resources.food": [
    "SRC-R15B-02",
    "SRC-R15B-01",
    "SRC-R15B-08",
    "SRC-R15B-09",
    "SRC-R17A-01"
  ],
  "resources.communication": [
    "SRC-R05-31",
    "SRC-R05-32",
    "SRC-R15B-19",
    "SRC-R15B-18",
    "SRC-R05-33",
    "SRC-R05-34",
    "SRC-R05-01",
    "SRC-R05-09",
    "SRC-R15B-16",
    "SRC-R15B-17",
    "SRC-R12V-24",
    "SRC-R12V-26",
    "SRC-R15B-13",
    "SRC-R15B-11"
  ],
  "chapters.chapter1": [
    "SRC-R04-03",
    "SRC-R04-04",
    "SRC-R15A-08",
    "SRC-R17C-28",
    "SRC-R05-01",
    "SRC-R05-09",
    "SRC-R15B-11"
  ],
  "chapters.chapter2": [
    "SRC-R04-09",
    "SRC-R18-1-37",
    "SRC-R18-1-38",
    "SRC-R18-1-39",
    "SRC-R05-33",
    "SRC-R05-34"
  ],
  "chapters.chapter3": [
    "SRC-R05-02",
    "SRC-R05-04",
    "SRC-R14A-09",
    "SRC-R18-1-01",
    "SRC-R18-1-03",
    "SRC-R05-23",
    "SRC-R05-24",
    "SRC-R19-1-05"
  ],
  "chapters.chapter4": [
    "SRC-R19-2-26",
    "SRC-R19-2-27",
    "SRC-R19-2-28",
    "SRC-R19-2-21",
    "SRC-R19-2-23",
    "SRC-R19-2-24",
    "SRC-R19-2-25",
    "SRC-R19-2-17",
    "SRC-R19-2-18"
  ],
  "chapters.chapter5": [
    "SRC-R17C-03",
    "SRC-R17C-04",
    "SRC-R17C-02",
    "SRC-R17C-07",
    "SRC-R17C-10",
    "SRC-R19-2-01",
    "SRC-R19-2-06",
    "SRC-006"
  ],
  "chapters.chapter6": [
    "SRC-R14A-18",
    "SRC-R14C-04",
    "SRC-R15B-08",
    "SRC-R15B-09",
    "SRC-R17A-01",
    "SRC-R15B-16",
    "SRC-R15B-17",
    "SRC-R04-27"
  ],
  "chapters.chapter7": [
    "SRC-R18-1-15",
    "SRC-R18-1-16",
    "SRC-R17C-02",
    "SRC-R04-36",
    "SRC-R04-43",
    "SRC-R04-35"
  ]
};
