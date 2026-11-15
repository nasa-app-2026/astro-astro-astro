export interface LandingState {
  readonly x: number;
  readonly y: number;
  readonly horizontalSpeed: number;
  readonly verticalSpeed: number;
  readonly fuel: number;
  readonly oxygen: number;
}

export interface LandingControls {
  readonly left: boolean;
  readonly right: boolean;
  readonly thrust: boolean;
}

export interface AstronautState {
  readonly x: number;
  readonly y: number;
  readonly oxygen: number;
  readonly battery: number;
  readonly supplies: number;
}

export type SupplyKind = 'oxygen' | 'battery' | 'supplies';

export const LANDING_SURFACE_Y = 390;
export const LANDING_PAD_X = 730;
export const LANDER_POSITION = { x: LANDING_PAD_X, y: 350 } as const;
export const ASTRONAUT_LANDER_RADIUS = 62;
export const BUILD_SITE_POSITION = { x: 150, y: 350 } as const;
export const LANDING_START: LandingState = {
  x: 600,
  y: 120,
  horizontalSpeed: 0,
  verticalSpeed: 40,
  fuel: 100,
  oxygen: 100,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export function stepLanding(state: LandingState, controls: LandingControls, deltaSeconds: number): LandingState {
  const totalDelta = Math.max(0, deltaSeconds);
  const steps = Math.max(1, Math.ceil(totalDelta / 0.05));
  const delta = totalDelta / steps;
  const horizontalAcceleration = Number(controls.right) - Number(controls.left);
  let next = state;

  for (let step = 0; step < steps; step += 1) {
    const horizontalSpeed = clamp(next.horizontalSpeed + horizontalAcceleration * 78 * delta, -100, 100);
    const dampedSpeed = horizontalAcceleration === 0
      ? horizontalSpeed * Math.exp(-4 * delta)
      : horizontalSpeed;
    const thrusting = controls.thrust && next.fuel > 0;
    const verticalSpeed = clamp(
      next.verticalSpeed + (32 - (thrusting ? 76 : 0)) * delta,
      -55,
      105,
    );

    next = {
      x: clamp(next.x + dampedSpeed * delta, 40, 984),
      y: next.y + verticalSpeed * delta,
      horizontalSpeed: dampedSpeed,
      verticalSpeed,
      fuel: clamp(next.fuel - (thrusting ? 10 * delta : 0), 0, 100),
      oxygen: clamp(next.oxygen - 0.04 * delta, 0, 100),
    };
  }

  return next;
}

export function landingOutcome(state: LandingState): 'flight' | 'landed' | 'crash' {
  if (state.y < LANDING_SURFACE_Y - 28) return 'flight';
  const onPad = Math.abs(state.x - LANDING_PAD_X) <= 100;
  const gentle = Math.abs(state.horizontalSpeed) <= 78 && Math.abs(state.verticalSpeed) <= 78;
  return onPad && gentle ? 'landed' : 'crash';
}

export const ASTRONAUT_START: AstronautState = {
  x: LANDER_POSITION.x,
  y: LANDER_POSITION.y,
  oxygen: 70,
  battery: 62,
  supplies: 0,
};

export const ASTRONAUT_OXYGEN_DRAIN_PER_SECOND = 2;

export interface AstronautWalkingPose {
  readonly armSwing: number;
  readonly legSwing: number;
  readonly bob: number;
}

export function getAstronautWalkingPose(phase: number, walking: boolean): AstronautWalkingPose {
  if (!walking) return { armSwing: 0, legSwing: 0, bob: 0 };
  const stride = Math.sin(phase);
  return {
    armSwing: -stride * 0.32,
    legSwing: stride * 0.48,
    bob: Math.abs(Math.sin(phase * 2)) * 1.5,
  };
}

export function stepAstronaut(
  state: AstronautState,
  controls: { readonly left: boolean; readonly right: boolean; readonly up: boolean; readonly down: boolean },
  deltaSeconds: number,
): AstronautState {
  const totalDelta = Math.max(0, deltaSeconds);
  const steps = Math.max(1, Math.ceil(totalDelta / 0.05));
  const delta = totalDelta / steps;
  const horizontal = Number(controls.right) - Number(controls.left);
  const vertical = Number(controls.down) - Number(controls.up);
  const moving = horizontal !== 0 || vertical !== 0;
  let next = state;

  for (let step = 0; step < steps; step += 1) {
    const atLander = Math.hypot(next.x - LANDER_POSITION.x, next.y - LANDER_POSITION.y) <= ASTRONAUT_LANDER_RADIUS;
    next = {
      x: clamp(next.x + horizontal * 150 * delta, 80, 944),
      y: clamp(next.y + vertical * 120 * delta, 282, 388),
      oxygen: clamp(next.oxygen + (atLander ? 9 : -ASTRONAUT_OXYGEN_DRAIN_PER_SECOND) * delta, 0, 100),
      battery: clamp(next.battery + (atLander ? 13 : moving ? -5 : -0.5) * delta, 0, 100),
      supplies: next.supplies,
    };
  }

  return next;
}

export function collectSupply(state: AstronautState, kind: SupplyKind): AstronautState {
  return {
    ...state,
    oxygen: clamp(state.oxygen + (kind === 'oxygen' ? 28 : 0), 0, 100),
    battery: clamp(state.battery + (kind === 'battery' ? 32 : 0), 0, 100),
    supplies: state.supplies + 1,
  };
}

export function astronautIsAtLander(state: AstronautState): boolean {
  return Math.hypot(state.x - LANDER_POSITION.x, state.y - LANDER_POSITION.y) <= ASTRONAUT_LANDER_RADIUS;
}
