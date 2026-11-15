import { describe, expect, it } from 'vitest';
import {
    applyExpansionDustEvent,
    canBuildExpansionRecipe,
    canPlaceExpansionStructure,
    consumeExpansionRecipe,
    createExpansionMaterialInventory,
    EXPANSION_BUILDING_RECIPES,
    EXPANSION_SOLAR_FLARE_INTERVAL_MAX_SECONDS,
    EXPANSION_SOLAR_FLARE_INTERVAL_MIN_SECONDS,
    EXPANSION_STARTER_ORDER,
    getExpansionBuildableCount,
    getExpansionCargoCrateCount,
    getExpansionOrderCost,
    getRandomExpansionSolarFlareInterval,
    isExpansionGameplayActive
} from './expansion/mission';
import { getExpansionSurfaceFeatures } from './expansion/terrain';
import { getExpansionResourceState } from './expansion/visuals';

describe('Expansion mission briefing', () => {
    it('keeps the mission simulation paused until the briefing is dismissed', () => {
        expect(isExpansionGameplayActive('intro')).toBe(false);
        expect(isExpansionGameplayActive('order')).toBe(false);
        expect(isExpansionGameplayActive('delivery')).toBe(false);
        expect(isExpansionGameplayActive('collect')).toBe(true);
        expect(isExpansionGameplayActive('hazard')).toBe(true);
        expect(isExpansionGameplayActive('build')).toBe(true);
        expect(isExpansionGameplayActive('complete')).toBe(false);
        expect(isExpansionGameplayActive('failed')).toBe(false);
    });
});

describe('Expansion supply ordering', () => {
    it('prices the starter manifest and funds three different upgrades', () => {
        expect(getExpansionOrderCost(EXPANSION_STARTER_ORDER)).toBe(84);
        expect(getExpansionCargoCrateCount(EXPANSION_STARTER_ORDER)).toBe(7);
        expect(getExpansionBuildableCount(EXPANSION_STARTER_ORDER)).toBe(3);
    });

    it('blocks construction without the recipe materials and consumes them on success', () => {
        const recipe = EXPANSION_BUILDING_RECIPES.find(({ kind }) => kind === 'solar');
        if (!recipe) {
            throw new Error('Solar array recipe is required.');
        }

        const inventory = { ...EXPANSION_STARTER_ORDER };
        expect(canBuildExpansionRecipe(inventory, recipe.materials)).toBe(true);
        expect(consumeExpansionRecipe(inventory, recipe.materials)).toEqual({
            ...createExpansionMaterialInventory(),
            solarPanel: 0,
            wiringKit: 0,
            frameKit: 1,
            habitatPanel: 2,
            waterSystem: 1,
            antennaKit: 1,
            electronicsKit: 1
        });

        const missingElectronics = { ...inventory, electronicsKit: 0 };
        expect(getExpansionBuildableCount(missingElectronics)).toBe(2);
        expect(canBuildExpansionRecipe(missingElectronics, recipe.materials)).toBe(true);
    });
});

describe('Expansion rover dust and solar event', () => {
    it('schedules flare warnings at random intervals within the playable range', () => {
        expect(getRandomExpansionSolarFlareInterval(() => 0))
            .toBe(EXPANSION_SOLAR_FLARE_INTERVAL_MIN_SECONDS);
        expect(getRandomExpansionSolarFlareInterval(() => 0.999))
            .toBe(EXPANSION_SOLAR_FLARE_INTERVAL_MAX_SECONDS);
    });

    it('damages suit integrity but shields the astronaut from the radiation spike at the outpost', () => {
        expect(applyExpansionDustEvent(100, 8, true)).toEqual({
            suitIntegrity: 55,
            radiationDose: 8
        });
    });

    it('adds a dangerous radiation dose in the open and clamps both resources', () => {
        expect(applyExpansionDustEvent(20, 70, false)).toEqual({
            suitIntegrity: 0,
            radiationDose: 100
        });
        expect(applyExpansionDustEvent(100, 0, false)).toEqual({
            suitIntegrity: 55,
            radiationDose: 45
        });
    });
});

describe('Expansion structure placement', () => {
    const outpost = { x: 4, y: 3 };

    it('allows an empty adjacent tile but not an occupied or distant tile', () => {
        expect(canPlaceExpansionStructure({ x: 3, y: 3 }, [outpost], { x: 1, y: 3 })).toBe(true);
        expect(canPlaceExpansionStructure({ x: 4, y: 3 }, [outpost], { x: 1, y: 3 })).toBe(false);
        expect(canPlaceExpansionStructure({ x: 3, y: 3 }, [outpost], { x: 3, y: 3 })).toBe(false);
        expect(canPlaceExpansionStructure({ x: 1, y: 1 }, [outpost], { x: 1, y: 3 })).toBe(false);
    });
});

describe('Expansion resource display', () => {
    it('shows warnings at the existing suit, oxygen, and radiation limits', () => {
        expect(getExpansionResourceState('suitIntegrity', 60)).toBe('normal');
        expect(getExpansionResourceState('suitIntegrity', 59)).toBe('warning');
        expect(getExpansionResourceState('oxygen', 25)).toBe('normal');
        expect(getExpansionResourceState('oxygen', 24)).toBe('danger');
        expect(getExpansionResourceState('radiationDose', 44)).toBe('normal');
        expect(getExpansionResourceState('radiationDose', 45)).toBe('danger');
    });

    it('does not signal a warning for power or healthy resources', () => {
        expect(getExpansionResourceState('energy', 1)).toBe('normal');
        expect(getExpansionResourceState('oxygen', 100)).toBe('normal');
        expect(getExpansionResourceState('suitIntegrity', 100)).toBe('normal');
        expect(getExpansionResourceState('radiationDose', 0)).toBe('normal');
    });
});

describe('Expansion lunar map details', () => {
    it('places repeatable surface features within the playable grid and clear of mission markers', () => {
        const features = getExpansionSurfaceFeatures(10, 7);
        const reservedTiles = new Set([
            '1,3', '4,3',
            '5,2', '6,2', '7,2',
            '5,3', '6,3', '7,3',
            '5,4', '6,4', '7,4'
        ]);

        expect(features).toEqual(getExpansionSurfaceFeatures(10, 7));
        expect(features.filter((feature) => feature.kind === 'crater')).toHaveLength(12);
        expect(features.some((feature) => feature.kind === 'boulder')).toBe(true);
        expect(features.every((feature) =>
            feature.x >= 0
            && feature.x < 10
            && feature.y >= 0
            && feature.y < 7
            && Math.abs(feature.offsetX) <= 12
            && Math.abs(feature.offsetY) <= 12
            && !reservedTiles.has(`${feature.x},${feature.y}`)
        )).toBe(true);
    });
});
