import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class SurvivalScene extends ChapterScene {
  constructor() { super(chapters[4]); }

  protected createMission(): void {
    // Chapter 5 implementation goes here. Keep changes in this file.
  }
}
