export type CargoKit = 'shield' | 'science';
export type MachineMode = 'crane' | 'excavator';
export type MachineAction = 'shelter' | 'lab';

export interface MachineControls {
  readonly left: boolean;
  readonly right: boolean;
  readonly raise: boolean;
  readonly lower: boolean;
}

export interface BuildingState {
  readonly phase: 'manifest' | 'building' | 'complete';
  readonly cargoKit: CargoKit | null;
  readonly cargoMass: number;
  readonly power: number;
  readonly habitatPlaced: boolean;
  readonly solarDeployed: boolean;
  readonly regolith: number;
  readonly shelterBuilt: boolean;
  readonly scienceBenchInstalled: boolean;
  readonly activeMachine: MachineMode | null;
  readonly craneX: number;
  readonly craneCable: number;
  readonly craneLoad: 'habitat' | 'solar' | null;
  readonly excavatorX: number;
  readonly bucketDepth: number;
  readonly bucketLoaded: boolean;
  readonly message: string;
}

export const CARGO_CAPACITY_TONNES = 12;
export const BASE_CARGO_MASS_TONNES = 10;
export const MAX_REGOLITH_SCOOPS = 3;
export const STARTING_POWER = 45;
export const HABITAT_CRANE_TARGET = 62;
export const SOLAR_CRANE_TARGET = 22;
export const CRANE_ALIGNMENT_TOLERANCE = 7;
export const CRANE_RELEASE_DEPTH = 65;
export const EXCAVATOR_DIG_TARGET = 60;
export const EXCAVATOR_HOPPER_TARGET = 20;
export const EXCAVATOR_ALIGNMENT_TOLERANCE = 9;
export const EXCAVATOR_DIG_DEPTH = 70;
export const EXCAVATOR_DUMP_DEPTH = 25;

const CRANE_TROLLEY_SPEED = 15;
const CRANE_HOIST_SPEED = 50;
const EXCAVATOR_TRACK_SPEED = 16;
const EXCAVATOR_BOOM_SPEED = 55;
const MAX_CRANE_CABLE = 80;
const MAX_BUCKET_DEPTH = 85;
const SOIL_SCOOP_POWER = 6;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export function getExcavatorBoomAngle(bucketDepth: number): number {
  return -35 + clamp(bucketDepth, 0, MAX_BUCKET_DEPTH) * 0.9;
}

const KIT_MASS: Readonly<Record<CargoKit, number>> = {
  shield: 1.5,
  science: 2,
};

export function createBuildingState(): BuildingState {
  return {
    phase: 'manifest',
    cargoKit: null,
    cargoMass: 0,
    power: STARTING_POWER,
    habitatPlaced: false,
    solarDeployed: false,
    regolith: 0,
    shelterBuilt: false,
    scienceBenchInstalled: false,
    activeMachine: null,
    craneX: 85,
    craneCable: 0,
    craneLoad: null,
    excavatorX: 90,
    bucketDepth: 0,
    bucketLoaded: false,
    message: 'Choose a cargo kit, then use the machines to build the outpost.',
  };
}

export function selectCargoKit(state: BuildingState, cargoKit: CargoKit): BuildingState {
  if (state.phase !== 'manifest') {
    return { ...state, message: 'The cargo lander has already touched down. Choose machines for this manifest.' };
  }

  const science = cargoKit === 'science';
  return {
    ...state,
    phase: 'building',
    cargoKit,
    cargoMass: BASE_CARGO_MASS_TONNES + KIT_MASS[cargoKit],
    message: science
      ? 'Science crate loaded. Dig three scoops for the shelter, then install the science bench.'
      : 'Shield kit loaded. Use one scoop of lunar soil with it to print the storm shelter.',
  };
}

function updatePhase(state: BuildingState): BuildingState {
  const scienceReady = state.cargoKit !== 'science' || state.scienceBenchInstalled;
  if (!state.habitatPlaced || !state.solarDeployed || !state.shelterBuilt || !scienceReady) return state;

  return {
    ...state,
    phase: 'complete',
    message: 'Outpost complete! The habitat is powered and the crew has a storm shelter.',
  };
}

function blocked(state: BuildingState, message: string): BuildingState {
  return { ...state, message };
}

