import { settings } from '../settings';
import { food } from '../../../facts/food';

export const freshFood = {
  title: 'Fresh food', lengthDays: settings.challengeDays,
  gauges: { main: ['food', 'energy'], extra: 'water', scienceGoal: settings.experimentScience },
  dailyFood: settings.crewCount * food.packedFoodPerDay.value,
  lampEnergy: settings.plantArea * food.plantPower.value * settings.lampHours,
  plantWater: settings.plantArea * food.plantWater.value,
  deliveryDay: settings.foodExpectedDeliveryDay + settings.foodDeliveryDelay,
} as const;
