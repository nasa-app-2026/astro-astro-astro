import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import {
  BUILD_SITE_POSITION,
  collectSupply,
  LANDING_PAD_X,
  LANDING_START,
  LANDING_SURFACE_Y,
  landingOutcome,
  ASTRONAUT_START,
  getAstronautWalkingPose,
  astronautIsAtLander,
  stepLanding,
  stepAstronaut,
  type LandingState,
  type AstronautState,
  type SupplyKind,
} from './firstLanding/rules';

type MissionPhase = 'intro' | 'descent' | 'landed' | 'crash' | 'eva' | 'evaFailed' | 'complete';

interface SupplyCrate {
  readonly x: number;
  readonly y: number;
  readonly kind: SupplyKind;
  readonly object: Phaser.GameObjects.Container;
  collected: boolean;
}

interface AstronautLimbs {
  readonly leftArm: Phaser.GameObjects.Container;
  readonly rightArm: Phaser.GameObjects.Container;
  readonly leftLeg: Phaser.GameObjects.Container;
  readonly rightLeg: Phaser.GameObjects.Container;
}

function getAltitudeMeters(state: LandingState): number {
  return Math.max(0, Math.round((LANDING_SURFACE_Y - state.y - 28) * 0.7));
}

export class FirstLandingScene extends ChapterScene {
  constructor() { super(chapters[2]); }

  private phase: MissionPhase = 'intro';
  private heldKeys = new Set<string>();
  private watchedScenes: Phaser.Scene[] = [];
  private missionUi?: Phaser.GameObjects.Container;
  private lander?: Phaser.GameObjects.Container;
  private landerFlame?: Phaser.GameObjects.Graphics;
  private landerEngine?: Phaser.GameObjects.Graphics;
  private astronaut?: Phaser.GameObjects.Container;
  private astronautLimbs?: AstronautLimbs;
  private astronautWalkPhase = 0;
  private landingState: LandingState = LANDING_START;
  private astronautState: AstronautState = ASTRONAUT_START;
  private crates: SupplyCrate[] = [];
  private fuelLabel?: Phaser.GameObjects.Text;
  private fuelFill?: Phaser.GameObjects.Rectangle;
  private oxygenLabel?: Phaser.GameObjects.Text;
  private oxygenFill?: Phaser.GameObjects.Rectangle;
  private altitudeLabel?: Phaser.GameObjects.Text;
  private descentSpeedLabel?: Phaser.GameObjects.Text;
  private batteryLabel?: Phaser.GameObjects.Text;
  private batteryFill?: Phaser.GameObjects.Rectangle;
  private suppliesLabel?: Phaser.GameObjects.Text;

  protected createMission(): void {
    this.resetMissionState();
    this.missionUi = this.add.container(0, 0);
    this.missionUi.setDepth(1000);
    this.drawLandingSite();
    this.createLander();
    this.input.keyboard?.on('keydown', this.handleKeyDown, this);
    this.input.keyboard?.on('keyup', this.handleKeyUp, this);
    this.input.on('pointerdown', this.handlePointerDown, this);
    window.addEventListener('blur', this.releaseControls);
    this.events.once('shutdown', this.cleanup, this);
    this.watchedScenes = this.game.scene.getScenes(false).filter((scene) => scene !== this);
    this.watchedScenes.forEach((scene) => scene.events.on('start', this.stopWhenAnotherSceneStarts, this));
    this.renderIntro();
  }

  update(_time: number, delta: number): void {
    const activeDeltaSeconds = Math.min(delta, 100) / 1000;
    if (this.phase === 'descent') this.updateLanding(activeDeltaSeconds);
    if (this.phase === 'eva') this.updateAstronaut(activeDeltaSeconds);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    this.heldKeys.add(key);
    if (key === 'arrowup' || key === 'arrowdown' || key === ' ') event.preventDefault();
    if (key !== 'enter' && key !== ' ') return;

    if (this.phase === 'intro') this.startDescent();
    else if (this.phase === 'landed') this.startEVAMission();
    else if (this.phase === 'crash') this.startDescent();
    else if (this.phase === 'evaFailed') this.startEVAMission();
    else if (this.phase === 'complete') this.restartMission();
  }

