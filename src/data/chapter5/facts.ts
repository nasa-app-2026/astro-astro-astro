import { communication } from '../../facts/communication';
import { food } from '../../facts/food';
import { lifeSupport } from '../../facts/lifeSupport';
import { moonPlaces } from '../../facts/moonPlaces';
import { radiation } from '../../facts/radiation';
import { power } from '../../facts/power';
import { missions } from '../../facts/missions';

/**
 * Verified P0 dependencies, indexed by their existing catalog IDs.
 * Preserve the original fact objects, units, wording, labels and source keys.
 * Missing IDs remain unresolved in docs/chapter5-plan.md; no aliases or
 * replacement values are supplied here. Source details await sources.ts.
 */
export const chapter5Facts = Object.freeze({
  [missions.im2Tipped.id]: missions.im2Tipped,
  [missions.viper.id]: missions.viper,
  [moonPlaces.malpertCliff.id]: moonPlaces.malpertCliff,
  [moonPlaces.malpertEarthView.id]: moonPlaces.malpertEarthView,
  [moonPlaces.nobileRim2EarthView.id]: moonPlaces.nobileRim2EarthView,
  [power.equatorNight.id]: power.equatorNight,
  [power.nightCold.id]: power.nightCold,
  [power.batteriesForNight.id]: power.batteriesForNight,
  [power.darkSpells.id]: power.darkSpells,
  [power.emptyBaseHeating.id]: power.emptyBaseHeating,
  [lifeSupport.oxygenPerDay.id]: lifeSupport.oxygenPerDay,
  [lifeSupport.oxygenEnergyModel.id]: lifeSupport.oxygenEnergyModel,
  [lifeSupport.oxygenEnergyMinimum.id]: lifeSupport.oxygenEnergyMinimum,
  [radiation.careerLimit.id]: radiation.careerLimit,
  [moonPlaces.nineRegions.id]: moonPlaces.nineRegions,
  [moonPlaces.haworth.id]: moonPlaces.haworth,
  [moonPlaces.monsMouton.id]: moonPlaces.monsMouton,
  [moonPlaces.iceFriendlyGround.id]: moonPlaces.iceFriendlyGround,
  [communication.relaySatellites.id]: communication.relaySatellites,
  [food.packedFoodPerDay.id]: food.packedFoodPerDay,
  [food.plantPower.id]: food.plantPower,
  [food.plantWater.id]: food.plantWater,
  [food.veggie.id]: food.veggie,
  [food.leaf.id]: food.leaf,
  [food.cropAreaFullDiet.id]: food.cropAreaFullDiet,
});

export type Chapter5FactId = keyof typeof chapter5Facts;
