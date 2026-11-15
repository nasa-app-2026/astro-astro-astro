export type Chapter = 
  | 'common' 
  | 'flyby' 
  | 'robots' 
  | 'firstLanding' 
  | 'building' 
  | 'survival' 
  | 'expansion' 
;

export type MediaStatus = 
  | 'checked' 
  | 'adultAccount' 
  | 'notChecked' 
  | 'lookFirst' 
  | 'makeIt';

export const STATUS_WORDS: Record<MediaStatus, string> = {
  checked: '✅ Checked (link or licence)',
  adultAccount: '🔒 Adult downloads it',
  notChecked: '⚠️ Licence not checked yet',
  lookFirst: '👀 Look first: logo or person?',
  makeIt: '🛠️ Make it yourselves'
};

interface MediaAsset {
  id: string;
  chapters: readonly Chapter[];
  download: string;
  directUrl?: string;
  page?: string;
  source: string;
  licence: string;
  status: readonly MediaStatus[];
  statusNote: string;
  useFor: string;
  tags: readonly string[];
  credit: string;
  notes?: string;
}

export interface SoundAsset extends MediaAsset {
  localURL?: string;
  soundsLike: string;
  loop: string;
  length: string;
  caption?: string;
}

export interface ImageAsset extends MediaAsset {
  localImageURL?: string;
  shows: string;
  alt: string;
  size: string;
  original?: string;
  originalUrl?: string;
  facts?: readonly string[];
}