---
name: mission-trainer
description: Develop the Junior Astronaut Mission Trainer Phaser game, including independent chapter modules and Chromium browser tests.
---

# Mission Trainer development

Use this skill for code changes in this repository.

- Build against the challenge in `data/challenge.md`, the seven missions in `data/chapter.md`, and the resource decisions in `data/recources.md`.
- Keep each mission's gameplay inside its own `src/game/chapters/<id>.ts` file. The shared `catalog.ts`, `ChapterScene.ts`, and launcher provide the stable contract between branches. Edit those shared files only when the contract needs to change.
- All seven missions must remain directly selectable from the main screen, without unlock requirements.
- Every code addition or change requires meaningful unit tests and Playwright integration tests using Chromium. Cover the resulting player behavior and scene transitions, including keyboard access where relevant.
- Run `npm run test` (type check, Vitest, Playwright Chromium) and fix failures before finishing. Use `npm run build-nolog` when checking the production bundle.
