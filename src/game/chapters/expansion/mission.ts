export type ExpansionPhase = 'intro' | 'order' | 'delivery' | 'collect' | 'hazard' | 'build' | 'complete' | 'failed';
export type ExpansionDustEventStatus = 'inactive' | 'warning' | 'protected' | 'exposed';

export interface ExpansionTile {
    x: number;
    y: number;
}

export const EXPANSION_ORDER_BUDGET = 100;
export const EXPANSION_BUILD_TARGET = 3;
export const EXPANSION_CARGO_CAPACITY = 8;
export const EXPANSION_SOLAR_FLARE_INTERVAL_MIN_SECONDS = 20;
export const EXPANSION_SOLAR_FLARE_INTERVAL_MAX_SECONDS = 40;

export function getRandomExpansionSolarFlareInterval(random = Math.random): number {
    const intervalRange = EXPANSION_SOLAR_FLARE_INTERVAL_MAX_SECONDS
        - EXPANSION_SOLAR_FLARE_INTERVAL_MIN_SECONDS + 1;
    return EXPANSION_SOLAR_FLARE_INTERVAL_MIN_SECONDS + Math.floor(random() * intervalRange);
}

export const EXPANSION_MATERIALS = [
    { id: 'solarPanel', name: 'Solar panels', crateLabel: 'PANELS', inventoryLabel: 'PNL', price: 10, color: 0xf2c963 },
    { id: 'wiringKit', name: 'Wiring kits', crateLabel: 'WIRING', inventoryLabel: 'WIR', price: 6, color: 0x64d4ec },
    { id: 'frameKit', name: 'Frame kits', crateLabel: 'FRAMES', inventoryLabel: 'FRM', price: 8, color: 0x8db8ff },
    { id: 'habitatPanel', name: 'Habitat panels', crateLabel: 'HABITAT', inventoryLabel: 'HAB', price: 10, color: 0x72d99a },
    { id: 'waterSystem', name: 'Water systems', crateLabel: 'WATER', inventoryLabel: 'H2O', price: 10, color: 0x66c9f2 },
    { id: 'antennaKit', name: 'Antenna kits', crateLabel: 'ANTENNA', inventoryLabel: 'ANT', price: 10, color: 0xc49bff },
    { id: 'electronicsKit', name: 'Electronics kits', crateLabel: 'ELECTRONICS', inventoryLabel: 'ELEC', price: 10, color: 0xff967e },
    { id: 'shieldPanel', name: 'Radiation shielding', crateLabel: 'SHIELDING', inventoryLabel: 'SHLD', price: 12, color: 0xffc45c }
] as const;

export type ExpansionMaterialId = typeof EXPANSION_MATERIALS[number]['id'];
export type ExpansionMaterialInventory = Record<ExpansionMaterialId, number>;
export type ExpansionBuildingKind = 'greenhouse' | 'solar' | 'relay' | 'shelter' | 'garage' | 'recycler';
export type ExpansionRecipeMaterials = Partial<Record<ExpansionMaterialId, number>>;

export interface ExpansionBuildingRecipe {
    kind: ExpansionBuildingKind;
    materials: ExpansionRecipeMaterials;
}

export const EXPANSION_BUILDING_RECIPES: readonly ExpansionBuildingRecipe[] = [
    { kind: 'solar', materials: { solarPanel: 2, wiringKit: 1 } },
    { kind: 'greenhouse', materials: { frameKit: 1, habitatPanel: 2, waterSystem: 1 } },
    { kind: 'relay', materials: { antennaKit: 1, electronicsKit: 1 } },
    { kind: 'shelter', materials: { frameKit: 1, habitatPanel: 1, shieldPanel: 1 } },
    { kind: 'garage', materials: { frameKit: 2, solarPanel: 1 } },
    { kind: 'recycler', materials: { frameKit: 1, waterSystem: 1, electronicsKit: 1 } }
];