  private handleKeyUp(event: KeyboardEvent): void {
    this.heldKeys.delete(event.key.toLowerCase());
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    const overButton = pointer.x >= 347 && pointer.x <= 677 && pointer.y >= 520 && pointer.y <= 576;
    if (!overButton) return;

    if (this.phase === 'intro') this.startDescent();
    else if (this.phase === 'landed') this.startEVAMission();
    else if (this.phase === 'crash') this.startDescent();
    else if (this.phase === 'evaFailed') this.startEVAMission();
    else if (this.phase === 'complete') this.restartMission();
  }

  private resetMissionState(): void {
    this.setPhase('intro');
    this.heldKeys.clear();
    this.landingState = { ...LANDING_START };
    this.astronautState = { ...ASTRONAUT_START };
    this.crates = [];
    this.missionUi = undefined;
    this.lander = undefined;
    this.landerFlame = undefined;
    this.landerEngine = undefined;
    this.astronaut = undefined;
    this.astronautLimbs = undefined;
    this.astronautWalkPhase = 0;
    this.fuelLabel = undefined;
    this.fuelFill = undefined;
    this.oxygenLabel = undefined;
    this.oxygenFill = undefined;
    this.altitudeLabel = undefined;
    this.descentSpeedLabel = undefined;
    this.batteryLabel = undefined;
    this.batteryFill = undefined;
    this.suppliesLabel = undefined;
  }

  private setPhase(phase: MissionPhase): void {
    this.phase = phase;
    if (this.game?.canvas) {
      this.game.canvas.dataset.firstLandingPhase = phase;
      if (phase === 'eva' || phase === 'evaFailed' || phase === 'complete') {
        this.game.canvas.dataset.firstLandingCharacter = 'astronaut';
      } else {
        delete this.game.canvas.dataset.firstLandingCharacter;
      }
    }
  }

  private releaseControls = (): void => {
    this.heldKeys.clear();
  };

  private drawLandingSite(): void {
    this.drawEarthBackdrop();
    for (let index = 0; index < 24; index += 1) {
      const x = (index * 173 + 61) % 1000 + 12;
      const y = (index * 71 + 38) % 205 + 260;
      this.add.circle(x, y, index % 4 === 0 ? 2 : 1, 0xe7f3ff, 0.7);
    }

    const terrain = this.add.graphics();
    terrain.fillStyle(0x596573, 1).fillRect(0, LANDING_SURFACE_Y, 1024, 240);
    terrain.fillStyle(0xa6b1bc, 0.8).fillRect(0, LANDING_SURFACE_Y - 3, 1024, 3);
    terrain.fillStyle(0x26374a, 0.6);
    terrain.fillEllipse(270, 382, 110, 22);
    terrain.fillEllipse(490, 386, 72, 15);
    terrain.fillEllipse(945, 380, 125, 20);
    terrain.lineStyle(2, 0xb9c4cc, 0.45);
    terrain.strokeEllipse(270, 382, 110, 22);
    terrain.strokeEllipse(490, 386, 72, 15);
    terrain.strokeEllipse(945, 380, 125, 20);

    this.add.rectangle(LANDING_PAD_X, LANDING_SURFACE_Y - 7, 150, 6, 0x79e6dc, 0.95);
    this.add.triangle(LANDING_PAD_X, LANDING_SURFACE_Y - 22, -9, 8, 9, 8, 0x79e6dc, 1);
    this.add.text(LANDING_PAD_X - 53, LANDING_SURFACE_Y - 39, 'LANDING BEACON', {
      fontFamily: 'Arial', fontSize: '10px', color: '#b8fff6', fontStyle: 'bold',
    });

    this.drawBuildSite();
    this.add.text(68, 267, 'SOUTH POLE • APPROACH CORRIDOR', {
      fontFamily: 'Arial', fontSize: '13px', color: '#9eece3', fontStyle: 'bold',
    });
  }

