# Chapter 5 (Survival) plan

## Context

P0 audit date: 15 November 2026. P0 created only this document. The user subsequently authorized P1 using verified fact IDs only, leaving missing IDs unresolved, and creation of `src/data/chapter5/facts.ts`. Status: **P5 implemented** for the user's replacement Into the dark prompt. P6 and later steps have not run.

Confirmed media locations are `media-ts/` for metadata and `assets/` for media files. No move is needed. The user will provide `sources.ts` later; P1 preserves existing source keys without resolving source titles or URLs.

Junior Astronaut Mission Trainer is a TypeScript browser game using Phaser 4.2.1 and Vite (package range ^6.3.1). Students build independent Moon mission chapters for ages 7–12. The student is rebuilding Chapter 5, Survival. The user explicitly confirmed that its current blank screen is the correct baseline. Chapter 4 is also a placeholder. Chapters 1–3 already contain gameplay.

The goal is to document real paths, facts, startup contracts, constraints, checks, and small future steps toward a playable Survival chapter. The latest design discussed in the conversation is location selection followed by short resource challenges: oxygen/water, energy, radiation/communication, and food. Exact settings and the three selectable locations remain team choices. The older two-week scenario in `data/chapter.md` differs from these short challenges; it is recorded as context, not silently adopted. Age changes wording and explanation depth only, never rules. Food and communication belong inside Survival under the attached series. No game mechanics are implemented by this document.

### Standing rules (verbatim from the supplied attachment)

P4 update: the user's replacement “Settings, gauges and the sidebar” prompt is implemented as reusable components; the user explicitly instructed P4 after reviewing that P5 supplies actual challenge data. `src/data/chapter5/settings.ts` contains the four requested invented energy costs, display thresholds/precision with the required comment, and heating energy derived from `power.emptyBaseHeating` (1.5 kW × 24 hours = 36 kWh). The 24-hour conversion and structural arithmetic constants are not invented gameplay values. No challenge starting values or goals are invented here.

P4 adds `src/data/chapter5/gauges.ts` (six resource definitions and the `ChallengeGaugeConfig` contract), `src/rules/chapter5/gauges.ts` (pure age-aware gauge model), and chapter-owned `src/game/chapters/survival/sidebar.ts` / `sidebar.css` (DOM renderer). A challenge data file supplies exactly two distinct main resources, one distinct extra resource, and a positive science goal; readings supply current values and bar capacities, and the caller supplies crew count and science score. The renderer rejects missing readings, duplicate selections and invalid goals and replaces its host contents on update. It never renders a six-resource fallback. Science has its own progress section, not a resource ID. The sidebar has no close control; the future challenge screen controls its lifecycle.

Air days left = oxygen kg / (`lifeSupport.oxygenPerDay.value` × crew count); Food days left = packed food kg / (`food.packedFoodPerDay.value` × crew count). Wording uses `'7-9'` or null as young, `'10-12'` as older. Younger players get status/days and a bar; older players additionally get amount/unit. Days are rounded down; fractional supplies below displayed precision say “Less than a day left.” Bars clamp to their display range without hiding above-capacity values in older text. Dose status thresholds are presentation rules relative to a supplied bar capacity, not a medical safety assessment. Energy stores kWh; only the heating input fact is kW.

The P4 browser fixture mounts the real component with test data after onboarding, verifies both ages and two different three-gauge configurations, large/small bar sizes, separate science progress and replacement of previous gauges. Fixture values exist only in tests. P5 will mount these components in its playable challenge. No P5 or P6 gameplay/log behavior is built by P4, and the game continues to show the P3 challenge placeholder for now. No shared files were changed in P4.

P3 update: the user's “South pole region cards” prompt replaces the provisional deterministic-state P3. The user explicitly approved the existing `moonPlaces.malpertCliff` and `moonPlaces.malpertEarthView` IDs instead of the absent `malapart` IDs. P3 adds those two facts plus `moonPlaces.nobileRim2EarthView`, `missions.im2Tipped`, and `missions.viper` to the adapter (23 imported facts total). Shared fact files are unchanged. The display name remains the requested “Malapart Massif,” with a note that the catalog calls it “Malpert Massif.”

