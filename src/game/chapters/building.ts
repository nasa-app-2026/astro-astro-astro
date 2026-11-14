import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class BuildingScene extends ChapterScene {
  constructor() { super(chapters[3]); }

  protected createMission(): void {
    // Chapter 4 implementation goes here. Keep changes in this file.
  }
}