  private drawEarthBackdrop(): void {
    const x = 810;
    const y = 190;
    this.add.circle(x, y, 152, 0x081427, 1);
    const earth = this.add.container(x, y);
    earth.add(this.add.circle(0, 0, 112, 0x2876ae, 1).setStrokeStyle(3, 0xb4e3fa, 0.9));
    earth.add(this.add.ellipse(-35, -27, 44, 28, 0x6eaf70, 1).setRotation(-0.35));
    earth.add(this.add.ellipse(31, 8, 52, 31, 0x6eaf70, 1).setRotation(0.45));
    earth.add(this.add.ellipse(-5, 53, 25, 13, 0x6eaf70, 1).setRotation(-0.2));
    earth.add(this.add.ellipse(-8, -62, 62, 8, 0xe7f4fb, 0.65).setRotation(-0.15));
    earth.add(this.add.ellipse(24, 43, 69, 7, 0xe7f4fb, 0.55).setRotation(-0.2));
    this.game.canvas.dataset.firstLandingBackground = 'earth';
  }

  private drawBuildSite(): void {
    const { x } = BUILD_SITE_POSITION;
    const groundY = LANDING_SURFACE_Y - 1;
    const site = this.add.graphics();
    site.fillStyle(0x79e6dc, 0.08).fillEllipse(x, groundY, 112, 16);
    site.lineStyle(2, 0x79e6dc, 0.9).strokeEllipse(x, groundY, 112, 16);
    site.lineStyle(1, 0x79e6dc, 0.65)
      .lineBetween(x - 34, groundY - 5, x + 34, groundY - 5)
      .lineBetween(x - 34, groundY + 5, x + 34, groundY + 5);
    this.add.text(x - 37, groundY - 31, 'BUILD SITE', {
      fontFamily: 'Arial', fontSize: '10px', color: '#ffffff', fontStyle: 'bold',
    });
    this.game.canvas.dataset.firstLandingBuildSite = 'empty';
  }

  private createLander(): void {
    const body = this.add.graphics();
    body.fillStyle(0xd8e0e5, 1).fillRect(-24, -27, 48, 42);
    body.lineStyle(2, 0x526d7c, 1).strokeRect(-24, -27, 48, 42);
    body.fillStyle(0x879ba6, 1).fillTriangle(-24, -27, 0, -42, 24, -27);
    body.lineStyle(2, 0xcbd8df, 1).lineBetween(-23, -26, 0, -40).lineBetween(0, -40, 23, -26);
    body.fillStyle(0x56b6ca, 1).fillRect(-12, -20, 24, 13);
    body.lineStyle(1, 0xb9f1f3, 0.9).strokeRect(-12, -20, 24, 13);
    body.fillStyle(0xe4b65e, 1).fillRect(-20, -8, 7, 12);
    body.fillStyle(0xe4b65e, 1).fillRect(13, -8, 7, 12);
    body.fillStyle(0x93a4ad, 1).fillRect(-8, 15, 16, 8);
    body.fillStyle(0x627885, 1).fillRect(-5, 18, 10, 7);
    body.lineStyle(2, 0xe2f2f6, 1);
    body.lineBetween(-23, 12, -37, 32);
    body.lineBetween(-37, 32, -24, 32);
    body.lineBetween(23, 12, 37, 32);
    body.lineBetween(37, 32, 24, 32);
    body.fillStyle(0x3e718c, 1).fillRect(-42, -18, 12, 30);
    body.fillStyle(0x3e718c, 1).fillRect(30, -18, 12, 30);
    body.lineStyle(1, 0xc3e6ee, 0.9);
    body.lineBetween(-36, -16, -36, 10);
    body.lineBetween(36, -16, 36, 10);
    body.lineStyle(1, 0xb4c9d2, 1);
    body.lineBetween(-15, 4, 15, 4);
    body.lineBetween(0, 15, 0, 23);
    body.fillStyle(0xb9c8cf, 1).fillCircle(0, -44, 3);
    body.lineStyle(1, 0xd5e1e6, 1).lineBetween(0, -44, 8, -54);
    body.fillStyle(0x506573, 1).fillEllipse(0, 24, 20, 7);

    this.landerEngine = this.add.graphics();
    this.landerEngine.fillStyle(0x445d6a, 1).fillTriangle(-8, 19, 8, 19, 5, 28);
    this.landerEngine.fillTriangle(-8, 19, 5, 28, -5, 28);

    this.landerFlame = this.add.graphics();
    this.landerFlame.fillStyle(0xffbf5c, 0.9).fillTriangle(-6, 27, 6, 27, 0, 49);
    this.landerFlame.fillStyle(0xfff0a6, 0.95).fillTriangle(-3, 27, 3, 27, 0, 42);
    this.landerFlame.setVisible(false);
    this.lander = this.add.container(LANDING_START.x, LANDING_START.y, [body, this.landerFlame, this.landerEngine]);
  }

