import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
    applyExpansionFlareExposure,
    applyExpansionDustEvent,
    canBuildExpansionRecipe,
    canPlaceExpansionStructure,
    consumeExpansionRecipe,
    createExpansionMaterialInventory,
    EXPANSION_BUILDING_RECIPES,
    EXPANSION_BUILD_TARGET,
    EXPANSION_CARGO_CAPACITY,
    EXPANSION_MATERIALS,
    EXPANSION_ORDER_BUDGET,
    EXPANSION_STARTER_ORDER,
    getExpansionBuildableCount,
    getExpansionCargoCrateCount,
    getExpansionOrderCost,
    getRandomExpansionSolarFlareInterval,
    isExpansionGameplayActive,
    type ExpansionDustEventStatus,
    type ExpansionBuildingKind,
    type ExpansionMaterialId,
    type ExpansionMaterialInventory,
    type ExpansionPhase
} from './expansion/mission';
import { getExpansionSurfaceFeatures } from './expansion/terrain';
import { getExpansionResourceState } from './expansion/visuals';

type BuildingKind = ExpansionBuildingKind;
type Phase = ExpansionPhase;

interface Point {
    x: number;
    y: number;
}

interface SupplyCrate extends Point {
    material: ExpansionMaterialId;
    quantity: number;
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
const SOLAR_FLARE_WARNING_SECONDS = 3;
type CargoLanderAnimationPhase = 'approach' | 'descent' | 'touchdown' | 'landed' | 'departing';

export class ExpansionScene extends ChapterScene {
    private readonly boardLeft = 24;
    private readonly boardTop = 188;
    private readonly cellSize = 64;
    private readonly columns = 10;
    private readonly rows = 7;

    private astronaut: Point = { x: 1, y: 3 };
    private readonly crates: SupplyCrate[] = [];
    private readonly structures: Structure[] = [{ x: 4, y: 3, kind: 'outpost' }];
    private phase: Phase = 'intro';
    private order: ExpansionMaterialInventory = { ...EXPANSION_STARTER_ORDER };
    private inventory: ExpansionMaterialInventory = createExpansionMaterialInventory();
    private dustEventStatus: ExpansionDustEventStatus = 'inactive';
    private dustEventTimer = 0;
    private dustEventDeadline = 0;
    private nextDustEventAt = 0;
    private resumePhaseAfterDustEvent: 'collect' | 'build' = 'collect';
    private selectedBuilding?: BuildingKind;
    private message = 'Order the materials your outpost needs.';
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
    private startKeyWasDown = false;
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
    private materialMeterTexts: Phaser.GameObjects.Text[] = [];
    private selectionOutlines: Phaser.GameObjects.Rectangle[] = [];
    private buildingCards: Array<{ kind: BuildingKind; frame: Phaser.GameObjects.Rectangle }> = [];
    private orderLayer?: Phaser.GameObjects.Container;
    private orderStatusText?: Phaser.GameObjects.Text;
    private orderConfirmButton?: Phaser.GameObjects.Rectangle;
    private orderConfirmLabel?: Phaser.GameObjects.Text;
    private cargoPadMarker?: Phaser.GameObjects.Container;
    private cargoLander?: Phaser.GameObjects.Container;
    private cargoEnginePlume?: Phaser.GameObjects.Graphics;
    private cargoLanderPhase?: CargoLanderAnimationPhase;
    private readonly stars: Phaser.GameObjects.Arc[] = [];
    private solarFlareLayer?: Phaser.GameObjects.Container;
    private solarFlareBanner?: Phaser.GameObjects.Container;

    constructor() {
        super(chapters[5]);
    }

