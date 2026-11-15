import { Scene } from 'phaser';
import moonUrl from '../../../assets/images/earthset-artemis2.jpg?url';
import astronautUrl from '../../../assets/images/apollo11-moonwalker.jpg?url';

export class SplashScene extends Scene {
  constructor(private readonly onReady: () => void) {
    super('splash');
  }

  preload(): void {
    this.load.image('splash-moon', moonUrl);
    this.load.image('splash-astronaut', astronautUrl);
  }

  create(): void {
    const portrait = window.innerWidth / window.innerHeight < 0.8;
    const moon = this.add.image(512, 320, 'splash-moon');
    const photo = this.textures.get('splash-moon').getSourceImage();
    const baseScale = Math.max(1024 / photo.width, 640 / photo.height) * 1.04;
    moon.setScale(baseScale).setAlpha(0);
    this.tweens.add({ targets: moon, alpha: 1, duration: 500, ease: 'Sine.Out' });
    this.tweens.add({ targets: moon, scale: baseScale * 1.07, duration: 3000, ease: 'Sine.InOut' });

    this.add.rectangle(512, 320, 1024, 640, 0x06111f, 0.45);
    this.add.rectangle(512, 318, 1024, 360, 0x06111f, 0.24);
    this.add.rectangle(512, 621, 1024, 38, 0x06111f, 0.75);

    const frame = this.add.rectangle(portrait ? 512 : 841, portrait ? 495 : 341, portrait ? 196 : 284, portrait ? 196 : 284, 0x8bdcd9, 0.9).setAlpha(0);
    const astronaut = this.add.image(portrait ? 512 : 841, portrait ? 495 : 341, 'splash-astronaut').setDisplaySize(portrait ? 184 : 272, portrait ? 184 : 272).setAlpha(0);
    this.tweens.add({ targets: [frame, astronaut], alpha: 1, y: '-=14', duration: 800, delay: 350, ease: 'Sine.Out' });

    const common = { fontFamily: '"Trebuchet MS", "Arial Rounded MT Bold", Arial, sans-serif', fontStyle: 'bold', color: '#ffffff', stroke: '#123045', strokeThickness: 8, shadow: { offsetX: 0, offsetY: 5, color: '#000000', blur: 16, fill: true } };
    const titleX = portrait ? 512 : 74;
    const junior = this.add.text(-640, portrait ? 168 : 194, 'Junior', { ...common, fontSize: portrait ? '54px' : '74px' });
    const astronautTitle = this.add.text(1100, portrait ? 235 : 270, 'Astronaut', { ...common, fontSize: portrait ? '54px' : '76px', color: '#d6fff4' });
    const mission = this.add.text(-750, portrait ? 304 : 353, 'Mission Trainer', { ...common, fontSize: portrait ? '37px' : '57px' });
    if (portrait) [junior, astronautTitle, mission].forEach((title) => title.setOrigin(0.5, 0));
    this.tweens.add({ targets: junior, x: titleX, duration: 850, delay: 430, ease: 'Back.Out' });
    this.tweens.add({ targets: astronautTitle, x: titleX, duration: 900, delay: 540, ease: 'Back.Out' });
    this.tweens.add({ targets: mission, x: titleX, duration: 900, delay: 650, ease: 'Back.Out' });

    const tagline = this.add.text(portrait ? 512 : 78, portrait ? 380 : 450, 'Explore.  Decide.  Survive.  Grow.', { fontFamily: '"Trebuchet MS", Arial, sans-serif', fontSize: portrait ? '17px' : '25px', color: '#d9f9ff', shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 8, fill: true } }).setAlpha(0);
    if (portrait) tagline.setOrigin(0.5, 0);
    this.tweens.add({ targets: tagline, alpha: 1, y: portrait ? 370 : 438, duration: 550, delay: 1450, ease: 'Sine.Out' });
    const credit = this.add.text(portrait ? 512 : 22, 610, 'PHOTOS: NASA / ARTEMIS II CREW · NASA / APOLLO 11', { fontFamily: 'Arial, sans-serif', fontSize: portrait ? '7px' : '11px', color: '#d5e5ed' });
    if (portrait) credit.setOrigin(0.5, 0);

    this.onReady();
  }
}
