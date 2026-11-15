export const FLYBY_SCIENCE = {
  photos: 'photos',
  radiation: 'radiation',
  sunlight: 'sunlight',
  gravity: 'gravity',
} as const;

export type FlybyScience = typeof FLYBY_SCIENCE[keyof typeof FLYBY_SCIENCE];
export type FlybyPhase = 'briefing' | 'launching' | 'cruise' | 'returning' | 'complete' | 'crashed';

export type FlightControls = {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
};

export type FlightPoint = { x: number; y: number };
export type FlightPlan = {
  fuelLoad: number;
  energyStore: number;
};
export type FlybyState = {
  phase: FlybyPhase;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  fuel: number;
  battery: number;
  science: FlybyScience[];
  doseMsv: number;
  path: FlightPoint[];
  message: string;
};

export const FLIGHT_WORLD = {
  width: 1000,
  height: 600,
  earth: { x: 100, y: 55, radius: 64 },
  moon: { x: 790, y: 330, radius: 22 },
} as const;

export const FLIGHT_ASTEROIDS = [
  { x: 340, y: 185, radius: 19 },
  { x: 515, y: 420, radius: 24 },
  { x: 635, y: 235, radius: 16 },
  { x: 680, y: 465, radius: 20 },
] as const;

export const DEFAULT_FLIGHT_PLAN: FlightPlan = {
  fuelLoad: 100,
  energyStore: 100,
};

export const FLYBY_SCIENCE_LABELS: Record<FlybyScience, string> = {
  photos: 'Crater photographs',
  radiation: 'Radiation readings',
  sunlight: 'Sunlight readings',
  gravity: 'Lunar gravity reading',
};

export const initialFlybyState: FlybyState = {
  phase: 'briefing',
  x: FLIGHT_WORLD.earth.x,
  y: FLIGHT_WORLD.earth.y + FLIGHT_WORLD.earth.radius,
  vx: 0,
  vy: 0,
  heading: Math.PI / 2,
  fuel: DEFAULT_FLIGHT_PLAN.fuelLoad,
  battery: DEFAULT_FLIGHT_PLAN.energyStore,
  science: [],
  doseMsv: 0,
  path: [],
  message: 'Mission Control is ready. Plan your fuel and power, then fly the uncrewed survey rocket with the arrow keys.',
};

const SCIENCE_POWER_COST: Record<FlybyScience, number> = {
  photos: 15,
  radiation: 10,
  sunlight: 10,
  gravity: 8,
};

