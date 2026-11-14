import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class FlybyScene extends ChapterScene {
  constructor() { super(chapters[0]); }

  protected createMission(): void {
    // Chapter 1 implementation goes here. Keep changes in this file.
  }
}
