import { describe, expect, it } from 'vitest';
import {
  applyMachineAction,
  beginMachineOperation,
  CARGO_CAPACITY_TONNES,
  createBuildingState,
  EXCAVATOR_DIG_TARGET,
  EXCAVATOR_HOPPER_TARGET,
  finishMachineOperation,
  getExcavatorBoomAngle,
  HABITAT_CRANE_TARGET,
  moveActiveMachine,
  releaseCraneLoad,
  scoopOrDumpRegolith,
  selectCargoKit,
  SOLAR_CRANE_TARGET,
  type BuildingState,
  type MachineControls,
} from './building/logic';

const idle: MachineControls = { left: false, right: false, raise: false, lower: false };

function moveToPosition(state: BuildingState, target: number): BuildingState {
  for (let frame = 0; frame < 100; frame += 1) {
    const position = state.activeMachine === 'crane' ? state.craneX : state.excavatorX;
    if (Math.abs(position - target) <= 2) return state;
    state = moveActiveMachine(state, {
      ...idle,
      [position < target ? 'right' : 'left']: true,
    }, 0.05);
  }
  return state;
}

function moveDepthTo(state: BuildingState, target: number, lower: boolean): BuildingState {
  for (let frame = 0; frame < 100; frame += 1) {
    const depth = state.activeMachine === 'crane' ? state.craneCable : state.bucketDepth;
    if ((lower && depth >= target) || (!lower && depth <= target)) return state;
    state = moveActiveMachine(state, { ...idle, [lower ? 'lower' : 'raise']: true }, 0.05);
  }
  return state;
}

function placeCraneLoad(state: BuildingState, target: number): BuildingState {
  state = moveToPosition(state, target);
  state = moveDepthTo(state, 70, true);
  return releaseCraneLoad(state);
}

function collectOneScoop(state: BuildingState): BuildingState {
  state = moveToPosition(state, EXCAVATOR_DIG_TARGET);
  state = moveDepthTo(state, 75, true);
  state = scoopOrDumpRegolith(state);
  state = moveToPosition(state, EXCAVATOR_HOPPER_TARGET);
  state = moveDepthTo(state, 0, false);
  return scoopOrDumpRegolith(state);
}

function buildInfrastructure(state: BuildingState): BuildingState {
  state = beginMachineOperation(state, 'crane');
  state = placeCraneLoad(state, HABITAT_CRANE_TARGET);
  state = placeCraneLoad(state, SOLAR_CRANE_TARGET);
  return state;
}

describe('machine-built lunar outpost', () => {
  it('articulates the excavator boom through its safe operating range', () => {
    expect(getExcavatorBoomAngle(0)).toBe(-35);
    expect(getExcavatorBoomAngle(70)).toBe(28);
    expect(getExcavatorBoomAngle(100)).toBe(getExcavatorBoomAngle(85));
  });

  it('keeps either cargo plan within the lander payload limit', () => {
    const shieldPlan = selectCargoKit(createBuildingState(), 'shield');
    const sciencePlan = selectCargoKit(createBuildingState(), 'science');

    expect(shieldPlan.cargoMass).toBe(11.5);
    expect(sciencePlan.cargoMass).toBe(CARGO_CAPACITY_TONNES);
    expect(sciencePlan.phase).toBe('building');
  });

  it('only releases a crane load after steering it over a pad and lowering the hook', () => {
    const initial = beginMachineOperation(selectCargoKit(createBuildingState(), 'shield'), 'crane');
    const unaligned = releaseCraneLoad(initial);
    expect(unaligned.habitatPlaced).toBe(false);
    expect(unaligned.message).toContain('not aligned');

    let positioned = moveToPosition(initial, HABITAT_CRANE_TARGET);
    const raised = releaseCraneLoad(positioned);
    expect(raised.habitatPlaced).toBe(false);
    expect(raised.message).toContain('Lower the hook');

    positioned = placeCraneLoad(positioned, HABITAT_CRANE_TARGET);
    expect(positioned.habitatPlaced).toBe(true);
    expect(positioned.craneLoad).toBe('solar');
  });

  it('builds a powered shelter after the player operates the crane and excavator', () => {
    let state = selectCargoKit(createBuildingState(), 'shield');
    state = buildInfrastructure(state);
    expect(state.habitatPlaced).toBe(true);
    expect(state.solarDeployed).toBe(true);

    state = beginMachineOperation(state, 'excavator');
    state = collectOneScoop(state);
    state = finishMachineOperation(state);
    state = applyMachineAction(state, 'shelter');

    expect(state.phase).toBe('complete');
    expect(state.shelterBuilt).toBe(true);
    expect(state.regolith).toBe(0);
    expect(state.power).toBe(30);
  });

  it('requires three scoops and a science bench when the shield kit is left behind', () => {
    let state = selectCargoKit(createBuildingState(), 'science');
    state = buildInfrastructure(state);
    state = beginMachineOperation(state, 'excavator');

    const wrongSpot = scoopOrDumpRegolith(state);
    expect(wrongSpot.bucketLoaded).toBe(false);
    expect(wrongSpot.message).toContain('soil patch');

    state = collectOneScoop(state);
    state = collectOneScoop(state);
    state = collectOneScoop(state);
    state = finishMachineOperation(state);
    state = applyMachineAction(state, 'shelter');
    expect(state.phase).toBe('building');
    expect(state.shelterBuilt).toBe(true);

    state = applyMachineAction(state, 'lab');
    expect(state.phase).toBe('complete');
    expect(state.scienceBenchInstalled).toBe(true);
  });
});
