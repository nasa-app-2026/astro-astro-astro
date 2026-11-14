import type { ChapterInfo } from './game/chapters/catalog';

export function missionDirectory(chapters: readonly ChapterInfo[]): readonly { chapter: ChapterInfo; accessibleName: string }[] {
  return chapters.map((chapter) => ({
    chapter,
    accessibleName: `Open mission ${chapter.number}: ${chapter.title}`,
  }));
}
