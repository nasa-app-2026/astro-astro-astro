export const ROVER_SITES = {
  sunnyRidge: 'sunnyRidge',
  shadowedCrater: 'shadowedCrater',
} as const;

export type RoverSite = typeof ROVER_SITES[keyof typeof ROVER_SITES];
export type RobotsPhase = 'site-choice' | 'briefing' | 'transfer' | 'approach' | 'landing' | 'driving' | 'complete' | 'crashed';
export type CargoControls = { left: boolean; right: boolean; up: boolean; down: boolean };
export type RoverControls = { left: boolean; right: boolean; forward: boolean; reverse: boolean };
export type RoverPoint = { x: number; y: number };

export type RobotsState = {
  phase: RobotsPhase;
  site: RoverSite | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  fuel: number;
  battery: number;
  signal: number;
  autonomy: number;
  mappedTiles: string[];
  photos: string[];
  waterSampled: boolean;
  path: RoverPoint[];
  message: string;
};

export const CARGO_WORLD = {
  width: 1000,
  height: 600,
  earth: { x: 100, y: 55 },
  moon: { x: 790, y: 330, radius: 22 },
  sites: {
    sunnyRidge: { x: 790, y: 405 },
    shadowedCrater: { x: 865, y: 330 },
  },
} as const;

export const CARGO_ASTEROIDS = [
  { x: 355, y: 315, radius: 18 },
  { x: 570, y: 195, radius: 22 },
  { x: 690, y: 455, radius: 15 },
] as const;

export const initialRobotsState: RobotsState = {
  phase: 'site-choice',
  site: null,
  x: CARGO_WORLD.earth.x,
  y: CARGO_WORLD.earth.y + 64,
  vx: 0,
  vy: 0,
  heading: Math.PI / 2,
  fuel: 100,
  battery: 100,
  signal: 100,
  autonomy: 60,
  mappedTiles: [],
  photos: [],
  waterSampled: false,
  path: [],
  message: 'Choose a landing target for the uncrewed rover rocket.',
};

const distance = (a: RoverPoint, b: RoverPoint): number => Math.hypot(a.x - b.x, a.y - b.y);
const tileAt = (x: number, y: number): string => `${Math.floor(x / 20)},${Math.floor(y / 20)}`;
const inShadowCrater = (x: number, y: number): boolean => x >= 65 && y >= 60;

function isMissionComplete(state: RobotsState): boolean {
  return state.photos.length >= 3 && state.mappedTiles.length >= 5 && state.waterSampled;
}

function updateMap(state: RobotsState, x: number, y: number): string[] {
  const tile = tileAt(x, y);
  return state.mappedTiles.includes(tile) ? state.mappedTiles : [...state.mappedTiles, tile];
}

export function chooseRoverSite(state: RobotsState, site: RoverSite): RobotsState {
  if (state.phase !== 'site-choice') return state;
  return {
    ...state,
    phase: 'briefing',
    site,
    battery: site === ROVER_SITES.sunnyRidge ? 86 : 56,
    message: site === ROVER_SITES.sunnyRidge
      ? 'Sunny ridge selected: better solar power and radio contact, but fewer signs of water ice.'
      : 'Shadowed crater selected: more water-ice clues, but less rover power and a harder radio link.',
  };
}

export function launchRoverMission(state: RobotsState): RobotsState {
  if (state.phase !== 'briefing' || !state.site) return state;
  return {
    ...state,
    phase: 'transfer',
    fuel: 100,
    message: 'Rover rocket launch! Use the arrow keys to steer from Earth toward the Moon. Avoid the asteroid field.',
  };
}

