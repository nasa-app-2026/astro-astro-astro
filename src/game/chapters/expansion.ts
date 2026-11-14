import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

type BuildingKind = 'greenhouse' | 'solar' | 'relay' | 'shelter' | 'garage' | 'recycler';
type Phase = 'collect' | 'build' | 'complete' | 'failed';

interface Point {
    x: number;
    y: number;
}

interface SupplyCrate extends Point {
    collected: boolean;
    marker?: Phaser.GameObjects.Container;
}

interface Structure extends Point {
    kind: 'outpost' | BuildingKind;
    marker?: Phaser.GameObjects.Container;
}

interface BuildingOption {
    kind: BuildingKind;
    title: string;
    description: string;
    mapLabel: string;
    color: number;
    energyCost: number;
    report: string;
}

const options: readonly BuildingOption[] = [
    {
        kind: 'greenhouse',
        title: 'Greenhouse',
        description: 'Grow fresh food; lights use power.',
        mapLabel: 'G',
        color: 0x72d99a,
        energyCost: 14,
        report: 'Fresh greens are on the way. The grow-lights will need electricity.'
    },
    {
        kind: 'solar',
        title: 'Solar array',
        description: 'Make extra energy in the sunlight.',
        mapLabel: 'S',
        color: 0xf2c963,
        energyCost: 12,
        report: 'The new solar array helps keep the outpost charged.'
    },
    {
        kind: 'relay',
        title: 'Radio relay',
        description: 'Help messages travel around hills.',
        mapLabel: 'R',
        color: 0x64d4ec,
        energyCost: 10,
        report: 'Mission Control can now relay messages around nearby hills.'
    },
    {
        kind: 'shelter',
        title: 'Storm shelter',
        description: 'A nearby safe spot during solar storms.',
        mapLabel: '!',
        color: 0xff967e,
        energyCost: 18,
        report: 'The shielded shelter gives the crew another safe place to repair.'
    },
    {
        kind: 'garage',
        title: 'Rover garage',
        description: 'Prepare for longer trips over the Moon.',
        mapLabel: 'V',
        color: 0x8db8ff,
        energyCost: 16,
        report: 'The rover garage is ready for longer trips across the lunar surface.'
    },
    {
        kind: 'recycler',
        title: 'Air recycler',
        description: 'Recycle more air; save oxygen on walks.',
        mapLabel: 'O',
        color: 0xc49bff,
        energyCost: 15,
        report: 'The air recycler helps the crew make better use of its oxygen.'
    }
];

const MAX_RESOURCE = 100;

export class ExpansionScene extends ChapterScene {
    private readonly boardLeft = 24;
    private readonly boardTop = 188;
    private readonly cellSize = 64;
    private readonly columns = 10;
    private readonly rows = 7;

    private astronaut: Point = { x: 1, y: 3 };
    private readonly crates: SupplyCrate[] = [
        { x: 2, y: 1, collected: false },
        { x: 7, y: 2, collected: false },
        { x: 8, y: 5, collected: false }
    ];
    private readonly structures: Structure[] = [{ x: 4, y: 3, kind: 'outpost' }];
    private phase: Phase = 'collect';
    private selectedBuilding?: BuildingKind;
    private message = 'Find the three supply crates. Watch your suit while you explore.';
    private energy = 82;
    private oxygen = 84;
    private suitIntegrity = 100;
    private radiationDose = 0;
    private readonly displayedResources = { energy: 82, oxygen: 84, suitIntegrity: 100, radiationDose: 0 };
    private missionScore = 0;
    private moveTimer = 0;
    private serviceCooldown = 0;
    private repairTimer = 0;
    private previousRepairKey = false;
    private previousServiceKey = false;
    private endOverlayVisible = false;
    private hudTimer = 0;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private keys!: Record<'up' | 'down' | 'left' | 'right', Phaser.Input.Keyboard.Key>;
    private repairKey!: Phaser.Input.Keyboard.Key;
    private serviceKey!: Phaser.Input.Keyboard.Key;
    private astronautSprite!: Phaser.GameObjects.Container;
    private astronautArmLeft!: Phaser.GameObjects.Rectangle;
    private astronautArmRight!: Phaser.GameObjects.Rectangle;
    private astronautLegLeft!: Phaser.GameObjects.Rectangle;
    private astronautLegRight!: Phaser.GameObjects.Rectangle;
    private astronautShieldAura!: Phaser.GameObjects.Arc;
    private mapLayer!: Phaser.GameObjects.Container;
    private powerNetwork!: Phaser.GameObjects.Graphics;
    private hudLayer!: Phaser.GameObjects.Container;
    private resourceBars!: Phaser.GameObjects.Graphics;
    private resourceText: Phaser.GameObjects.Text[] = [];
    private lastResourceLabels: string[] = [];
    private statusText!: Phaser.GameObjects.Text;
    private supplyText!: Phaser.GameObjects.Text;
    private helpText!: Phaser.GameObjects.Text;
    private selectionOutlines: Phaser.GameObjects.Rectangle[] = [];
    private buildingCards: Array<{ kind: BuildingKind; frame: Phaser.GameObjects.Rectangle }> = [];
    private readonly stars: Phaser.GameObjects.Arc[] = [];

    constructor() {
        super(chapters[5]);
    }

    init() {
        this.astronaut = { x: 1, y: 3 };
        this.crates.forEach((crate) => {
            crate.collected = false;
            crate.marker = undefined;
        });
        this.structures.splice(1);
        this.structures[0] = { x: 4, y: 3, kind: 'outpost' };
        this.phase = 'collect';
        this.selectedBuilding = undefined;
        this.message = 'Find the three supply crates. Watch your suit while you explore.';
        this.energy = 82;
        this.oxygen = 84;
        this.suitIntegrity = 100;
        this.radiationDose = 0;
        this.displayedResources.energy = 82;
        this.displayedResources.oxygen = 84;
        this.displayedResources.suitIntegrity = 100;
        this.displayedResources.radiationDose = 0;
        this.missionScore = 0;
        this.moveTimer = 0;
        this.serviceCooldown = 0;
        this.repairTimer = 0;
        this.previousRepairKey = false;
        this.previousServiceKey = false;
        this.hudTimer = 0;
        this.endOverlayVisible = false;
        this.resourceText = [];
        this.lastResourceLabels = [];
        this.selectionOutlines = [];
        this.buildingCards = [];
        this.stars.length = 0;
    }

