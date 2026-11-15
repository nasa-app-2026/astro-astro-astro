export type ExpansionSurfaceFeature =
    | { kind: 'crater'; x: number; y: number; offsetX: number; offsetY: number; scale: number }
    | { kind: 'boulder'; x: number; y: number; offsetX: number; offsetY: number; scale: number };

const craterSites = [
    { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 9, y: 0 },
    { x: 4, y: 1 }, { x: 9, y: 2 }, { x: 0, y: 4 },
    { x: 3, y: 5 }, { x: 2, y: 6 }, { x: 9, y: 6 },
    { x: 1, y: 6 }, { x: 4, y: 6 }, { x: 2, y: 4 }
];

const occupiedSites = new Set([
    '1,3',
    '4,3',
    '5,2', '6,2', '7,2',
    '5,3', '6,3', '7,3',
    '5,4', '6,4', '7,4'
]);

export function getExpansionSurfaceFeatures(columns: number, rows: number): ExpansionSurfaceFeature[] {
    const features: ExpansionSurfaceFeature[] = [];
    const craters = craterSites.filter((site) =>
        site.x < columns
        && site.y < rows
        && !occupiedSites.has(`${site.x},${site.y}`)
    );
    const craterKeys = new Set(craters.map((site) => `${site.x},${site.y}`));

    craters.forEach(({ x, y }) => {
        features.push({
            kind: 'crater',
            x,
            y,
            offsetX: ((x * 17 + y * 11) % 17) - 8,
            offsetY: ((x * 7 + y * 13) % 17) - 8,
            scale: 0.82 + ((x * 3 + y * 5) % 4) * 0.08
        });
    });

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const key = `${x},${y}`;
            const seed = x * 37 + y * 61 + x * y * 13;
            if (occupiedSites.has(key) || craterKeys.has(key) || seed % 5 !== 2) {
                continue;
            }
            features.push({
                kind: 'boulder',
                x,
                y,
                offsetX: ((seed * 7) % 25) - 12,
                offsetY: ((seed * 11) % 25) - 12,
                scale: 0.8 + (seed % 4) * 0.12
            });
        }
    }

    return features;
}