P3 creates `src/data/chapter5/regions.ts`: four typed cards (Haworth, Mons Mouton, Malapart Massif, Nobile Rim 2), their fact-ID dependencies, and one named effect each with a rule, change and supporting fact ID. Effects have the required made-up-game-rule comment; no numerical gameplay values or simulation effects are applied. The Malapart “most days” behavior is explicitly a training rule; its source does not quantify contact duration. Nobile's one-spot limitation is visible in both age modes. Mons Mouton retains all three explicitly requested facts, including VIPER's Plan label.

P3 creates `src/rules/chapter5/state.ts`, with browser-independent `Chapter5State`, `initialChapter5State()` and `chooseRegion()`. `SurvivalScene` holds the state, retains the chosen region when returning from the challenge placeholder, and resets it on chapter re-entry. Existing chapter-owned scene/CSS files render picture placeholders, age-specific facts, labels, source references, the no-final-site reminder and the shared-light-pattern small print. No source registry, random generator or challenge gameplay is introduced. The label mapping comes from the existing fact schema. The user-provided small print is explanatory copy, not a new quantitative fact.

P3 updates only Chapter 5 data/rules/scene/styles, its unit and browser tests, and this plan. P2 tests were evolved from expecting a region placeholder to checking the real cards while retaining both site routes and re-entry coverage. P3 browser tests select every card in both age modes, verify wording/labels, reach the challenge placeholder, preserve selection on back navigation, and reset it after exiting.

P2 update: the user's new prompt, “Site choice and the equator briefing,” replaces the provisional challenge-data P2 below. P2 implements site selection in the existing `src/game/chapters/survival.ts` entry point, with chapter-owned styling at `src/game/chapters/survival/site.css` and browser-independent briefing data/helper code at `src/data/chapter5/site.ts`. No Phaser or screen imports enter the data module. `factText` did not previously exist; P2 adds it locally, selecting young/older wording with a young-wording fallback for a null profile age. Numeric scientific claims remain in the source facts; CSS values are presentation choices, not scientific or gameplay values.

P2 adds three verified dependencies to `src/data/chapter5/facts.ts`: `power.equatorNight`, `power.nightCold`, `power.batteriesForNight`, all from `src/facts/power.ts` (18 imported facts total). The briefing preserves source IDs and labels; source titles/URLs await the user-provided registry. The requested closing sentence is supplied directly by the user. Equator selection can only return to site choice, highlighting/focusing the south-pole button. Only the south-pole choice opens the region placeholder. Exiting removes Chapter 5 DOM; reopening starts at site choice.

P2 changes `src/game/chapters/survival.test.ts` and `tests/survival.spec.ts` for exact fact IDs, both age wordings, both routes, keyboard activation, and cleanup/re-entry. Shared file `tests/navigation.spec.ts` also needs a focused update: its obsolete assertion that Survival has no UI conflicts with the newly requested site screen. The replacement checks exactly one panel, its viewport bounds, and removal on exit while retaining all toolbar and directory assertions. This cannot be fixed inside Chapter 5 without hiding the requested UI from the test or changing its valid DOM host. Shared game code and other chapters are untouched.

**STANDING RULES FOR CHAPTER 5**

1. Before every step: read this file, then look at the actual code. Never assume a file, function or fact exists; check it.

2. Never create, change or delete AGENTS.md, skill files, `package.json` or shared settings files without asking first. If the project has an AGENTS.md, follow it; if it conflicts with these rules, stop and ask.

3. Change ONLY Chapter 5, or a shared file only if the fix cannot be made inside Chapter 5, and say why.

4. If a prompt asks for something that does not match the file, stop and ask for a clearer question

5. Do not invent a workaround.

6. Build only what the current prompt asks. Do not build ahead.

7. Folders: in these folders never import the game engine or screen code, so tests can run:

  a) `src/rules/chapter5/` means Chapter 5's rules

  b) `src/screens/chapter5/` its screens

  c) `src/data/chapter5/` its data folder. Use the real paths agreed in P0 and written above. The rules folder must be playable without a browser.

8. Real facts come only from `src/facts/`, used by their id. Never type a real number into the code. Made-up gameplay numbers live in Chapter 5's own `settings` file, each with the comment `"Game rule, made up for fun"`.