const distance = (a: FlightPoint, b: FlightPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
const moonDistance = (state: FlybyState): number => distance(state, FLIGHT_WORLD.moon);
function isScienceAvailable(state: FlybyState, science: FlybyScience): boolean {
  const lunarDistance = moonDistance(state);
  switch (science) {
    case FLYBY_SCIENCE.photos:
      return lunarDistance <= 245;
    case FLYBY_SCIENCE.radiation:
      return state.y >= 150;
    case FLYBY_SCIENCE.sunlight:
      return state.y >= 150 && lunarDistance <= 280;
    case FLYBY_SCIENCE.gravity:
      return lunarDistance <= 165;
  }
}

export function launchFlyby(state: FlybyState): FlybyState {
  if (state.phase !== 'briefing') return state;
  return { ...state, phase: 'launching', message: 'Liftoff! Hold ↑ / W to climb. Left and right steer; ↓ / X fires the reverse thruster. There is no mission clock.' };
}

export function configureFlyby(state: FlybyState, plan: FlightPlan): FlybyState {
  if (state.phase !== 'briefing') return state;
  return {
    ...state,
    fuel: Math.max(0, Math.min(100, plan.fuelLoad)),
    battery: Math.max(0, Math.min(100, plan.energyStore)),
  };
}

export function stepFlyby(state: FlybyState, controls: FlightControls, deltaSeconds: number): FlybyState {
  if (!['launching', 'cruise', 'returning'].includes(state.phase)) return state;
  const dt = Math.max(0, Math.min(deltaSeconds, 0.08));
  if (dt === 0) return state;

  const horizontal = Number(controls.right) - Number(controls.left);
  const vertical = Number(controls.up) - Number(controls.down);
  const thrust = Math.abs(horizontal) + Math.abs(vertical);
  const fuelScale = state.fuel <= 0 ? 0 : 0.18 + state.fuel / 100 * 0.82;
  const powerScale = state.battery <= 0 ? 0 : 1;
  let ax = horizontal * 28 * fuelScale * powerScale;
  let ay = vertical * 28 * fuelScale * powerScale;

  if (state.x < 240 && state.y < 190) ay -= 8 * (1 - state.y / 220);

  const dx = FLIGHT_WORLD.moon.x - state.x;
  const dy = FLIGHT_WORLD.moon.y - state.y;
  const moonDistanceNow = Math.hypot(dx, dy);
  if (moonDistanceNow < 260 && moonDistanceNow > FLIGHT_WORLD.moon.radius) {
    const gravity = 12 * (260 - moonDistanceNow) / 180;
    ax += dx / moonDistanceNow * gravity;
    ay += dy / moonDistanceNow * gravity;
  }

  let vx = state.vx + ax * dt;
  let vy = state.vy + ay * dt;
  const drag = Math.pow(thrust ? 0.998 : 0.9, dt * 60);
  vx *= drag;
  vy *= drag;
  const speed = Math.hypot(vx, vy);
  const maxSpeed = 10 + state.fuel * 0.9;
  if (speed > maxSpeed) {
    vx = vx / speed * maxSpeed;
    vy = vy / speed * maxSpeed;
  }
  const x = Math.max(0, Math.min(FLIGHT_WORLD.width, state.x + vx * dt));
  const y = Math.max(0, Math.min(FLIGHT_WORLD.height, state.y + vy * dt));
  if (x === 0 || x === FLIGHT_WORLD.width) vx = 0;
  if (y === 0 || y === FLIGHT_WORLD.height) vy = 0;
  const phase = state.phase === 'launching' && y >= 150 ? 'cruise' : state.phase;
  const flightState = {
    ...state,
    phase,
    x,
    y,
    vx,
    vy,
    heading: Math.hypot(vx, vy) > 1 ? Math.atan2(vy, vx) : state.heading,
    fuel: Math.max(0, state.fuel - dt * thrust * fuelScale * 1.1),
    battery: Math.max(0, state.battery - dt * thrust * 0.5),
  };
  const eligible = flightState.science.length === 4;
  const returnedToEarth = flightState.phase === 'returning'
    && distance(flightState, FLIGHT_WORLD.earth) < 55
    && Math.hypot(vx, vy) < 22;
  const asteroid = FLIGHT_ASTEROIDS.find((rock) => distance(flightState, rock) < rock.radius + 8);
  const collision = moonDistance(flightState) < FLIGHT_WORLD.moon.radius || Boolean(asteroid);
  const path = flightState.path;
  const lastPoint = path[path.length - 1];
  const nextPath = !lastPoint || distance(lastPoint, flightState) >= 12
    ? [...path, { x, y }].slice(-50)
    : path;

  return {
    ...flightState,
    phase: collision ? 'crashed' : returnedToEarth ? 'complete' : eligible ? 'returning' : flightState.phase,
    path: nextPath,
    message: collision
      ? asteroid ? 'Asteroid collision! Use the first-person camera and small thruster corrections to avoid space rocks.' : 'The spacecraft hit the Moon. Restart the flight and try a wider approach.'
      : returnedToEarth
        ? 'Safe landing! The spacecraft is home with all four science records.'
        : eligible
          ? 'All science jobs are done. Fly back toward Earth and slow down for a safe landing.'
          : state.message,
  };
}

export function collectFlybyScience(state: FlybyState, science: FlybyScience): FlybyState {
  if (!['launching', 'cruise'].includes(state.phase) || state.science.includes(science)) return state;
  if (!isScienceAvailable(state, science)) {
    const hint = science === FLYBY_SCIENCE.gravity || science === FLYBY_SCIENCE.photos
      ? 'Fly closer to the Moon first.'
      : 'Climb above the atmosphere first.';
    return { ...state, message: `${FLYBY_SCIENCE_LABELS[science]} unavailable here. ${hint}` };
  }
  if (state.battery < SCIENCE_POWER_COST[science]) return { ...state, message: 'Battery reserve is too low for that instrument. Save power before the next science job.' };

  const result: Record<FlybyScience, string> = {
    photos: 'Moon camera captured a detailed picture of the cratered surface.',
    radiation: 'Radiation sensor records about 1 mSv per day near the Moon.',
    sunlight: 'Solar sensor records about 1,361 W/m² of sunlight near the Moon.',
    gravity: 'Gravity sensor measures about 1.62 m/s² — roughly one-sixth of Earth gravity.',
  };
  const scienceList = [...state.science, science];
  const updated = {
    ...state,
    science: scienceList,
    battery: state.battery - SCIENCE_POWER_COST[science],
    doseMsv: state.doseMsv + (science === FLYBY_SCIENCE.radiation ? 1 : 0),
    message: result[science],
  };
  return scienceList.length === 4
    ? { ...updated, phase: 'returning', message: 'All science jobs are done. Fly back to Earth for landing.' }
    : updated;
}

export function restartFlyby(): FlybyState {
  return { ...initialFlybyState };
}
