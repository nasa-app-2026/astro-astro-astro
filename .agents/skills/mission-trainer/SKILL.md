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

## Chapter ownership

The seven chapter scenes are already registered. A teammate owns one existing file and its matching test files:

| Mission | Scene file | Scene key |
| --- | --- | --- |
| Flyby test | `src/game/chapters/flyby.ts` | `flyby` |
| Robots go first | `src/game/chapters/robots.ts` | `robots` |
| First landing | `src/game/chapters/firstLanding.ts` | `firstLanding` |
| Building the outpost | `src/game/chapters/building.ts` | `building` |
| Survival | `src/game/chapters/survival.ts` | `survival` |
| Expansion | `src/game/chapters/expansion.ts` | `expansion` |
| Sustainability | `src/game/chapters/sustainability.ts` | `sustainability` |

Implement the assigned mission by filling in that file's `createMission()` method. Its constructor already passes the chapter metadata to `ChapterScene`, and the shared base calls `createMission()` after drawing the scene frame. The base currently draws a placeholder panel; chapter objects added in `createMission()` appear above it. If that panel obstructs the mission design, coordinate a shared frame change instead of editing `ChapterScene.ts` in the chapter branch. Use Phaser scene APIs through `this` for game objects, input, time, and scene events. Keep mission state, choices, scoring, and event handlers within the owned chapter module or new files under a chapter-specific folder such as `src/game/chapters/flyby/`. Clean up any browser listeners or external subscriptions when the scene shuts down. Keep the existing constructor, scene key, and `createMission()` hook so the launcher continues to work.

Use `data/chapter.md` for that mission's story and decisions, `data/recources.md` for resource behavior, and `data/challenge.md` for audience and learning goals. The `facts/` and `media-ts/` catalogs are source material; import what is useful, with attribution visible to players when using real data. Put new mission-only assets under `assets/chapters/<id>/` so asset changes also stay separate.

## Merge-safe boundaries

For ordinary chapter work, edit only the owned chapter file, new files in its chapter-specific folder, its assets, `src/game/chapters/<id>.test.ts`, and `tests/<id>.spec.ts`. Do not edit another chapter's files.

Do not change `src/main.ts`, `src/game/main.ts`, `src/game/scenes/MainMenuScene.ts`, `src/game/chapters/index.ts`, `src/game/chapters/catalog.ts`, `src/game/chapters/ChapterScene.ts`, or shared build and test configuration in a chapter branch. Those files define the launcher and scene contract used by every teammate. If a chapter needs a new shared API, explain the need to the team and make a separate coordinated change before depending on it. Do not work around the boundary by copying shared code into a chapter.

Keep chapter tests in chapter-specific files. Unit tests should cover decision rules and resource changes. Playwright tests should launch the game in Chromium, open the chapter from the directory, make representative player choices, verify visible consequences, and return to the directory. Keep all chapters selectable without completing earlier ones. Run `npm run test` before merging; `npm run build-nolog` checks the production bundle.