  private startDescent(): void {
    this.setPhase('descent');
    this.landingState = { ...LANDING_START };
    this.game.canvas.dataset.firstLandingX = String(this.landingState.x);
    if (this.lander) {
      this.lander.setPosition(this.landingState.x, this.landingState.y);
      this.lander.setVisible(true);
    }
    this.renderLandingHud();
    this.game.canvas.dataset.firstLandingStartAltitudeM = String(getAltitudeMeters(this.landingState));
  }

  private updateLanding(deltaSeconds: number): void {
    const controls = {
      left: this.isDown('arrowleft', 'a'),
      right: this.isDown('arrowright', 'd'),
      thrust: this.isDown('arrowup', 'w'),
    };
    this.landingState = stepLanding(this.landingState, controls, deltaSeconds);
    this.lander?.setPosition(this.landingState.x, this.landingState.y);
    this.landerFlame?.setVisible(controls.thrust && this.landingState.fuel > 0);
    this.game.canvas.dataset.firstLandingX = String(this.landingState.x);
    this.setMeter(this.fuelLabel, this.fuelFill, this.landingState.fuel, 'PROPELLANT', 245);
    this.setMeter(this.oxygenLabel, this.oxygenFill, this.landingState.oxygen, 'CABIN OXYGEN', 245);
    const altitude = getAltitudeMeters(this.landingState);
    const descentSpeed = Math.max(0, Math.round(this.landingState.verticalSpeed * 0.7));
    this.altitudeLabel?.setText(`ALTITUDE  ${altitude} m`);
    this.descentSpeedLabel?.setText(`VERTICAL SPEED  ${descentSpeed} m/s`);
    this.game.canvas.dataset.firstLandingAltitudeM = String(altitude);
    this.game.canvas.dataset.firstLandingDescentSpeed = String(descentSpeed);

    const outcome = landingOutcome(this.landingState);
    if (outcome === 'landed') this.finishLanding(true);
    else if (outcome === 'crash') this.finishLanding(false);
  }

  private finishLanding(safe: boolean): void {
    this.setPhase(safe ? 'landed' : 'crash');
    this.landerFlame?.setVisible(false);
    if (safe) this.lander?.setPosition(this.landingState.x, LANDING_SURFACE_Y - 28);
    this.clearPanel();
    if (safe) {
      this.addPanelHeading('SAFE LANDING • TOUCHDOWN CONFIRMED');
      this.addPanelText(`Lander fuel remaining: ${Math.round(this.landingState.fuel)}%. The astronaut can begin a moonwalk to collect supplies.`);
      this.addPanelNote('A gentle landing keeps the crew and their equipment ready for the surface mission. Press Enter / Space to continue.');
      this.addButton(512, 542, 'START MOONWALK');
    } else {
      this.addPanelHeading('HARD LANDING • MISSION ABORTED');
      this.addPanelText('The lander missed the beacon or touched down too quickly.');
      this.addPanelNote(`Fuel remaining: ${Math.round(this.landingState.fuel)}%. Adjust your steering and use short engine burns. Press Enter / Space to retry.`);
      this.addButton(512, 542, 'RETRY LANDING');
    }
  }

