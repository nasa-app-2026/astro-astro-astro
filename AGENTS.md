# Repository instructions

Read [skills/mission-trainer/SKILL.md](skills/mission-trainer/SKILL.md) before changing game code.

Keep chapter gameplay in its own file under `src/game/chapters/`. Change shared launcher, catalog, and scene base only when the contract itself must change, so different chapter branches merge cleanly.

Whenever you add or change code, add or update meaningful unit tests and Playwright integration tests that run in Chromium. Run `npm run test` before considering the change complete. Test player-visible behavior and real scene transitions; avoid tests that only repeat implementation text.
