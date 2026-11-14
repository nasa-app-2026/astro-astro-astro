import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class RobotsScene extends ChapterScene {
  constructor() { super(chapters[1]); }

  protected createMission(): void {
    // Chapter 2 implementation goes here. Keep changes in this file.
  }
}