export const EXPANSION_STARTER_ORDER: Readonly<ExpansionMaterialInventory> = {
    solarPanel: 2,
    wiringKit: 1,
    frameKit: 1,
    habitatPanel: 2,
    waterSystem: 1,
    antennaKit: 1,
    electronicsKit: 1,
    shieldPanel: 0
};

export function createExpansionMaterialInventory(): ExpansionMaterialInventory {
    return {
        solarPanel: 0,
        wiringKit: 0,
        frameKit: 0,
        habitatPanel: 0,
        waterSystem: 0,
        antennaKit: 0,
        electronicsKit: 0,
        shieldPanel: 0
    };
}

export function getExpansionOrderCost(order: ExpansionMaterialInventory): number {
    return EXPANSION_MATERIALS.reduce((total, material) =>
        total + material.price * order[material.id], 0
    );
}

export function getExpansionCargoCrateCount(order: ExpansionMaterialInventory): number {
    return EXPANSION_MATERIALS.filter((material) => order[material.id] > 0).length;
}

export function canBuildExpansionRecipe(
    inventory: ExpansionMaterialInventory,
    recipe: ExpansionRecipeMaterials
): boolean {
    return EXPANSION_MATERIALS.every(({ id }) => inventory[id] >= (recipe[id] ?? 0));
}

export function consumeExpansionRecipe(
    inventory: ExpansionMaterialInventory,
    recipe: ExpansionRecipeMaterials
): ExpansionMaterialInventory | undefined {
    if (!canBuildExpansionRecipe(inventory, recipe)) {
        return undefined;
    }

    const remaining = { ...inventory };
    EXPANSION_MATERIALS.forEach(({ id }) => {
        remaining[id] -= recipe[id] ?? 0;
    });
    return remaining;
}

export function getExpansionBuildableCount(
    inventory: ExpansionMaterialInventory,
    limit = EXPANSION_BUILD_TARGET
): number {
    const visit = (remaining: ExpansionMaterialInventory, built: number): number => {
        if (built === limit) {
            return built;
        }

        let best = built;
        for (const recipe of EXPANSION_BUILDING_RECIPES) {
            const nextInventory = consumeExpansionRecipe(remaining, recipe.materials);
            if (!nextInventory) {
                continue;
            }
            best = Math.max(best, visit(nextInventory, built + 1));
            if (best === limit) {
                return best;
            }
        }
        return best;
    };

    return visit(inventory, 0);
}

export function isExpansionGameplayActive(phase: ExpansionPhase): boolean {
    return phase === 'collect' || phase === 'hazard' || phase === 'build';
}

export function canPlaceExpansionStructure(
    tile: ExpansionTile,
    structures: readonly ExpansionTile[],
    astronaut: ExpansionTile
): boolean {
    const occupiedByStructure = structures.some((structure) =>
        structure.x === tile.x && structure.y === tile.y
    );
    const occupiedByAstronaut = astronaut.x === tile.x && astronaut.y === tile.y;
    const adjacentToStructure = structures.some((structure) =>
        Math.abs(structure.x - tile.x) + Math.abs(structure.y - tile.y) === 1
    );

    return !occupiedByStructure && !occupiedByAstronaut && adjacentToStructure;
}

export function applyExpansionFlareExposure(
    suitIntegrity: number,
    radiationDose: number,
    seconds: number,
    protectedByOutpost: boolean
): { suitIntegrity: number; radiationDose: number } {
    if (protectedByOutpost) {
        return { suitIntegrity, radiationDose };
    }

    return {
        suitIntegrity: Math.max(0, suitIntegrity - 9 * seconds),
        radiationDose: Math.min(100, radiationDose + 22 * seconds)
    };
}

export function applyExpansionDustEvent(
    suitIntegrity: number,
    radiationDose: number,
    protectedByOutpost: boolean
): { suitIntegrity: number; radiationDose: number } {
    return {
        suitIntegrity: Math.max(0, suitIntegrity - 45),
        radiationDose: protectedByOutpost
            ? radiationDose
            : Math.min(100, radiationDose + 45)
    };
}
