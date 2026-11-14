import { describe, expect, it } from 'vitest';
import {
  FLIGHT_WORLD,
  FLYBY_SCIENCE,
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

  it('requires all instruments and two lunar orbits before a safe Earth landing', () => {
    let state: typeof initialFlybyState = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise',
      x: FLIGHT_WORLD.moon.x + 120,
      y: FLIGHT_WORLD.moon.y,
      orbits: 2,
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

  it('blocks instrument readings until the spacecraft reaches the required location', () => {
    const state = launchFlyby(initialFlybyState);
    const blocked = collectFlybyScience(state, FLYBY_SCIENCE.gravity);
    expect(blocked.science).toHaveLength(0);
    expect(blocked.message).toContain('Fly closer to the Moon');
  });

  it('applies the selected fuel, battery, mission time, and blackout autopilot plan', () => {
    const plan = { fuelLoad: 10, energyStore: 25, missionMinutes: 60, autopilot: false };
    const configured = configureFlyby(initialFlybyState, plan);
    expect(configured.fuel).toBe(10);
    expect(configured.battery).toBe(25);
    expect(configured.missionMinutes).toBe(60);
    expect(configured.autopilot).toBe(false);

    const lowFuel = stepFlyby(launchFlyby(configured), { ...idle, up: true }, 0.08);
    const fullFuel = stepFlyby(launchFlyby(initialFlybyState), { ...idle, up: true }, 0.08);
    expect(lowFuel.vy).toBeLessThan(fullFuel.vy);
  });

  it('spends battery on science and only permits far-side measurements with autopilot enabled', () => {
    const nearMoon = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise' as const,
      x: FLIGHT_WORLD.moon.x + 120,
      y: FLIGHT_WORLD.moon.y,
      orbits: 2,
      battery: 20,
    };
    const measured = collectFlybyScience(nearMoon, FLYBY_SCIENCE.photos);
    expect(measured.battery).toBe(5);

    const farSide = { ...nearMoon, x: 900, y: 374, signal: 18 };
    expect(collectFlybyScience(farSide, FLYBY_SCIENCE.photos).science).toContain(FLYBY_SCIENCE.photos);
    const manual = { ...farSide, autopilot: false };
    expect(collectFlybyScience(manual, FLYBY_SCIENCE.photos).message).toContain('autopilot');
  });

  it('ends a flight that exceeds its selected mission-time limit', () => {
    const state = {
      ...launchFlyby(initialFlybyState),
      phase: 'cruise' as const,
      elapsedMinutes: 29.99,
      missionMinutes: 30,
    };
    expect(stepFlyby(state, idle, 0.08).phase).toBe('crashed');
  });
});