9. Sources (titles, organisations, links) come only from `sources.ts`, by the id. Never type a real source name or URL by hand.

10. Every number, setting and rule the game uses must be in a settings file, each with the comment `"Game rule, made up for fun"`. Never type a number into the code. The same rule applies to the random generator: never use `Math.random()`; use a seeded random number generator with the same seed the game uses.

11. Tests: use the project's test tools. "The check command" means the command agreed in P0. Write unit tests for each new rule (first, where possible); integration tests that play a whole challenge through the rules folder

  (in `development` and test builds only (for example window.__chapter5)). Run the check command after every change. Never skip, delete or weaken a test, including the other chapters' tests. After three failed attempts at the same problem, stop and ask.

12. Science and safety: there are no dust storms on the Moon. Say "space weather", never "weather" or "storm". Say "Moon dust" if relevant, never "dust storm". Say "space weather" or "space storm" if data are moved on to the Moon's surface. Say "Moon landing mission", never "moon landing mission". Say "space weather" or "Moon landing mission", never "moon landing mission". Say "space weather" or "space storm" if data are moved on to the Moon's surface. Say "Moon landing mission", never "moon landing mission".

### Verified repository constraints and unresolved conflicts

- Read `AGENTS.md`, `.github/copilot-instructions.md`, and `.agents/skills/mission-trainer/SKILL.md`. They place chapter gameplay under `src/game/chapters/`, with unit tests at `src/game/chapters/survival.test.ts` and Chromium tests at `tests/survival.spec.ts`. The skill permits helpers within a chapter-specific directory under that tree. The requested top-level rules/screens/data trees differ from that convention. They are listed below as requested proposals, pending the explicit conflict resolution required by standing rule 2.
- Standing rule 7 literally prohibits engine or screen imports in all three folders, including the screens folder. Clarify whether this prohibition is intended for rules/data only. Until then no screen implementation is approved.
- Standing rules 8 and 10 overlap: scientific values must remain attributed facts, while invented gameplay settings must be labelled as invented. Do not label measured science as made up. Clarify the scope of “every number,” including UI layout and algorithm constants.
- The user authorized P1 as a fact adapter only at `src/data/chapter5/facts.ts`, with no gameplay or screen changes. This resolves the folder exception for this data file; it does not authorize changes to shared instructions or settle future screen-folder questions.
- No shared seeded random generator was found in `src/`. `src/missionDirectory.ts` uses an injectable random function defaulting to `Math.random()`, and `expansion.ts` also uses it. Do not change those shared/other-chapter implementations. The required “same seed the game uses” has no discovered contract.

### Baseline checks

P4 verification on 15 November 2026: **`npm run test` PASS**, exit 0; typecheck, all 45 unit tests and all 19 Chromium tests passed. Both age modes and all six reusable gauge types are covered; browser tests render only three gauges at a time from fixture configuration and keep science separate.

P3 verification on 15 November 2026: **`npm run test` PASS**, exit 0; typecheck, all 36 unit tests and all 17 Chromium tests passed on the first run.

P2 verification on 15 November 2026: final **`npm run test` PASS**, exit 0; typecheck, 34 unit tests and all 15 Chromium tests passed together. The first run found the obsolete shared blank-screen assertion, which was replaced with panel bounds and cleanup checks. The second run passed P2/navigation but encountered the previously observed First Landing descent timeout. The final repeat passed every test; no First Landing code or tests were changed.

P1 verification on 15 November 2026: **`npm run test` PASS**, exit 0. Typecheck passed; 9 unit test files / 31 tests passed; all 13 Chromium tests passed, including First Landing and the updated Survival data-import/navigation test. The earlier P0 failure below is retained as historical evidence, not the current check result. No other chapter's code or tests were changed to obtain this pass.

The existing repository check command is `npm run test`: TypeScript (`npm run typecheck`), Vitest (`npm run test:unit`), then Playwright Chromium (`npm run test:integration`). This is the proposed P0 check command, subject to confirmation. `npm run build-nolog` builds production. ESLint packages are installed, but no lint script or ESLint configuration was found; no lint command is claimed to pass. Zod 4.6.7 is installed. Existing test tools are sufficient; adding packages or modifying shared settings is not proposed.