  private startEVAMission(): void {
    this.setPhase('eva');
    this.astronautState = { ...ASTRONAUT_START };
    this.astronautWalkPhase = 0;
    this.game.canvas.dataset.firstLandingWalkPhase = '0';
    this.crates.forEach((crate) => crate.object.destroy());
    this.crates = [];
    this.createAstronaut();
    this.createSupplyCrates();
    this.renderAstronautHud();
  }

  private createAstronaut(): void {
    this.astronaut?.destroy();
    const backpack = this.add.graphics();
    backpack.fillStyle(0x334a5a, 1).fillRoundedRect(-22, -19, 12, 30, 4);
    backpack.fillStyle(0x66b8cf, 1).fillRoundedRect(-20, -17, 8, 10, 3);
    backpack.lineStyle(2, 0xd7e3e7, 1).strokeRoundedRect(-22, -19, 12, 30, 4);

    const createLimb = (x: number, y: number, width: number, height: number, boot = false): Phaser.GameObjects.Container => {
      const art = this.add.graphics();
      art.fillStyle(0xd5dfe2, 1).fillRoundedRect(-width / 2, 0, width, height, 4);
      art.lineStyle(2, 0xffffff, 1).strokeRoundedRect(-width / 2, 0, width, height, 4);
      art.fillStyle(0xb7c9d0, 1).fillRoundedRect(-width / 2, height * 0.45, width, 5, 2);
      if (boot) {
        art.fillStyle(0x344653, 1).fillRoundedRect(-width / 2 - 3, height - 4, width + 6, 7, 3);
      } else {
        art.fillStyle(0xe9eff0, 1).fillCircle(0, height, 5);
      }
      return this.add.container(x, y, [art]);
    };

    const leftLeg = createLimb(-6, 7, 8, 22, true);
    const rightLeg = createLimb(6, 7, 8, 22, true);
    const leftArm = createLimb(-13, -17, 9, 25);
    const rightArm = createLimb(13, -17, 9, 25);

    const astronautArt = this.add.graphics();
    astronautArt.fillStyle(0xe8eff0, 1);
    astronautArt.fillRoundedRect(-11, -20, 22, 34, 8);
    astronautArt.lineStyle(2, 0xffffff, 1).strokeRoundedRect(-11, -20, 22, 34, 8);
    astronautArt.fillStyle(0x566d79, 1);
    astronautArt.fillRoundedRect(-11, 3, 22, 5, 2);
    astronautArt.fillStyle(0x304f60, 1);
    astronautArt.fillRoundedRect(-5, -13, 10, 9, 2);
    astronautArt.lineStyle(1, 0x8dd3df, 1);
    astronautArt.lineBetween(-3, -10, 3, -10);
    astronautArt.lineBetween(0, -12, 0, -6);
    astronautArt.fillStyle(0xe9eff0, 1);
    astronautArt.fillCircle(0, -30, 14);
    astronautArt.lineStyle(2, 0xffffff, 1).strokeCircle(0, -30, 14);
    astronautArt.fillStyle(0x24465b, 1).fillEllipse(4, -30, 18, 19);
    astronautArt.lineStyle(2, 0x8dd3df, 1).strokeEllipse(4, -30, 18, 19);
    astronautArt.lineStyle(2, 0xd6e3e5, 1);
    astronautArt.lineBetween(-11, -23, -8, -19);
    astronautArt.lineBetween(-10, -17, -7, -13);
    astronautArt.lineStyle(3, 0x78b9ca, 1);
    astronautArt.lineBetween(-10, -10, -13, -7);
    astronautArt.lineBetween(-13, -7, -11, 0);
    const oxygenLabel = this.add.text(-18, -12, 'O2', {
      fontFamily: 'Arial', fontSize: '5px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.astronautLimbs = { leftArm, rightArm, leftLeg, rightLeg };
    this.astronaut = this.add.container(this.astronautState.x, this.astronautState.y, [
      backpack, leftLeg, rightLeg, leftArm, rightArm, astronautArt, oxygenLabel,
    ]);
  }

  private createSupplyCrates(): void {
    const locations: readonly { x: number; y: number; kind: SupplyKind }[] = [
      { x: 810, y: 310, kind: 'battery' },
      { x: 670, y: 366, kind: 'oxygen' },
      { x: 535, y: 307, kind: 'battery' },
      { x: 390, y: 368, kind: 'supplies' },
      { x: 255, y: 310, kind: 'oxygen' },
    ];
    this.crates = locations.map(({ x, y, kind }) => {
      const crate = this.add.container(x, y);
      const color = kind === 'oxygen' ? 0x58b8dc : kind === 'battery' ? 0xe7b34e : 0x95c77a;
      crate.add(this.add.circle(0, 0, 18, color, 0.13));
      crate.add(this.add.rectangle(0, 0, 24, 22, color, 1).setStrokeStyle(2, 0xe1edf2));
      crate.add(this.add.rectangle(0, 0, 4, 22, 0x314757, 1));
      crate.add(this.add.rectangle(0, 0, 24, 4, 0x314757, 1));
      return { x, y, kind, object: crate, collected: false };
    });
  }

  private updateAstronaut(deltaSeconds: number): void {
    const controls = {
      left: this.isDown('arrowleft', 'a'),
      right: this.isDown('arrowright', 'd'),
      up: this.isDown('arrowup', 'w'),
      down: this.isDown('arrowdown', 's'),
    };
    const previousPosition = this.astronautState;
    this.astronautState = stepAstronaut(this.astronautState, controls, deltaSeconds);
    const walking = this.astronautState.x !== previousPosition.x || this.astronautState.y !== previousPosition.y;
    this.astronautWalkPhase = walking ? (this.astronautWalkPhase + deltaSeconds * 11) % (Math.PI * 2) : 0;
    const walkingPose = getAstronautWalkingPose(this.astronautWalkPhase, walking);
    this.astronaut?.setPosition(
      this.astronautState.x,
      this.astronautState.y - walkingPose.bob,
    );
    this.astronautLimbs?.leftArm.setRotation(walkingPose.armSwing);
    this.astronautLimbs?.rightArm.setRotation(-walkingPose.armSwing);
    this.astronautLimbs?.leftLeg.setRotation(walkingPose.legSwing);
    this.astronautLimbs?.rightLeg.setRotation(-walkingPose.legSwing);
    this.game.canvas.dataset.firstLandingWalkPhase = String(walkingPose.legSwing);
    if (controls.left || controls.right) this.astronaut?.setScale(controls.left ? -1 : 1, 1);

    for (const crate of this.crates) {
      if (crate.collected || Math.hypot(this.astronautState.x - crate.x, this.astronautState.y - crate.y) > 24) continue;
      crate.collected = true;
      crate.object.destroy();
      this.astronautState = collectSupply(this.astronautState, crate.kind);
    }

    this.setMeter(this.oxygenLabel, this.oxygenFill, this.astronautState.oxygen, 'SUIT OXYGEN', 230);
    this.setMeter(this.batteryLabel, this.batteryFill, this.astronautState.battery, 'SUIT BATTERY', 230);
    this.suppliesLabel?.setText(`SUPPLIES ${this.astronautState.supplies} / 5`);
    this.game.canvas.dataset.firstLandingOxygen = String(this.astronautState.oxygen);
    this.game.canvas.dataset.firstLandingBattery = String(Math.round(this.astronautState.battery));
    this.game.canvas.dataset.firstLandingSupplies = String(this.astronautState.supplies);

    if (this.astronautState.oxygen <= 0 || this.astronautState.battery <= 0) {
      this.setPhase('evaFailed');
      this.renderEVAResult(false);
    } else if (this.astronautState.supplies >= 5 && astronautIsAtLander(this.astronautState)) {
      this.setPhase('complete');
      this.renderEVAResult(true);
    }
  }

  private renderEVAResult(success: boolean): void {
    this.clearPanel();
    this.addPanelHeading(success ? 'ASTRONAUT RETURNED • EVA COMPLETE' : 'EVA ENDED • RESOURCE LIMIT REACHED');
    this.addPanelText(success
      ? 'All five supply crates made it back to the lander. The astronaut can recharge and plan the next moonwalk.'
      : 'Suit oxygen or battery ran out before the astronaut could finish the EVA.');
    this.addPanelNote(`Supplies: ${this.astronautState.supplies} / 5 • Suit oxygen: ${Math.round(this.astronautState.oxygen)}% • Suit battery: ${Math.round(this.astronautState.battery)}%`);
    this.addButton(512, 542, success ? 'REPLAY MISSION' : 'RETRY MOONWALK');
  }

  private restartMission(): void {
    this.setPhase('intro');
    this.landingState = { ...LANDING_START };
    this.astronautState = { ...ASTRONAUT_START };
    this.astronautLimbs = undefined;
    this.astronautWalkPhase = 0;
    this.lander?.setPosition(this.landingState.x, this.landingState.y);
    this.astronaut?.destroy();
    this.astronaut = undefined;
    this.crates.forEach((crate) => crate.object.destroy());
    this.crates = [];
    this.renderIntro();
  }

  private renderLandingHud(): void {
    this.clearPanel();
    this.addPanelHeading('DESCENT TELEMETRY • MANAGE PROPELLANT & CABIN OXYGEN');
    this.fuelLabel = this.addMeter('PROPELLANT', 82, 438, 245, this.landingState.fuel, 0xf0b95c);
    this.oxygenLabel = this.addMeter('CABIN OXYGEN', 374, 438, 245, this.landingState.oxygen, 0x62c5e1);
    this.altitudeLabel = this.add.text(672, 438, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    });
    this.descentSpeedLabel = this.add.text(672, 460, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    });
    this.missionUi?.add([this.altitudeLabel, this.descentSpeedLabel]);
    this.addPanelNote('Steer: left/right or A/D • Engine: up/W • Use short burns; keep a safe touchdown speed.');
    this.addSourceNote('Artemis south-pole mission concept • HUD percentages and flight values are an educational game model.');
  }

