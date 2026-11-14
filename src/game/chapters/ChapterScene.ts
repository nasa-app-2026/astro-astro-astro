import { Scene } from 'phaser';
import type { ChapterInfo } from './catalog';

/** Shared frame only. Mission logic belongs in each chapter's own file. */
export abstract class ChapterScene extends Scene {
  protected constructor(protected readonly chapter: ChapterInfo) {
    super(chapter.id);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#081427');
    this.add.circle(810, 190, 148, 0xb5c7d9, 0.92);
    this.add.circle(770, 157, 25, 0x879cb2, 0.36);
    this.add.circle(857, 218, 39, 0x879cb2, 0.31);
    this.add.text(64, 72, `MISSION ${String(this.chapter.number).padStart(2, '0')}`, { fontFamily: 'Arial', fontSize: '24px', color: '#79e6dc' });
    this.add.text(64, 119, this.chapter.title, { fontFamily: 'Arial', fontSize: '48px', color: '#ffffff', fontStyle: 'bold' });
    this.add.text(64, 206, this.chapter.summary, { fontFamily: 'Arial', fontSize: '24px', color: '#d4e3f4', wordWrap: { width: 540 } });
    this.add.rectangle(512, 490, 896, 180, 0x102642, 0.95).setStrokeStyle(2, 0x3a6480);
    this.add.text(92, 432, 'MISSION MODULE', { fontFamily: 'Arial', fontSize: '18px', color: '#79e6dc', fontStyle: 'bold' });
    this.add.text(92, 475, 'Chapter workspace ready. Your team can build the mission here.', { fontFamily: 'Arial', fontSize: '22px', color: '#ffffff', wordWrap: { width: 840 } });
    this.createMission();
  }

  /** Override in the chapter file to add gameplay, events, and cleanup. */
  protected abstract createMission(): void;
}