export function beginMachineOperation(state: BuildingState, machine: MachineMode): BuildingState {
  if (state.phase !== 'building') return blocked(state, 'Choose a cargo kit before operating a machine.');
  if (state.activeMachine) return blocked(state, 'Finish the current machine operation first.');

  if (machine === 'crane') {
    const craneLoad = !state.habitatPlaced ? 'habitat' : !state.solarDeployed ? 'solar' : null;
    if (!craneLoad) return blocked(state, 'The habitat and solar mast are already placed.');
    return {
      ...state,
      activeMachine: 'crane',
      craneLoad,
      message: `Mobile crane carrying ${craneLoad === 'habitat' ? 'the habitat' : 'the solar mast'}. Move over its marked pad, lower the hook and release.`,
    };
  }

  if (!state.habitatPlaced || !state.solarDeployed) {
    return blocked(state, 'Place the habitat and solar mast before operating the excavator.');
  }
  if (state.shelterBuilt || state.regolith >= MAX_REGOLITH_SCOOPS) {
    return blocked(state, 'The required lunar soil has already been collected.');
  }
  return {
    ...state,
    activeMachine: 'excavator',
    message: 'Drive the excavator to the soil patch, lower its boom and scoop. Carry the loaded bucket back to the hopper to dump.',
  };
}

export function moveActiveMachine(
  state: BuildingState,
  controls: MachineControls,
  deltaSeconds: number,
): BuildingState {
  if (!state.activeMachine) return state;
  const delta = clamp(deltaSeconds, 0, 0.1);
  if (delta === 0) return state;
  const horizontal = Number(controls.right) - Number(controls.left);
  const vertical = Number(controls.lower) - Number(controls.raise);
  if (horizontal === 0 && vertical === 0) return state;

  if (state.activeMachine === 'crane') {
    return {
      ...state,
      craneX: clamp(state.craneX + horizontal * CRANE_TROLLEY_SPEED * delta, 0, 100),
      craneCable: clamp(state.craneCable + vertical * CRANE_HOIST_SPEED * delta, 0, MAX_CRANE_CABLE),
    };
  }
  return {
    ...state,
    excavatorX: clamp(state.excavatorX + horizontal * EXCAVATOR_TRACK_SPEED * delta, 0, 100),
    bucketDepth: clamp(state.bucketDepth + vertical * EXCAVATOR_BOOM_SPEED * delta, 0, MAX_BUCKET_DEPTH),
  };
}

export function releaseCraneLoad(state: BuildingState): BuildingState {
  if (state.activeMachine !== 'crane' || !state.craneLoad) {
    return blocked(state, 'Select the mobile crane before releasing a load.');
  }
  const target = state.craneLoad === 'habitat' ? HABITAT_CRANE_TARGET : SOLAR_CRANE_TARGET;
  if (Math.abs(state.craneX - target) > CRANE_ALIGNMENT_TOLERANCE) {
    return blocked(state, 'The hook is not aligned with the highlighted landing pad.');
  }
  if (state.craneCable < CRANE_RELEASE_DEPTH) {
    return blocked(state, 'Lower the hook close to the ground before releasing the load.');
  }

  if (state.craneLoad === 'habitat') {
    if (state.power < 12) return blocked(state, 'The crane needs 12 power to anchor the habitat.');
    return {
      ...state,
      habitatPlaced: true,
      power: state.power - 12,
      craneLoad: 'solar',
      craneCable: 0,
      message: 'Habitat set down and anchored. The crane has picked up the folded solar mast.',
    };
  }

  if (state.power < 8) return blocked(state, 'The crane needs 8 power to raise the solar mast.');
  return {
    ...state,
    solarDeployed: true,
    activeMachine: null,
    craneLoad: null,
    craneCable: 0,
    power: Math.min(60, state.power - 8 + 25),
    message: 'Solar mast deployed! Its panels added 25 game power units.',
  };
}

