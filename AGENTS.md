# Repository instructions

Read [.agents/skills/mission-trainer/SKILL.md](.agents/skills/mission-trainer/SKILL.md) before changing game code.

Keep chapter gameplay in its own file under `src/game/chapters/`. Change shared launcher, catalog, and scene base only when the contract itself must change, so different chapter branches merge cleanly.

For a chapter assignment, use the ownership table and contribution steps in the project skill. Place chapter-specific unit tests in `src/game/chapters/<id>.test.ts` and Chromium integration tests in `tests/<id>.spec.ts`. Coordinate any shared contract change separately before depending on it.

Whenever you add or change code, add or update meaningful unit tests and Playwright integration tests that run in Chromium. Run `npm run test` before considering the change complete. Test player-visible behavior and real scene transitions; avoid tests that only repeat implementation text.

## Player inputs

The splash screen leads to an age selection screen before the mission directory. Player inputs for the current game session live in `src/playerProfile.ts`. A chapter that needs the selected age imports `getPlayerProfile()` and reads `getPlayerProfile().ageRange`, which is `'7-9'` or `'10-12'` after onboarding. The value is `null` until the player submits the age screen; handle that case if code can run earlier. When adding another player input later, extend `PlayerProfile` and its setter in that module, then collect it in the shared onboarding flow in `src/main.ts`. Keep chapter-specific copies of player inputs out of individual scene modules.
