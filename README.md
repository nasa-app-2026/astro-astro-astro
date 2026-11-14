# Junior Astronaut Mission Trainer

A browser-based Phaser 4 and TypeScript game about the choices involved in building a Moon outpost. The current milestone provides an open mission directory and seven independent chapter workspaces. Gameplay for each chapter is ready for the team to implement.

## Run

```sh
npm install
npm run dev-nolog
```

Open `http://localhost:8080`. `npm run build-nolog` creates the production bundle in `dist/`.

## Project map

- `data/challenge.md` — challenge requirements.
- `data/chapter.md` — seven mission outlines across five stages.
- `data/recources.md` — resource and decision design notes.
- `facts/` — sourced lunar and mission facts, available for future gameplay.
- `media-ts/` and `assets/` — media catalog and local source files.
- `src/main.ts` — browser shell, mission directory, and navigation.
- `src/game/main.ts` — Phaser game configuration and scene registration.
- `src/game/scenes/MainMenuScene.ts` — menu background scene.
- `src/game/chapters/catalog.ts` — chapter titles, stages, focus areas, and summaries.
- `src/game/chapters/ChapterScene.ts` — shared chapter frame and `createMission()` hook.
- `src/game/chapters/<id>.ts` — one independent scene file per chapter.

The directory always offers all seven chapters. Each chapter file owns its gameplay through `createMission()`. Teammates should avoid editing shared files unless they need to change the chapter contract; this keeps separate chapter branches easy to merge.

## Tests

`npm run test` runs the TypeScript check, Vitest unit tests, and Playwright integration tests in Chromium. The browser suite opens every chapter directly, returns to the directory, and checks keyboard access at a narrow viewport. See [AGENTS.md](AGENTS.md) and [the project skill](.agents/skills/mission-trainer/SKILL.md) for the testing requirement on future code changes.
