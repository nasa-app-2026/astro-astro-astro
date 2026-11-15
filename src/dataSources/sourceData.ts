import { allImages, allSounds } from '../../media-ts';
import { chapter5Data } from '../data/chapter5/data-screen';
import { chapters } from '../game/chapters/catalog';
import { GROUP_WORDS, getSource, mediaSourceKey, sources, textSources } from '../facts/sources';
import { NASA_WHY_USED_PLACEHOLDER } from './whyUsedPlaceholders';
import type { DataSourcesInput, LocalMediaKind } from './model';

const imageFiles = Object.keys(import.meta.glob('../../assets/images/**/*'));
const audioFiles = Object.keys(import.meta.glob('../../assets/audio/**/*'));

function localFiles(paths: readonly string[], kind: LocalMediaKind) {
  return paths.map((path) => {
    const pathParts = path.split('/');
    const fileName = pathParts[pathParts.length - 1] ?? path;
    return { id: fileName.replace(/\.[^.]+$/, ''), kind, fileName };
  });
}

const mediaCredits = [...allImages, ...allSounds].map((media) => {
  const sourceKey = mediaSourceKey[media.id];
  return {
    id: media.id,
    credit: media.credit,
    collectionTitle: sourceKey ? getSource(sourceKey)?.title : undefined,
  };
});

export function createDataSourcesInput(): DataSourcesInput {
  return {
    sources,
    chapters,
    textSources,
    chapter5SourceKeys: chapter5Data().sources.map((source) => source.key),
    groupWords: GROUP_WORDS,
    mediaFiles: [...localFiles(imageFiles, 'image'), ...localFiles(audioFiles, 'audio')],
    mediaCredits,
    whyUsedPlaceholder: NASA_WHY_USED_PLACEHOLDER,
  };
}
