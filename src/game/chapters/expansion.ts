import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import { isExpansionGameplayActive, type ExpansionPhase } from './expansion/mission';
import { getExpansionResourceState } from './expansion/visuals';

type BuildingKind = 'greenhouse' | 'solar' | 'relay' | 'shelter' | 'garage' | 'recycler';
type Phase = ExpansionPhase;

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
    private phase: Phase = 'intro';
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
    private startEnterKey!: Phaser.Input.Keyboard.Key;
    private startSpaceKey!: Phaser.Input.Keyboard.Key;
    private astronautSprite!: Phaser.GameObjects.Container;
    private astronautArmLeft!: Phaser.GameObjects.Rectangle;
    private astronautArmRight!: Phaser.GameObjects.Rectangle;
    private astronautLegLeft!: Phaser.GameObjects.Rectangle;
    private astronautLegRight!: Phaser.GameObjects.Rectangle;
    private astronautShieldAura!: Phaser.GameObjects.Arc;
    private mapLayer!: Phaser.GameObjects.Container;
    private powerNetwork!: Phaser.GameObjects.Graphics;
    private hudLayer!: Phaser.GameObjects.Container;
    private briefingLayer!: Phaser.GameObjects.Container;
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
        this.phase = 'intro';
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
        this.startEnterKey = this.input.keyboard.addKey('ENTER');
        this.startSpaceKey = this.input.keyboard.addKey('SPACE');
        this.mapLayer = this.add.container(0, 0).setDepth(5);

        this.drawScene();
        this.drawAstronaut();
        this.hudLayer = this.add.container(0, 0).setDepth(100);
        this.refreshHud();
        this.updateResourceBars(1);
        this.drawMissionBriefing();

        this.input.on('pointerdown', this.handlePointerDown, this);
        this.events.once('shutdown', () => {
            this.input.off('pointerdown', this.handlePointerDown, this);
            delete this.game.canvas.dataset.expansionPhase;
            delete this.game.canvas.dataset.expansionSupplies;
            delete this.game.canvas.dataset.expansionBuilds;
        });
    }

    update(_time: number, delta: number) {
        if (this.phase === 'intro') {
            if (this.startEnterKey.isDown || this.startSpaceKey.isDown) {
                this.beginMission();
            }
            this.animateStars(delta);
            return;
        }

        if (!isExpansionGameplayActive(this.phase)) {
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
        if (this.phase === 'intro') {
            return;
        }

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

    private beginMission() {
        if (this.phase !== 'intro') {
            return;
        }
        this.phase = 'collect';
        this.message = 'Find the three supply crates. Watch your suit while you explore.';
        this.briefingLayer.setVisible(false);
        this.refreshHud();
    }

    private drawMissionBriefing() {
        this.briefingLayer = this.add.container(0, 0).setDepth(110);
        this.briefingLayer.add(this.add.rectangle(512, 320, 1024, 640, 0x050b13, 0.82));

        const panel = this.add.graphics();
        panel.fillStyle(0x07121e, 0.94);
        panel.fillRoundedRect(192, 106, 640, 428, 16);
        panel.fillStyle(0x13263a, 0.98);
        panel.fillRoundedRect(200, 98, 624, 428, 14);
        panel.lineStyle(1.5, 0x57738b, 0.9);
        panel.strokeRoundedRect(200, 98, 624, 428, 14);
        panel.fillStyle(0x74dfc3, 0.95);
        panel.fillRoundedRect(224, 98, 82, 3, 2);
        panel.fillStyle(0x244158, 0.92);
        panel.fillRoundedRect(220, 111, 584, 1, 1);
        this.briefingLayer.add(panel);

        const signal = this.add.circle(244, 136, 4, 0x7be6c5);
        this.briefingLayer.add(signal);
        this.tweens.add({
            targets: signal,
            alpha: { from: 0.5, to: 1 },
            scale: { from: 0.85, to: 1.35 },
            duration: 850,
            yoyo: true,
            repeat: -1
        });
        this.briefingLayer.add(this.add.text(256, 127, 'MISSION CONTROL  /  INCOMING TRANSMISSION', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#91b5c9',
            fontStyle: 'bold',
            letterSpacing: 1
        }));
        this.briefingLayer.add(this.add.text(232, 153, 'Engineer, you’re on duty.', {
            fontFamily: 'Arial',
            fontSize: '27px',
            color: '#f5f8fc',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(
            234,
            194,
            'You’re the astronaut engineer helping grow our south-pole Moon outpost. Three supply kits are waiting out there. Bring them back, then build three upgrades the crew needs.',
            {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#c4d2e3',
                wordWrap: { width: 430 },
                lineSpacing: 4
            }
        ));
        this.drawBriefingAstronaut();

        const jobCard = this.add.graphics();
        jobCard.fillStyle(0x0d1b29, 0.92);
        jobCard.fillRoundedRect(224, 269, 270, 142, 8);
        jobCard.lineStyle(1, 0x344c61, 0.9);
        jobCard.strokeRoundedRect(224, 269, 270, 142, 8);
        jobCard.fillStyle(0x70d7bd, 0.9);
        jobCard.fillRoundedRect(224, 269, 3, 142, 2);
        this.briefingLayer.add(jobCard);
        this.briefingLayer.add(this.add.text(240, 282, 'YOUR ASSIGNMENT', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#7de0c6',
            fontStyle: 'bold',
            letterSpacing: 1
        }));
        this.briefingLayer.add(this.add.text(242, 307, '01   Collect 3 supply kits', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#edf4fa',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(242, 336, '02   Return safely to the base', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#edf4fa',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(242, 365, '03   Choose and build 3 upgrades', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#edf4fa',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(242, 390, 'Oxygen and suit shield matter out there.', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#9eb3c7'
        }));

        const controlsCard = this.add.graphics();
        controlsCard.fillStyle(0x0d1b29, 0.92);
        controlsCard.fillRoundedRect(506, 269, 298, 142, 8);
        controlsCard.lineStyle(1, 0x344c61, 0.9);
        controlsCard.strokeRoundedRect(506, 269, 298, 142, 8);
        controlsCard.fillStyle(0xf0c766, 0.9);
        controlsCard.fillRoundedRect(506, 269, 3, 142, 2);
        this.briefingLayer.add(controlsCard);
        this.briefingLayer.add(this.add.text(522, 282, 'SUIT CONTROLS', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#f0d17d',
            fontStyle: 'bold',
            letterSpacing: 1
        }));
        this.briefingLayer.add(this.add.text(524, 307, 'WASD / ARROWS', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#ffffff',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(676, 307, 'Move around', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#bbcada'
        }));
        this.briefingLayer.add(this.add.text(524, 338, 'R', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#83dced',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(553, 338, 'Patch your suit', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#bbcada'
        }));
        this.briefingLayer.add(this.add.text(524, 367, 'E', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#f0d17d',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(553, 367, 'Refill near a building', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#bbcada'
        }));
        this.briefingLayer.add(this.add.text(522, 390, 'Keep an eye on your oxygen and shield.', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#9eb3c7'
        }));

        const startButton = this.add.rectangle(512, 467, 270, 42, 0x206b63)
            .setStrokeStyle(1.5, 0x77ddc0)
            .setInteractive({ useHandCursor: true });
        this.briefingLayer.add(startButton);
        const buttonGlow = this.add.rectangle(512, 467, 270, 42, 0x72e0c3, 0.06);
        this.briefingLayer.add(buttonGlow);
        this.tweens.add({
            targets: buttonGlow,
            alpha: { from: 0.04, to: 0.2 },
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.briefingLayer.add(this.add.text(512, 467, 'BEGIN FIELD MISSION     →', {
            fontFamily: 'Arial',
            fontSize: '14px',
            color: '#ffffff',
            fontStyle: 'bold',
            letterSpacing: 1
        }).setOrigin(0.5));
        startButton.on('pointerdown', () => this.beginMission());
        this.briefingLayer.add(this.add.text(512, 501, 'Press ENTER or SPACE to begin', {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#8fa6bb'
        }).setOrigin(0.5));
    }

    private drawBriefingAstronaut() {
        const portrait = this.add.container(746, 220);
        const glow = this.add.circle(0, 0, 48, 0x55d7d1, 0.035)
            .setStrokeStyle(1, 0x72d9c2, 0.18);
        portrait.add(glow);
        portrait.add(this.add.circle(0, 0, 39, 0x0b1a28, 0.95)
            .setStrokeStyle(1.5, 0x5c8798, 0.8));
        portrait.add(this.add.circle(0, 0, 34, 0x173248, 0.7)
            .setStrokeStyle(1, 0x78dfd0, 0.45));
        portrait.add(this.add.ellipse(-24, 6, 10, 25, 0x708ba0)
            .setStrokeStyle(1, 0xb9cbd9, 0.8));
        portrait.add(this.add.ellipse(0, 17, 37, 27, 0xd8e3eb)
            .setStrokeStyle(1, 0xf2f7fb, 0.9));
        portrait.add(this.add.rectangle(0, 8, 23, 8, 0x49b8a5));
        portrait.add(this.add.rectangle(0, 22, 16, 16, 0x294157)
            .setStrokeStyle(1, 0x7d9bb2, 0.85));
        portrait.add(this.add.rectangle(0, 17, 10, 2, 0x79d6d1));
        portrait.add(this.add.circle(-3, 24, 1.5, 0xf6d36e));
        portrait.add(this.add.circle(3, 24, 1.5, 0x77ddc0));
        portrait.add(this.add.circle(0, -13, 23, 0xe7eef4)
            .setStrokeStyle(1.5, 0xffffff, 0.95));
        portrait.add(this.add.ellipse(5, -14, 17, 19, 0x1d526f)
            .setStrokeStyle(1, 0x7ce0ed, 0.86));
        portrait.add(this.add.ellipse(8, -20, 7, 3, 0xd7f8ff, 0.95));
        portrait.add(this.add.ellipse(-6, -13, 4, 9, 0xffffff, 0.4));
        portrait.add(this.add.text(0, 44, 'FIELD ENGINEER', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#a8c6d6',
            fontStyle: 'bold',
            letterSpacing: 1
        }).setOrigin(0.5));
        this.briefingLayer.add(portrait);

        this.tweens.add({
            targets: portrait,
            y: 217,
            duration: 1300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.035, to: 0.12 },
            scale: { from: 0.96, to: 1.06 },
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private drawScene() {
        this.add.rectangle(512, 384, 1024, 768, 0x07111f);
        this.drawAtmosphere();
        this.drawStars();
        this.drawEarth();
        this.drawHeader();
        this.drawMap();
        this.drawPanel();
        this.drawFooter();
        this.drawResourceHud();
    }

    private drawStars() {
        for (let index = 0; index < 54; index++) {
            const x = 18 + ((index * 127 + 41) % 988);
            const y = 8 + ((index * 61 + 17) % 166);
            const star = this.add.circle(x, y, index % 9 === 0 ? 1.8 : 1, 0xd7e9ff, 0.45);
            this.stars.push(star);
            this.tweens.add({
                targets: star,
                alpha: { from: 0.18, to: index % 9 === 0 ? 0.92 : 0.66 },
                scale: { from: 0.8, to: index % 9 === 0 ? 1.4 : 1.1 },
                duration: 1100 + (index % 7) * 280,
                yoyo: true,
                repeat: -1,
                delay: (index % 8) * 170
            });
            if (index % 9 === 0) {
                this.add.rectangle(x, y, 7, 1, 0xc5ddf6, 0.36);
                this.add.rectangle(x, y, 1, 7, 0xc5ddf6, 0.36);
            }
        }
    }

    private drawAtmosphere() {
        this.add.ellipse(290, 142, 580, 188, 0x6a8bb5, 0.045);
        this.add.ellipse(800, 116, 390, 180, 0x55a1c7, 0.045);
        this.add.ellipse(346, 196, 690, 104, 0x8292a2, 0.11);
        this.add.ellipse(757, 190, 588, 94, 0x536579, 0.18);
        this.add.ellipse(442, 218, 830, 95, 0x28384a, 0.72);
        this.add.ellipse(950, 621, 840, 178, 0x131e29, 0.46);
        this.add.ellipse(88, 638, 520, 134, 0x1b2835, 0.38);
        this.add.ellipse(820, 662, 552, 145, 0x1b2936, 0.35);

        const horizon = this.add.graphics().setDepth(1);
        horizon.fillStyle(0x1b2937, 0.76);
        horizon.fillTriangle(0, 184, 0, 152, 165, 184);
        horizon.fillTriangle(125, 184, 274, 145, 408, 184);
        horizon.fillTriangle(462, 184, 610, 158, 763, 184);
        horizon.fillTriangle(756, 184, 911, 143, 1024, 166);
        horizon.fillStyle(0x253445, 0.55);
        horizon.fillTriangle(0, 184, 99, 166, 221, 184);
        horizon.fillTriangle(540, 184, 718, 164, 860, 184);
    }

    private drawEarth() {
        this.add.circle(950, 54, 43, 0x5ca8d7, 0.045);
        this.add.circle(950, 54, 34, 0x5ca8d7, 0.08);
        this.add.circle(950, 52, 25, 0x2a608b)
            .setStrokeStyle(1.5, 0x9ee3ff, 0.85);
        this.add.ellipse(944, 43, 14, 8, 0x76ce9b);
        this.add.ellipse(957, 54, 11, 14, 0x65b988);
        this.add.ellipse(939, 61, 8, 5, 0x70c793);
        this.add.ellipse(944, 38, 13, 3, 0xe8f5ff, 0.82);
        this.add.ellipse(958, 47, 8, 2.5, 0xe8f5ff, 0.72);
        this.add.ellipse(950, 32, 7, 4, 0xffffff, 0.16);
        this.add.text(950, 84, 'EARTH  /  1.3 s', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#91b9d1',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.ellipse(950, 54, 83, 61, 0x63aee5, 0.025);
    }

    private drawHeader() {
        const headerPill = this.add.graphics();
        headerPill.fillStyle(0x14283a, 0.9);
        headerPill.fillRoundedRect(28, 12, 196, 22, 8);
        headerPill.lineStyle(1, 0x356077, 0.9);
        headerPill.strokeRoundedRect(28, 12, 196, 22, 8);
        this.add.circle(39, 34, 4, 0x72d99a);
        this.add.text(50, 18, 'LUNAR OUTPOST  /  STAGE 04', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#9dc7d7',
            fontStyle: 'bold'
        });
        this.add.text(28, 48, 'GROW THE MOON BASE', {
            fontFamily: 'Arial',
            fontSize: '29px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.add.text(30, 84, 'Explore safely, keep your suit in shape, and choose what your crew needs next.', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#bbcada'
        });
        this.add.rectangle(512, 106, 968, 1, 0x31475b, 0.9);
        this.add.rectangle(67, 106, 78, 2, 0x65d4b8);
        this.add.rectangle(111, 106, 8, 2, 0xc1f2e7);
    }

    private drawResourceHud() {
        const cards = [
            { label: '⚡  ENERGY', key: 'energy' as const, color: 0xf2c963 },
            { label: 'O₂  OXYGEN', key: 'oxygen' as const, color: 0x66c9f2 },
            { label: '🛡  SUIT SHIELD', key: 'suitIntegrity' as const, color: 0x72d99a },
            { label: '☢  RADIATION DOSE', key: 'radiationDose' as const, color: 0xff806f }
        ];
        this.resourceBars = this.add.graphics().setDepth(20);

        cards.forEach((card, index) => {
            const x = 28 + index * 246;
            const shell = this.add.graphics();
            shell.fillStyle(0x142338, 0.96);
            shell.fillRoundedRect(x, 109, 224, 46, 8);
            shell.fillStyle(0x192b40, 0.95);
            shell.fillRoundedRect(x + 2, 111, 220, 42, 6);
            shell.fillStyle(card.color, 0.9);
            shell.fillRoundedRect(x, 109, 3, 46, 2);
            shell.lineStyle(1, 0x4b6681, 0.86);
            shell.strokeRoundedRect(x, 109, 224, 46, 8);
            this.add.text(x + 10, 116, card.label, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#eef6ff',
                fontStyle: 'bold'
            });
            this.resourceText.push(this.add.text(x + 213, 115, '100%', {
                fontFamily: 'Arial',
                fontSize: '13px',
                color: '#f5f8fc',
                fontStyle: 'bold'
            }).setOrigin(1, 0));
            const indicator = this.add.circle(x + 211, 140, 2.5, card.color);
            this.tweens.add({
                targets: indicator,
                alpha: { from: 0.4, to: 1 },
                scale: { from: 0.8, to: 1.3 },
                duration: 950 + index * 150,
                yoyo: true,
                repeat: -1
            });
        });
    }

    private drawMap() {
        const width = this.columns * this.cellSize;
        const height = this.rows * this.cellSize;
        this.mapLayer.add(this.add.rectangle(
            this.boardLeft + width / 2,
            this.boardTop + height / 2,
            width + 22,
            height + 22,
            0x0b1623
        ).setStrokeStyle(2, 0x60788e));
        this.mapLayer.add(this.add.rectangle(
            this.boardLeft + width / 2,
            this.boardTop + height / 2,
            width + 12,
            height + 12,
            0x172432
        ).setStrokeStyle(1, 0xa2bac9, 0.36));

        const craters: Point[] = [
            { x: 0, y: 0 }, { x: 5, y: 0 }, { x: 9, y: 0 },
            { x: 4, y: 1 }, { x: 9, y: 2 }, { x: 0, y: 4 },
            { x: 3, y: 5 }, { x: 6, y: 4 }, { x: 9, y: 6 },
            { x: 1, y: 6 }, { x: 6, y: 2 }, { x: 2, y: 4 }
        ];

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const center = this.tileCenter({ x, y });
                const shade = (x + y) % 4 === 0 ? 0x303c47 : (x * 3 + y) % 3 === 0 ? 0x2b3844 : 0x293641;
                this.mapLayer.add(this.add.rectangle(
                    center.x,
                    center.y,
                    this.cellSize - 1,
                    this.cellSize - 1,
                    shade
                ).setStrokeStyle(1, 0x364653, 0.82));

                if (craters.some((crater) => crater.x === x && crater.y === y)) {
                    this.mapLayer.add(this.add.ellipse(center.x + 8, center.y + 12, 42, 27, 0x101a24, 0.85));
                    this.mapLayer.add(this.add.ellipse(center.x + 6, center.y + 7, 35, 22, 0x53606b, 0.68)
                        .setStrokeStyle(1.5, 0xaab3b8, 0.34));
                    this.mapLayer.add(this.add.ellipse(center.x + 6, center.y + 9, 27, 15, 0x202c37, 0.91));
                    this.mapLayer.add(this.add.ellipse(center.x + 5, center.y + 6, 18, 7, 0x71808b, 0.17));
                }

                if ((x * 11 + y * 5) % 13 === 2) {
                    const rock = this.add.ellipse(center.x - 13, center.y + 17, 8, 5, 0x76818a, 0.62)
                        .setStrokeStyle(1, 0xa2abb1, 0.28);
                    this.mapLayer.add(rock);
                    this.mapLayer.add(this.add.ellipse(center.x - 12, center.y + 19, 11, 3, 0x101b26, 0.5));
                }
            }
        }

        const regolith = this.add.graphics();
        this.mapLayer.add(regolith);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const center = this.tileCenter({ x, y });
                for (let detail = 0; detail < 4; detail++) {
                    const seed = x * 71 + y * 43 + detail * 29;
                    const speckX = center.x - 26 + (seed * 17) % 53;
                    const speckY = center.y - 25 + (seed * 31) % 51;
                    const color = detail % 2 === 0 ? 0xb8c3cc : 0x111d29;
                    regolith.fillStyle(color, detail % 2 === 0 ? 0.19 : 0.32);
                    regolith.fillCircle(speckX, speckY, detail === 0 ? 1.4 : 0.8);
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
        const panel = this.add.graphics();
        panel.fillStyle(0x091522, 0.42);
        panel.fillRoundedRect(696, 184, 300, 444, 14);
        panel.fillStyle(0x111f31, 0.98);
        panel.fillRoundedRect(688, 176, 300, 444, 14);
        panel.fillStyle(0x16283b, 0.8);
        panel.fillRoundedRect(692, 180, 292, 436, 11);
        panel.lineStyle(1.5, 0x45617c, 0.92);
        panel.strokeRoundedRect(688, 176, 300, 444, 14);
        panel.fillStyle(0x69d8c0, 0.9);
        panel.fillRoundedRect(706, 176, 56, 3, 2);
        panel.fillStyle(0x30465f, 0.72);
        panel.fillRect(706, 325, 264, 1);
        this.add.text(706, 190, 'MISSION CONTROL', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#91a9c5',
            fontStyle: 'bold'
        });
        this.add.circle(966, 198, 3, 0x74e0bd);
        this.add.text(958, 190, 'LIVE', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#8de8ce',
            fontStyle: 'bold'
        }).setOrigin(1, 0);

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
                    card.setFillStyle(0x23394f);
                    card.setStrokeStyle(1, option.color);
                }
            });
            card.on('pointerout', () => {
                card.setFillStyle(this.selectedBuilding === option.kind ? 0x264252 : 0x192a3d);
                if (this.selectedBuilding !== option.kind) {
                    card.setStrokeStyle(1, 0x354c64);
                }
            });
            this.add.circle(718, y + 13, 10, option.color, 0.08);
            this.add.circle(718, y + 13, 5, option.color)
                .setStrokeStyle(1, 0xe9f7ff, 0.55);
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

        const statusPanel = this.add.graphics();
        statusPanel.fillStyle(0x101d2c, 1);
        statusPanel.fillRoundedRect(702, 550, 272, 68, 8);
        statusPanel.lineStyle(1, 0x3a5369, 0.9);
        statusPanel.strokeRoundedRect(702, 550, 272, 68, 8);
        statusPanel.fillStyle(0x70d7bd, 0.85);
        statusPanel.fillRoundedRect(702, 550, 3, 68, 2);
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
        const mapCaption = this.add.graphics();
        mapCaption.fillStyle(0x0c1926, 0.88);
        mapCaption.fillRoundedRect(28, 160, 632, 20, 6);
        mapCaption.lineStyle(1, 0x354c61, 0.78);
        mapCaption.strokeRoundedRect(28, 160, 632, 20, 6);
        this.add.circle(41, 170, 3, 0x68d8bc);
        this.add.text(51, 164, 'LUNAR SURFACE  /  SUPPLY ROUTE', {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#72d9c2',
            fontStyle: 'bold'
        });
        this.add.text(646, 164, '3 KITS REQUIRED', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#b8cbdc',
            fontStyle: 'bold'
        }).setOrigin(1, 0);
    }

    private drawAstronaut() {
        const center = this.tileCenter(this.astronaut);
        const sprite = this.add.container(center.x, center.y);
        sprite.setDepth(10);
        sprite.add(this.add.ellipse(0, 22, 32, 10, 0x09131f, 0.75));
        sprite.add(this.add.ellipse(0, 15, 44, 21, 0x67d9e8, 0.035));
        this.astronautShieldAura = this.add.circle(0, -2, 27, 0x6fd8e9, 0.04)
            .setStrokeStyle(2, 0x8be9f5, 0.52);
        sprite.add(this.astronautShieldAura);
        sprite.add(this.add.rectangle(-19, 8, 11, 25, 0x738da4)
            .setStrokeStyle(1, 0xb9cbd9, 0.8));
        sprite.add(this.add.rectangle(-19, 1, 13, 9, 0x3c596f)
            .setStrokeStyle(1, 0x86a2bb));
        sprite.add(this.add.rectangle(-19, 11, 6, 8, 0x243b51));
        sprite.add(this.add.ellipse(0, 9, 26, 34, 0xcbd8e3)
            .setStrokeStyle(2, 0xeff7ff, 0.95));
        sprite.add(this.add.ellipse(0, 4, 20, 20, 0xe7eef4, 0.92));
        sprite.add(this.add.rectangle(0, 9, 15, 18, 0xc3d1dd)
            .setStrokeStyle(1, 0xeff7ff, 0.78));
        sprite.add(this.add.rectangle(-10, -1, 4, 9, 0xf0f6fa));
        sprite.add(this.add.rectangle(10, -1, 4, 9, 0xf0f6fa));
        this.astronautArmLeft = this.add.rectangle(-16, 8, 7, 17, 0xb2c5d5)
            .setStrokeStyle(1, 0x7f97ad);
        this.astronautArmRight = this.add.rectangle(16, 8, 7, 17, 0xb2c5d5)
            .setStrokeStyle(1, 0x7f97ad);
        sprite.add(this.astronautArmLeft);
        sprite.add(this.astronautArmRight);
        sprite.add(this.add.circle(-17, 17, 4, 0xf1f5f8).setStrokeStyle(1, 0x8199ad));
        sprite.add(this.add.circle(17, 17, 4, 0xf1f5f8).setStrokeStyle(1, 0x8199ad));
        this.astronautLegLeft = this.add.rectangle(-7, 25, 8, 12, 0x8fa6bb)
            .setStrokeStyle(1, 0x647e96);
        this.astronautLegRight = this.add.rectangle(7, 25, 8, 12, 0x8fa6bb)
            .setStrokeStyle(1, 0x647e96);
        sprite.add(this.astronautLegLeft);
        sprite.add(this.astronautLegRight);
        sprite.add(this.add.rectangle(-7, 31, 12, 5, 0x26394b).setStrokeStyle(1, 0x8298ab));
        sprite.add(this.add.rectangle(7, 31, 12, 5, 0x26394b).setStrokeStyle(1, 0x8298ab));
        sprite.add(this.add.circle(0, -11, 18, 0xdce7ef)
            .setStrokeStyle(2, 0xffffff, 0.94));
        sprite.add(this.add.ellipse(5, -12, 15, 15, 0x1d526f)
            .setStrokeStyle(1, 0x7ce0ed, 0.86));
        sprite.add(this.add.ellipse(8, -16, 6, 3, 0xd7f8ff, 0.95));
        sprite.add(this.add.ellipse(-7, -11, 4, 8, 0xffffff, 0.42));
        sprite.add(this.add.line(0, -2, -10, -3, 10, -3, 0x91a9bc).setLineWidth(1));
        sprite.add(this.add.rectangle(0, 0, 21, 4, 0x49b8a5));
        sprite.add(this.add.rectangle(0, 10, 12, 11, 0x294157).setStrokeStyle(1, 0x66849e));
        sprite.add(this.add.rectangle(0, 7, 8, 2, 0x6fc9d3));
        sprite.add(this.add.circle(0, 12, 2, 0xf6d36e));
        sprite.add(this.add.circle(-5, 12, 1.4, 0x77ddc0));
        sprite.add(this.add.line(0, 3, 0, -2, 0, -6, 0x6c8298).setLineWidth(1));
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
        marker.add(this.add.circle(0, 3, 30, 0xf3b65e, 0.055));
        marker.add(this.add.ellipse(0, 19, 38, 12, 0x07121d, 0.62));
        marker.add(this.add.rectangle(0, 1, 31, 31, 0x8c5c38)
            .setStrokeStyle(2, 0xffd48c));
        marker.add(this.add.rectangle(0, 1, 25, 25, 0xc77f3d)
            .setStrokeStyle(1, 0xf7c87d, 0.85));
        marker.add(this.add.rectangle(0, 1, 7, 25, 0xf1b967, 0.88));
        marker.add(this.add.rectangle(0, -5, 31, 5, 0xffd48c));
        marker.add(this.add.line(0, 1, -12, -9, -12, 11, 0xffe6b5).setLineWidth(1, 0.8));
        marker.add(this.add.line(0, 1, 12, -9, 12, 11, 0x754b31).setLineWidth(1, 0.8));
        marker.add(this.add.text(0, -18, '+', {
            fontFamily: 'Arial',
            fontSize: '16px',
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
        marker.add(this.add.circle(0, 2, 33, color, 0.055));
        marker.add(this.add.ellipse(0, 20, 53, 14, 0x09131f, 0.7));

        if (structure.kind === 'solar') {
            marker.add(this.add.rectangle(0, 2, 54, 28, 0x173550).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, 2, 48, 22, 0x276288, 0.92));
            marker.add(this.add.line(0, 2, -17, -11, -17, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, 0, -11, 0, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, 17, -11, 17, 15, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, -27, 2, 27, 2, color).setLineWidth(1));
            marker.add(this.add.line(0, 2, -24, -4, 24, -4, 0x77bce1, 0.45).setLineWidth(1));
            marker.add(this.add.line(0, 2, -24, 9, 24, 9, 0x77bce1, 0.45).setLineWidth(1));
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
            marker.add(this.add.ellipse(0, 4, 63, 53, 0x74e5b3, 0.06));
            marker.add(this.add.rectangle(0, 4, 49, 34, 0x183e3c, 0.94).setStrokeStyle(2, color));
            marker.add(this.add.triangle(0, -13, -25, 13, 25, 13, 0, -13, 0x88dabb, 0.5)
                .setStrokeStyle(2, 0xc3f7de, 0.9));
            marker.add(this.add.line(-9, -4, -9, 19, 6, 19, color).setLineWidth(2));
            marker.add(this.add.line(10, -5, 10, 19, 20, 19, color).setLineWidth(2));
            marker.add(this.add.rectangle(0, 7, 2, 21, 0xb5f5d2, 0.6));
            marker.add(this.add.rectangle(0, 18, 40, 2, 0x315e4d));
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
            marker.add(this.add.rectangle(0, -10, 42, 4, 0x826a62));
            marker.add(this.add.rectangle(0, 9, 14, 20, 0x182637));
            marker.add(this.add.rectangle(-16, 2, 5, 24, 0x6d7377));
            marker.add(this.add.rectangle(16, 2, 5, 24, 0x6d7377));
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
            marker.add(this.add.ellipse(0, 17, 20, 7, 0x0d1b27, 0.7));
            marker.add(this.add.rectangle(0, 9, 5, 22, 0xc1cfda).setStrokeStyle(1, 0xffffff, 0.7));
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
            marker.add(this.add.rectangle(0, 1, 52, 36, 0x273b50).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, 8, 34, 23, 0x101c29).setStrokeStyle(1, 0x6988a2));
            marker.add(this.add.rectangle(0, 20, 42, 4, color));
            marker.add(this.add.rectangle(-7, 12, 22, 7, 0x426e83));
            marker.add(this.add.circle(-14, 19, 4, 0x121f2b).setStrokeStyle(1, 0xaec2d2));
            marker.add(this.add.circle(2, 19, 4, 0x121f2b).setStrokeStyle(1, 0xaec2d2));
            marker.add(this.add.circle(-7, 11, 1.5, 0xd6f4ff));
        } else if (structure.kind === 'recycler') {
            marker.add(this.add.rectangle(0, 3, 42, 39, 0x34415a).setStrokeStyle(2, color));
            const turbine = this.add.circle(0, -3, 11, 0x17283d).setStrokeStyle(3, color);
            marker.add(turbine);
            marker.add(this.add.circle(0, -3, 3, color));
            marker.add(this.add.rectangle(0, 18, 25, 4, color));
            marker.add(this.add.rectangle(0, 11, 33, 2, 0x7787a0));
            marker.add(this.add.circle(13, 14, 2, 0x80e0bd));
            this.tweens.add({
                targets: turbine,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
        } else {
            marker.add(this.add.rectangle(0, 3, 52, 38, 0x33485e).setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, -13, 58, 9, color));
            marker.add(this.add.rectangle(-17, 8, 7, 13, 0x162638));
            marker.add(this.add.rectangle(0, 8, 7, 13, 0x162638));
            marker.add(this.add.rectangle(17, 8, 7, 13, 0x162638));
            marker.add(this.add.rectangle(-17, -6, 6, 8, 0x50687f));
            marker.add(this.add.rectangle(17, -6, 6, 8, 0x50687f));
            marker.add(this.add.line(0, -16, -24, -9, 24, -9, 0xffffff, 0.38).setLineWidth(1));
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
        this.updateExpansionDiagnostics();
    }

    private updateExpansionDiagnostics() {
        const canvas = this.game?.canvas;
        if (!canvas) {
            return;
        }
        canvas.dataset.expansionPhase = this.phase;
        canvas.dataset.expansionSupplies = String(this.crates.filter((crate) => crate.collected).length);
        canvas.dataset.expansionBuilds = String(this.structures.length - 1);
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
        const resourceKeys = ['energy', 'oxygen', 'suitIntegrity', 'radiationDose'] as const;
        const colors = [0xf2c963, 0x66c9f2, 0x72d99a, 0xff806f];
        this.resourceBars.clear();
        values.forEach((value, index) => {
            const x = 38 + index * 246;
            const fillWidth = 204 * Math.max(0, Math.min(1, value / MAX_RESOURCE));
            const state = getExpansionResourceState(resourceKeys[index], value);
            const color = state === 'danger'
                ? 0xff806f
                : state === 'warning'
                    ? 0xffa762
                    : colors[index];
            this.resourceBars.fillStyle(0x31485e, 1);
            this.resourceBars.fillRoundedRect(x - 2, 131, 208, 14, 7);
            if (fillWidth > 0.5) {
                this.resourceBars.fillStyle(color, state === 'normal' ? 0.22 : 0.4);
                this.resourceBars.fillRoundedRect(x - 3, 129, fillWidth + 6, 18, 8);
                this.resourceBars.fillStyle(color, 1);
                this.resourceBars.fillRoundedRect(x, 133, fillWidth, 10, 5);
                this.resourceBars.fillStyle(0xffffff, 0.55);
                this.resourceBars.fillRoundedRect(x + 2, 134, Math.max(0, fillWidth - 4), 2, 1);
                this.resourceBars.fillStyle(0x081320, 0.32);
                for (let notch = 1; notch < 10; notch++) {
                    const notchX = x + notch * 20.4;
                    if (notchX < x + fillWidth - 1) {
                        this.resourceBars.fillRect(notchX, 133, 1, 10);
                    }
                }
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