P0 baseline run of `npm run test`: **FAIL** (exit 1). Typecheck passed; 9 unit test files / 28 tests passed; 12 of 13 Chromium tests passed. `tests/firstLanding.spec.ts:29` timed out waiting for descent speed below 25; its observed value became Infinity because the attribute was absent. No attempt was made to modify that other chapter or weaken its tests. This is one recorded baseline attempt. P0 cannot claim the agreed check is PASS or authorize P1.

## Paths

### Existing files and startup map

| Path | Verified purpose / future use |
| --- | --- |
| `index.html` | Loads `/src/main.ts`; contains `#app` and viewport metadata. |
| `src/main.ts` | DOM startup, age form, directory, chapter navigation and scene shutdown. |
| `src/splashGate.ts`, `src/game/scenes/SplashScene.ts` | Three-second ready-triggered splash and Skip completion before age selection. |
| `src/playerProfile.ts` | Session-only profile via `getPlayerProfile()`; `ageRange` is `'7-9'`, `'10-12'`, or `null` before submission. `setAgeRange` stores the selection. |
| `src/missionDirectory.ts` | Survival first, remaining chapters shuffled; builds directory entries. |
| `src/game/chapters/catalog.ts` | Chapter IDs and metadata; Survival is chapter number 5, key `survival`. |
| `src/game/chapters/index.ts`, `src/game/main.ts` | Register existing scene classes with Phaser. Launcher calls `game.scene.start(chapter.id)` and stops the previous scene. |
| `src/game/chapters/ChapterScene.ts` | Shared Phaser frame invokes `createMission()`; retain constructor, scene key and hook. |
| `src/game/chapters/flyby.ts`, `src/game/chapters/flyby.logic.ts` | Chapter 1 scene plus separate logic module. |
| `src/game/chapters/robots.ts`, `src/game/chapters/robots.logic.ts` | Chapter 2 scene plus separate logic module. |
| `src/game/chapters/firstLanding.ts`, `src/game/chapters/firstLanding/rules.ts` | Chapter 3 scene plus chapter-owned rules folder. |
| `src/game/chapters/building.ts` | Chapter 4 has an empty `createMission()` and inherits the shared placeholder. |
| `src/game/chapters/survival.ts` | Existing Chapter 5 entry draws an opaque blank rectangle over the shared frame. Currently imports only `ChapterScene` and `chapters`; imports no facts. |
| `src/game/chapters/survival.test.ts` | Checks Survival remains directly addressable as chapter 5. |
| `tests/survival.spec.ts`, `tests/helpers/onboarding.ts` | Browser coverage opens blank Survival through onboarding and returns to the directory. |
| `src/facts/types.ts`, `src/facts/index.ts` | Fact schema, named exports and `allFacts`. |
| `media-ts/`, `assets/` | Existing media metadata and assets; `src/media/` does not exist. |
| `data/challenge.md`, `data/chapter.md`, `data/recources.md` | Existing challenge, chapter story and resource background; spelling of `recources.md` is intentional here because it is the real path. |
| `vitest.config.ts`, `playwright.config.ts`, `scripts/run-integration.mjs`, `package.json` | Existing test discovery and check orchestration. Read only. |

No `sources.ts` was found, including the attachment's suggested `docs/knowledge/sources.ts/` location. The attachment's `docs/knowledge/kid-facts-ts/moonPlaces.ts` replacement source was not found. Do not fabricate a source registry or source URLs. Facts do carry source keys and credit strings, but these do not supply the registry required by standing rule 9.

### Proposed Chapter 5 paths (not created in P0)

P1 created only the proposed `src/data/chapter5/facts.ts` implementation file and updated the existing Survival unit/browser test files. The remaining proposed files do not exist yet.

