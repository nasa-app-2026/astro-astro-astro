import { food } from '../../facts/food';
import { settings } from '../../data/chapter5/settings';
import { freshFood } from '../../data/chapter5/challenges/fresh-food';
import { isDark } from './into-the-dark';

export type FoodState = Readonly<{ day: number; food: number; energy: number; water: number; freshGrown: number; crewAte: number; lampDays: number; science: number; ending: 'food' | 'energy' | 'water' | 'complete' | null; message: string }>;
export type FoodAction = 'lamps' | 'rest';
const precise = (value: number) => Number(value.toFixed(6));
export function startFreshFood(): FoodState {
  return { day: 1, food: settings.foodStartingSupply, energy: settings.foodStartingEnergy, water: settings.foodStartingWater, freshGrown: 0, crewAte: 0, lampDays: 0, science: 0, ending: null, message: '' };
}
export function advanceFreshFood(state: FoodState, action: FoodAction): FoodState {
  if (state.ending) throw new Error('Challenge already ended');
  const grossWater = freshFood.plantWater;
  const netWater = grossWater * (1 - settings.plantWaterRecovery);
  const delivery = state.day === freshFood.deliveryDay ? settings.foodDeliveryAmount : 0;
  const energyRaw = state.energy + (isDark(state.day) ? -settings.extraHeatingPerDarkDay : settings.solarPerSunnyDay) - settings.baseUsePerDay - (action === 'lamps' ? freshFood.lampEnergy : 0);
  const grownGrams = action === 'lamps' ? freshFood.lampEnergy * food.gramsPerKwh.range[0] : 0;
  // Convert grams to kilograms; 1 kg = 1,000 g.
  const grownKg = grownGrams / 1000;
  const foodRaw = precise(state.food + delivery + grownKg - freshFood.dailyFood);
  const waterRaw = precise(state.water - netWater);
  const ending = state.water < grossWater ? 'water' : foodRaw <= 0 ? 'food' : energyRaw <= 0 ? 'energy' : state.day === freshFood.lengthDays ? 'complete' : null;
  const lampDays = state.lampDays + (action === 'lamps' ? 1 : 0);
  const science = lampDays >= settings.experimentLampDays ? settings.experimentScience : 0;
  const message = `${delivery ? `The delayed cargo arrived with ${delivery} kg of food. ` : ''}${action === 'lamps' ? `Lamps used ${settings.plantArea} m² × ${food.plantPower.value} kW/m² × ${settings.lampHours} hours = ${freshFood.lampEnergy} kWh and grew ${grownGrams} g at the low estimate of ${food.gramsPerKwh.range[0]} g/kWh. ` : 'The lamps rested. '}The crew used ${freshFood.dailyFood} kg of packed food. Plants used ${grossWater} litres; ${settings.plantWaterRecovery * 100}% was collected, so ${precise(netWater)} litres left the supply.`;
  return { day: state.day + 1, food: Math.max(0, foodRaw), energy: Math.max(0, energyRaw), water: Math.max(0, waterRaw), freshGrown: precise(state.freshGrown + grownKg), crewAte: precise(state.crewAte + freshFood.dailyFood), lampDays, science, ending, message };
}