    protected createMission(): void {
        if (!this.input.keyboard) {
            throw new Error('Keyboard input is required to play the Expansion chapter.');
        }

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = {
            up: this.input.keyboard.addKey(87),
            down: this.input.keyboard.addKey(83),
            left: this.input.keyboard.addKey(65),
            right: this.input.keyboard.addKey(68)
        };
        this.repairKey = this.input.keyboard.addKey(82);
        this.serviceKey = this.input.keyboard.addKey(69);
        this.mapLayer = this.add.container(0, 0).setDepth(5);

        this.drawScene();
        this.drawAstronaut();
        this.hudLayer = this.add.container(0, 0).setDepth(100);
        this.refreshHud();
        this.updateResourceBars(1);

        this.input.on('pointerdown', this.handlePointerDown, this);
        this.events.once('shutdown', () => {
            this.input.off('pointerdown', this.handlePointerDown, this);
        });
    }

    update(_time: number, delta: number) {
        if (this.phase === 'complete' || this.phase === 'failed') {
            this.animateStars(delta);
            return;
        }

        const seconds = delta / 1000;
        this.serviceCooldown = Math.max(0, this.serviceCooldown - seconds);
        this.repairTimer = Math.max(0, this.repairTimer - seconds);

        const direction = this.repairTimer === 0 ? this.getDirection() : undefined;
        let moved = false;
        let moveDirection: Point | undefined;
        if (direction) {
            this.moveTimer -= delta;
            if (this.moveTimer <= 0) {
                this.moveTimer = 205;
                moved = this.moveAstronaut(direction);
                if (moved) {
                    moveDirection = direction;
                }
            }
        } else {
            this.moveTimer = 0;
        }

        this.updateResources(seconds, moved, moveDirection);
        this.handleKeys();
        this.animateStars(delta);
        this.updateResourceBars(seconds);

        this.hudTimer -= delta;
        if (this.hudTimer <= 0) {
            this.hudTimer = 150;
            this.refreshHud();
        }
    }

    private getDirection(): Point | undefined {
        if (this.cursors.left.isDown || this.keys.left.isDown) {
            return { x: -1, y: 0 };
        }
        if (this.cursors.right.isDown || this.keys.right.isDown) {
            return { x: 1, y: 0 };
        }
        if (this.cursors.up.isDown || this.keys.up.isDown) {
            return { x: 0, y: -1 };
        }
        if (this.cursors.down.isDown || this.keys.down.isDown) {
            return { x: 0, y: 1 };
        }
        return undefined;
    }

    private handleKeys() {
        const repairDown = this.repairKey.isDown;
        if (repairDown && !this.previousRepairKey) {
            this.repairSuit();
        }
        this.previousRepairKey = repairDown;

        const serviceDown = this.serviceKey.isDown;
        if (serviceDown && !this.previousServiceKey) {
            this.useNearbyStation();
        }
        this.previousServiceKey = serviceDown;
    }

    private updateResources(seconds: number, moved: boolean, direction?: Point) {
        const atHome = this.isNearStructure('outpost');
        const atShelter = this.isNearStructure('shelter');

        if (moved) {
            const oxygenCost = this.hasStructure('garage') ? 0.85 : this.hasStructure('recycler') ? 1.1 : 1.5;
            this.oxygen = Math.max(0, this.oxygen - oxygenCost);
            this.energy = Math.max(0, this.energy - (this.hasStructure('garage') ? 0.18 : 0.35));
            this.suitIntegrity = Math.max(0, this.suitIntegrity - 0.45);
            this.missionScore += 1;
            if (direction) {
                this.moveAstronautSprite(direction);
            }
        } else {
            const oxygenRate = this.hasStructure('recycler') ? 0.035 : 0.075;
            this.oxygen = Math.max(0, this.oxygen - oxygenRate * seconds);
            this.energy = Math.max(0, this.energy - 0.012 * seconds);
            if (!atHome && !atShelter && this.repairTimer === 0) {
                this.suitIntegrity = Math.max(0, this.suitIntegrity - 0.45 * seconds);
            }
        }

        if (this.hasStructure('solar')) {
            this.energy = Math.min(MAX_RESOURCE, this.energy + 0.12 * seconds);
        }

        if (this.suitIntegrity < 60 && !atHome && !atShelter && this.repairTimer === 0) {
            this.radiationDose = Math.min(MAX_RESOURCE, this.radiationDose + 0.7 * seconds);
        }

        if (this.oxygen <= 0) {
            this.failMission('Your oxygen ran out. Return to the outpost sooner next time.');
        } else if (this.radiationDose >= MAX_RESOURCE) {
            this.failMission('Your radiation warning reached its limit. Repair your suit sooner next time.');
        }
    }

    private moveAstronaut(direction: Point): boolean {
        if (this.phase !== 'collect') {
            return false;
        }

        const next = { x: this.astronaut.x + direction.x, y: this.astronaut.y + direction.y };
        if (next.x < 0 || next.x >= this.columns || next.y < 0 || next.y >= this.rows) {
            return false;
        }
        if (this.structures.some((structure) => structure.x === next.x && structure.y === next.y)) {
            return false;
        }

        this.astronaut = next;
        const crate = this.crates.find((item) => !item.collected && item.x === next.x && item.y === next.y);
        if (crate) {
            this.collectCrate(crate);
        } else {
            this.message = this.isNearStructure('outpost')
                ? 'Near the outpost: press E to refill oxygen and charge your suit.'
                : 'Keep moving to use more oxygen. Repair your suit when its shield gets low.';
        }
        return true;
    }