export function scoopOrDumpRegolith(state: BuildingState): BuildingState {
  if (state.activeMachine !== 'excavator') {
    return blocked(state, 'Select the excavator before scooping lunar soil.');
  }

  if (state.bucketLoaded) {
    if (Math.abs(state.excavatorX - EXCAVATOR_HOPPER_TARGET) > EXCAVATOR_ALIGNMENT_TOLERANCE) {
      return blocked(state, 'Move the loaded bucket over the soil hopper before dumping.');
    }
    if (state.bucketDepth > EXCAVATOR_DUMP_DEPTH) {
      return blocked(state, 'Raise the bucket above the hopper before dumping the soil.');
    }
    return {
      ...state,
      bucketLoaded: false,
      regolith: Math.min(MAX_REGOLITH_SCOOPS, state.regolith + 1),
      message: `Soil dumped into the hopper. ${Math.min(MAX_REGOLITH_SCOOPS, state.regolith + 1)} scoop${state.regolith === 0 ? '' : 's'} collected.`,
    };
  }

  if (Math.abs(state.excavatorX - EXCAVATOR_DIG_TARGET) > EXCAVATOR_ALIGNMENT_TOLERANCE) {
    return blocked(state, 'Drive the excavator over the marked soil patch before scooping.');
  }
  if (state.bucketDepth < EXCAVATOR_DIG_DEPTH) {
    return blocked(state, 'Lower the excavator bucket into the soil before scooping.');
  }
  if (state.regolith >= MAX_REGOLITH_SCOOPS) {
    return blocked(state, 'The soil hopper is full.');
  }
  if (state.power < SOIL_SCOOP_POWER) {
    return blocked(state, `The excavator needs ${SOIL_SCOOP_POWER} power to dig.`);
  }
  return {
    ...state,
    bucketLoaded: true,
    power: state.power - SOIL_SCOOP_POWER,
    message: 'Bucket full. Carry the soil to the hopper and raise the boom to dump it.',
  };
}

export function finishMachineOperation(state: BuildingState): BuildingState {
  if (!state.activeMachine) return state;
  if (state.bucketLoaded) return blocked(state, 'Dump the loaded bucket into the hopper before parking the excavator.');
  return {
    ...state,
    activeMachine: null,
    message: state.regolith >= (state.cargoKit === 'science' ? 3 : 1)
      ? 'Machine parked. The 3D printer has enough soil for the storm shelter.'
      : 'Machine parked. Select another machine or continue collecting soil.',
  };
}

export function applyMachineAction(state: BuildingState, action: MachineAction): BuildingState {
  if (state.phase === 'manifest') {
    return blocked(state, 'Choose a cargo kit before operating the machines.');
  }
  if (state.phase === 'complete') {
    return blocked(state, 'The outpost is complete. Start a new build to try another cargo plan.');
  }
  if (state.activeMachine) {
    return blocked(state, 'Finish the current machine operation before starting the printer.');
  }

  switch (action) {
    case 'shelter': {
      if (!state.habitatPlaced || !state.solarDeployed) {
        return blocked(state, 'Anchor the habitat and deploy the solar mast before printing the shelter.');
      }
      const soilNeeded = state.cargoKit === 'science' ? 3 : 1;
      const powerNeeded = state.cargoKit === 'science' ? 20 : 14;
      if (state.shelterBuilt) return blocked(state, 'The storm shelter is already printed.');
      if (state.regolith < soilNeeded) {
        return blocked(state, `The printer needs ${soilNeeded} scoop${soilNeeded === 1 ? '' : 's'} of regolith for this shelter.`);
      }
      if (state.power < powerNeeded) {
        return blocked(state, `The printer needs ${powerNeeded} power to build the storm shelter.`);
      }
      return updatePhase({
        ...state,
        shelterBuilt: true,
        regolith: state.regolith - soilNeeded,
        power: state.power - powerNeeded,
        message: state.cargoKit === 'science'
          ? 'Regolith berm printed. Install the science bench to finish this cargo plan.'
          : 'Storm shelter printed using the shield kit and lunar soil.',
      });
    }

    case 'lab':
      if (state.cargoKit !== 'science') return blocked(state, 'There is no science crate on this cargo manifest.');
      if (!state.habitatPlaced || !state.solarDeployed) {
        return blocked(state, 'Anchor the habitat and deploy the solar mast before installing the bench.');
      }
      if (state.scienceBenchInstalled) return blocked(state, 'The science bench is already installed.');
      if (state.power < 5) return blocked(state, 'The crane needs 5 power to install the science bench.');
      return updatePhase({
        ...state,
        scienceBenchInstalled: true,
        power: state.power - 5,
        message: state.shelterBuilt
          ? 'Science bench installed. All outpost construction jobs are complete!'
          : 'Science bench installed. Now use the excavator and 3D printer to build the shelter.',
      });
  }
}
