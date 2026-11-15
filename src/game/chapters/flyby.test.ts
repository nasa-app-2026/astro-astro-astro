import { describe, expect, it } from 'vitest';
import {
  FLIGHT_ASTEROIDS,
  FLIGHT_WORLD,
  FLYBY_SCIENCE,
  type FlybyState,
  collectFlybyScience,
  configureFlyby,
  initialFlybyState,
  launchFlyby,
  stepFlyby,
} from './flyby.logic';

const idle = { left: false, right: false, up: false, down: false };

describe('piloted Moon flyby mission', () => {
  it('launches with continuous thruster control and moves the ship from the pad', () => {
    let state = launchFlyby(initialFlybyState);
    for (let frame = 0; frame < 60; frame += 1) {
      state = stepFlyby(state, { ...idle, up: true }, 0.05);
    }

    expect(state.y).toBeGreaterThan(initialFlybyState.y);
    expect(state.phase).toBe('cruise');
    expect(state.fuel).toBeLessThan(initialFlybyState.fuel);
    expect(state.path.length).toBeGreaterThan(1);
  });

  it('keeps diagonal thrusters from producing extra acceleration', () => {
    const cruise = { ...launchFlyby(initialFlybyState), phase: 'cruise' as const, x: 450, y: 100 };
    const vertical = stepFlyby(cruise, { ...idle, up: true }, 1 / 60);
    const diagonal = stepFlyby(cruise, { ...idle, up: true, right: true }, 1 / 60);
    expect(Math.hypot(diagonal.vx, diagonal.vy)).toBeCloseTo(Math.hypot(vertical.vx, vertical.vy), 1);
    expect(diagonal.vx).toBeGreaterThan(0);
  });

  it('keeps the trajectory stable across equivalent frame durations', () => {
    const start = { ...launchFlyby(initialFlybyState), phase: 'cruise' as const, x: 450, y: 100 };
    const oneStep = stepFlyby(start, { ...idle, up: true }, 0.1);
    let manySteps: FlybyState = start;
    for (let i = 0; i < 6; i += 1) manySteps = stepFlyby(manySteps, { ...idle, up: true }, 1 / 60);
    expect(oneStep.x).toBeCloseTo(manySteps.x, 3);
    expect(oneStep.y).toBeCloseTo(manySteps.y, 3);
    expect(oneStep.vy).toBeCloseTo(manySteps.vy, 3);
  });

  it('auto-brakes the spacecraft when the player releases the thrusters', () => {
    let coasting: FlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: 450,
      y: 100,
      vx: 25,
      vy: 0,
    };
    for (let frame = 0; frame < 10; frame += 1) {
      coasting = stepFlyby(coasting, idle, 0.075);
    }

    expect(Math.hypot(coasting.vx, coasting.vy)).toBeLessThan(12);
  });

  it('returns only after a complete lunar orbit and all four readings', () => {
    let state: typeof initialFlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: FLIGHT_WORLD.moon.x + 120,
      y: FLIGHT_WORLD.moon.y,
      orbitProgress: Math.PI * 2,
    };

    for (const science of Object.values(FLYBY_SCIENCE)) {
      state = collectFlybyScience(state, science);
    }
    expect(state.science).toHaveLength(4);
    expect(state.phase).toBe('returning');

    state = {
      ...state,
      x: FLIGHT_WORLD.earth.x,
      y: FLIGHT_WORLD.earth.y,
      vx: 0,
      vy: 0,
    };
    state = stepFlyby(state, idle, 0.016);
    expect(state.phase).toBe('complete');
    expect(state.message).toContain('Safe landing');
  });

  it('requires a complete orbit before the science readings can start the return phase', () => {
    let state: typeof initialFlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: FLIGHT_WORLD.moon.x + 120,
      y: FLIGHT_WORLD.moon.y,
    };
    for (const science of Object.values(FLYBY_SCIENCE)) state = collectFlybyScience(state, science);
    expect(state.science).toHaveLength(4);
    expect(state.phase).toBe('cruise');
    expect(state.message).toContain('orbit guide around the Moon once');
  });

  it('restarts orbit progress when the spacecraft reverses around the Moon', () => {
    const state: FlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: FLIGHT_WORLD.moon.x + 140,
      y: FLIGHT_WORLD.moon.y,
      vx: 0,
      vy: -40,
      orbitProgress: 1.2,
      orbitAngle: 0.02,
      orbitDirection: 1,
    };
    expect(stepFlyby(state, idle, 1 / 60).orbitProgress).toBe(0);
  });

  it('restarts orbit progress when the spacecraft leaves the marked orbit corridor', () => {
    const state: FlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: FLIGHT_WORLD.moon.x + 240,
      y: FLIGHT_WORLD.moon.y,
      orbitProgress: 2,
      orbitAngle: 0,
      orbitDirection: 1,
    };
    expect(stepFlyby(state, idle, 1 / 60).orbitProgress).toBe(0);
  });

  it('blocks instrument readings until the spacecraft reaches the required location', () => {
    const state = launchFlyby(initialFlybyState);
    const blocked = collectFlybyScience(state, FLYBY_SCIENCE.gravity);
    expect(blocked.science).toHaveLength(0);
    expect(blocked.message).toContain('Fly closer to the Moon');
  });

  it('does not register an asteroid hit when the rocket only passes nearby', () => {
    const rock = FLIGHT_ASTEROIDS[0];
    const nearMiss = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise' as const,
      x: rock.x - 24,
      y: rock.y,
      vx: 0,
      vy: 0,
    };
    expect(stepFlyby(nearMiss, idle, 0.01).phase).toBe('cruise');
  });

  it('applies the selected fuel and battery reserves', () => {
    const plan = { fuelLoad: 10, energyStore: 25 };
    const configured = configureFlyby(initialFlybyState, plan);
    expect(configured.fuel).toBe(10);
    expect(configured.battery).toBe(25);

    const lowFuel = stepFlyby(launchFlyby(configured), { ...idle, up: true }, 0.08);
    const fullFuel = stepFlyby(launchFlyby(initialFlybyState), { ...idle, up: true }, 0.08);
    expect(lowFuel.vy).toBeLessThan(fullFuel.vy);
  });

  it('spends battery on science but never drains it while waiting', () => {
    const nearMoon = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise' as const,
      x: FLIGHT_WORLD.moon.x + 120,
      y: FLIGHT_WORLD.moon.y,
      battery: 20,
    };
    const measured = collectFlybyScience(nearMoon, FLYBY_SCIENCE.photos);
    expect(measured.battery).toBe(5);

    let waiting: FlybyState = nearMoon;
    for (let frame = 0; frame < 60; frame += 1) {
      waiting = stepFlyby(waiting, idle, 0.08);
    }
    expect(waiting.battery).toBe(nearMoon.battery);
  });

  it('keeps the flight available past the former mission-time limit', () => {
    let state: FlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: 400,
      y: 100,
    };
    for (let frame = 0; frame < 600; frame += 1) {
      state = stepFlyby(state, idle, 0.08);
    }

    expect(state.phase).toBe('cruise');
    expect(state.battery).toBe(initialFlybyState.battery);
  });
});
