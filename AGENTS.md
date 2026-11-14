# Repository instructions

Read [.agents/skills/mission-trainer/SKILL.md](.agents/skills/mission-trainer/SKILL.md) before changing game code.

Keep chapter gameplay in its own file under `src/game/chapters/`. Change shared launcher, catalog, and scene base only when the contract itself must change, so different chapter branches merge cleanly.

For a chapter assignment, use the ownership table and contribution steps in the project skill. Place chapter-specific unit tests in `src/game/chapters/<id>.test.ts` and Chromium integration tests in `tests/<id>.spec.ts`. Coordinate any shared contract change separately before depending on it.

Whenever you add or change code, add or update meaningful unit tests and Playwright integration tests that run in Chromium. Run `npm run test` before considering the change complete. Test player-visible behavior and real scene transitions; avoid tests that only repeat implementation text.
