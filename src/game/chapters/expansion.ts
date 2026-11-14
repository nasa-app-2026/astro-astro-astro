import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';

export class ExpansionScene extends ChapterScene {
  constructor() { super(chapters[5]); }

  protected createMission(): void {
    // Chapter 6 implementation goes here. Keep changes in this file.
  }
}