export function stepCargoFlight(state: RobotsState, controls: CargoControls, deltaSeconds: number): RobotsState {
  if (state.phase !== 'transfer' && state.phase !== 'approach') return state;
  const dt = Math.max(0, Math.min(deltaSeconds, 0.08));
  if (dt === 0) return state;
  const horizontal = Number(controls.right) - Number(controls.left);
  const vertical = Number(controls.up) - Number(controls.down);
  const thrust = Math.abs(horizontal) + Math.abs(vertical);
  const fuelScale = state.fuel <= 0 ? 0 : 0.18 + state.fuel / 100 * 0.82;
  let vx = state.vx + horizontal * 28 * fuelScale * dt;
  let vy = state.vy + vertical * 28 * fuelScale * dt;

  if (state.x < 240 && state.y < 190) vy -= 8 * (1 - state.y / 220) * dt;
  const dx = CARGO_WORLD.moon.x - state.x;
  const dy = CARGO_WORLD.moon.y - state.y;
  const moonDistance = Math.hypot(dx, dy);
  if (moonDistance < 260 && moonDistance > CARGO_WORLD.moon.radius) {
    const gravity = 12 * (260 - moonDistance) / 180;
    vx += dx / moonDistance * gravity * dt;
    vy += dy / moonDistance * gravity * dt;
  }
  const drag = Math.pow(thrust ? 0.998 : 0.9, dt * 60);
  vx *= drag;
  vy *= drag;
  const speed = Math.hypot(vx, vy);
  const maxSpeed = 10 + state.fuel * 0.9;
  if (speed > maxSpeed) {
    vx = vx / speed * maxSpeed;
    vy = vy / speed * maxSpeed;
  }
  const x = Math.max(0, Math.min(CARGO_WORLD.width, state.x + vx * dt));
  const y = Math.max(0, Math.min(CARGO_WORLD.height, state.y + vy * dt));
  const phase: RobotsPhase = moonDistance < 190 ? 'approach' : state.phase;
  const point = { x, y };
  const asteroid = CARGO_ASTEROIDS.find((rock) => distance(point, rock) < rock.radius + 8);
  const crashed = Boolean(asteroid) || distance(point, CARGO_WORLD.moon) < CARGO_WORLD.moon.radius;
  const signal = Math.hypot(x - CARGO_WORLD.earth.x, y - CARGO_WORLD.earth.y) > 500 ? 45 : 100;
  const path = state.path;
  const last = path[path.length - 1];
  const nextPath = !last || distance(last, point) >= 12 ? [...path, point].slice(-50) : path;

  return {
    ...state,
    phase: crashed ? 'crashed' : phase,
    x,
    y,
    vx,
    vy,
    heading: speed > 1 ? Math.atan2(vy, vx) : state.heading,
    fuel: Math.max(0, state.fuel - dt * thrust * fuelScale * 1.1),
    signal,
    path: nextPath,
    message: crashed
      ? asteroid ? 'Asteroid collision! Restart the cargo flight and steer around the rocks.' : 'The cargo rocket hit the Moon. Restart and approach a marked landing site.'
      : phase === 'approach'
        ? `Lunar approach. Steer to the selected ${state.site === ROVER_SITES.sunnyRidge ? 'sunny ridge' : 'shadowed crater'} and slow down to land.`
        : signal < 100
          ? 'Earth signal is weak at lunar distance. The uncrewed rocket follows its flight computer.'
          : thrust
            ? `Cargo rocket moving at ${Math.hypot(vx, vy).toFixed(1)} m/s.`
            : state.message,
  };
}

export function landCargoRocket(state: RobotsState): RobotsState {
  if (state.phase !== 'approach' || !state.site) return state;
  const target = CARGO_WORLD.sites[state.site];
  const targetDistance = distance(state, target);
  const speed = Math.hypot(state.vx, state.vy);
  if (targetDistance > 22) {
    return { ...state, message: `Landing target is ${targetDistance.toFixed(0)} km away. Steer closer to the selected site.` };
  }
  if (speed > 16) return { ...state, message: 'Too fast to land safely. Use reverse thrust and try the landing again.' };
  return {
    ...state,
    phase: 'landing',
    x: target.x,
    y: target.y,
    vx: 0,
    vy: 0,
    message: 'Soft touchdown! Cargo is safe. Deploy the rover from the lander ramp.',
  };
}

export function deployRover(state: RobotsState): RobotsState {
  if (state.phase !== 'landing' || !state.site) return state;
  return {
    ...state,
    phase: 'driving',
    x: 8,
    y: 20,
    vx: 0,
    vy: 0,
    heading: 0,
    battery: state.site === ROVER_SITES.sunnyRidge ? 86 : 56,
    mappedTiles: [tileAt(8, 20)],
    photos: [],
    waterSampled: false,
    path: [],
    message: 'Touchdown confirmed. The rover rolls down the lander ramp. Hold the arrow keys to steer and drive.',
  };
}