    init() {
        this.astronaut = { x: 1, y: 3 };
        this.crates.splice(0);
        this.structures.splice(1);
        this.structures[0] = { x: 4, y: 3, kind: 'outpost' };
        this.phase = 'intro';
        this.order = { ...EXPANSION_STARTER_ORDER };
        this.inventory = createExpansionMaterialInventory();
        this.dustEventStatus = 'inactive';
        this.dustEventTimer = 0;
        this.dustEventDeadline = 0;
        this.nextDustEventAt = 0;
        this.resumePhaseAfterDustEvent = 'collect';
        this.selectedBuilding = undefined;
        this.message = 'Order the materials your outpost needs.';
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
        this.startKeyWasDown = false;
        this.hudTimer = 0;
        this.endOverlayVisible = false;
        this.resourceText = [];
        this.lastResourceLabels = [];
        this.selectionOutlines = [];
        this.buildingCards = [];
        this.materialMeterTexts = [];
        this.stars.length = 0;
        this.orderLayer = undefined;
        this.orderStatusText = undefined;
        this.orderConfirmButton = undefined;
        this.orderConfirmLabel = undefined;
        this.cargoPadMarker = undefined;
        this.cargoLander = undefined;
        this.cargoLanderPhase = undefined;
        this.solarFlareLayer = undefined;
        this.solarFlareBanner = undefined;
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
            this.clearSolarFlareAnimation();
            this.clearCargoDeliveryVisuals();
            this.orderLayer?.destroy(true);
            delete this.game.canvas.dataset.expansionPhase;
            delete this.game.canvas.dataset.expansionSupplies;
            delete this.game.canvas.dataset.expansionCargoCrates;
            delete this.game.canvas.dataset.expansionOrderCost;
            delete this.game.canvas.dataset.expansionOrderCrates;
            delete this.game.canvas.dataset.expansionOrderBuildable;
            delete this.game.canvas.dataset.expansionOrderValid;
            delete this.game.canvas.dataset.expansionInventory;
            delete this.game.canvas.dataset.expansionBuilds;
            delete this.game.canvas.dataset.expansionHazard;
            delete this.game.canvas.dataset.expansionHazardTimer;
            delete this.game.canvas.dataset.expansionNextFlare;
            delete this.game.canvas.dataset.expansionLanderPhase;
            delete this.game.canvas.dataset.expansionSuitIntegrity;
            delete this.game.canvas.dataset.expansionRadiationDose;
        });
    }

    update(_time: number, delta: number) {
        const startKeyDown = this.startEnterKey.isDown || this.startSpaceKey.isDown;
        if (this.phase === 'intro') {
            if (startKeyDown && !this.startKeyWasDown) {
                this.beginMission();
            }
            this.startKeyWasDown = startKeyDown;
            this.animateStars(delta);
            return;
        }

        if (this.phase === 'order') {
            if (startKeyDown && !this.startKeyWasDown) {
                this.confirmOrder();
            }
            this.startKeyWasDown = startKeyDown;
            this.animateStars(delta);
            return;
        }
        this.startKeyWasDown = startKeyDown;

        if (this.phase === 'delivery') {
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
        if ((this.phase === 'collect' || this.phase === 'build')
            && this.nextDustEventAt > 0
            && Date.now() >= this.nextDustEventAt) {
            this.beginDustEvent();
        }
        if (this.phase === 'hazard' && this.dustEventStatus === 'warning') {
            this.dustEventTimer = Math.max(0, (this.dustEventDeadline - Date.now()) / 1000);
        }

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
                    if (this.phase === 'build' && this.selectedBuilding) {
                        this.showSelection();
                    }
                }
            }
        } else {
            this.moveTimer = 0;
        }

        this.updateResources(seconds, moved, moveDirection);
        if (this.phase === 'hazard' && this.dustEventStatus === 'warning' && this.dustEventTimer === 0) {
            this.resolveDustEvent();
        }
        this.handleKeys();
        this.animateStars(delta);
        this.updateResourceBars(seconds);

        if (this.phase === 'hazard') {
            this.refreshHud();
        } else {
            this.hudTimer -= delta;
            if (this.hudTimer <= 0) {
                this.hudTimer = 150;
                this.refreshHud();
            }
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
        const flareWarningActive = this.phase === 'hazard' && this.dustEventStatus === 'warning';

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

        if (flareWarningActive) {
            const resources = applyExpansionFlareExposure(
                this.suitIntegrity,
                this.radiationDose,
                seconds,
                atHome
            );
            this.suitIntegrity = resources.suitIntegrity;
            this.radiationDose = resources.radiationDose;
        } else if (this.suitIntegrity < 60 && !atHome && !atShelter && this.repairTimer === 0) {
            this.radiationDose = Math.min(MAX_RESOURCE, this.radiationDose + 0.7 * seconds);
        }

        if (this.oxygen <= 0) {
            this.failMission('Your oxygen ran out. Return to the outpost sooner next time.');
        } else if (this.radiationDose >= MAX_RESOURCE && !flareWarningActive) {
            this.failMission('Your radiation warning reached its limit. Repair your suit sooner next time.');
        }
    }

    private moveAstronaut(direction: Point): boolean {
        if (this.phase !== 'collect' && this.phase !== 'hazard' && this.phase !== 'build') {
            return false;
        }

        const next = { x: this.astronaut.x + direction.x, y: this.astronaut.y + direction.y };
        if (next.x < 0 || next.x >= this.columns || next.y < 0 || next.y >= this.rows) {
            return false;
        }
        if (this.structures.some((structure) => structure.x === next.x && structure.y === next.y)) {
            return false;
        }
        if (
            next.x === 6
            && next.y === 3
            && (this.cargoLanderPhase === 'descent'
                || this.cargoLanderPhase === 'touchdown'
                || this.cargoLanderPhase === 'landed'
                || this.cargoLanderPhase === 'departing')
        ) {
            return false;
        }

        this.astronaut = next;
        const crate = this.crates.find((item) => !item.collected && item.x === next.x && item.y === next.y);
        if (crate) {
            this.collectCrate(crate);
        } else if (this.phase === 'hazard') {
            this.message = this.dustEventStatus === 'warning'
                ? `Solar alert: get to the outpost in ${Math.ceil(this.dustEventTimer)} seconds.`
                : 'The solar burst passed. Return to the outpost for shielding.';
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

        const material = EXPANSION_MATERIALS.find(({ id }) => id === crate.material);
        if (!material) {
            throw new Error(`Unknown Expansion cargo material: ${crate.material}`);
        }
        this.inventory[crate.material] += crate.quantity;
        this.oxygen = Math.min(MAX_RESOURCE, this.oxygen + 12);
        this.energy = Math.min(MAX_RESOURCE, this.energy + 6);
        this.missionScore += 10;
        const collected = this.crates.filter((item) => item.collected).length;
        if (collected === this.crates.length) {
            this.departCargoLander();
            if (this.phase === 'hazard') {
                this.resumePhaseAfterDustEvent = 'build';
                this.message = `Cargo collected. Reach the outpost in ${Math.ceil(this.dustEventTimer)} seconds.`;
            } else {
                this.phase = 'build';
                this.message = 'All cargo collected. Use the delivered materials to build three upgrades.';
            }
        } else {
            this.message = this.phase === 'hazard'
                ? `Solar flare warning: ${this.crates.length - collected} cargo crates remain. Reach the outpost in ${Math.ceil(this.dustEventTimer)} seconds.`
                : `Loaded ${crate.quantity} ${material.name.toLowerCase()}. ${this.crates.length - collected} cargo crates remain at the landing site.`;
        }
        this.showFloatingText(
            this.tileCenter(crate),
            `+${crate.quantity} ${material.crateLabel}`,
            material.color
        );
        this.refreshHud();
    }

    private beginDustEvent() {
        if (this.phase !== 'collect' && this.phase !== 'build') {
            return;
        }
        this.resumePhaseAfterDustEvent = this.phase;
        this.nextDustEventAt = 0;
        this.phase = 'hazard';
        this.dustEventStatus = 'warning';
        this.dustEventTimer = SOLAR_FLARE_WARNING_SECONDS;
        this.dustEventDeadline = Date.now() + SOLAR_FLARE_WARNING_SECONDS * 1000;
        this.message = `SOLAR FLARE INCOMING! Reach the outpost in ${SOLAR_FLARE_WARNING_SECONDS} seconds.`;
        this.drawSolarFlareAnimation();
        this.refreshHud();
    }

    private scheduleNextDustEvent() {
        const delay = getRandomExpansionSolarFlareInterval();
        this.nextDustEventAt = Date.now() + delay * 1000;
    }

    private resolveDustEvent() {
        const protectedByOutpost = this.isNearStructure('outpost');
        const resources = applyExpansionDustEvent(
            this.suitIntegrity,
            this.radiationDose,
            protectedByOutpost
        );
        this.suitIntegrity = resources.suitIntegrity;
        this.dustEventTimer = 0;
        this.dustEventStatus = protectedByOutpost ? 'protected' : 'exposed';
        this.clearSolarFlareAnimation();
        if (!protectedByOutpost) {
            this.radiationDose = MAX_RESOURCE;
            this.message = 'GAME OVER: High-yield radiation exposure from the solar flare ended the mission.';
            this.updateResourceBars(1);
            this.failMission(this.message);
            return;
        }

        this.radiationDose = resources.radiationDose;
        this.message = 'The outpost blocked the radiation burst. Dust cut suit integrity by 45%; press R to patch up.';
        this.showFloatingText(
            this.tileCenter(this.astronaut),
            'RADIATION BLOCKED',
            0x9beac2
        );
        this.finishDustEvent();
    }

    private finishDustEvent() {
        if (this.phase !== 'hazard') {
            return;
        }
        this.phase = this.resumePhaseAfterDustEvent;
        this.scheduleNextDustEvent();
        this.refreshHud();
    }

    private drawSolarFlareAnimation() {
        this.clearSolarFlareAnimation();
        const flare = this.add.container(0, 0).setDepth(9);
        const mapWidth = this.columns * this.cellSize;
        const mapHeight = this.rows * this.cellSize;
        const wash = this.add.rectangle(
            this.boardLeft + mapWidth / 2,
            this.boardTop + mapHeight / 2,
            mapWidth,
            mapHeight,
            0xff5634,
            0.08
        );
        flare.add(wash);
        this.tweens.add({
            targets: wash,
            alpha: { from: 0.12, to: 0.34 },
            duration: 230,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const sourceX = this.boardLeft + mapWidth - 18;
        const sourceY = this.boardTop + 10;
        const source = this.add.container(sourceX, sourceY);
        source.add(this.add.circle(0, 0, 27, 0xff682f, 0.16));
        source.add(this.add.circle(0, 0, 18, 0xff8c3d, 0.38)
            .setStrokeStyle(2, 0xffd37a, 0.82));
        source.add(this.add.circle(0, 0, 10, 0xffc854));
        source.add(this.add.circle(0, 0, 5, 0xfff3bd));
        const rays = this.add.graphics();
        for (let ray = 0; ray < 16; ray++) {
            const angle = Math.PI * 2 * ray / 16;
            const length = ray % 2 === 0 ? 37 : 27;
            rays.lineStyle(ray % 2 === 0 ? 2 : 1, 0xffd47c, 0.88);
            rays.lineBetween(
                Math.cos(angle) * 13,
                Math.sin(angle) * 13,
                Math.cos(angle) * length,
                Math.sin(angle) * length
            );
        }
        source.add(rays);
        flare.add(source);
        this.tweens.add({
            targets: source,
            scale: { from: 0.88, to: 1.14 },
            alpha: { from: 0.76, to: 1 },
            duration: 280,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        for (let ring = 0; ring < 3; ring++) {
            const wave = this.add.ellipse(sourceX, sourceY, 18, 44, 0xffc45c, 0)
                .setStrokeStyle(2, 0xffc45c, 0.78);
            flare.add(wave);
            this.tweens.add({
                targets: wave,
                scaleX: { from: 0.3, to: 4 },
                scaleY: { from: 0.3, to: 2.7 },
                alpha: { from: 0.9, to: 0 },
                duration: 1100,
                repeat: -1,
                delay: ring * 260,
                ease: 'Sine.easeOut'
            });
        }

        const banner = this.add.container(0, 0);
        const bannerFrame = this.add.graphics();
        bannerFrame.fillStyle(0x36100d, 0.98);
        bannerFrame.fillRoundedRect(177, 150, 334, 44, 8);
        bannerFrame.lineStyle(2, 0xff684f, 1);
        bannerFrame.strokeRoundedRect(177, 150, 334, 44, 8);
        banner.add(bannerFrame);
        banner.add(this.add.text(344, 158, 'SOLAR FLARE', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffe34a',
            fontStyle: 'bold',
            stroke: '#3c2200',
            strokeThickness: 3
        }).setOrigin(0.5));
        banner.add(this.add.text(344, 181, 'RADIATION SPIKE - REACH THE OUTPOST', {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#ffd0c3',
            fontStyle: 'bold'
        }).setOrigin(0.5));
        this.hudLayer.add(banner);
        this.solarFlareBanner = banner;

        this.mapLayer.add(flare);
        this.solarFlareLayer = flare;
    }

    private clearSolarFlareAnimation() {
        if (this.solarFlareLayer) {
            this.solarFlareLayer.list.forEach((object) => this.tweens.killTweensOf(object));
            this.solarFlareLayer.destroy();
            this.solarFlareLayer = undefined;
        }
        this.solarFlareBanner?.destroy();
        this.solarFlareBanner = undefined;
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer) {
        if (this.phase === 'intro' || this.phase === 'order' || this.phase === 'delivery') {
            return;
        }

        if (this.phase === 'complete' || this.phase === 'failed') {
            if (pointer.x >= 417 && pointer.x <= 607 && pointer.y >= 434 && pointer.y <= 478) {
                this.scene.restart();
            }
            return;
        }

        const canMoveByPointer = this.phase === 'collect'
            || this.phase === 'hazard'
            || (this.phase === 'build' && !this.selectedBuilding);
        if (canMoveByPointer && this.isOnBoard(pointer.x, pointer.y)) {
            const tile = this.pointerTile(pointer.x, pointer.y);
            const distance = Math.abs(tile.x - this.astronaut.x) + Math.abs(tile.y - this.astronaut.y);
            if (distance === 1 && this.repairTimer === 0) {
                const direction = { x: tile.x - this.astronaut.x, y: tile.y - this.astronaut.y };
                const moved = this.moveAstronaut(direction);
                if (moved) {
                    this.updateResources(0, true, direction);
                }
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
        if ((this.phase !== 'collect' && this.phase !== 'hazard' && this.phase !== 'build') || this.repairTimer > 0) {
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
        if (this.phase !== 'collect' && this.phase !== 'hazard' && this.phase !== 'build') {
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
        if (this.astronaut.x === tile.x && this.astronaut.y === tile.y) {
            this.message = 'Move the astronaut before placing a structure on this tile.';
            this.refreshHud();
            return;
        }
        if (!canPlaceExpansionStructure(tile, this.structures, this.astronaut)) {
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

        const recipe = EXPANSION_BUILDING_RECIPES.find(({ kind }) => kind === option.kind);
        if (!recipe) {
            throw new Error(`The ${option.title} material recipe is not available.`);
        }
        const remainingMaterials = consumeExpansionRecipe(this.inventory, recipe.materials);
        if (!remainingMaterials) {
            this.message = `Missing materials for the ${option.title.toLowerCase()}: ${this.formatRecipe(recipe.materials)}.`;
            this.refreshHud();
            return;
        }
        this.inventory = remainingMaterials;
        this.energy -= option.energyCost;
        this.structures.push({ ...tile, kind: option.kind });
        this.drawPowerNetwork();
        this.missionScore += 20;

        if (option.kind === 'solar') {
            this.energy = Math.min(MAX_RESOURCE, this.energy + 24);
        } else if (option.kind === 'greenhouse') {
            this.oxygen = Math.min(MAX_RESOURCE, this.oxygen + 14);
        } else if (option.kind === 'relay') {
            this.energy = Math.min(MAX_RESOURCE, this.energy + 10);
        }

        const builtCount = this.structures.length - 1;
        if (builtCount >= EXPANSION_BUILD_TARGET) {
            this.phase = 'complete';
            this.message = 'Three upgrades built! Your Moon outpost is growing.';
        } else {
            this.message = `${option.title} built! Choose another upgrade (${EXPANSION_BUILD_TARGET - builtCount} to go).`;
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
        this.phase = 'order';
        this.message = 'Choose a material order within the $100 budget.';
        this.briefingLayer.setVisible(false);
        this.drawOrderTerminal();
        this.refreshHud();
    }

    private drawOrderTerminal() {
        this.orderLayer?.destroy(true);
        const layer = this.add.container(0, 0).setDepth(120);
        this.orderLayer = layer;
        layer.add(this.add.rectangle(512, 320, 1024, 640, 0x03080e, 0.86));

        const panel = this.add.graphics();
        panel.fillStyle(0x07121e, 0.98);
        panel.fillRoundedRect(44, 32, 936, 574, 16);
        panel.lineStyle(2, 0x668298, 0.95);
        panel.strokeRoundedRect(44, 32, 936, 574, 16);
        panel.fillStyle(0x71d8bf, 0.95);
        panel.fillRoundedRect(68, 32, 100, 4, 2);
        layer.add(panel);

        layer.add(this.add.text(76, 48, 'OUTPOST SUPPLY TERMINAL', {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#f5f8fc',
            fontStyle: 'bold'
        }));
        layer.add(this.add.text(78, 80, 'Choose cargo for one lander delivery. The starter order is editable.', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#afc3d6'
        }));
        const budgetCard = this.add.rectangle(872, 62, 166, 42, 0x1b3042)
            .setStrokeStyle(1, 0x536d82);
        layer.add(budgetCard);
        layer.add(this.add.text(872, 62, `BUDGET  $${EXPANSION_ORDER_BUDGET}`, {
            fontFamily: 'Arial',
            fontSize: '15px',
            color: '#f2d783',
            fontStyle: 'bold'
        }).setOrigin(0.5));

        layer.add(this.add.text(78, 112, 'MATERIAL ORDER', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#82dec7',
            fontStyle: 'bold'
        }));
        layer.add(this.add.text(532, 112, 'BUILD RECIPES', {
            fontFamily: 'Arial',
            fontSize: '12px',
            color: '#82dec7',
            fontStyle: 'bold'
        }));

        EXPANSION_MATERIALS.forEach((material, index) => {
            const y = 149 + index * 39;
            const row = this.add.rectangle(278, y, 412, 34, 0x142638)
                .setStrokeStyle(1, 0x304b60);
            layer.add(row);
            layer.add(this.add.circle(91, y, 4, material.color));
            layer.add(this.add.text(104, y - 10, material.name, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#eff5fa',
                fontStyle: 'bold'
            }));
            layer.add(this.add.text(104, y + 3, `$${material.price} each`, {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: '#9fb3c6'
            }));

            const minus = this.add.rectangle(384, y, 26, 25, 0x243b50)
                .setStrokeStyle(1, 0x58758c)
                .setInteractive({ useHandCursor: true });
            layer.add(minus);
            layer.add(this.add.text(384, y - 1, '−', {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: this.order[material.id] > 0 ? '#ffffff' : '#718294',
                fontStyle: 'bold'
            }).setOrigin(0.5));
            minus.on('pointerdown', () => this.adjustOrder(material.id, -1));

            layer.add(this.add.text(423, y - 8, String(this.order[material.id]), {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5, 0));
            layer.add(this.add.text(423, y + 7, 'units', {
                fontFamily: 'Arial',
                fontSize: '8px',
                color: '#8fa7ba'
            }).setOrigin(0.5, 0));

            const plus = this.add.rectangle(462, y, 26, 25, 0x243b50)
                .setStrokeStyle(1, 0x58758c)
                .setInteractive({ useHandCursor: true });
            layer.add(plus);
            layer.add(this.add.text(462, y - 1, '+', {
                fontFamily: 'Arial',
                fontSize: '17px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5));
            plus.on('pointerdown', () => this.adjustOrder(material.id, 1));
        });

        EXPANSION_BUILDING_RECIPES.forEach((recipe, index) => {
            const option = options.find(({ kind }) => kind === recipe.kind);
            if (!option) {
                throw new Error(`Missing Expansion option for ${recipe.kind}.`);
            }
            const y = 149 + index * 53;
            const row = this.add.rectangle(738, y + 1, 418, 48, 0x142638)
                .setStrokeStyle(1, 0x304b60);
            layer.add(row);
            layer.add(this.add.text(540, y - 14, option.title, {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: '#f1f5f9',
                fontStyle: 'bold'
            }));
            layer.add(this.add.text(540, y + 1, this.formatRecipe(recipe.materials), {
                fontFamily: 'Arial',
                fontSize: '9px',
                color: '#aec2d3'
            }));
        });

        const cost = getExpansionOrderCost(this.order);
        const crateCount = getExpansionCargoCrateCount(this.order);
        const buildable = getExpansionBuildableCount(this.order);
        const orderIsValid = this.canConfirmOrder();
        this.orderStatusText = this.add.text(
            78,
            472,
            `TOTAL  $${cost} / $${EXPANSION_ORDER_BUDGET}     CARGO CRATES  ${crateCount}/${EXPANSION_CARGO_CAPACITY}     UPGRADES FUNDED  ${buildable}/${EXPANSION_BUILD_TARGET}`,
            {
                fontFamily: 'Arial',
                fontSize: '11px',
                color: orderIsValid ? '#a4f0c3' : '#ffb37d',
                fontStyle: 'bold'
            }
        );
        layer.add(this.orderStatusText);
        layer.add(this.add.text(
            78,
            492,
            orderIsValid
                ? 'Each material type is packed in its own crate and unloaded together at the marked landing site.'
                : 'Adjust the order until it can build at least three structures before confirming.',
            {
                fontFamily: 'Arial',
                fontSize: '10px',
                color: '#aebfd0'
            }
        ));

        const recommendedButton = this.add.rectangle(348, 564, 190, 38, 0x1b3042)
            .setStrokeStyle(1, 0x71879a)
            .setInteractive({ useHandCursor: true });
        layer.add(recommendedButton);
        layer.add(this.add.text(348, 564, 'RECOMMENDED ORDER', {
            fontFamily: 'Arial',
            fontSize: '11px',
            color: '#d8e4ed',
            fontStyle: 'bold'
        }).setOrigin(0.5));
        recommendedButton.on('pointerdown', () => {
            this.order = { ...EXPANSION_STARTER_ORDER };
            this.drawOrderTerminal();
            this.updateExpansionDiagnostics();
        });

        this.orderConfirmButton = this.add.rectangle(
            700,
            564,
            230,
            38,
            orderIsValid ? 0x246e62 : 0x263342
        ).setStrokeStyle(1, orderIsValid ? 0x7ce0c2 : 0x495969);
        if (orderIsValid) {
            this.orderConfirmButton.setInteractive({ useHandCursor: true });
            this.orderConfirmButton.on('pointerdown', () => this.confirmOrder());
        }
        layer.add(this.orderConfirmButton);
        this.orderConfirmLabel = this.add.text(
            700,
            564,
            orderIsValid ? 'CONFIRM ORDER  →' : 'FUND 3 UPGRADES TO CONTINUE',
            {
                fontFamily: 'Arial',
                fontSize: orderIsValid ? '12px' : '10px',
                color: orderIsValid ? '#ffffff' : '#a9b5c2',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5);
        layer.add(this.orderConfirmLabel);
        this.updateExpansionDiagnostics();
    }

    private adjustOrder(material: ExpansionMaterialId, amount: number) {
        if (this.phase !== 'order') {
            return;
        }
        const nextAmount = this.order[material] + amount;
        if (nextAmount < 0) {
            return;
        }

        const nextOrder = { ...this.order, [material]: nextAmount };
        if (getExpansionOrderCost(nextOrder) > EXPANSION_ORDER_BUDGET
            || getExpansionCargoCrateCount(nextOrder) > EXPANSION_CARGO_CAPACITY) {
            return;
        }
        this.order = nextOrder;
        this.drawOrderTerminal();
    }

    private canConfirmOrder() {
        return getExpansionOrderCost(this.order) <= EXPANSION_ORDER_BUDGET
            && getExpansionCargoCrateCount(this.order) <= EXPANSION_CARGO_CAPACITY
            && getExpansionBuildableCount(this.order) >= EXPANSION_BUILD_TARGET;
    }

    private confirmOrder() {
        if (this.phase !== 'order') {
            return;
        }
        if (!this.canConfirmOrder()) {
            this.message = 'Order enough materials to build three upgrades before confirming.';
            this.drawOrderTerminal();
            this.refreshHud();
            return;
        }

        const cargoTiles = [
            { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 5, y: 3 },
            { x: 7, y: 3 }, { x: 5, y: 4 }, { x: 6, y: 4 }, { x: 7, y: 4 }
        ];
        const manifest = EXPANSION_MATERIALS
            .filter(({ id }) => this.order[id] > 0)
            .map((material, index) => ({
                ...cargoTiles[index],
                material: material.id,
                quantity: this.order[material.id],
                collected: false
            }));
        this.crates.splice(0, this.crates.length, ...manifest);
        this.orderLayer?.destroy(true);
        this.orderLayer = undefined;
        this.orderStatusText = undefined;
        this.orderConfirmButton = undefined;
        this.orderConfirmLabel = undefined;
        this.phase = 'delivery';
        this.message = 'Cargo lander inbound. Watch the marked landing site.';
        this.drawCargoLandingAnimation();
        this.refreshHud();
    }

    private drawCargoLandingAnimation() {
        const site = this.tileCenter({ x: 6, y: 3 });
        const pad = this.add.container(site.x, site.y).setDepth(3);
        pad.add(this.add.ellipse(0, 17, 58, 21, 0x25231f, 0.8));
        pad.add(this.add.ellipse(0, 9, 48, 12, 0xb9a98c, 0.64)
            .setStrokeStyle(2, 0xf0d89f, 0.92));
        pad.add(this.add.ellipse(0, 9, 36, 7, 0x3c3932, 0.9));
        pad.add(this.add.text(0, 23, 'LANDING PAD', {
            fontFamily: 'Arial',
            fontSize: '7px',
            color: '#fff2c2',
            fontStyle: 'bold',
            stroke: '#171716',
            strokeThickness: 2
        }).setOrigin(0.5));
        this.mapLayer.add(pad);
        this.cargoPadMarker = pad;

        const lander = this.add.container(site.x + 170, site.y - 190)
            .setDepth(12)
            .setScale(0.82)
            .setAngle(-10);
        const enginePlume = this.add.graphics();
        enginePlume.fillStyle(0xff813d, 0.76);
        enginePlume.fillTriangle(-17, 15, 17, 15, 0, 55);
        enginePlume.fillStyle(0xffb957, 0.9);
        enginePlume.fillTriangle(-9, 14, 9, 14, 0, 45);
        enginePlume.fillStyle(0xffedb0, 0.94);
        enginePlume.fillTriangle(-4, 13, 4, 13, 0, 34);
        lander.add(enginePlume);
        this.cargoEnginePlume = enginePlume;
        const leftLeg = this.add.rectangle(-17, 19, 4, 24, 0x879391)
            .setScale(1, 0.2);
        const rightLeg = this.add.rectangle(17, 19, 4, 24, 0x879391)
            .setScale(1, 0.2);
        lander.add(leftLeg);
        lander.add(rightLeg);
        lander.add(this.add.rectangle(-22, 32, 16, 4, 0xe4e8dd));
        lander.add(this.add.rectangle(22, 32, 16, 4, 0xe4e8dd));
        lander.add(this.add.rectangle(0, 0, 48, 30, 0xe1e7e4)
            .setStrokeStyle(2, 0x6a8491));
        lander.add(this.add.rectangle(0, 4, 31, 16, 0x345f70)
            .setStrokeStyle(1, 0x9fe5e6));
        lander.add(this.add.rectangle(-9, 4, 11, 12, 0x79c6d3, 0.9)
            .setStrokeStyle(1, 0xc1f7f4));
        lander.add(this.add.rectangle(8, 4, 11, 12, 0x4d91a3, 0.9)
            .setStrokeStyle(1, 0x9fe5e6));
        lander.add(this.add.rectangle(0, -19, 27, 10, 0xf2f1e7)
            .setStrokeStyle(2, 0x74818a));
        lander.add(this.add.rectangle(0, -19, 18, 5, 0x8be1e6)
            .setStrokeStyle(1, 0xc8fbf2));
        lander.add(this.add.rectangle(-30, 0, 9, 20, 0xd3ddd9)
            .setStrokeStyle(1, 0x718493));
        lander.add(this.add.rectangle(30, 0, 9, 20, 0xd3ddd9)
            .setStrokeStyle(1, 0x718493));
        lander.add(this.add.circle(-23, -11, 2.5, 0xffc15c));
        lander.add(this.add.circle(23, -11, 2.5, 0x7ee0c3));
        lander.add(this.add.line(0, 0, 0, -25, 0, -36, 0xd8e3df).setLineWidth(2));
        lander.add(this.add.circle(0, -38, 3, 0x73cce0));
        this.mapLayer.add(lander);
        this.cargoLander = lander;
        this.cargoLanderPhase = 'approach';
        this.updateExpansionDiagnostics();
        this.tweens.add({
            targets: enginePlume,
            alpha: { from: 0.62, to: 1 },
            scaleY: { from: 0.8, to: 1.16 },
            duration: 190,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        this.tweens.add({
            targets: lander,
            x: site.x + 56,
            y: site.y - 104,
            angle: 0,
            scale: 1,
            duration: 1050,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (this.phase !== 'delivery') {
                    return;
                }
                this.cargoLanderPhase = 'descent';
                this.updateExpansionDiagnostics();
                this.tweens.add({
                    targets: [leftLeg, rightLeg],
                    scaleY: 1,
                    duration: 360,
                    ease: 'Back.easeOut'
                });
                this.tweens.add({
                    targets: lander,
                    x: site.x,
                    y: site.y - 34,
                    duration: 1450,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        if (this.phase !== 'delivery') {
                            return;
                        }
                        this.cargoLanderPhase = 'touchdown';
                        this.updateExpansionDiagnostics();
                        this.cameras.main.shake(160, 0.002);
                        this.createLandingDust(site);
                        this.tweens.add({
                            targets: lander,
                            y: site.y - 38,
                            duration: 170,
                            yoyo: true,
                            ease: 'Sine.easeOut',
                            onComplete: () => {
                                if (this.phase !== 'delivery') {
                                    return;
                                }
                                this.cargoLanderPhase = 'landed';
                                this.phase = 'collect';
                                this.message = 'Lander is down! Collect the marked material crates one by one.';
                                this.scheduleNextDustEvent();
                                this.crates.forEach((crate) => this.drawCrate(crate));
                                this.refreshHud();
                            }
                        });
                    }
                });
            }
        });
    }

    private createLandingDust(site: Point) {
        for (let index = 0; index < 6; index++) {
            const angle = (Math.PI * 2 * index) / 6;
            const distance = 10 + (index % 2) * 5;
            const puff = this.add.ellipse(
                site.x + Math.cos(angle) * distance,
                site.y + 11 + Math.sin(angle) * 4,
                24 + (index % 3) * 5,
                10 + (index % 2) * 3,
                index % 2 === 0 ? 0xd6c6a5 : 0xafa184,
                0.62
            ).setDepth(11);
            this.tweens.add({
                targets: puff,
                x: site.x + Math.cos(angle) * 47,
                y: site.y + 11 + Math.sin(angle) * 13,
                scale: 1.55,
                alpha: 0,
                duration: 880,
                ease: 'Cubic.easeOut',
                onComplete: () => puff.destroy()
            });
        }
    }

    private clearCargoDeliveryVisuals() {
        if (this.cargoLander) {
            this.cargoLander.list.forEach((child) => this.tweens.killTweensOf(child));
            this.tweens.killTweensOf(this.cargoLander);
            this.cargoLander.destroy();
            this.cargoLander = undefined;
        }
        this.cargoEnginePlume = undefined;
        if (this.cargoPadMarker) {
            this.tweens.killTweensOf(this.cargoPadMarker);
            this.cargoPadMarker.destroy();
        }
        this.cargoPadMarker = undefined;
        this.cargoLanderPhase = undefined;
    }

    private departCargoLander() {
        const lander = this.cargoLander;
        if (!lander) {
            throw new Error('Cannot animate cargo liftoff because the lander is missing.');
        }

        this.cargoLanderPhase = 'departing';
        this.updateExpansionDiagnostics();
        this.createLandingDust(this.tileCenter({ x: 6, y: 3 }));

        if (this.cargoEnginePlume) {
            this.tweens.killTweensOf(this.cargoEnginePlume);
            this.tweens.add({
                targets: this.cargoEnginePlume,
                alpha: { from: 0.65, to: 1 },
                scaleY: { from: 0.9, to: 1.8 },
                duration: 220,
                yoyo: true,
                repeat: 3,
                ease: 'Sine.easeInOut'
            });
        }

        if (this.cargoPadMarker) {
            this.tweens.add({
                targets: this.cargoPadMarker,
                alpha: 0,
                duration: 650,
                ease: 'Sine.easeOut'
            });
        }

        this.tweens.add({
            targets: lander,
            x: lander.x + 68,
            y: lander.y - 210,
            scale: 0.82,
            angle: 10,
            alpha: 0,
            duration: 1850,
            delay: 220,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                if (this.cargoLander !== lander) {
                    return;
                }
                this.clearCargoDeliveryVisuals();
                this.updateExpansionDiagnostics();
            }
        });
    }

    private formatRecipe(recipe: Partial<Record<ExpansionMaterialId, number>>) {
        return EXPANSION_MATERIALS
            .filter(({ id }) => (recipe[id] ?? 0) > 0)
            .map((material) => `${material.crateLabel} ×${recipe[material.id]}`)
            .join(' + ');
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
            'You’re the astronaut engineer growing our south-pole Moon outpost. Order materials within the $100 budget, collect the cargo lander’s crates one by one, and use that stock to build three upgrades.',
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
        this.briefingLayer.add(this.add.text(242, 307, '01   Order materials within budget', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#edf4fa',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(242, 336, '02   Collect the lander cargo', {
            fontFamily: 'Arial',
            fontSize: '13px',
            color: '#edf4fa',
            fontStyle: 'bold'
        }));
        this.briefingLayer.add(this.add.text(242, 365, '03   Build 3 funded upgrades', {
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
        this.add.circle(950, 54, 34, 0x5ca8d7, 0.08)
            .setStrokeStyle(1, 0x8ddcff, 0.16);
        this.add.circle(950, 52, 27, 0x2a608b)
            .setStrokeStyle(1.5, 0x9ee3ff, 0.9);
        this.add.ellipse(943, 44, 13, 9, 0x75c991).setAngle(-24);
        this.add.ellipse(957, 45, 8, 6, 0x6bb886).setAngle(18);
        this.add.ellipse(957, 56, 10, 15, 0x65b988).setAngle(-12);
        this.add.ellipse(941, 60, 9, 6, 0x70c793).setAngle(12);
        this.add.ellipse(950, 54, 4, 8, 0x8bd39a).setAngle(-18);
        this.add.circle(949, 64, 2, 0x82ce93);
        this.add.ellipse(949, 41, 18, 3, 0xe8f5ff, 0.76).setAngle(-16);
        this.add.ellipse(954, 51, 15, 2.5, 0xf1fbff, 0.7).setAngle(20);
        this.add.ellipse(946, 62, 16, 2.5, 0xe8f5ff, 0.62).setAngle(-12);
        this.add.ellipse(950, 30, 11, 3, 0xf3fbff, 0.72);
        this.add.ellipse(963, 52, 12, 46, 0x10213a, 0.14);
        this.add.ellipse(943, 36, 7, 2, 0xffffff, 0.42).setAngle(-24);
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
        const frame = this.add.graphics().setDepth(0);
        frame.fillStyle(0x090d12, 0.72);
        frame.fillRoundedRect(
            this.boardLeft - 7,
            this.boardTop - 7,
            width + 14,
            height + 14,
            15
        );
        frame.fillStyle(0x5d5549, 1);
        frame.fillRoundedRect(
            this.boardLeft - 3,
            this.boardTop - 3,
            width + 6,
            height + 6,
            12
        );
        frame.fillStyle(0x756957, 1);
        frame.fillRoundedRect(
            this.boardLeft,
            this.boardTop,
            width,
            height,
            9
        );
        frame.lineStyle(2, 0xb9a98c, 0.72);
        frame.strokeRoundedRect(
            this.boardLeft,
            this.boardTop,
            width,
            height,
            9
        );
        this.mapLayer.add(frame);

        const surface = this.add.graphics().setDepth(1);
        const tones = [0x776b59, 0x6d6456, 0x81725e, 0x716757];
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const center = this.tileCenter({ x, y });
                const inset = 2;
                surface.fillStyle(tones[(x * 3 + y * 5 + x * y) % tones.length], 1);
                surface.fillRoundedRect(
                    center.x - this.cellSize / 2 + inset,
                    center.y - this.cellSize / 2 + inset,
                    this.cellSize - inset * 2,
                    this.cellSize - inset * 2,
                    7
                );
                surface.lineStyle(1, 0x332d25, 0.3);
                surface.strokeRoundedRect(
                    center.x - this.cellSize / 2 + inset,
                    center.y - this.cellSize / 2 + inset,
                    this.cellSize - inset * 2,
                    this.cellSize - inset * 2,
                    7
                );
            }
        }
        this.mapLayer.add(surface);

        const regolith = this.add.graphics().setDepth(2);
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const center = this.tileCenter({ x, y });
                const seed = x * 71 + y * 43;
                regolith.fillStyle(0xd0bea0, 0.12);
                regolith.fillEllipse(center.x - 12, center.y - 15, 30, 13);
                regolith.fillStyle(0x29251f, 0.18);
                regolith.fillEllipse(center.x + 14, center.y + 13, 27, 11);
                for (let detail = 0; detail < 7; detail++) {
                    const speckX = center.x - 25 + ((seed + detail * 19) * 17) % 51;
                    const speckY = center.y - 24 + ((seed + detail * 13) * 11) % 49;
                    regolith.fillStyle(detail % 3 === 0 ? 0xdecda9 : 0x342d25, detail % 3 === 0 ? 0.42 : 0.34);
                    regolith.fillCircle(speckX, speckY, detail % 3 === 0 ? 1.6 : 1);
                }
                regolith.lineStyle(1, 0x332d25, 0.28);
                regolith.lineBetween(
                    center.x - 21 + seed % 15,
                    center.y + 20,
                    center.x - 12 + seed % 19,
                    center.y + 16
                );
            }
        }
        this.mapLayer.add(regolith);

        const grid = this.add.graphics().setDepth(3);
        grid.lineStyle(1, 0xe6d7b8, 0.2);
        for (let x = 1; x < this.columns; x++) {
            const gridX = this.boardLeft + x * this.cellSize;
            grid.lineBetween(gridX, this.boardTop + 4, gridX, this.boardTop + height - 4);
        }
        for (let y = 1; y < this.rows; y++) {
            const gridY = this.boardTop + y * this.cellSize;
            grid.lineBetween(this.boardLeft + 4, gridY, this.boardLeft + width - 4, gridY);
        }
        this.mapLayer.add(grid);

        getExpansionSurfaceFeatures(this.columns, this.rows).forEach((feature) => {
            const tile = this.tileCenter(feature);
            const centerX = tile.x + feature.offsetX;
            const centerY = tile.y + feature.offsetY;
            const detail = this.add.container(centerX, centerY).setDepth(4);
            if (feature.kind === 'crater') {
                detail.add(this.add.ellipse(3, 5, 43 * feature.scale, 31 * feature.scale, 0x28231e, 0.6));
                detail.add(this.add.ellipse(0, 0, 42 * feature.scale, 30 * feature.scale, 0xa9997b, 0.75)
                    .setStrokeStyle(1, 0xd5c4a2, 0.66));
                detail.add(this.add.ellipse(1, 2, 31 * feature.scale, 21 * feature.scale, 0x554b3d, 0.96)
                    .setStrokeStyle(1, 0x40382e, 0.86));
                detail.add(this.add.ellipse(-2, -2, 22 * feature.scale, 13 * feature.scale, 0x39332b, 0.92));
                detail.add(this.add.ellipse(-8, -8, 18 * feature.scale, 5 * feature.scale, 0xe0cfaa, 0.32));
                detail.add(this.add.ellipse(15, 8, 12 * feature.scale, 4 * feature.scale, 0x1e1b17, 0.3));
            } else {
                detail.add(this.add.ellipse(2, 6, 26 * feature.scale, 11 * feature.scale, 0x302a23, 0.55));
                detail.add(this.add.ellipse(-5, 0, 14 * feature.scale, 10 * feature.scale, 0x98907e)
                    .setStrokeStyle(1, 0xd0c5ad, 0.64)
                    .setAngle(-23));
                detail.add(this.add.ellipse(5, -3, 12 * feature.scale, 9 * feature.scale, 0xaaa18e)
                    .setStrokeStyle(1, 0xd8ceb9, 0.68)
                    .setAngle(18));
                detail.add(this.add.ellipse(1, -6, 7 * feature.scale, 4 * feature.scale, 0xe2d6bd, 0.68)
                    .setAngle(-12));
                detail.add(this.add.ellipse(-8, -4, 4, 2, 0xf0e3c9, 0.55));
            }
            this.mapLayer.add(detail);
        });

        this.mapLayer.add(this.add.rectangle(
            this.boardLeft + width / 2,
            this.boardTop + height / 2,
            width,
            height,
            0x000000,
            0
        ).setStrokeStyle(1, 0xd6c6a5, 0.45).setDepth(8));

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
        panel.fillRoundedRect(696, 184, 300, 454, 14);
        panel.fillStyle(0x111f31, 0.98);
        panel.fillRoundedRect(688, 176, 300, 462, 14);
        panel.fillStyle(0x16283b, 0.8);
        panel.fillRoundedRect(692, 180, 292, 454, 11);
        panel.lineStyle(1.5, 0x45617c, 0.92);
        panel.strokeRoundedRect(688, 176, 300, 462, 14);
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
        this.add.text(706, 311, 'RECIPE MATERIALS ARE TRACKED BELOW', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#9fb6c7',
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
            const recipe = EXPANSION_BUILDING_RECIPES.find(({ kind }) => kind === option.kind);
            this.add.text(732, y + 16, recipe ? this.formatRecipe(recipe.materials) : option.description, {
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
        statusPanel.fillRoundedRect(702, 542, 272, 48, 8);
        statusPanel.lineStyle(1, 0x3a5369, 0.9);
        statusPanel.strokeRoundedRect(702, 542, 272, 48, 8);
        statusPanel.fillStyle(0x70d7bd, 0.85);
        statusPanel.fillRoundedRect(702, 542, 3, 48, 2);
        this.statusText = this.add.text(710, 546, '', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#c4d2e3',
            wordWrap: { width: 250 },
            lineSpacing: 1
        });
        this.helpText = this.add.text(710, 580, '', {
            fontFamily: 'Arial',
            fontSize: '7px',
            color: '#f1d27b',
            wordWrap: { width: 252 },
            maxLines: 1
        });

        const materialPanel = this.add.graphics();
        materialPanel.fillStyle(0x101d2c, 1);
        materialPanel.fillRoundedRect(702, 594, 272, 42, 8);
        materialPanel.lineStyle(1, 0x3a5369, 0.9);
        materialPanel.strokeRoundedRect(702, 594, 272, 42, 8);
        materialPanel.fillStyle(0x72d99a, 0.85);
        materialPanel.fillRoundedRect(702, 594, 3, 42, 2);
        this.add.text(710, 597, 'MATERIALS LEFT', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#9fbbcc',
            fontStyle: 'bold'
        });
        this.materialMeterTexts = [];
        EXPANSION_MATERIALS.forEach((material, index) => {
            const column = index % 4;
            const row = Math.floor(index / 4);
            const x = 710 + column * 64;
            const y = 611 + row * 14;
            const color = `#${material.color.toString(16).padStart(6, '0')}`;
            this.add.circle(x + 2, y + 5, 2, material.color);
            this.materialMeterTexts.push(this.add.text(
                x + 7,
                y,
                `${material.inventoryLabel} ${this.inventory[material.id]}`,
                {
                    fontFamily: 'Arial',
                    fontSize: '8px',
                    color,
                    fontStyle: 'bold'
                }
            ));
        });
    }

    private drawFooter() {
        const mapCaption = this.add.graphics();
        mapCaption.fillStyle(0x0c1926, 0.88);
        mapCaption.fillRoundedRect(28, 160, 632, 20, 6);
        mapCaption.lineStyle(1, 0x354c61, 0.78);
        mapCaption.strokeRoundedRect(28, 160, 632, 20, 6);
        this.add.circle(41, 170, 3, 0x68d8bc);
        this.add.text(51, 164, 'LUNAR SURFACE  /  CARGO LANDING ZONE', {
            fontFamily: 'Arial',
            fontSize: '9px',
            color: '#72d9c2',
            fontStyle: 'bold'
        });
        this.add.text(646, 164, '3 UPGRADES REQUIRED', {
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
        sprite.add(this.add.ellipse(2, 22, 39, 13, 0x302a22, 0.72));
        sprite.add(this.add.ellipse(0, 4, 48, 42, 0x75dce8, 0.08));
        this.astronautShieldAura = this.add.circle(0, 2, 26, 0x6fd8e9, 0.045)
            .setStrokeStyle(2, 0x9beaf1, 0.58);
        sprite.add(this.astronautShieldAura);
        sprite.add(this.add.rectangle(0, 13, 18, 20, 0x405365)
            .setStrokeStyle(2, 0xc4d2d7, 0.8));
        sprite.add(this.add.rectangle(0, 11, 13, 15, 0x233d4d));
        sprite.add(this.add.rectangle(0, 18, 12, 3, 0x59d0c0));
        this.astronautArmLeft = this.add.rectangle(-15, 3, 8, 17, 0xe7e6d9)
            .setStrokeStyle(1, 0xa2aba8);
        this.astronautArmRight = this.add.rectangle(15, 3, 8, 17, 0xe7e6d9)
            .setStrokeStyle(1, 0xa2aba8);
        sprite.add(this.astronautArmLeft);
        sprite.add(this.astronautArmRight);
        sprite.add(this.add.circle(-16, 12, 4, 0xe7e6d9).setStrokeStyle(1, 0xa2aba8));
        sprite.add(this.add.circle(16, 12, 4, 0xe7e6d9).setStrokeStyle(1, 0xa2aba8));
        this.astronautLegLeft = this.add.rectangle(-7, 22, 8, 12, 0x9ca9aa)
            .setStrokeStyle(1, 0x66757c);
        this.astronautLegRight = this.add.rectangle(7, 22, 8, 12, 0x9ca9aa)
            .setStrokeStyle(1, 0x66757c);
        sprite.add(this.astronautLegLeft);
        sprite.add(this.astronautLegRight);
        sprite.add(this.add.rectangle(-7, 29, 13, 6, 0x384652).setStrokeStyle(1, 0x9da8a6));
        sprite.add(this.add.rectangle(7, 29, 13, 6, 0x384652).setStrokeStyle(1, 0x9da8a6));
        sprite.add(this.add.ellipse(0, 5, 23, 24, 0xf0eee4)
            .setStrokeStyle(2, 0xffffff, 0.94));
        sprite.add(this.add.ellipse(2, -11, 31, 29, 0xecebe0)
            .setStrokeStyle(2, 0xffffff, 0.98));
        sprite.add(this.add.ellipse(3, -13, 23, 18, 0x1d5268)
            .setStrokeStyle(1, 0x9beaf1, 0.9));
        sprite.add(this.add.ellipse(7, -18, 10, 4, 0xd8f7ef, 0.82));
        sprite.add(this.add.ellipse(-6, -12, 4, 8, 0xffffff, 0.4));
        sprite.add(this.add.rectangle(0, 2, 17, 4, 0x49b8a5));
        sprite.add(this.add.circle(-8, 5, 2, 0xf6d36e));
        sprite.add(this.add.circle(8, 5, 2, 0x77ddc0));
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
        const material = EXPANSION_MATERIALS.find(({ id }) => id === crate.material);
        if (!material) {
            throw new Error(`Unknown Expansion cargo material: ${crate.material}`);
        }
        const center = this.tileCenter(crate);
        const marker = this.add.container(center.x, center.y);
        marker.setDepth(4);
        marker.add(this.add.circle(0, 2, 31, material.color, 0.12));
        marker.add(this.add.ellipse(2, 19, 39, 13, 0x30261b, 0.64));
        marker.add(this.add.rectangle(0, 1, 34, 31, 0x58402c)
            .setStrokeStyle(2, material.color));
        marker.add(this.add.rectangle(0, -1, 29, 27, 0xc58b4d)
            .setStrokeStyle(1, material.color, 0.9));
        marker.add(this.add.rectangle(0, -1, 6, 26, 0xe1b76b, 0.95));
        marker.add(this.add.rectangle(-1, -1, 27, 5, 0xe1b76b, 0.95));
        marker.add(this.add.rectangle(-1, -1, 2, 25, 0x765232, 0.95));
        marker.add(this.add.rectangle(-1, -1, 26, 2, 0x765232, 0.95));
        marker.add(this.add.rectangle(-14, -13, 5, 5, 0xf4d29a));
        marker.add(this.add.rectangle(13, -13, 5, 5, 0xf4d29a));
        marker.add(this.add.rectangle(-14, 11, 5, 5, 0x9d6d40));
        marker.add(this.add.rectangle(13, 11, 5, 5, 0x9d6d40));
        marker.add(this.add.circle(1, 0, 4, 0x4f4130)
            .setStrokeStyle(1, 0xffe6b5));
        marker.add(this.add.text(1, 0, '+', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#fff7df',
            fontStyle: 'bold'
        }).setOrigin(0.5));
        marker.add(this.add.text(0, -27, `${material.inventoryLabel} x${crate.quantity}`, {
            fontFamily: 'Arial',
            fontSize: '7px',
            color: '#fff3cf',
            fontStyle: 'bold',
            stroke: '#21170e',
            strokeThickness: 2
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
        marker.add(this.add.circle(0, 1, 31, color, 0.12));
        marker.add(this.add.ellipse(2, 21, 48, 13, 0x302a22, 0.62));
        marker.add(this.add.circle(0, 2, 26, 0x554d40)
            .setStrokeStyle(2, 0xdbc9a6, 0.7));

        if (structure.kind === 'solar') {
            [-14, 14].forEach((panelX) => {
                marker.add(this.add.rectangle(panelX, 0, 23, 27, 0x183d55)
                    .setStrokeStyle(2, color));
                marker.add(this.add.rectangle(panelX, 0, 18, 22, 0x286783));
                [-5, 0, 5].forEach((lineX) => {
                    marker.add(this.add.line(panelX + lineX, 0, 0, -10, 0, 10, 0x79b8c2, 0.72)
                        .setLineWidth(1));
                });
                marker.add(this.add.line(panelX, 0, -8, 0, 8, 0, 0x9bd5d3, 0.68).setLineWidth(1));
            });
            marker.add(this.add.circle(0, 0, 7, 0x766344).setStrokeStyle(1, color));
            marker.add(this.add.circle(0, 0, 3, 0xf4d778));
            const glint = this.add.ellipse(-14, -10, 7, 3, 0xf7f0c4, 0.86);
            marker.add(glint);
            this.tweens.add({
                targets: glint,
                x: 14,
                duration: 1800,
                repeat: -1,
                delay: 500,
                ease: 'Sine.easeInOut'
            });
        } else if (structure.kind === 'greenhouse') {
            marker.add(this.add.ellipse(0, 0, 48, 33, 0x263e34)
                .setStrokeStyle(2, color));
            marker.add(this.add.ellipse(0, -2, 42, 27, 0x79c79c, 0.5)
                .setStrokeStyle(1, 0xd4f2c3, 0.9));
            [-11, 0, 11].forEach((rowX, index) => {
                marker.add(this.add.line(rowX, 0, 0, -9, 0, 10, 0x315b40, 0.88).setLineWidth(2));
                [-6, 0, 6].forEach((leafY) => {
                    marker.add(this.add.ellipse(rowX + (index % 2 ? 3 : -3), leafY, 8, 4, 0x92e07f)
                        .setStrokeStyle(1, 0xc9f0a2, 0.65)
                        .setAngle(rowX < 0 ? -25 : 25));
                });
            });
            const growLight = this.add.ellipse(0, -2, 35, 3, 0xfff0a2, 0.76);
            marker.add(growLight);
            this.tweens.add({
                targets: growLight,
                alpha: { from: 0.35, to: 0.9 },
                duration: 950,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else if (structure.kind === 'shelter') {
            marker.add(this.add.circle(0, 0, 21, 0x55463c)
                .setStrokeStyle(4, color));
            marker.add(this.add.circle(0, 0, 14, 0x93806a)
                .setStrokeStyle(2, 0xd6c4a4));
            marker.add(this.add.circle(0, 0, 8, 0x403b37)
                .setStrokeStyle(1, 0xffcf9a));
            marker.add(this.add.rectangle(0, 17, 12, 8, 0x3c3530));
            const beacon = this.add.circle(0, -19, 3, 0xffc096);
            marker.add(beacon);
            for (let bolt = 0; bolt < 8; bolt++) {
                const angle = Math.PI * 2 * bolt / 8;
                marker.add(this.add.circle(Math.cos(angle) * 21, Math.sin(angle) * 21, 1.4, 0xf3d7a2));
            }
            this.tweens.add({
                targets: beacon,
                alpha: { from: 0.35, to: 1 },
                scale: { from: 0.8, to: 1.35 },
                duration: 650,
                yoyo: true,
                repeat: -1
            });
        } else if (structure.kind === 'relay') {
            marker.add(this.add.circle(0, 1, 20, 0x566a70)
                .setStrokeStyle(2, color));
            marker.add(this.add.circle(0, 1, 14, 0x89958d)
                .setStrokeStyle(1, 0xe7d8b8));
            marker.add(this.add.circle(0, 1, 7, 0x384750)
                .setStrokeStyle(1, 0x8fe0e0));
            marker.add(this.add.circle(0, 1, 3, 0xf0f6e5));
            marker.add(this.add.line(0, -3, -17, 17, 17, 17, 0xd9e1d7, 0.8).setLineWidth(2));
            const signalSmall = this.add.arc(0, 1, 26, 205, 335, false, color)
                .setStrokeStyle(2, color, 0.9);
            marker.add(signalSmall);
            this.tweens.add({
                targets: signalSmall,
                alpha: { from: 0.4, to: 1 },
                scale: { from: 0.9, to: 1.14 },
                duration: 950,
                yoyo: true,
                repeat: -1
            });
        } else if (structure.kind === 'garage') {
            marker.add(this.add.rectangle(0, 0, 45, 37, 0x75634e)
                .setStrokeStyle(2, color));
            marker.add(this.add.rectangle(0, 0, 36, 28, 0x3d4746)
                .setStrokeStyle(1, 0xd1c4a7));
            marker.add(this.add.line(0, -14, -14, -14, 14, -14, color).setLineWidth(3));
            marker.add(this.add.ellipse(0, 1, 25, 12, 0xbfc4b7)
                .setStrokeStyle(1, 0xf3eedc));
            marker.add(this.add.rectangle(0, 1, 14, 11, 0x4a6975));
            marker.add(this.add.circle(-7, -4, 3, 0x28333a));
            marker.add(this.add.circle(7, -4, 3, 0x28333a));
            marker.add(this.add.circle(-7, 6, 3, 0x28333a));
            marker.add(this.add.circle(7, 6, 3, 0x28333a));
            marker.add(this.add.rectangle(0, 17, 28, 3, color));
        } else if (structure.kind === 'recycler') {
            marker.add(this.add.circle(0, 0, 21, 0x505b5a)
                .setStrokeStyle(2, color));
            marker.add(this.add.circle(0, 0, 15, 0x263a3f)
                .setStrokeStyle(2, 0xb5d5c7));
            const fan = this.add.container(0, 0);
            for (let blade = 0; blade < 4; blade++) {
                const angle = blade * 90;
                fan.add(this.add.ellipse(0, -8, 7, 13, color, 0.88).setAngle(angle));
            }
            fan.add(this.add.circle(0, 0, 4, 0xf0ead8));
            marker.add(fan);
            marker.add(this.add.rectangle(0, 19, 27, 3, color));
            this.tweens.add({
                targets: fan,
                angle: 360,
                duration: 3000,
                repeat: -1
            });
        } else {
            marker.add(this.add.circle(0, 0, 22, 0x788078)
                .setStrokeStyle(2, 0xe4ddca));
            marker.add(this.add.circle(0, -2, 15, 0xe3e0d3)
                .setStrokeStyle(2, color));
            marker.add(this.add.ellipse(0, -5, 23, 18, 0x8cc2c2, 0.72)
                .setStrokeStyle(1, 0xf5f2e7));
            marker.add(this.add.ellipse(2, -8, 11, 8, 0xd2f3dd, 0.55));
            marker.add(this.add.rectangle(0, 17, 12, 8, 0x5e625b));
            marker.add(this.add.circle(0, 11, 3, 0x6fd4c2));
        }

        marker.add(this.add.text(0, 28, option?.title.toUpperCase() ?? 'OUTPOST', {
            fontFamily: 'Arial',
            fontSize: '8px',
            color: '#fff8e6',
            fontStyle: 'bold',
            backgroundColor: '#302a22'
        }).setOrigin(0.5));
        structure.marker = marker;
        this.mapLayer.add(marker);

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
                        const tile = { x, y };
                        if (canPlaceExpansionStructure(tile, this.structures, this.astronaut)) {
                            const center = this.tileCenter(tile);
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
        if (!this.resourceBars || !this.supplyText || !this.statusText || !this.helpText || !this.materialMeterTexts.length) {
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
        this.supplyText.setText(this.phase === 'order'
            ? 'ORDER MATERIALS'
            : this.phase === 'delivery'
                ? 'LANDER INBOUND'
                : this.phase === 'collect'
                    ? `CARGO  ${collected} / ${this.crates.length}`
                    : this.phase === 'hazard'
                ? this.dustEventStatus === 'warning'
                    ? `SOLAR FLARE  ${Math.ceil(this.dustEventTimer)}s`
                    : 'RETURN TO BASE'
                    : `BUILDS  ${built} / ${EXPANSION_BUILD_TARGET}`);
        this.materialMeterTexts.forEach((text, index) => {
            const material = EXPANSION_MATERIALS[index];
            if (material) {
                text.setText(`${material.inventoryLabel} ${this.inventory[material.id]}`);
            }
        });
        this.statusText.setText(this.phase === 'failed'
            ? this.message
            : this.phase === 'complete'
                ? 'Mission complete! Three upgrades are built.'
                : this.message);
        this.statusText.setColor(this.phase === 'failed'
            ? '#ff9b8c'
            : this.phase === 'complete'
                ? '#9beac2'
                : this.phase === 'hazard'
                    ? '#ffd47c'
                : this.oxygen < 25 || this.suitIntegrity < 35
                    ? '#ffd47c'
                    : '#c4d2e3');

        if (this.phase === 'collect') {
            this.helpText.setText(this.repairTimer > 0
                ? 'Patching suit... hold still.'
                : this.serviceCooldown > 0
                    ? `Station ready in ${Math.ceil(this.serviceCooldown)}s`
                    : 'Collect every material crate.');
        } else if (this.phase === 'build') {
            const option = options.find((item) => item.kind === this.selectedBuilding);
            this.helpText.setText(option
                ? `Move and click a tile. Cost: ${option.energyCost} energy.`
                : `Build ${EXPANSION_BUILD_TARGET} upgrades. Move or click to move.`);
        } else if (this.phase === 'order') {
            this.helpText.setText('Order enough materials for 3 upgrades.');
        } else if (this.phase === 'delivery') {
            this.helpText.setText('Cargo lander is descending to the marked pad.');
        } else if (this.phase === 'hazard') {
            this.helpText.setText(this.dustEventStatus === 'warning'
                ? `Reach the outpost in ${Math.ceil(this.dustEventTimer)}s.`
                : 'The flare has passed.');
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
        canvas.dataset.expansionCargoCrates = String(this.crates.length);
        canvas.dataset.expansionOrderCost = String(getExpansionOrderCost(this.order));
        canvas.dataset.expansionOrderCrates = String(getExpansionCargoCrateCount(this.order));
        canvas.dataset.expansionOrderBuildable = String(getExpansionBuildableCount(this.order));
        canvas.dataset.expansionOrderValid = String(this.canConfirmOrder());
        canvas.dataset.expansionInventory = JSON.stringify(this.inventory);
        canvas.dataset.expansionBuilds = String(this.structures.length - 1);
        canvas.dataset.expansionAstronaut = `${this.astronaut.x},${this.astronaut.y}`;
        canvas.dataset.expansionHazard = this.dustEventStatus;
        canvas.dataset.expansionHazardTimer = String(Math.ceil(this.dustEventTimer));
        canvas.dataset.expansionNextFlare = String(
            (this.phase === 'collect' || this.phase === 'build') && this.nextDustEventAt > 0
                ? Math.ceil(Math.max(0, this.nextDustEventAt - Date.now()) / 1000)
                : 0
        );
        if (this.cargoLanderPhase) {
            canvas.dataset.expansionLanderPhase = this.cargoLanderPhase;
        } else {
            delete canvas.dataset.expansionLanderPhase;
        }
        canvas.dataset.expansionSuitIntegrity = String(Math.round(this.suitIntegrity));
        canvas.dataset.expansionRadiationDose = String(Math.round(this.radiationDose));
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
        const title = this.add.text(
            512,
            302,
            won ? 'OUTPOST EXPANDED!' : this.dustEventStatus === 'exposed' ? 'HIGH RADIATION EXPOSURE' : 'TIME TO HEAD BACK',
            {
            fontFamily: 'Arial',
            fontSize: '27px',
            color: won ? '#a4f0c3' : '#ff9b8c',
            fontStyle: 'bold'
            }
        ).setOrigin(0.5).setDepth(42);
        this.hudLayer.add(title);
        const summary = this.add.text(512, 355, won
            ? `${this.structures.slice(1).map((item) => options.find((option) => option.kind === item.kind)?.title).join('  •  ')}\nMission score: ${this.missionScore}  •  Radiation: ${Math.round(this.radiationDose)}%`
            : `${this.message}\nYou collected ${this.crates.filter((crate) => crate.collected).length} material crates.`, {
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
        const recipe = EXPANSION_BUILDING_RECIPES.find(({ kind }) => kind === option.kind);
        if (!recipe) {
            throw new Error(`The ${option.title} material recipe is not available.`);
        }
        if (!canBuildExpansionRecipe(this.inventory, recipe.materials)) {
            this.selectedBuilding = undefined;
            this.message = `Missing materials for the ${option.title.toLowerCase()}: ${this.formatRecipe(recipe.materials)}.`;
            this.buildingCards.forEach(({ frame }) => {
                frame.setFillStyle(0x192a3d);
                frame.setStrokeStyle(1, 0x354c64);
            });
            this.showSelection();
            this.refreshHud();
            return;
        }

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
