import { describe, expect, it } from 'vitest';
import {
  CARGO_WORLD,
  CARGO_ASTEROIDS,
  ROVER_PARKING_AREA,
  ROVER_SITES,
  chooseRoverSite,
  deployRover,
  initialRobotsState,
  landCargoRocket,
  launchRoverMission,
  sampleRoverWater,
  stepCargoFlight,
  stepRover,
  takeRoverPhoto,
} from './robots.logic';

const idleCargo = { left: false, right: false, up: false, down: false };
const idleRover = { left: false, right: false, forward: false, reverse: false };

describe('piloted rover cargo mission', () => {
  it('requires a target selection, then lets the player pilot the cargo rocket from Earth', () => {
    const selected = chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge);
    let flight = launchRoverMission(selected);
    const launchY = flight.y;
    for (let frame = 0; frame < 60; frame += 1) {
      flight = stepCargoFlight(flight, { ...idleCargo, up: true }, 0.05);
    }

    expect(flight.phase).toBe('transfer');
    expect(flight.y).toBeLessThan(launchY);
    expect(flight.fuel).toBeLessThan(100);
    expect(flight.path.length).toBeGreaterThan(1);
  });

  it('moves rocket thrust in the direction shown by the arrow controls', () => {
    const flight = {
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      x: 450,
      y: 300,
    };
    const upward = stepCargoFlight(flight, { ...idleCargo, up: true }, 0.08);
    const downward = stepCargoFlight(flight, { ...idleCargo, down: true }, 0.08);

    expect(upward.y).toBeLessThan(flight.y);
    expect(downward.y).toBeGreaterThan(flight.y);
  });

  it('keeps cargo-rocket diagonal thrust normalized and frame-rate stable', () => {
    const flight = {
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      x: 450,
      y: 300,
    };
    const vertical = stepCargoFlight(flight, { ...idleCargo, up: true }, 1 / 60);
    const diagonal = stepCargoFlight(flight, { ...idleCargo, up: true, right: true }, 1 / 60);
    expect(Math.hypot(diagonal.vx, diagonal.vy)).toBeCloseTo(Math.hypot(vertical.vx, vertical.vy), 1);
    let severalFrames = flight;
    for (let i = 0; i < 6; i += 1) severalFrames = stepCargoFlight(severalFrames, { ...idleCargo, up: true }, 1 / 60);
    const singleFrameBatch = stepCargoFlight(flight, { ...idleCargo, up: true }, 0.1);
    expect(singleFrameBatch.x).toBeCloseTo(severalFrames.x, 3);
    expect(singleFrameBatch.y).toBeCloseTo(severalFrames.y, 3);
  });

  it('lets Earth and Moon gravity pull the cargo rocket in toward each body', () => {
    const flight = launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge));
    const nearEarth = stepCargoFlight({ ...flight, x: 130, y: CARGO_WORLD.earth.y }, idleCargo, 0.08);
    const nearMoon = stepCargoFlight({ ...flight, x: 600, y: 300 }, idleCargo, 0.08);

    expect(nearEarth.x).toBeLessThan(130);
    expect(nearMoon.x).toBeGreaterThan(600);
    expect(nearMoon.y).toBeGreaterThan(300);
  });

  it('makes low propellant produce slower acceleration and limits cargo landing to the target', () => {
    const base = launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.shadowedCrater));
    const lowFuel = stepCargoFlight({ ...base, fuel: 10 }, { ...idleCargo, up: true }, 0.08);
    const fullFuel = stepCargoFlight(base, { ...idleCargo, up: true }, 0.08);
    expect(lowFuel.vy).toBeGreaterThan(fullFuel.vy);

    const approach = {
      ...base,
      phase: 'approach' as const,
      x: CARGO_WORLD.sites.shadowedCrater.x,
      y: CARGO_WORLD.sites.shadowedCrater.y,
      vx: 0,
      vy: 0,
    };
    expect(landCargoRocket(approach).phase).toBe('landing');
    expect(landCargoRocket({ ...approach, vx: 30 }).message).toContain('Too fast');
  });

  it('ends a cargo flight when it hits an asteroid', () => {
    const flight = {
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      x: CARGO_ASTEROIDS[0].x - 10,
      y: CARGO_ASTEROIDS[0].y,
    };
    expect(stepCargoFlight(flight, idleCargo, 0.08).phase).toBe('crashed');
  });

  it('allows the cargo rocket to safely pass close beside an asteroid', () => {
    const rock = CARGO_ASTEROIDS[0];
    const nearMiss = {
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      x: rock.x - 24,
      y: rock.y,
      vx: 0,
      vy: 0,
    };
    expect(stepCargoFlight(nearMiss, idleCargo, 0.01).phase).toBe('transfer');
  });

  it('auto-brakes the cargo rocket when the player releases the thrusters', () => {
    const flight = {
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      x: 450,
      y: 100,
      vx: 25,
      vy: 0,
    };
    let coasting = flight;
    for (let frame = 0; frame < 10; frame += 1) {
      coasting = stepCargoFlight(coasting, idleCargo, 0.075);
    }

    expect(Math.hypot(coasting.vx, coasting.vy)).toBeLessThan(12);
  });

  it('auto-brakes the rover when the player releases the drive controls', () => {
    const landed = landCargoRocket({
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      phase: 'approach',
      x: CARGO_WORLD.sites.sunnyRidge.x,
      y: CARGO_WORLD.sites.sunnyRidge.y,
      vx: 0,
      vy: 0,
    });
    const rover = { ...deployRover(landed), x: 20, y: 20, vx: 14, vy: 0 };
    let coasting = rover;
    for (let frame = 0; frame < 10; frame += 1) {
      coasting = stepRover(coasting, idleRover, 0.075);
    }

    expect(Math.hypot(coasting.vx, coasting.vy)).toBeLessThan(8);
  });

  it('drives forward across the lunar surface and steers left toward the upper terrain', () => {
    const rover = {
      ...initialRobotsState,
      phase: 'driving' as const,
      site: ROVER_SITES.sunnyRidge,
      x: 50,
      y: 50,
      heading: 0,
    };
    const turned = stepRover(rover, { ...idleRover, left: true }, 0.08);
    const driven = stepRover(turned, { ...idleRover, forward: true }, 0.08);

    expect(turned.heading).toBeLessThan(0);
    expect(driven.x).toBeGreaterThan(rover.x);
    expect(driven.y).toBeLessThan(rover.y);
    expect(driven.mappedTiles.length).toBeGreaterThan(rover.mappedTiles.length);
  });

  it('keeps sunny ridge driving smoother and slows the rover on rough crater ground', () => {
    const sunny = {
      ...initialRobotsState,
      phase: 'driving' as const,
      site: ROVER_SITES.sunnyRidge,
      x: 35,
      y: 8,
      heading: 0,
    };
    const shadowed = {
      ...sunny,
      site: ROVER_SITES.shadowedCrater,
      x: 75,
      y: 70,
    };
    const controls = { ...idleRover, forward: true };
    const smoothStep = stepRover(sunny, controls, 0.08);
    const roughStep = stepRover(shadowed, controls, 0.08);

    expect(smoothStep.vx).toBeGreaterThan(roughStep.vx);
    expect(smoothStep.battery).toBeGreaterThan(roughStep.battery);
  });

  it('switches from a soft landing to continuous rover drive and unique photo jobs', () => {
    const landed = landCargoRocket({
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.sunnyRidge)),
      phase: 'approach',
      x: CARGO_WORLD.sites.sunnyRidge.x,
      y: CARGO_WORLD.sites.sunnyRidge.y,
      vx: 0,
      vy: 0,
    });
    let rover = deployRover(landed);
    rover = takeRoverPhoto(rover);
    for (let frame = 0; frame < 20; frame += 1) {
      rover = stepRover(rover, { ...idleRover, forward: true }, 0.08);
    }
    expect(rover.x).toBeGreaterThan(8);
    expect(rover.photos).toHaveLength(1);
    expect(takeRoverPhoto(rover).photos).toHaveLength(2);
  });

  it('completes rover science after mapping, photographing, and sampling crater soil', () => {
    let rover = deployRover(landCargoRocket({
      ...launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.shadowedCrater)),
      phase: 'approach',
      x: CARGO_WORLD.sites.shadowedCrater.x,
      y: CARGO_WORLD.sites.shadowedCrater.y,
      vx: 0,
      vy: 0,
    }));
    rover = takeRoverPhoto(rover);
    rover = { ...rover, x: 25, y: 20, mappedTiles: ['0,1', '1,1', '2,1'] };
    rover = takeRoverPhoto(rover);
    rover = { ...rover, x: 45, y: 25, mappedTiles: ['0,1', '1,1', '2,1', '3,1'] };
    rover = takeRoverPhoto(rover);
    rover = { ...rover, x: 75, y: 70, mappedTiles: ['0,1', '1,1', '2,1', '3,3', '4,3'] };
    rover = sampleRoverWater(rover);

    expect(rover.phase).toBe('driving');
    expect(rover.parked).toBe(false);
    expect(rover.photos).toHaveLength(3);
    expect(rover.mappedTiles).toHaveLength(5);
    expect(rover.waterSampled).toBe(true);

    rover = stepRover({
      ...rover,
      x: ROVER_PARKING_AREA.x,
      y: ROVER_PARKING_AREA.y,
      vx: 0,
      vy: 0,
    }, idleRover, 0.08);

    expect(rover.phase).toBe('complete');
    expect(rover.parked).toBe(true);
    expect(rover.message).toContain('parked safely');
  });

  it('does not complete the mission by parking before the science survey is done', () => {
    const rover = stepRover({
      ...initialRobotsState,
      phase: 'driving',
      site: ROVER_SITES.sunnyRidge,
      x: ROVER_PARKING_AREA.x,
      y: ROVER_PARKING_AREA.y,
    }, idleRover, 0.08);

    expect(rover.phase).toBe('driving');
    expect(rover.parked).toBe(true);
  });
});