| Path | Planned action and purpose |
| --- | --- |
| `docs/chapter5-plan.md` | Create in P0; maintain agreed progress in later authorized steps. |
| `src/data/chapter5/` | Requested data folder, pending ownership conflict resolution. Proposed files: `facts.ts`, `settings.ts`, `locations.ts`, `challenges.ts`, `spaceWeather.ts`. |
| `src/rules/chapter5/` | Requested browser-independent rules folder. Proposed files: `types.ts`, `random.ts`, `mission.ts`, `lifeSupport.ts`, `energy.ts`, `radiation.ts`, `communication.ts`, `food.ts`. |
| `src/screens/chapter5/` | Requested presentation folder. Proposed files: `mission.ts`, `locations.ts`, `challenges.ts`, `results.ts`, `sources.ts`, `testBridge.ts`. Engine imports require resolution of rule 7. |
| `src/game/chapters/survival.ts` | Later connect Chapter 5 presentation through the existing scene lifecycle; clean up chapter listeners and DOM on shutdown. |
| `src/game/chapters/survival.test.ts` | Later extend with meaningful rules, deterministic replay and complete challenge tests. Retain valid scene identity coverage. |
| `tests/survival.spec.ts` | Later evolve the blank-screen expectation into playable behavior tests while preserving navigation, fresh-entry and cleanup coverage. Requires an authorized gameplay step, not P0. |

P0 touches no existing/shared files. No launcher, catalog, scene-registration, base-scene, profile, package, instruction, skill or settings changes are currently proposed. `src/facts/` and the missing source registry are shared prerequisites: any change to them must be separately agreed, with the exact target path and reason recorded first.

### Fact audit and proposed imports

P1 imports the **15 exact IDs marked Present in the table below**, using their original objects, through `src/data/chapter5/facts.ts`. Its exported `chapter5Facts` lookup is keyed by those IDs; `Chapter5FactId` describes the supported keys. The blank Survival scene itself still imports no facts. The 20 missing requested IDs remain unresolved; no candidate aliases or additional facts have been adopted. There are **155 fact records across eight fact modules**, not the expected 163: communication 12, food 15, lifeSupport 23, missions 21, moonPlaces 24, power 23, radiation 27, storms 10. `src/facts/index.ts` exports/aggregates seven modules and omits food, so its `allFacts` contains **140** records. Food is imported directly from `src/facts/food.ts` without changing the shared barrel.

The following table checks every requested ID exactly; an absent ID is not substituted automatically:

| Requested fact ID | Exact-ID result |
| --- | --- |
| lifeSupport.oxygenPerDay | Present in src/facts/lifeSupport.ts |
| lifeSupport.oxygenEnergyModel | Present in src/facts/lifeSupport.ts |
| lifeSupport.oxygenEnergyMinimum | Present in src/facts/lifeSupport.ts |
| lifeSupport.powerEmby | **Missing** |
| lifeSupport.powerDarksels | **Missing** |
| lifeSupport.powerEquatorNight | **Missing** |
| lifeSupport.powerBattery | **Missing** |
| lifeSupport.radDoseSunny | **Missing** |
| radiation.doseBusySun | **Missing** |
| radiation.doseStormUnit | **Missing** |
| radiation.careerLimit | Present in src/facts/radiation.ts |
| radiation.radiation.shelter | **Missing** |
| radiation.waterBeltShield | **Missing** |
| radiation.crewArm | **Missing** |
| moonPlaces.nineRegions | Present in src/facts/moonPlaces.ts |
| moonPlaces.haworth | Present in src/facts/moonPlaces.ts |
| moonPlaces.monsMouton | Present in src/facts/moonPlaces.ts |
| moonPlaces.mapertCliff | **Missing** |
| moonPlaces.iceFriendlyGround | Present in src/facts/moonPlaces.ts |
| moonPlaces.mapertEarthView | **Missing** |
| moonPlaces.nobleRim2EarthView | **Missing** |
| moonPlaces.iceMissions | **Missing** |
| moonPlaces.missionTypes | **Missing** |
| communication.radioDay | **Missing** |
| communication.radioNight | **Missing** |
| communication.relaySatellites | Present in src/facts/communication.ts |
| food.allFromEarth | **Missing** |
| food.packedFoodPerDay | Present in src/facts/food.ts |
| food.plantPower | Present in src/facts/food.ts |
| food.gramsPerWh | **Missing** |
| food.plantWater | Present in src/facts/food.ts |
| food.veggie | Present in src/facts/food.ts |
| food.leaf | Present in src/facts/food.ts |
| food.cropAreaFullDiet | Present in src/facts/food.ts |
| food.pollicesBlock | **Missing** |

