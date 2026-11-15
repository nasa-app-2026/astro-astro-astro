import { describe, expect, it } from 'vitest';
import {
  collectSupply,
  BUILD_SITE_POSITION,
  landingOutcome,
  LANDER_POSITION,
  LANDING_PAD_X,
  LANDING_START,
  LANDING_SURFACE_Y,
  ASTRONAUT_START,
  astronautIsAtLander,
  getAstronautWalkingPose,
  stepAstronaut,
  stepLanding,
} from './firstLanding/rules';

describe('first landing flight and astronaut rules', () => {
  it('uses fuel to slow the lander during descent', () => {
    const state = {
      x: 600, y: 300, horizontalSpeed: 0, verticalSpeed: 40, fuel: 100, oxygen: 100,
    };
    const next = stepLanding(state, { left: false, right: false, thrust: true }, 0.05);

    expect(next.verticalSpeed).toBeLessThan(state.verticalSpeed);
    expect(next.fuel).toBeLessThan(state.fuel);
    expect(next.oxygen).toBeLessThan(state.oxygen);
    expect(next.y).toBeGreaterThan(state.y);
  });

  it('simulates all elapsed time when a frame is longer than 50 ms', () => {
    const controls = { left: false, right: false, thrust: false };
    const longFrame = stepLanding(LANDING_START, controls, 0.2);
    let shortFrames = LANDING_START;
    for (let frame = 0; frame < 4; frame += 1) shortFrames = stepLanding(shortFrames, controls, 0.05);

    expect(longFrame).toEqual(shortFrames);
    expect(longFrame.verticalSpeed).toBeGreaterThan(LANDING_START.verticalSpeed);
    expect(longFrame.y).toBeGreaterThan(LANDING_START.y + 0.05);
  });

  it('gives the player time to react before the lander reaches the surface', () => {
    const state = stepLanding(LANDING_START, { left: false, right: false, thrust: false }, 2.5);

    expect(landingOutcome(state)).toBe('flight');
  });

  it('accepts a slow touchdown on the beacon and rejects an unsafe approach', () => {
    expect(landingOutcome({
      x: LANDING_PAD_X, y: LANDING_SURFACE_Y - 28, horizontalSpeed: 15, verticalSpeed: 25, fuel: 60, oxygen: 100,
    })).toBe('landed');
    expect(landingOutcome({
      x: LANDING_PAD_X - 180, y: LANDING_SURFACE_Y - 27, horizontalSpeed: 15, verticalSpeed: 25, fuel: 60, oxygen: 100,
    })).toBe('crash');
    expect(landingOutcome({
      x: LANDING_PAD_X, y: LANDING_SURFACE_Y - 27, horizontalSpeed: 15, verticalSpeed: 90, fuel: 60, oxygen: 100,
    })).toBe('crash');
  });

  it('can reach a safe landing by steering and pulsing the engine', () => {
    let state = LANDING_START;
    let engineOn = false;
    for (let frame = 0; frame < 900 && landingOutcome(state) === 'flight'; frame += 1) {
      const descentSpeed = Math.max(0, Math.round(state.verticalSpeed * 0.7));
      if (!engineOn && descentSpeed > 30) engineOn = true;
      else if (engineOn && descentSpeed < 10) engineOn = false;
      state = stepLanding(state, {
        left: false,
        right: frame < 51,
        thrust: engineOn,
      }, 1 / 60);
    }

    expect(landingOutcome(state)).toBe('landed');
    expect(state.fuel).toBeLessThan(LANDING_START.fuel);
  });

  it('moves the astronaut and spends oxygen and battery away from the lander', () => {
    const next = stepAstronaut({ ...ASTRONAUT_START, x: 640 }, {
      left: false, right: true, up: false, down: false,
    }, 0.05);

    expect(next.x).toBeGreaterThan(640);
    expect(next.oxygen).toBeLessThan(ASTRONAUT_START.oxygen);
    expect(next.battery).toBeLessThan(ASTRONAUT_START.battery);
  });

  it('drains EVA oxygen a little faster while the astronaut is away from the lander', () => {
    const next = stepAstronaut({ ...ASTRONAUT_START, x: 640 }, {
      left: false, right: false, up: false, down: false,
    }, 1);

    expect(next.oxygen).toBeCloseTo(ASTRONAUT_START.oxygen - 2);
  });

  it('swings opposite arms and legs while walking and returns them to neutral when still', () => {
    const walkingPose = getAstronautWalkingPose(Math.PI / 2, true);
    const standingPose = getAstronautWalkingPose(Math.PI / 2, false);

    expect(walkingPose.legSwing).toBeGreaterThan(0);
    expect(walkingPose.armSwing).toBeLessThan(0);
    expect(walkingPose.bob).toBeGreaterThan(0);
    expect(standingPose).toEqual({ armSwing: 0, legSwing: 0, bob: 0 });
  });

  it('applies astronaut movement and resource use across a long frame', () => {
    const controls = { left: false, right: true, up: false, down: false };
    const longFrame = stepAstronaut(ASTRONAUT_START, controls, 0.2);
    let shortFrames = ASTRONAUT_START;
    for (let frame = 0; frame < 4; frame += 1) shortFrames = stepAstronaut(shortFrames, controls, 0.05);

    expect(longFrame).toEqual(shortFrames);
    expect(longFrame.x).toBeGreaterThan(ASTRONAUT_START.x + 0.05);
  });

  it('recharges at the lander but not at the empty build site', () => {
    const atLander = { ...ASTRONAUT_START, ...LANDER_POSITION, oxygen: 50, battery: 50 };
    const atBuildSite = { ...ASTRONAUT_START, ...BUILD_SITE_POSITION, oxygen: 50, battery: 50 };
    const next = stepAstronaut(atLander, {
      left: false, right: false, up: false, down: false,
    }, 0.05);
    const emptySite = stepAstronaut(atBuildSite, {
      left: false, right: false, up: false, down: false,
    }, 0.05);

    expect(astronautIsAtLander(atLander)).toBe(true);
    expect(astronautIsAtLander(atBuildSite)).toBe(false);
    expect(next.oxygen).toBeGreaterThan(atLander.oxygen);
    expect(next.battery).toBeGreaterThan(atLander.battery);
    expect(emptySite.oxygen).toBeLessThan(atBuildSite.oxygen);
    expect(emptySite.battery).toBeLessThan(atBuildSite.battery);
  });

  it('collects supplies and clamps resource packs at full capacity', () => {
    const collected = collectSupply({ ...ASTRONAUT_START, oxygen: 85, battery: 90 }, 'oxygen');
    expect(collected.oxygen).toBe(100);
    expect(collected.battery).toBe(90);
    expect(collected.supplies).toBe(1);
    expect(collectSupply(collected, 'battery').battery).toBe(100);
  });
});