export function stepRover(state: RobotsState, controls: RoverControls, deltaSeconds: number): RobotsState {
  if (state.phase !== 'driving') return state;
  const dt = Math.max(0, Math.min(deltaSeconds, 0.08));
  if (dt === 0) return state;
  const turn = Number(controls.left) - Number(controls.right);
  const heading = state.heading + turn * 1.8 * dt;
  const drive = Number(controls.forward) - Number(controls.reverse);
  const ax = Math.cos(heading) * drive * 24;
  const ay = Math.sin(heading) * drive * 24;
  const drag = Math.pow(drive ? 0.992 : 0.94, dt * 60);
  let vx = (state.vx + ax * dt) * drag;
  let vy = (state.vy + ay * dt) * drag;
  const speed = Math.hypot(vx, vy);
  if (speed > 18) {
    vx = vx / speed * 18;
    vy = vy / speed * 18;
  }
  const x = Math.max(0, Math.min(100, state.x + vx * dt));
  const y = Math.max(0, Math.min(100, state.y + vy * dt));
  const mappedTiles = updateMap(state, x, y);
  const entersShadow = state.site === ROVER_SITES.shadowedCrater && inShadowCrater(x, y) && !inShadowCrater(state.x, state.y);
  const leavesShadow = state.signal === 22 && !inShadowCrater(x, y);
  const signal = entersShadow ? 22 : leavesShadow ? (state.site === ROVER_SITES.sunnyRidge ? 78 : 48) : state.signal;
  const autonomy = entersShadow ? Math.min(100, state.autonomy + 20) : state.autonomy;
  const isMoving = Math.abs(drive) > 0;
  const battery = Math.max(0, state.battery - dt * (isMoving ? 0.4 : turn ? 0.12 : 0.02));
  const path = state.path;
  const lastPoint = path[path.length - 1];
  const nextPath = !lastPoint || Math.hypot(lastPoint.x - x, lastPoint.y - y) >= 1.5
    ? [...path, { x, y }].slice(-60)
    : path;

  return {
    ...state,
    x,
    y,
    vx,
    vy,
    heading,
    battery,
    signal,
    autonomy,
    mappedTiles,
    path: nextPath,
    message: entersShadow
      ? 'A crater wall blocks Earth radio. The rover follows its stored route and drives on its own until the signal returns.'
      : leavesShadow
        ? 'The rover is back in radio range and sends its stored pictures and map data to Earth.'
        : state.signal === 22
          ? 'Earth radio remains blocked in the crater. The rover is following its stored route autonomously.'
          : isMoving
            ? `Driving at ${speed.toFixed(1)} m/s. ${mappedTiles.length} terrain tiles mapped.`
            : state.message,
  };
}

export function takeRoverPhoto(state: RobotsState): RobotsState {
  if (state.phase !== 'driving') return state;
  if (state.battery < 4) return { ...state, message: 'Battery is too low to power the camera.' };
  const tile = tileAt(state.x, state.y);
  if (state.photos.includes(tile)) {
    return { ...state, message: 'This tile is already in the photo log. Drive to a new tile for another picture.' };
  }
  const photos = [...state.photos, tile];
  const next = {
    ...state,
    photos,
    battery: state.battery - 4,
    message: `Picture ${photos.length} saved from terrain tile ${tile}.`,
  };
  return isMissionComplete(next) ? {
    ...next,
    phase: 'complete',
    message: 'Scout complete! Three pictures, a water-ice sample, and five terrain tiles are ready for Earth.',
  } : next;
}

export function sampleRoverWater(state: RobotsState): RobotsState {
  if (state.phase !== 'driving') return state;
  if (!inShadowCrater(state.x, state.y)) {
    return { ...state, message: 'Water-ice clues are in the shadowed crater. Drive to the darker crater area to sample the soil.' };
  }
  if (state.waterSampled) return { ...state, message: 'Water-ice sample already logged. Keep exploring and taking pictures.' };
  if (state.battery < 8) return { ...state, message: 'Battery is too low to run the soil drill.' };
  const next = {
    ...state,
    waterSampled: true,
    battery: state.battery - 8,
    message: 'Soil sample collected at the crater. The drill found clues consistent with water ice.',
  };
  return isMissionComplete(next) ? {
    ...next,
    phase: 'complete',
    message: 'Scout complete! Three pictures, a water-ice sample, and five terrain tiles are ready for Earth.',
  } : next;
}

export function restartRoverMission(): RobotsState {
  return { ...initialRobotsState, path: [] };
}