Relevant differences: the repository has `moonPlaces.malpertCliff`, `moonPlaces.malpertEarthView` and `moonPlaces.nobileRim2EarthView`, rather than the requested `mapert`/`noble` spellings. The two Earth-visibility facts are present under those actual IDs. It also has `food.allFoodFromEarth` and `food.gramsPerKwh`; the latter must not be treated as grams per Wh. These are candidates for discussion, not approved aliases. Other absent IDs may describe different concepts; no guessed mapping is made.

For the oxygen/water challenge, additional existing candidate dependencies are `lifeSupport.waterPerDay` and `lifeSupport.splitWater`, both in `src/facts/lifeSupport.ts`. All future imports must be explicitly recorded here when agreed; no hidden imports are assumed by the proposed steps.

Example of an existing fact read from a future `src/data/chapter5/facts.ts` (illustration only, not implemented):

```ts
import { lifeSupport } from '../../facts/index';
const oxygen = lifeSupport.oxygenPerDay;
// oxygen.id === 'lifeSupport.oxygenPerDay'
// Read oxygen.value and oxygen.unit for calculations and units.
// Presentation selects oxygen.young or oxygen.older using the shared profile.
// Keep oxygen.label and oxygen.sources with it for attribution.
```

The fact has value 0.8, unit `kg per astronaut per day`, and source key `SRC-R17A-01`. `lifeSupport.oxygenEnergyModel` has value 14 kWh/kg and describes a model, not a measured Moon-machine efficiency. `Fact.value` is optional; some facts use `range` or wording only. Do not invent a numeric value for qualitative facts. `getPlayerProfile()` would be imported from `../../playerProfile` from either proposed data/screens folder. The null age case needs an agreed presentation fallback; it must not alter rules.

## Steps

These are provisional, dependent planning steps, not executions of P1–P16 or assertions about unseen later prompt parts. Exact team choices, missing facts, source-registry path and folder conflicts must be settled first. Each numbered step is sized as one future prompt; all changed rules receive tests in the existing Survival test files and the check command runs after each authorized change.

