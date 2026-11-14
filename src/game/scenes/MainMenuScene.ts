import { Scene } from 'phaser';

export class MainMenuScene extends Scene {
  constructor() { super('menu'); }

  create(): void {
    this.cameras.main.setBackgroundColor('#081427');
    this.add.circle(820, 360, 240, 0xb5c7d9, 0.9);
    this.add.circle(740, 298, 35, 0x879cb2, 0.34);
    this.add.circle(890, 420, 52, 0x879cb2, 0.27);
    this.add.circle(807, 496, 25, 0x879cb2, 0.28);
    for (let i = 0; i < 34; i += 1) {
      const x = (i * 173 + 41) % 1024;
      const y = (i * 277 + 67) % 640;
      this.add.circle(x, y, i % 5 === 0 ? 2 : 1, 0xdcefff, 0.65);
    }
  }
}