    private collectCrate(crate: SupplyCrate) {
        crate.collected = true;
        if (crate.marker) {
            this.tweens.add({
                targets: crate.marker,
                alpha: 0,
                scale: 1.65,
                angle: 12,
                duration: 420,
                ease: 'Cubic.easeOut',
                onComplete: () => crate.marker?.destroy()
            });
        }
        this.createPickupBurst(this.tileCenter(crate));

        this.oxygen = Math.min(MAX_RESOURCE, this.oxygen + 12);
        this.energy = Math.min(MAX_RESOURCE, this.energy + 6);
        this.missionScore += 10;
        const collected = this.crates.filter((item) => item.collected).length;
        if (collected === this.crates.length) {
            this.phase = 'build';
            this.message = 'All three supply kits are here. Pick three upgrades and place them beside your base.';
        } else {
            this.message = `Supply kit secured! ${this.crates.length - collected} more to find.`;
        }
        this.showFloatingText(this.tileCenter(crate), '+ AIR  + POWER', 0x9beac2);
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (this.phase === 'complete' || this.phase === 'failed') {
            if (pointer.x >= 417 && pointer.x <= 607 && pointer.y >= 434 && pointer.y <= 478) {
                this.scene.restart();
            }
            return;
        }

        if (this.phase === 'collect' && this.isOnBoard(pointer.x, pointer.y)) {
            const tile = this.pointerTile(pointer.x, pointer.y);
            const distance = Math.abs(tile.x - this.astronaut.x) + Math.abs(tile.y - this.astronaut.y);
            if (distance === 1 && this.repairTimer === 0) {
                    const direction = { x: tile.x - this.astronaut.x, y: tile.y - this.astronaut.y };
                    this.moveAstronaut(direction);
                    this.updateResources(0, true, direction);
                this.refreshHud();
            }
            return;
        }

        if (this.phase !== 'build') {
            return;
        }

        if (this.selectedBuilding && this.isOnBoard(pointer.x, pointer.y)) {
            this.placeBuilding(pointer.x, pointer.y);
        }
    }

    private repairSuit() {
        if ((this.phase !== 'collect' && this.phase !== 'build') || this.repairTimer > 0) {
            return;
        }
        if (this.energy < 10) {
            this.message = 'Not enough energy to repair. Return to the outpost and press E to recharge.';
            this.refreshHud();
            return;
        }
        if (this.suitIntegrity > 92) {
            this.message = 'Your suit shield is in good shape. Save the repair kit for later.';
            this.refreshHud();
            return;
        }

        this.energy = Math.max(0, this.energy - 10);
        this.suitIntegrity = Math.min(MAX_RESOURCE, this.suitIntegrity + 42);
        this.repairTimer = 1.1;
        this.message = 'Suit patching... stay still for a moment.';
        this.showFloatingText(this.tileCenter(this.astronaut), 'SUIT PATCHED', 0x7cdbed);
        this.refreshHud();
    }

    private useNearbyStation() {
        if (this.phase !== 'collect' && this.phase !== 'build') {
            return;
        }
        if (this.serviceCooldown > 0) {
            this.message = `Refill station cooling down: ${Math.ceil(this.serviceCooldown)} seconds.`;
            this.refreshHud();
            return;
        }
        const station = this.structures.find((structure) =>
            Math.abs(structure.x - this.astronaut.x) + Math.abs(structure.y - this.astronaut.y) <= 1
        );
        if (!station) {
            this.message = 'Move next to the outpost or a shelter to refill and recharge.';
            this.refreshHud();
            return;
        }

        this.oxygen = Math.min(MAX_RESOURCE, this.oxygen + 42);
        this.energy = Math.min(MAX_RESOURCE, this.energy + 32);
        this.suitIntegrity = Math.min(MAX_RESOURCE, this.suitIntegrity + (station.kind === 'shelter' ? 45 : 12));
        this.serviceCooldown = 8;
        this.message = station.kind === 'shelter'
            ? 'Shelter stop! Oxygen, energy and suit shielding restored.'
            : 'Safe outpost stop! Oxygen refilled, batteries charged and suit checked.';
        this.showFloatingText(this.tileCenter(station), 'SAFE STOP  +O₂  +⚡', 0x9beac2);
        this.refreshHud();
    }

    private placeBuilding(pointerX: number, pointerY: number) {
        const tile = this.pointerTile(pointerX, pointerY);
        const occupied = this.structures.some((item) => item.x === tile.x && item.y === tile.y);
        const adjacent = this.structures.some((item) =>
            Math.abs(item.x - tile.x) + Math.abs(item.y - tile.y) === 1
        );

        if (occupied || !adjacent) {
            this.message = 'Choose an empty tile beside your outpost or another new building.';
            this.refreshHud();
            return;
        }

        const option = options.find((item) => item.kind === this.selectedBuilding);
        if (!option) {
            throw new Error('The selected expansion building is not available.');
        }
        if (this.energy < option.energyCost) {
            this.message = `The ${option.title.toLowerCase()} needs ${option.energyCost} energy. Recharge at the outpost first.`;
            this.refreshHud();
            return;
        }

        this.energy -= option.energyCost;
        this.structures.push({ ...tile, kind: option.kind });
        this.drawPowerNetwork();
        this.crates.find((crate) => crate.collected && !crate.marker)?.marker?.destroy();
        this.missionScore += 20;

        if (option.kind === 'solar') {
            this.energy = Math.min(MAX_RESOURCE, this.energy + 24);
        } else if (option.kind === 'greenhouse') {
            this.oxygen = Math.min(MAX_RESOURCE, this.oxygen + 14);
        } else if (option.kind === 'relay') {
            this.energy = Math.min(MAX_RESOURCE, this.energy + 10);
        }

        const builtCount = this.structures.length - 1;
        if (builtCount >= this.crates.length) {
            this.phase = 'complete';
            this.message = 'Three upgrades built! Your Moon outpost is growing.';
        } else {
            this.message = `${option.title} built! Choose another upgrade (${this.crates.length - builtCount} supply kits left).`;
        }

        this.selectedBuilding = undefined;
        this.buildingCards.forEach(({ frame }) => {
            frame.setFillStyle(0x192a3d);
            frame.setStrokeStyle(1, 0x354c64);
        });
        this.showSelection();
        const newStructure = this.structures[this.structures.length - 1];
        this.drawStructure(newStructure);
        if (newStructure.marker) {
            newStructure.marker.setScale(0.55).setAlpha(0);
            this.tweens.add({
                targets: newStructure.marker,
                scale: 1,
                alpha: 1,
                duration: 450,
                ease: 'Back.easeOut'
            });
        }
        this.showFloatingText(this.tileCenter(tile), `${option.title.toUpperCase()} BUILT`, option.color);
        this.refreshHud();
    }

    private failMission(reason: string) {
        if (this.phase === 'failed') {
            return;
        }
        this.phase = 'failed';
        this.message = reason;
        this.refreshHud();
        this.drawEndOverlay(false);
    }

    private drawScene() {
        this.add.rectangle(512, 384, 1024, 768, 0x081320);
        this.drawStars();
        this.drawMoon();
        this.drawHeader();
        this.drawMap();
        this.drawPanel();
        this.drawFooter();
        this.drawResourceHud();
    }