  private renderAstronautHud(): void {
    this.clearPanel();
    this.addPanelHeading('ASTRONAUT EVA • RETURN TO THE LANDER');
    this.oxygenLabel = this.addMeter('SUIT OXYGEN', 78, 431, 230, this.astronautState.oxygen, 0x62c5e1);
    this.batteryLabel = this.addMeter('SUIT BATTERY', 397, 431, 230, this.astronautState.battery, 0xf0b95c);
    this.suppliesLabel = this.add.text(720, 432, `SUPPLIES ${this.astronautState.supplies} / 5`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    });
    this.missionUi?.add(this.suppliesLabel);
    this.addPanelNote('Arrows / WASD move • Suit oxygen runs down away from the lander; return there to recharge.');
    this.addSourceNote('Collect oxygen and battery packs, then return to the lander. Resource rates are simplified game values.');
  }

  private addMeter(
    label: string,
    x: number,
    y: number,
    width: number,
    value: number,
    color: number,
  ): Phaser.GameObjects.Text {
    const title = this.add.text(x, y, `${label}  ${Math.round(value)}%`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
    });
    const track = this.add.rectangle(x, y + 22, width, 11, 0x263b50, 1).setOrigin(0, 0.5);
    const fill = this.add.rectangle(x, y + 22, width * value / 100, 7, color, 1).setOrigin(0, 0.5);
    this.missionUi?.add([title, track, fill]);
    if (label === 'PROPELLANT') this.fuelFill = fill;
    if (label.includes('OXYGEN')) this.oxygenFill = fill;
    if (label.includes('BATTERY')) this.batteryFill = fill;
    return title;
  }

  private setMeter(
    label: Phaser.GameObjects.Text | undefined,
    fill: Phaser.GameObjects.Rectangle | undefined,
    value: number,
    name: string,
    width: number,
  ): void {
    label?.setText(`${name}  ${Math.round(value)}%`);
    fill?.setSize(Math.max(0, width * value / 100), 7);
  }

  private renderIntro(): void {
    this.clearPanel();
    this.addPanelHeading('LUNAR LANDING • FLIGHT PLAN');
    this.addPanelText('Touch down gently on the glowing beacon. Steer with left/right and use the engine to control your descent.');
    this.addPanelNote('Arrow keys or WASD • Watch fuel and landing speed • NASA Artemis surface concepts; meters are illustrative.');
    this.addButton(512, 548, 'START DESCENT');
  }

  private clearPanel(): void {
    this.missionUi?.removeAll(true);
    this.fuelLabel = undefined;
    this.fuelFill = undefined;
    this.oxygenLabel = undefined;
    this.oxygenFill = undefined;
    this.batteryLabel = undefined;
    this.batteryFill = undefined;
    this.suppliesLabel = undefined;
    delete this.game.canvas.dataset.firstLandingAltitudeM;
    delete this.game.canvas.dataset.firstLandingStartAltitudeM;
    delete this.game.canvas.dataset.firstLandingDescentSpeed;
    delete this.game.canvas.dataset.firstLandingOxygen;
    delete this.game.canvas.dataset.firstLandingBattery;
    delete this.game.canvas.dataset.firstLandingSupplies;
    this.missionUi?.add(this.add.rectangle(512, 490, 896, 180, 0x102642, 1).setStrokeStyle(2, 0x3a6480));
  }

  private addPanelHeading(text: string): void {
    this.missionUi?.add(this.add.text(82, 412, text, {
      fontFamily: 'Arial', fontSize: '16px', color: '#79e6dc', fontStyle: 'bold',
    }));
  }

  private addPanelText(text: string): void {
    this.missionUi?.add(this.add.text(82, 438, text, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', wordWrap: { width: 850 },
    }));
  }

  private addPanelNote(text: string): void {
    this.missionUi?.add(this.add.text(82, 467, text, {
      fontFamily: 'Arial', fontSize: '12px', color: '#c5d5e0', wordWrap: { width: 850 },
    }));
  }

  private addSourceNote(text: string): void {
    this.missionUi?.add(this.add.text(82, 567, text, {
      fontFamily: 'Arial', fontSize: '10px', color: '#a9becd', wordWrap: { width: 850 },
    }));
  }

  private addButton(x: number, y: number, label: string): void {
    const button = this.add.rectangle(x, y, 330, 42, 0x173b53, 1)
      .setStrokeStyle(2, 0x79e6dc);
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.missionUi?.add([button, text]);
  }

  private isDown(...keys: string[]): boolean {
    return keys.some((key) => this.heldKeys.has(key));
  }

  private stopWhenAnotherSceneStarts(): void {
    this.watchedScenes.forEach((scene) => scene.events.off('start', this.stopWhenAnotherSceneStarts, this));
    this.watchedScenes = [];
    this.scene.stop();
  }

  private cleanup(): void {
    this.watchedScenes.forEach((scene) => scene.events.off('start', this.stopWhenAnotherSceneStarts, this));
    this.watchedScenes = [];
    this.input.keyboard?.off('keydown', this.handleKeyDown, this);
    this.input.keyboard?.off('keyup', this.handleKeyUp, this);
    this.input.off('pointerdown', this.handlePointerDown, this);
    window.removeEventListener('blur', this.releaseControls);
    this.heldKeys.clear();
    delete this.game.canvas.dataset.firstLandingPhase;
    delete this.game.canvas.dataset.firstLandingX;
    delete this.game.canvas.dataset.firstLandingAltitudeM;
    delete this.game.canvas.dataset.firstLandingDescentSpeed;
    delete this.game.canvas.dataset.firstLandingOxygen;
    delete this.game.canvas.dataset.firstLandingBattery;
    delete this.game.canvas.dataset.firstLandingSupplies;
    delete this.game.canvas.dataset.firstLandingCharacter;
    delete this.game.canvas.dataset.firstLandingWalkPhase;
    delete this.game.canvas.dataset.firstLandingBackground;
    delete this.game.canvas.dataset.firstLandingBuildSite;
    this.phase = 'intro';
    this.landingState = { ...LANDING_START };
    this.astronautState = { ...ASTRONAUT_START };
  }
}
