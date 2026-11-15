import { gaugeDefinitions, type GaugeReading, type ResourceId } from '../../data/chapter5/gauges';
import { settings } from '../../data/chapter5/settings';
import { chapter5Facts } from '../../data/chapter5/facts';
import type { AgeRange } from '../../playerProfile';

export function gaugeModel(id: ResourceId, reading: GaugeReading, age: AgeRange | null, crewCount: number) {
  if (!Number.isFinite(reading.value) || !Number.isFinite(reading.capacity) || reading.capacity <= 0) {
    throw new Error('Gauge readings must be finite and capacity must be positive');
  }
  if (!Number.isInteger(crewCount) || crewCount <= 0) throw new Error('Crew count must be a positive integer');
  const definition = gaugeDefinitions[id];
  const amount = Math.max(0, reading.value);
  const fraction = Math.min(1, amount / reading.capacity);
  const number = (value: number) => value.toLocaleString('en', { maximumFractionDigits: settings.displayDecimals });
  let status: string;
  if (id === 'air' || id === 'food') {
    const dailyUse = id === 'air'
      ? chapter5Facts['lifeSupport.oxygenPerDay'].value
      : chapter5Facts['food.packedFoodPerDay'].value;
    const days = amount / (dailyUse * crewCount);
    // Round down so the display never promises more remaining time than the supply supports.
    const precision = 10 ** settings.displayDecimals;
    const displayedDays = Math.floor(days * precision) / precision;
    status = days > 0 && displayedDays === 0 ? 'Less than a day left' : `${number(displayedDays)} days left`;
  } else if (id === 'dose') {
    status = fraction >= settings.gaugeHighFraction ? 'High' : fraction >= settings.gaugeLowFraction ? 'Building up' : 'Low';
  } else if (id === 'data') {
    status = amount === 0 ? 'Nothing queued' : 'Waiting to send';
  } else {
    status = amount === 0 ? 'Empty' : fraction <= settings.gaugeLowFraction ? 'Low' : 'Available';
  }
  return {
    ...definition,
    fraction,
    status,
    text: age === '10-12' ? `${number(amount)} ${definition.unit} · ${status}` : status,
  };
}
