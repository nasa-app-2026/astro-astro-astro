import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class SurvivalScene extends ChapterScene {
  constructor() { super(chapters[4]); }

  protected createMission(): void {
    this.add.rectangle(512, 320, 1024, 640, 0x081427).setDepth(100);
  }
}
