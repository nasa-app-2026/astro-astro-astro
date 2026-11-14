import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class FirstLandingScene extends ChapterScene {
  constructor() { super(chapters[2]); }

  protected createMission(): void {
    // Chapter 3 implementation goes here. Keep changes in this file.
  }
}
