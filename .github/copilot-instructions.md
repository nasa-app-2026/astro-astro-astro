# Junior Astronaut Mission Trainer

This is a Phaser 4 and TypeScript browser game. Read `AGENTS.md` and `.agents/skills/mission-trainer/SKILL.md` before changing game code. The game brief is in `data/challenge.md`, with chapter plans in `data/chapter.md` and resource notes in `data/recources.md`.

Keep each mission's gameplay in its own `src/game/chapters/<id>.ts` file. Only change the shared launcher, catalog, or scene base when their contract needs to change. Keep all seven chapters directly selectable.

For every code change, add or update meaningful unit tests and Playwright integration tests using Chromium. Run `npm run test` and resolve failures. Test player-visible behavior and actual scene transitions.
