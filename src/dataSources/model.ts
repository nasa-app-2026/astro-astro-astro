import type { ChapterInfo } from '../game/chapters/catalog';
import type { Source, SourceGroup, SourceChecked } from '../facts/sources';

export type ChapterFilter = 'all' | number;
export type LocalMediaKind = 'image' | 'audio';

export type ListedSource = Pick<Source, 'key' | 'title' | 'organisation' | 'url' | 'group' | 'checked'>;

export interface LocalMediaFile {
  readonly id: string;
  readonly kind: LocalMediaKind;
  readonly fileName: string;
}

export interface MediaCreditRecord {
  readonly id: string;
  readonly credit: string;
  readonly collectionTitle?: string;
}

export interface DataSourcesInput {
  readonly sources: readonly ListedSource[];
  readonly chapters: readonly Pick<ChapterInfo, 'number' | 'title'>[];
  readonly textSources: Readonly<Record<string, readonly string[]>>;
  readonly chapter5SourceKeys: readonly string[];
  readonly groupWords: Readonly<Record<SourceGroup, string>>;
  readonly mediaFiles: readonly LocalMediaFile[];
  readonly mediaCredits: readonly MediaCreditRecord[];
  readonly whyUsedPlaceholder: string;
}

export type AllSourcesRow =
  | { readonly kind: 'heading'; readonly group: SourceGroup; readonly title: string }
  | { readonly kind: 'source'; readonly source: ListedSource };

export interface CreditedMedia extends LocalMediaFile {
  readonly credit: string;
  readonly collectionTitle: string;
}

export interface DataSourcesPageModel {
  readonly filter: ChapterFilter;
  readonly chapters: readonly Pick<ChapterInfo, 'number' | 'title'>[];
  readonly allSources: readonly ListedSource[];
  readonly allSourcesRows: readonly AllSourcesRow[];
  readonly nasaChallengeSources: readonly (ListedSource & { readonly whyUsed: string; readonly archivedNotLive: boolean })[];
  readonly creditedMedia: readonly CreditedMedia[];
  readonly mediaNeedingCredit: readonly LocalMediaFile[];
}

export function buildDataSourcesModel(input: DataSourcesInput, filter: ChapterFilter = 'all'): DataSourcesPageModel {
  const chapter = typeof filter === 'number'
    ? input.chapters.find((item) => item.number === filter)
    : undefined;
  const allowedKeys = filter === 'all'
    ? undefined
    : new Set([
      ...(chapter ? input.textSources[`chapters.chapter${chapter.number}`] ?? [] : []),
      ...(filter === 5 ? input.chapter5SourceKeys : []),
    ]);

  const seenSourceKeys = new Set<string>();
  const allSources = input.sources.filter((source) => {
    if (allowedKeys && !allowedKeys.has(source.key)) return false;
    if (seenSourceKeys.has(source.key)) return false;
    seenSourceKeys.add(source.key);
    return true;
  });

  const allSourcesRows: AllSourcesRow[] = [];
  let previousGroup: SourceGroup | undefined;
  for (const source of allSources) {
    if (source.group !== previousGroup) {
      allSourcesRows.push({
        kind: 'heading',
        group: source.group,
        title: input.groupWords[source.group],
      });
      previousGroup = source.group;
    }
    allSourcesRows.push({ kind: 'source', source });
  }

  const nasaChallengeSources = allSources
    .filter((source) => source.group === 'nasaChallengeResource')
    .map((source) => ({
      ...source,
      whyUsed: input.whyUsedPlaceholder,
      archivedNotLive: source.key === 'SRC-006',
    }));

  const creditById = new Map(input.mediaCredits.map((credit) => [credit.id, credit]));
  const creditedMedia: CreditedMedia[] = [];
  const mediaNeedingCredit: LocalMediaFile[] = [];
  for (const file of input.mediaFiles) {
    const credit = creditById.get(file.id);
    if (credit?.credit && credit.collectionTitle) {
      creditedMedia.push({ ...file, credit: credit.credit, collectionTitle: credit.collectionTitle });
    } else {
      mediaNeedingCredit.push(file);
    }
  }

  return {
    filter,
    chapters: [...input.chapters].sort((left, right) => left.number - right.number),
    allSources,
    allSourcesRows,
    nasaChallengeSources,
    creditedMedia,
    mediaNeedingCredit,
  };
}

export function isSearchResultOnly(checked: SourceChecked): boolean {
  return checked === 'searchResultOnly';
}