    private drawStars() {
        for (let index = 0; index < 38; index++) {
            const x = 20 + ((index * 127 + 41) % 984);
            const y = 8 + ((index * 61 + 17) % 145);
            const star = this.add.circle(x, y, index % 7 === 0 ? 2 : 1.2, 0xd7e9ff, 0.45);
            this.stars.push(star);
            this.tweens.add({
                targets: star,
                alpha: { from: 0.2, to: 0.8 },
                duration: 900 + (index % 5) * 280,
                yoyo: true,
                repeat: -1,
                delay: (index % 8) * 170
            });
        }
    }

    private drawMoon() {
        this.add.circle(950, 49, 23, 0xe7edf5, 0.92);
        this.add.circle(960, 40, 23, 0x081320, 1);
        this.add.circle(936, 50, 3, 0xadb9c7, 0.55);
        this.add.circle(943, 62, 2, 0xb9c4d2, 0.5);
        this.add.circle(949, 48, 1, 0x75889e, 0.55);
        this.add.circle(959, 57, 2, 0x9caabc, 0.45);
        this.add.ellipse(950, 49, 66, 54, 0x63aee5, 0.035);
    }

    private drawHeader() {
        this.add.text(28, 18, 'STAGE 4  /  CHAPTER 6', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#91a9c5',
            fontStyle: 'bold'
        });
        this.add.text(28, 39, 'GROW THE MOON BASE', {
            fontFamily: 'Arial',
            fontSize: '31px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.add.text(30, 78, 'Explore safely, keep your suit in shape, and choose what your crew needs next.', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#c4d2e3'
        });
        this.add.rectangle(512, 106, 968, 1, 0x263a50, 0.9);
        this.add.rectangle(58, 106, 54, 2, 0x65d4b8);
    }

    private drawResourceHud() {
        const cards = [
            { label: '⚡ ENERGY', color: 0xf2c963, value: () => this.energy },
            { label: 'O₂ OXYGEN', color: 0x66c9f2, value: () => this.oxygen },
            { label: '🛡 SUIT SHIELD', color: 0x72d99a, value: () => this.suitIntegrity },
            { label: '☢ RADIATION DOSE', color: 0xff806f, value: () => this.radiationDose }
        ];
        this.resourceBars = this.add.graphics().setDepth(20);

        cards.forEach((card, index) => {
            const x = 28 + index * 246;
            this.add.rectangle(x + 112, 131, 224, 44, 0x172b40)
                .setStrokeStyle(1.5, 0x42617d);
            this.add.text(x + 10, 116, card.label, {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#eef6ff',
                fontStyle: 'bold'
            });
            this.resourceText.push(this.add.text(x + 210, 114, '100%', {
                fontFamily: 'Arial',
                fontSize: '15px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(1, 0));
        });
    }

    private drawMap() {
        const width = this.columns * this.cellSize;
        const height = this.rows * this.cellSize;
        this.mapLayer.add(this.add.rectangle(
            this.boardLeft + width / 2,
            this.boardTop + height / 2,
            width + 10,
            height + 10,
            0x0d1b28
        ).setStrokeStyle(2, 0x65768a));

        const craters: Point[] = [
            { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 9, y: 0 },
            { x: 4, y: 1 }, { x: 9, y: 2 }, { x: 0, y: 4 },
            { x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 },
            { x: 1, y: 6 }, { x: 6, y: 2 }, { x: 2, y: 4 }
        ];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const center = this.tileCenter({ x, y });
                const shade = (x + y) % 3 === 0 ? 0x303d49 : 0x2b3743;
                this.mapLayer.add(this.add.rectangle(
                    center.x,
                    center.y,
                    this.cellSize - 2,
                    this.cellSize - 2,
                    shade
                ).setStrokeStyle(1, 0x3c4b58));

                if (craters.some((crater) => crater.x === x && crater.y === y)) {
                    this.mapLayer.add(this.add.ellipse(center.x + 9, center.y + 11, 40, 27, 0x1d2934, 0.9)
                        .setStrokeStyle(1, 0x58636b, 0.45));
                    this.mapLayer.add(this.add.ellipse(center.x + 6, center.y + 7, 29, 18, 0x46525c, 0.8));
                    this.mapLayer.add(this.add.ellipse(center.x + 6, center.y + 8, 23, 13, 0x2a3641, 0.65));
                }

                if ((x * 7 + y * 3) % 11 === 0) {
                    this.mapLayer.add(this.add.circle(center.x - 19, center.y - 17, 1.6, 0x8995a0, 0.6));
                    this.mapLayer.add(this.add.circle(center.x + 22, center.y - 10, 1, 0xb4bdc5, 0.55));
                }

                if ((x * 11 + y * 5) % 13 === 2) {
                    const rock = this.add.ellipse(center.x - 13, center.y + 17, 8, 5, 0x76818a, 0.62)
                        .setStrokeStyle(1, 0xa2abb1, 0.28);
                    this.mapLayer.add(rock);
                    this.mapLayer.add(this.add.ellipse(center.x - 12, center.y + 19, 11, 3, 0x101b26, 0.5));
                }
            }
        }

        this.drawPowerNetwork();
        this.crates.forEach((crate) => this.drawCrate(crate));
        this.structures.forEach((structure) => this.drawStructure(structure));
    }

    private drawPowerNetwork() {
        this.powerNetwork?.destroy();
        this.powerNetwork = this.add.graphics().setDepth(4);
        this.mapLayer.add(this.powerNetwork);

        const links: Array<{ from: Structure; to: Structure }> = [];
        this.structures.forEach((structure, index) => {
            const neighbor = this.structures.find((candidate, candidateIndex) =>
                candidateIndex < index
                && Math.abs(candidate.x - structure.x) + Math.abs(candidate.y - structure.y) === 1
            );
            if (neighbor) {
                links.push({ from: structure, to: neighbor });
            }
        });

        links.forEach(({ from, to }) => {
            const start = this.tileCenter(from);
            const end = this.tileCenter(to);
            this.powerNetwork.lineStyle(7, 0x060e18, 0.62);
            this.powerNetwork.lineBetween(start.x, start.y, end.x, end.y);
            this.powerNetwork.lineStyle(2, 0x5bb8b1, 0.68);
            this.powerNetwork.lineBetween(start.x, start.y, end.x, end.y);
            this.powerNetwork.fillStyle(0xa3f2d5, 0.88);
            this.powerNetwork.fillCircle((start.x + end.x) / 2, (start.y + end.y) / 2, 3);
        });
    }

    private drawPanel() {
        this.add.rectangle(838, 400, 300, 444, 0x111f31)
            .setStrokeStyle(2, 0x30465f);
        this.add.text(706, 190, 'MISSION CONTROL', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#91a9c5',
            fontStyle: 'bold'
        });

        this.supplyText = this.add.text(706, 216, '', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.add.text(706, 247, 'WALK', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#72d99a',
            fontStyle: 'bold'
        });
        this.add.text(752, 247, 'Arrows / WASD', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#c4d2e3'
        });
        this.add.text(706, 268, 'R', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#7cdbed',
            fontStyle: 'bold'
        });
        this.add.text(752, 268, 'Patch suit (+42 shield, 10 ⚡)', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#c4d2e3'
        });
        this.add.text(706, 289, 'E', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#f2c963',
            fontStyle: 'bold'
        });
        this.add.text(752, 289, 'Refill near a building', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#c4d2e3'
        });

        this.add.rectangle(838, 326, 270, 1, 0x30465f);
        this.add.text(706, 337, 'EXPANSION OPTIONS', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#91a9c5',
            fontStyle: 'bold'
        });

        options.forEach((option, index) => {
            const y = 356 + index * 31;
            const card = this.add.rectangle(838, y + 13, 270, 28, 0x192a3d)
                .setStrokeStyle(1, 0x354c64)
                .setInteractive({ useHandCursor: true });
            this.buildingCards.push({ kind: option.kind, frame: card });
            card.on('pointerover', () => {
                if (this.phase === 'build') {
                    card.setStrokeStyle(1, option.color);
                }
            });
            card.on('pointerout', () => {
                if (this.selectedBuilding !== option.kind) {
                    card.setStrokeStyle(1, 0x354c64);
                }
            });
            this.add.circle(718, y + 13, 7, option.color);
            this.add.text(732, y + 3, option.title, {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            });
            this.add.text(732, y + 16, option.description, {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: '#b7c8da'
            });
            this.add.text(961, y + 4, `${option.energyCost} ⚡`, {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: '#f2d783',
                fontStyle: 'bold'
            }).setOrigin(1, 0);
            card.on('pointerdown', () => {
                if (this.phase === 'build') {
                    this.selectBuilding(option);
                }
            });
        });

        this.add.rectangle(838, 582, 270, 66, 0x172b3b)
            .setStrokeStyle(1, 0x30465f);
        this.statusText = this.add.text(710, 554, '', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#c4d2e3',
            wordWrap: { width: 250 },
            lineSpacing: 2
        });
        this.helpText = this.add.text(710, 604, '', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#f1d27b',
            wordWrap: { width: 252 }
        });
    }

    private drawFooter() {
        this.add.text(28, 646, 'Moving uses more O₂  •  Resting uses less  •  R patches your suit  •  E refills near buildings', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#aebed0'
        });
        this.add.text(28, 671, 'Radiation rises when your shield drops below 60%. Repairs cost energy; shelters are safe places to stop.', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#8094aa'
        });
    }

    private drawAstronaut() {
        const center = this.tileCenter(this.astronaut);
        const sprite = this.add.container(center.x, center.y);
        sprite.setDepth(10);
        sprite.add(this.add.ellipse(0, 22, 32, 10, 0x09131f, 0.75));
        this.astronautShieldAura = this.add.circle(0, -2, 27, 0x6fd8e9, 0.04)
            .setStrokeStyle(2, 0x8be9f5, 0.52);
        sprite.add(this.astronautShieldAura);
        sprite.add(this.add.rectangle(-19, 8, 8, 23, 0xa2b6c8)
            .setStrokeStyle(1, 0x748ba1));
        sprite.add(this.add.rectangle(-19, 2, 10, 8, 0x4b667e));
        sprite.add(this.add.rectangle(0, 8, 23, 27, 0xdde8f2)
            .setStrokeStyle(2, 0x86a2bb));
        this.astronautArmLeft = this.add.rectangle(-16, 8, 7, 17, 0xb2c5d5)
            .setStrokeStyle(1, 0x7f97ad);
        this.astronautArmRight = this.add.rectangle(16, 8, 7, 17, 0xb2c5d5)
            .setStrokeStyle(1, 0x7f97ad);
        sprite.add(this.astronautArmLeft);
        sprite.add(this.astronautArmRight);
        this.astronautLegLeft = this.add.rectangle(-7, 25, 8, 12, 0x8fa6bb)
            .setStrokeStyle(1, 0x647e96);
        this.astronautLegRight = this.add.rectangle(7, 25, 8, 12, 0x8fa6bb)
            .setStrokeStyle(1, 0x647e96);
        sprite.add(this.astronautLegLeft);
        sprite.add(this.astronautLegRight);
        sprite.add(this.add.rectangle(-7, 31, 11, 4, 0x394b60));
        sprite.add(this.add.rectangle(7, 31, 11, 4, 0x394b60));
        sprite.add(this.add.circle(0, -11, 17, 0xeaf0f6)
            .setStrokeStyle(2, 0x95b0c9));
        sprite.add(this.add.ellipse(6, -11, 12, 14, 0x59afd5));
        sprite.add(this.add.ellipse(8, -15, 5, 3, 0xc4edff, 0.9));
        sprite.add(this.add.ellipse(0, -11, 27, 24, 0x21374d, 0.22)
            .setStrokeStyle(1, 0xa9d9ea, 0.7));
        sprite.add(this.add.rectangle(0, 0, 21, 5, 0x49b8a5));
        sprite.add(this.add.rectangle(0, 9, 11, 10, 0x294157).setStrokeStyle(1, 0x66849e));
        sprite.add(this.add.circle(0, 9, 2, 0xf6d36e));
        sprite.add(this.add.circle(-5, 9, 1.4, 0x77ddc0));
        sprite.add(this.add.line(0, 4, 0, -2, 0, -6, 0x6c8298).setLineWidth(1));
        this.astronautSprite = sprite;

        this.tweens.add({
            targets: sprite,
            y: center.y - 3,
            duration: 850,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private drawCrate(crate: SupplyCrate) {
        if (crate.collected) {
            return;
        }
        const center = this.tileCenter(crate);
        const marker = this.add.container(center.x, center.y);
        marker.setDepth(4);
        marker.add(this.add.circle(0, 0, 25, 0xf3b65e, 0.1));
        marker.add(this.add.rectangle(0, 1, 29, 29, 0xc77f3d)
            .setStrokeStyle(2, 0xffd48c));
        marker.add(this.add.rectangle(0, 1, 9, 29, 0xf1b967, 0.8));
        marker.add(this.add.rectangle(0, -5, 29, 6, 0xffd48c));
        marker.add(this.add.text(0, -19, '+', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5));
        crate.marker = marker;
        this.mapLayer.add(marker);
        const beacon = marker.list[0];
        this.tweens.add({
            targets: marker,
            y: center.y - 5,
            duration: 1050,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: beacon,
            alpha: { from: 0.06, to: 0.28 },
            scale: { from: 0.82, to: 1.25 },
            duration: 1050,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private drawStructure(structure: Structure) {
        const center = this.tileCenter(structure);
        const option = options.find((item) => item.kind === structure.kind);
        const color = option?.color ?? 0x9eb7d2;
        const marker = this.add.container(center.x, center.y);
        marker.setDepth(5);
        marker.add(this.add.ellipse(0, 20, 53, 14, 0x09131f, 0.7));

        if (structure.kind === 'solar') {
            marker.add(this.add.rectangle(0, 2, 54, 28, 0x24496a).setStrokeStyle(2, color));
            marker.add(this.add.line(0, 2, -17, -11, -17, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, 0, -11, 0, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, 17, -11, 17, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, -27, 2, 27, 2, color).setLineWidth(1));
            marker.add(this.add.rectangle(0, 19, 5, 12, 0xb5c4d1));
            const glint = this.add.rectangle(-22, 2, 5, 25, 0xb8f1ff, 0.72);
            marker.add(glint);
            this.tweens.add({
                targets: glint,
                x: 22,
                alpha: { from: 0.05, to: 0.85 },
                duration: 1800,
                repeat: -1,
                delay: 500,
                ease: 'Sine.easeInOut'
            });
        } else if (structure.kind === 'greenhouse') {
            marker.add(this.add.rectangle(0, 4, 49, 34, 0x276556, 0.88).setStrokeStyle(2, color));
            marker.add(this.add.triangle(0, -13, -25, 13, 25, 13, 0, -13, 0x9ae1c2, 0.75));
            marker.add(this.add.line(-9, -4, -9, 19, 6, 19, color).setLineWidth(2));
            marker.add(this.add.line(10, -5, 10, 19, 20, 19, color).setLineWidth(2));
            const growLight = this.add.rectangle(0, -2, 32, 4, 0xf6e48f, 0.72);
            marker.add(growLight);
            this.tweens.add({
                targets: growLight,
                alpha: { from: 0.35, to: 0.88 },
                duration: 950,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            [-12, 0, 12].forEach((leafX, index) => {
                const leaf = this.add.ellipse(leafX, 15, 7, 13, index === 1 ? 0x98f0ab : 0x67d48c)
                    .setStrokeStyle(1, 0xc3ffd1, 0.55);
                marker.add(leaf);
                this.tweens.add({
                    targets: leaf,
                    angle: { from: -7, to: 7 },
                    duration: 1300 + index * 160,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: index * 120
                });
            });
        } else if (structure.kind === 'shelter') {
            marker.add(this.add.rectangle(0, 2, 51, 34, 0x493a42).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, 9, 14, 20, 0x182637));
            marker.add(this.add.line(0, -15, 0, -25, 0, -14, color).setLineWidth(3));
            const beacon = this.add.circle(0, -27, 4, 0xffc096);
            marker.add(beacon);
            this.tweens.add({
                targets: beacon,
                alpha: { from: 0.35, to: 1 },
                scale: { from: 0.8, to: 1.35 },
                duration: 650,
                yoyo: true,
                repeat: -1
            });
        } else if (structure.kind === 'relay') {
            marker.add(this.add.rectangle(0, 9, 5, 22, 0xc1cfda));
            marker.add(this.add.line(0, -14, -14, -1, 14, -1, color).setLineWidth(3));
            const signalSmall = this.add.arc(0, -15, 17, 205, 335, false, color).setStrokeStyle(2, color);
            const signalLarge = this.add.arc(0, -15, 26, 210, 330, false, color, 0.7).setStrokeStyle(1, color, 0.7);
            marker.add(signalSmall);
            marker.add(signalLarge);
            marker.add(this.add.circle(0, -14, 4, 0xf0f6ff));
            [signalSmall, signalLarge].forEach((signal, index) => {
                this.tweens.add({
                    targets: signal,
                    alpha: { from: 0.35, to: 1 },
                    scale: { from: 0.9, to: 1.14 },
                    duration: 950,
                    yoyo: true,
                    repeat: -1,
                    delay: index * 280
                });
            });
        } else if (structure.kind === 'garage') {
            marker.add(this.add.rectangle(0, 1, 52, 36, 0x304359).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, 8, 31, 22, 0x101c29));
            marker.add(this.add.rectangle(0, 20, 42, 4, color));
        } else if (structure.kind === 'recycler') {
            marker.add(this.add.rectangle(0, 3, 42, 39, 0x34415a).setStrokeStyle(2, color));
            const turbine = this.add.circle(0, -3, 11, 0x17283d).setStrokeStyle(3, color);
            marker.add(turbine);
            marker.add(this.add.circle(0, -3, 3, color));
            marker.add(this.add.rectangle(0, 18, 25, 4, color));
            this.tweens.add({
                targets: turbine,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
        } else {
            marker.add(this.add.rectangle(0, 3, 52, 38, 0x40536a).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, -13, 58, 9, color));
            marker.add(this.add.rectangle(-17, 8, 7, 13, 0x162638));
            marker.add(this.add.rectangle(0, 8, 7, 13, 0x162638));
            marker.add(this.add.rectangle(17, 8, 7, 13, 0x162638));
            [-17, 0, 17].forEach((windowX, index) => {
                const light = this.add.rectangle(windowX, 8, 4, 8, 0x84e8dc, 0.8);
                marker.add(light);
                this.tweens.add({
                    targets: light,
                    alpha: { from: 0.42, to: 1 },
                    duration: 1100 + index * 170,
                    yoyo: true,
                    repeat: -1,
                    delay: index * 120
                });
            });
        }

        marker.add(this.add.text(0, 28, option?.title.toUpperCase() ?? 'OUTPOST', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#0a1420'
        }).setOrigin(0.5));
        structure.marker = marker;
        this.mapLayer.add(marker);

        if (structure.kind === 'solar') {
            this.tweens.add({
                targets: marker,
                alpha: { from: 0.82, to: 1 },
                duration: 1100,
                yoyo: true,
                repeat: -1
            });
        }
    }

    private moveAstronautSprite(direction: Point) {
        const center = this.tileCenter(this.astronaut);
        const previousCenter = {
            x: center.x - direction.x * this.cellSize,
            y: center.y - direction.y * this.cellSize
        };
        this.createDustPuff(previousCenter.x, previousCenter.y + 18);
        this.tweens.killTweensOf(this.astronautSprite);
        this.astronautSprite.setScale(direction.x < 0 ? -1 : 1, 1);
        this.tweens.add({
            targets: this.astronautSprite,
            x: center.x,
            y: center.y - 2,
            angle: direction.y < 0 ? -4 : direction.y > 0 ? 4 : 0,
            duration: 195,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (this.phase !== 'complete' && this.phase !== 'failed') {
                    this.tweens.add({
                        targets: this.astronautSprite,
                        y: center.y - 3,
                        angle: 0,
                        duration: 850,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            }
        });
        this.tweens.add({
            targets: [this.astronautArmLeft, this.astronautLegRight],
            angle: { from: -15, to: 15 },
            duration: 95,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: [this.astronautArmRight, this.astronautLegLeft],
            angle: { from: 15, to: -15 },
            duration: 95,
            yoyo: true,
            repeat: 1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: this.astronautShieldAura,
            alpha: { from: this.suitIntegrity < 60 ? 0.3 : 0.48, to: 0.16 },
            scale: { from: 1.12, to: 0.94 },
            duration: 300,
            yoyo: true
        });
        this.showSelection();
    }

    private createDustPuff(x: number, y: number) {
        for (let index = 0; index < 4; index++) {
            const puff = this.add.ellipse(
                x + (index - 1.5) * 5,
                y,
                6 + index % 2 * 2,
                3 + index % 2,
                0xb9c2ca,
                0.32
            ).setDepth(9);
            this.tweens.add({
                targets: puff,
                x: puff.x + (index - 1.5) * 5,
                y: puff.y - 7 - index % 2 * 3,
                scale: 1.8,
                alpha: 0,
                duration: 380 + index * 35,
                ease: 'Sine.easeOut',
                onComplete: () => puff.destroy()
            });
        }
    }

    private showSelection() {
        this.selectionOutlines.forEach((outline) => outline.destroy());
        this.selectionOutlines = [];
        if (this.phase === 'build' && this.selectedBuilding) {
            const option = options.find((item) => item.kind === this.selectedBuilding);
            if (option) {
                for (let y = 0; y < this.rows; y++) {
                    for (let x = 0; x < this.columns; x++) {
                        const occupied = this.structures.some((structure) => structure.x === x && structure.y === y);
                        const adjacent = this.structures.some((structure) =>
                            Math.abs(structure.x - x) + Math.abs(structure.y - y) === 1
                        );
                        if (!occupied && adjacent) {
                            const center = this.tileCenter({ x, y });
                            const outline = this.add.rectangle(center.x, center.y, 56, 56)
                                .setStrokeStyle(2, option.color, 0.9)
                                .setFillStyle(option.color, 0.1)
                                .setDepth(2);
                            this.mapLayer.add(outline);
                            this.selectionOutlines.push(outline);
                            this.tweens.add({
                                targets: outline,
                                alpha: { from: 0.35, to: 0.88 },
                                duration: 720,
                                yoyo: true,
                                repeat: -1,
                                delay: (x + y) * 28,
                                ease: 'Sine.easeInOut'
                            });
                        }
                    }
                }
            }
        }
    }

    private showFloatingText(point: Point, text: string, color: number) {
        const label = this.add.text(point.x, point.y - 24, text, {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: `#${color.toString(16).padStart(6, '0')}`,
            fontStyle: 'bold',
            stroke: '#081320',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: label,
            y: point.y - 66,
            alpha: 0,
            duration: 950,
            ease: 'Cubic.easeOut',
            onComplete: () => label.destroy()
        });
    }

    private createPickupBurst(point: Point) {
        for (let index = 0; index < 12; index++) {
            const angle = Math.PI * 2 * index / 12;
            const distance = 20 + (index % 3) * 5;
            const spark = this.add.circle(point.x, point.y, index % 3 === 0 ? 3 : 2, index % 2 ? 0x8fe6d0 : 0xffd48c)
                .setDepth(30);
            this.tweens.add({
                targets: spark,
                x: point.x + Math.cos(angle) * distance,
                y: point.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.2,
                duration: 420 + (index % 4) * 35,
                ease: 'Cubic.easeOut',
                onComplete: () => spark.destroy()
            });
        }
    }

    private refreshHud() {
        if (!this.resourceBars || !this.supplyText || !this.statusText || !this.helpText) {
            return;
        }

        const values = [this.energy, this.oxygen, this.suitIntegrity, this.radiationDose];
        values.forEach((value, index) => {
            const text = this.resourceText[index];
            const label = `${Math.round(value)}%`;
            if (text && this.lastResourceLabels[index] !== label) {
                text.setText(label);
                this.lastResourceLabels[index] = label;
            }
        });

        const collected = this.crates.filter((crate) => crate.collected).length;
        const built = this.structures.length - 1;
        const currentCount = this.phase === 'collect' ? collected : built;
        this.supplyText.setText(this.phase === 'collect'
            ? `SUPPLIES  ${currentCount} / 3`
            : `NEW BUILDS  ${currentCount} / 3`);
        this.statusText.setText(this.phase === 'failed'
            ? this.message
            : this.phase === 'complete'
                ? 'Mission complete! Three upgrades are built.'
                : this.message);
        this.statusText.setColor(this.phase === 'failed'
            ? '#ff9b8c'
            : this.phase === 'complete'
                ? '#9beac2'
                : this.oxygen < 25 || this.suitIntegrity < 35
                    ? '#ffd47c'
                    : '#c4d2e3');

        if (this.phase === 'collect') {
            this.helpText.setText(this.repairTimer > 0
                ? 'Patching suit... hold still.'
                : this.serviceCooldown > 0
                    ? `Station ready in ${Math.ceil(this.serviceCooldown)}s`
                    : 'Collect kits, then return to the base.');
        } else if (this.phase === 'build') {
            const option = options.find((item) => item.kind === this.selectedBuilding);
            this.helpText.setText(option
                ? `Click a nearby empty tile. Cost: ${option.energyCost} energy.`
                : 'Choose 3 upgrades and place them beside the base.');
        } else {
            this.helpText.setText(`Mission score: ${this.missionScore}`);
        }

        if (this.phase === 'complete' || this.phase === 'failed') {
            this.drawEndOverlay(this.phase === 'complete');
        }
    }

    private updateResourceBars(seconds: number) {
        const smoothing = 1 - Math.exp(-seconds * 13);
        this.displayedResources.energy += (this.energy - this.displayedResources.energy) * smoothing;
        this.displayedResources.oxygen += (this.oxygen - this.displayedResources.oxygen) * smoothing;
        this.displayedResources.suitIntegrity += (this.suitIntegrity - this.displayedResources.suitIntegrity) * smoothing;
        this.displayedResources.radiationDose += (this.radiationDose - this.displayedResources.radiationDose) * smoothing;

        const values = [
            this.displayedResources.energy,
            this.displayedResources.oxygen,
            this.displayedResources.suitIntegrity,
            this.displayedResources.radiationDose
        ];
        const colors = [0xf2c963, 0x66c9f2, 0x72d99a, 0xff806f];
        this.resourceBars.clear();
        values.forEach((value, index) => {
            const x = 38 + index * 246;
            const fillWidth = 204 * Math.max(0, Math.min(1, value / MAX_RESOURCE));
            const color = index === 3 && value >= 45
                ? 0xff806f
                : index === 2 && value < 60
                    ? 0xffa762
                    : index === 1 && value < 25
                        ? 0xff806f
                        : colors[index];
            this.resourceBars.fillStyle(0x31485e, 1);
            this.resourceBars.fillRoundedRect(x, 133, 204, 10, 5);
            if (fillWidth > 0.5) {
                this.resourceBars.fillStyle(color, 0.3);
                this.resourceBars.fillRoundedRect(x - 2, 130, fillWidth + 4, 16, 7);
                this.resourceBars.fillStyle(color, 1);
                this.resourceBars.fillRoundedRect(x, 133, fillWidth, 10, 5);
                this.resourceBars.fillStyle(0xffffff, 0.65);
                this.resourceBars.fillRoundedRect(x + 2, 134, Math.max(0, fillWidth - 4), 2, 1);
            }
        });

        if (this.astronautShieldAura) {
            const shieldIsLow = this.suitIntegrity < 60;
            const warningPulse = shieldIsLow ? 0.55 + Math.sin(this.time.now / 180) * 0.25 : 0.38;
            this.astronautShieldAura.setStrokeStyle(
                shieldIsLow ? 3 : 2,
                shieldIsLow ? 0xff806f : 0x8be9f5,
                warningPulse
            );
            this.astronautShieldAura.setFillStyle(
                shieldIsLow ? 0xff806f : 0x6fd8e9,
                shieldIsLow ? 0.08 + warningPulse * 0.08 : 0.04
            );
        }
    }

    private drawEndOverlay(won: boolean) {
        if (this.endOverlayVisible) {
            return;
        }
        this.endOverlayVisible = true;
        const shade = this.add.rectangle(512, 384, 1024, 768, 0x06101c, 0.78).setDepth(40);
        this.hudLayer.add(shade);
        const panel = this.add.rectangle(512, 382, 480, 252, 0x142238)
            .setStrokeStyle(2, won ? 0x6fd4aa : 0xff806f)
            .setDepth(41);
        this.hudLayer.add(panel);
        const title = this.add.text(512, 302, won ? 'OUTPOST EXPANDED!' : 'TIME TO HEAD BACK', {
            fontFamily: 'Arial',
            fontSize: '27px',
            color: won ? '#a4f0c3' : '#ff9b8c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(42);
        this.hudLayer.add(title);
        const summary = this.add.text(512, 355, won
            ? `${this.structures.slice(1).map((item) => options.find((option) => option.kind === item.kind)?.title).join('  •  ')}\nMission score: ${this.missionScore}  •  Radiation: ${Math.round(this.radiationDose)}%`
            : `${this.message}\nYou collected ${this.crates.filter((crate) => crate.collected).length} supply kits.`, {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#dce8f4',
            align: 'center',
            wordWrap: { width: 410 },
            lineSpacing: 7
        }).setOrigin(0.5).setDepth(42);
        this.hudLayer.add(summary);
        const button = this.add.rectangle(512, 456, 190, 43, 0x287a70)
            .setStrokeStyle(1, 0x77ddc0)
            .setInteractive({ useHandCursor: true })
            .setDepth(42);
        this.hudLayer.add(button);
        const buttonText = this.add.text(512, 456, 'PLAY AGAIN', {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(43);
        this.hudLayer.add(buttonText);
    }

    private animateStars(delta: number) {
        if (delta > 80) {
            this.stars.forEach((star, index) => {
                if (index % 4 === 0) {
                    star.setAlpha(0.35 + Math.random() * 0.4);
                }
            });
        }
    }

    private isOnBoard(x: number, y: number) {
        return x >= this.boardLeft
            && x < this.boardLeft + this.columns * this.cellSize
            && y >= this.boardTop
            && y < this.boardTop + this.rows * this.cellSize;
    }

    private pointerTile(x: number, y: number): Point {
        return {
            x: Math.floor((x - this.boardLeft) / this.cellSize),
            y: Math.floor((y - this.boardTop) / this.cellSize)
        };
    }

    private tileCenter(point: Point) {
        return {
            x: this.boardLeft + point.x * this.cellSize + this.cellSize / 2,
            y: this.boardTop + point.y * this.cellSize + this.cellSize / 2
        };
    }

    private hasStructure(kind: BuildingKind) {
        return this.structures.some((structure) => structure.kind === kind);
    }

    private isNearStructure(kind: Structure['kind']) {
        return this.structures.some((structure) =>
            structure.kind === kind
            && Math.abs(structure.x - this.astronaut.x) + Math.abs(structure.y - this.astronaut.y) <= 1
        );
    }

    private selectBuilding(option: BuildingOption) {
        this.selectedBuilding = option.kind;
        this.message = `Place the ${option.title.toLowerCase()} beside your base. Each choice changes what the outpost can do.`;
        this.buildingCards.forEach(({ kind, frame }) => {
            const selected = kind === option.kind;
            const selectedColor = options.find((item) => item.kind === kind)?.color ?? 0x354c64;
            frame.setFillStyle(selected ? 0x264252 : 0x192a3d);
            frame.setStrokeStyle(selected ? 2 : 1, selected ? selectedColor : 0x354c64);
        });
        this.showSelection();
        this.refreshHud();
    }
}
