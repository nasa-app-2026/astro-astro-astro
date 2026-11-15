import type { ChapterInfo } from './game/chapters/catalog';

export function missionDirectory(chapters: readonly ChapterInfo[], random = Math.random): readonly { chapter: ChapterInfo; accessibleName: string }[] {
  const survival = chapters.find((chapter) => chapter.id === 'survival');
  const others = chapters.filter((chapter) => chapter.id !== 'survival');
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return [...(survival ? [survival] : []), ...others].map((chapter) => ({
    chapter,
    accessibleName: `Open ${chapter.title}`,
  }));
}
