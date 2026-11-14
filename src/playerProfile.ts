/** Shared player choices for the current game session. Chapters can read this module directly. */
export type AgeRange = '7-9' | '10-12';

export type PlayerProfile = Readonly<{
  ageRange: AgeRange | null;
}>;

let profile: PlayerProfile = { ageRange: null };

export function getPlayerProfile(): PlayerProfile {
  return profile;
}

export function setAgeRange(ageRange: AgeRange): void {
  profile = { ...profile, ageRange };
}
