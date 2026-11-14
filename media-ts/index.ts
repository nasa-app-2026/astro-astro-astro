import type { SoundAsset, ImageAsset } from './types';

import { sounds1 } from './sounds1';
import { sounds2 } from './sounds2';
import { sounds3 } from './sounds3';
import { sounds4 } from './sounds4';
import { sounds5 } from './sounds5';
import { sounds6 } from './sounds6';
import { images1 } from './images1';
import { images2 } from './images2';
import { images3 } from './images3';
import { images4 } from './images4';
import { images5 } from './images5';
import { images6 } from './images6';

export type { Chapter, MediaStatus, SoundAsset, ImageAsset } from './types';
export { STATUS_WORDS } from './types';

export const sounds = {
  ...sounds1,
  ...sounds2,
  ...sounds3,
  ...sounds4,
  ...sounds5,
  ...sounds6
};

export const images = {
  ...images1,
  ...images2,
  ...images3,
  ...images4,
  ...images5,
  ...images6
};

export const allSounds: readonly SoundAsset[] = Object.values(sounds);
export const allImages: readonly ImageAsset[] = Object.values(images);