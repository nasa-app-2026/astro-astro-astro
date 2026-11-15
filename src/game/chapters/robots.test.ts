import { describe, expect, it } from 'vitest';
import {
  CARGO_WORLD,
  CARGO_ASTEROIDS,
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
    expect(flight.y).toBeGreaterThan(launchY);
    expect(flight.fuel).toBeLessThan(100);
    expect(flight.path.length).toBeGreaterThan(1);
  });

  it('makes low propellant produce slower acceleration and limits cargo landing to the target', () => {
    const base = launchRoverMission(chooseRoverSite(initialRobotsState, ROVER_SITES.shadowedCrater));
    const lowFuel = stepCargoFlight({ ...base, fuel: 10 }, { ...idleCargo, up: true }, 0.08);
    const fullFuel = stepCargoFlight(base, { ...idleCargo, up: true }, 0.08);
    expect(lowFuel.vy).toBeLessThan(fullFuel.vy);

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

    expect(rover.phase).toBe('complete');
    expect(rover.photos).toHaveLength(3);
    expect(rover.mappedTiles).toHaveLength(5);
    expect(rover.waterSampled).toBe(true);
  });
});