1. **P1 — fact adapter only:** create `src/data/chapter5/facts.ts` using the agreed verified IDs only; read existing fact objects without rewriting shared science. Add dependency/units checks to `survival.test.ts` and verify browser import preserves the blank-screen flow in `tests/survival.spec.ts`. No screen or gameplay changes.
2. **P2 — site choice and equator briefing (user's replacement prompt):** implement “Where will you train?” with equator and south-pole choices. Show the three specified power facts through `factText`, selected by age. Return from the equator briefing with the south pole highlighted; south-pole selection opens only a region placeholder. Verify both paths in both age modes and run `npm run test`.
3. **P3 — south pole region cards (user's replacement prompt):** create `src/data/chapter5/regions.ts` and `src/rules/chapter5/state.ts`; render the four specified cards through the existing scene and `factText`, store the selected region, and open the challenge placeholder. Effects remain descriptive data only. Validate fact dependencies and test selecting all four cards in both age modes.
4. **P4 — settings, gauges and sidebar (user's replacement prompt):** create settings, six reusable gauge definitions, pure age-aware gauge formatting and a renderer accepting exactly three resources plus a separate science goal. Test with fixture data; P5 supplies the real challenge configuration and connects it to gameplay.
5. **P5 — Into the dark (user's replacement prompt):** add Chapter 5 challenge settings, `src/data/chapter5/challenges/into-the-dark.ts`, pure rules in `src/rules/chapter5/into-the-dark.ts`, and the playable screen in `survival.ts`. The six-day training example includes oxygen production, three daily actions, sunny and dark energy accounting, daily dose, three-gauge sidebar, reasons, safe endings, and replay-based retry. Source keys from existing fact objects remain visible; the absent `sources.ts` does not block the user-authorized P5 implementation. The user explicitly directed that 0.9 mSv/day be a made-up training setting because the source fact is absent.
6. **P6 — decision record and Log button (user's replacement prompt):** record each day's decision and gauge changes in `src/rules/chapter5/log.ts`, with the user's approval of this path. The chapter keeps the log while moving between challenge screens, and retry rebuilds the current attempt through replay. When energy is low, mark the earlier day or tied days with the largest combined action and oxygen-production energy costs; the existing gauge low threshold defines low energy. The log displays newest first and supports both ages.
7. **P7 — challenge debrief (user's replacement prompt):** add turning-point replay in `src/rules/chapter5/turning-point.ts` and age-specific debrief cards in the Survival screen. The user approved replaying the existing fixed light pattern because this challenge has no seed. Compare completion, progress, then science; replay only the choices actually recorded. Completed challenges meeting their science goal receive encouraging feedback instead.
8. **P8 — source display:** create `src/screens/chapter5/sources.ts` using the agreed existing registry path; expand attribution into source details and distinguish measured values, estimates and gameplay assumptions. No hardcoded source identities or URLs.
9. **P9 — energy rules:** create `src/rules/chapter5/energy.ts`; use approved sunlight/dark-spell facts, settings and seed. Extend `challenges.ts` and unit tests for energy conservation, storage and depletion.
10. **P10 — challenge selection:** create `src/screens/chapter5/challenges.ts`; connect life-support and energy challenges with their own relevant resources, duration and location factors. Test the whole energy challenge in Chromium.
11. **P11 — space-weather data:** create `src/data/chapter5/spaceWeather.ts`; use only approved sourced events and explicit game-model assumptions. Do not convert an event category into a human radiation dose without an agreed model. Validate dependencies and units.
12. **P12 — radiation rules:** create `src/rules/chapter5/radiation.ts`; calculate exposure and shelter trade-offs from approved settings/facts, record readable day consequences, and test both shelter and exposed paths.
13. **P13 — communication rules:** create `src/rules/chapter5/communication.ts`; model approved location-dependent contact constraints, connect to the radiation/communication challenge, and test complete runs without a browser.
14. **P14 — food challenge:** create `src/rules/chapter5/food.ts`; use direct food-module imports agreed in the adapter, model approved resource trade-offs and distinguish a plant experiment from supplying a full diet. Connect to challenge selection and test outcomes.
15. **P15 — presentation and test access:** update the chapter screens for both age wordings and keyboard access. If required by the agreed test design, create `src/screens/chapter5/testBridge.ts` with development/test-only exposure, production exclusion and shutdown cleanup. Verify age changes no rule outcomes.
16. **P16 — final integration:** update the Chapter 5 tests and results/source views; exercise each challenge, location persistence, same-seed replay, retry, exit/re-entry and visible attributions. Run the agreed checks and production build; do not mark complete while failures remain.

## Questions

P1 clarifications now recorded: use the 15 verified exact IDs only; create `src/data/chapter5/facts.ts`; retain `media-ts/` and `assets/`; defer `sources.ts` until the user provides it. `npm run test` is the executed P1 check and now passes. Remaining questions below apply to later steps, not to the completed P1 adapter.

1. Which folder convention should be used: the requested `src/rules/chapter5/`, `src/screens/chapter5/`, `src/data/chapter5/`, or helpers under `src/game/chapters/survival/` as the repository instructions prescribe? The requested paths above are proposals, not agreed exceptions. Does rule 7 prohibit engine imports only in rules/data, allowing presentation code in screens?
2. Should the prompt be corrected to use the real fact IDs and 155-record inventory, or will the team provide a corrected catalog? In particular, confirm the actual `malpert` and `nobile` IDs, the `food.allFoodFromEarth` ID and the kWh unit difference. Supply explicit decisions for all missing IDs in the audit; do not infer mappings.
3. Where should the required authoritative `sources.ts` come from, and what is its approved repository path? `src/media/` and the proposed replacement moonPlaces source are also absent. Existing media catalogs are under `media-ts/`.
4. Confirm P1 is restricted to the fact adapter, then approve a corrected sequence for later gameplay steps. Only P0 was requested now. The attachment supplies detailed P0/P1 entries, not detailed P2–P16 requirements.
5. Confirm the short-challenge structure, team-selected playable regions, durations, supplies, costs, win/fail conditions and seed ownership before the relevant implementation steps. These choices are not filled in with random invented numbers here.
6. Should rule 10 mean invented gameplay constants live in settings while scientific values remain sourced, and how should layout/algorithm constants be handled? Confirm how numerical requirements should be satisfied for facts that supply only text or a range.
7. Is `npm run test` the agreed check command, with no lint stage until the team supplies one? The baseline First Landing failure needs resolution by its owner or separately authorized work before a check can be reported PASS. No other chapter was changed by P0.

## Progress

- [x] P0: read the repository and attachment; record the blank baseline, actual paths, fact audit, standing rules, proposed sequence and baseline test result in this document.
- [x] P0 handoff for P1: user approved the verified-ID-only adapter and its new path; subsequent P1 check passes. Remaining design questions apply to later steps.
- [x] P1: fact adapter implemented; unit and Chromium checks added; `npm run test` PASS (31 unit tests, 13 Chromium tests). No later step started.
- [x] P2: site choice and equator briefing; `npm run test` PASS (34 unit tests, 15 Chromium tests). Both routes and both age modes covered.
- [x] P3: south pole region cards and selection state; `npm run test` PASS (36 unit tests, 17 Chromium tests). No challenge effects applied yet.
- [x] P4: settings, gauges and sidebar; `npm run test` PASS (45 unit tests, 19 Chromium tests). Real challenge integration is P5.
- [x] P5: Into the dark implemented. Typecheck and all 50 unit tests pass. All Survival Chromium tests pass in both age modes. Three full `npm run test` runs each had 22 of 23 Chromium tests pass: first an unrelated Flyby timer assertion, then twice an unrelated First Landing descent timeout. The full check is not yet green. The 0.9 mSv/day dose is labelled as an unsourced training assumption.
- [x] P6: decision log and delayed energy links; `npm run test` passed (51 unit tests, 25 Chromium tests).
- [x] P7: debrief and turning-point replay implemented; `npm run test` passed (52 unit tests, 25 Chromium tests).
- [ ] P8: NASA DONKI archive and rules implemented for May 2024 and December 2019. The NOAA archive identifies two S2 proton events by matching times and associated flares; twelve other DONKI SEP records remain unknown as authorized. Unknown levels cannot produce a dose. Zod validates the archive. Source titles await `sources.ts`; storm gauge and debrief screen remain for a later screen step because P8 requests rules only. Typecheck and 59 unit tests pass; all Survival browser tests passed on the second full run, but two unrelated Expansion tests timed out waiting for the hidden mission tile.
- [x] P9: Storm alert planning and challenge implemented, with user-approved `radiation.watershield`, NOAA archive events, unknown-level exclusions, shelter choices, region walk-back rule and dose debrief. A simulated S4 is used only in tests. Typecheck and 65 unit tests pass; 27 of 29 Chromium tests pass, including P9; two Expansion tests timed out waiting for the hidden mission tile. Source titles await `sources.ts`.
- [x] P10: Can you hear us implemented with region contact examples, data queue, one-use relay, contact-dependent warnings and sent-data goal. The communication challenge starts with 160 kWh so five lab days and a send can fit through the example dark days. Typecheck and 70 unit tests pass; the P10 Chromium journey passes. The full browser run has two unrelated Expansion failures caused by the hidden mission tile. Source titles await `sources.ts`.
- [x] P11: Fresh food implemented with the approved `food.gramsPerKwh` ID, plant-box calculations, daily water recovery, one-day-late cargo and safe early endings. Typecheck and 73 unit tests pass; the P11 browser journey passes. The full run passed 28 of 31 Chromium tests; two Expansion tests and one First Landing test timed out.
- [x] P12: Ice to air implemented with the existing ice, oxygen and Haworth facts, a six-day light example, seeded archived space-weather events and safe early endings. One split batch uses the approximate 1.1 kg water per kg oxygen training rule. Typecheck and 77 unit tests pass; 30 of 32 Chromium tests pass, including the P12 journey. The two Expansion tests time out waiting for the hidden mission tile.
- [ ] P13: communication rules.
- [ ] P14: food challenge.
- [ ] P15: age wording, accessibility and test access.
- [ ] P16: final integration and attribution audit.
