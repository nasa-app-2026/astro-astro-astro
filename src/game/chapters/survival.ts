import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import { getPlayerProfile } from '../../playerProfile';
import { equatorBriefing, factText } from '../../data/chapter5/site';
import { chapter5Facts, type Chapter5FactId } from '../../data/chapter5/facts';
import { chapter5Data } from '../../data/chapter5/data-screen';
import { GROUP_WORDS } from '../../facts/sources';
import { regions } from '../../data/chapter5/regions';
import { initialChapter5State, chooseRegion, type Chapter5State } from '../../rules/chapter5/state';
import { LABEL_WORDS } from '../../facts/types';
import { intoTheDark } from '../../data/chapter5/challenges/into-the-dark';
import { advanceIntoTheDark, isDark, replayToMorning, startIntoTheDark } from '../../rules/chapter5/into-the-dark';
import { renderSidebar } from './survival/sidebar';
import type { DecisionLogEntry } from '../../rules/chapter5/log';
import { findTurningPoint } from '../../rules/chapter5/turning-point';
import { stormAlert } from '../../data/chapter5/challenges/storm-alert';
import { advanceStormAlert, prediction, startStormAlert, type Cargo, type Sun, type StormAction } from '../../rules/chapter5/storm-alert';
import { settings } from '../../data/chapter5/settings';
import { archiveLabel } from '../../rules/chapter5/storms';
import { stormArchive } from '../../data/chapter5/storms';
import { canYouHearUs, contactDays } from '../../data/chapter5/challenges/can-you-hear-us';
import { advanceContact, contactWarning, startContact, type ContactAction } from '../../rules/chapter5/can-you-hear-us';
import { freshFood } from '../../data/chapter5/challenges/fresh-food';
import { advanceFreshFood, startFreshFood, type FoodAction } from '../../rules/chapter5/fresh-food';
import { iceToAir } from '../../data/chapter5/challenges/ice-to-air';
import { advanceIceToAir, startIceToAir, type IceAction } from '../../rules/chapter5/ice-to-air';
import { trainingOrder, trainingStorageKey, initialTrainingProgress, finishChallenge, nextChallenge, bigConnections, type TrainingEntry, type TrainingChallenge, type TrainingProgress } from '../../rules/chapter5/training';
import { bestTrainingChange, type TrainingAttempt, type TrainingChoice } from '../../rules/chapter5/training-replay';
import { alternatives, replayAttempt } from '../../rules/chapter5/what-if';
import { gaugeModel } from '../../rules/chapter5/gauges';
import type { ResourceId } from '../../data/chapter5/gauges';
import './survival/site.css';
import equatorImageUrl from '../../../assets/images/apollo11-moonwalker.jpg?url';
import southPoleMosaicUrl from '../../../assets/images/south-pole-mosaic.jpg?url';

export class SurvivalScene extends ChapterScene {
  private state: Chapter5State = initialChapter5State();
  constructor() { super(chapters[4]); }

  protected createMission(): void {
    this.state = initialChapter5State();
    this.add.rectangle(512, 320, 1024, 640, 0x081427).setDepth(100);
    const host = document.querySelector<HTMLElement>('#chapter-view');
    if (!host) throw new Error('Missing chapter view');
    const panel = document.createElement('section');
    panel.id = 'survival-site';
    panel.className = 'survival-panel';
    panel.setAttribute('aria-labelledby', 'survival-heading');
    host.append(panel);
    this.events.once('shutdown', () => panel.remove());

    const heading = (title: string) => {
      panel.replaceChildren();
      panel.classList.remove('survival-equator-briefing');
      const titleElement = document.createElement('h1');
      titleElement.id = 'survival-heading';
      titleElement.tabIndex = -1;
      titleElement.textContent = title;
      panel.append(titleElement);
      titleElement.focus();
    };
    const paragraph = (text: string) => {
      const element = document.createElement('p');
      element.textContent = text;
      panel.append(element);
    };
    const button = (title: string, action: () => void, parent: HTMLElement = panel) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.textContent = title;
      element.addEventListener('click', action);
      parent.append(element);
      return element;
    };
    const factElement = (id: Chapter5FactId) => {
      const item = document.createElement('div');
      item.className = 'survival-region-fact';
      item.dataset.factId = id;
      const label = document.createElement('strong');
      label.textContent = LABEL_WORDS[chapter5Facts[id].label];
      const text = document.createElement('p');
      text.textContent = factText(id, getPlayerProfile().ageRange);
      const sources = document.createElement('small');
      sources.textContent = `Source references: ${chapter5Facts[id].sources.join(', ')}`;
      item.append(label, text, sources);
      return item;
    };
    let progress: TrainingProgress = initialTrainingProgress();
    let entries: TrainingEntry[] = [];
    let attempts: TrainingAttempt[] = [];
    try {
      const saved = localStorage.getItem(trainingStorageKey);
      if (saved === 'complete') progress = { completed: [...trainingOrder], finished: true };
      else if (saved) {
        const parsed: unknown = JSON.parse(saved);
        const record = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as { completed?: unknown; entries?: unknown; attempts?: unknown } : { completed: parsed };
        const completed = record.completed;
        if (Array.isArray(completed) && completed.every((name, index) => name === trainingOrder[index]) && completed.length <= trainingOrder.length) {
          progress = { completed: completed as TrainingChallenge[], finished: completed.length === trainingOrder.length };
          if (Array.isArray(record.entries) && Array.isArray(record.attempts)) { entries = record.entries as TrainingEntry[]; attempts = record.attempts as TrainingAttempt[]; }
        }
      }
    } catch { /* Training continues when storage is unavailable. */ }
    let replayMode = progress.finished;
    let currentAttempt: TrainingAttempt | null = null;
    let pendingBranch: { attempt: TrainingAttempt; morning: number } | null = null;
    const beginAttempt = (challenge: TrainingChallenge, plan?: Parameters<typeof startStormAlert>[0]) => {
      if (pendingBranch && pendingBranch.attempt.challenge === challenge) {
        const { attempt, morning } = pendingBranch;
        const replayed = replayAttempt(attempt, undefined, morning);
        attempts.push(attempt);
        const previous = entries.filter(entry => entry.challenge === challenge).slice(-attempt.choices.length);
        entries.push(...previous.slice(0, morning - 1).map(entry => ({ ...entry, links: (entry.links ?? []).filter(day => day < morning) })));
        currentAttempt = { ...attempt, choices: [...attempt.choices.slice(0, morning - 1)] };
        pendingBranch = null;
        try { localStorage.setItem(trainingStorageKey, JSON.stringify({ completed: progress.completed, entries, attempts })); } catch { /* Continue without storage. */ }
        return replayed.state;
      }
      currentAttempt = { challenge, region: this.state.chosenRegion ?? 'haworth', choices: [], plan };
      return null;
    };
    const record = (action: string, oxygen: number, energyUsed: number, description: string, changes: string, science: number, remaining: number, capacity: number) => {
      if (!currentAttempt) return;
      const choice: TrainingChoice = { action, oxygen };
      currentAttempt = { ...currentAttempt, choices: [...currentAttempt.choices, choice] };
      entries.push({ challenge: currentAttempt.challenge, day: currentAttempt.choices.length, action, oxygen, energyUsed, description, changes, science });
      if (remaining <= capacity * settings.gaugeLowFraction) {
        const count = currentAttempt.choices.length;
        const start = entries.length - count;
        const earlier = entries.slice(start, -1);
        const max = Math.max(0, ...earlier.map(entry => entry.energyUsed));
        if (max > 0) entries = entries.map((entry, index) => index >= start && index < entries.length - 1 && entry.energyUsed === max ? { ...entry, links: [...(entry.links ?? []), count] } : entry);
      }
    };
    const saveAttempt = () => { if (currentAttempt) { attempts.push(currentAttempt); currentAttempt = null; } };
    const progressStrip = (active: TrainingChallenge) => {
      const nav = document.createElement('nav'); nav.className = 'survival-progress-strip'; nav.setAttribute('aria-label', 'Training progress');
      for (const name of trainingOrder) {
        const item = document.createElement('span'); item.textContent = `${progress.completed.includes(name) ? '●' : '○'} ${name}`;
        if (name === active) item.setAttribute('aria-current', 'step'); nav.append(item);
      }
      panel.append(nav);
    };
    const appendTrainingLog = () => {
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'survival-log-button'; toggle.textContent = '💡 Log'; toggle.setAttribute('aria-expanded', 'false');
      const view = document.createElement('section'); view.className = 'survival-log'; view.setAttribute('aria-label', 'Decision log'); view.hidden = true;
      const title = document.createElement('h2'); title.textContent = 'Decision log'; view.append(title);
      const list = document.createElement('ol');
      for (const entry of [...entries].reverse()) {
        const line = document.createElement('li');
        const links = (entry.links ?? []).map(day => ` ↳ Day ${day}: low energy`).join('');
        line.textContent = getPlayerProfile().ageRange === '10-12' ? `${entry.challenge} · Day ${entry.day}: ${entry.description} · +${entry.science} science ↳ ${entry.energyUsed} kWh because ${entry.energyUsed ? 'the activity or oxygen production uses energy' : 'this choice uses no extra energy'}. ${entry.changes}${links}` : `Day ${entry.day} 🧪 ${entry.description} ↳ ⚡. Choices can use energy.${links}`;
        list.append(line);
      }
      view.append(list); toggle.addEventListener('click', () => { view.hidden = !view.hidden; toggle.setAttribute('aria-expanded', String(!view.hidden)); });
      panel.append(toggle, view);
    };
    const showDataScreen = () => {
      const data = chapter5Data();
      heading('Where our data comes from');
      paragraph('This game was made by students, not by NASA.');
      const section = (title: string) => { const h = document.createElement('h2'); h.textContent = title; panel.append(h); };
      section('Real numbers');
      for (const fact of data.facts) {
        const item = document.createElement('p');
        item.dataset.factId = fact.id;
        const text = document.createElement('span'); text.textContent = factText(fact.id as Chapter5FactId, getPlayerProfile().ageRange);
        const credit = document.createElement('small'); credit.textContent = ` ${fact.id} - ${fact.credit} - ${LABEL_WORDS[fact.label]}`;
        item.append(text, credit); panel.append(item);
      }
      section('Sources');
      let group = '';
      for (const source of data.sources) {
        if (group !== source.group) { group = source.group; const h = document.createElement('h3'); h.textContent = GROUP_WORDS[source.group]; panel.append(h); }
        const p = document.createElement('p'); p.dataset.sourceKey = source.key;
        if (source.url) { const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.title; p.append(link); }
        else p.textContent = source.title;
        p.append(` - ${source.organisation} (${source.key})`); panel.append(p);
      }
      section('NASA data');
      paragraph(`Archived, not live: ${data.archive.months.map(month => month.month).join(' and ')}. Downloaded ${data.archive.downloadedAt}. Dates were moved onto mission days.`);
      section('Game numbers');
      for (const setting of data.gameNumbers) {
        const item = document.createElement('p'); item.dataset.setting = setting.name;
        item.textContent = `${setting.name}: ${JSON.stringify(setting.value)} - ${setting.derived ? 'calculated from a sourced fact' : 'made up to make it playable'}`;
        panel.append(item);
      }
      button('Back to training debrief', showFinalDebrief);
    };
    const showFinalDebrief = () => {
      heading('Training debrief');
      const turning = bestTrainingChange(attempts);
      paragraph(turning ? `★ Your turning point: ${turning.challenge}, day ${turning.day}. You could try ${turning.choice.action}${turning.choice.oxygen ? ` and ${turning.choice.oxygen} kg oxygen` : ''}.` : '★ You did well! No single change improved the recorded training.');
      const connections = bigConnections(entries);
      const older = getPlayerProfile().ageRange === '10-12';
      if (older && entries.length) {
        const first = entries[0];
        paragraph(`What do you think happened to energy after your day ${first.day} choice in ${first.challenge}?`);
        const answer = document.createElement('p'); answer.hidden = true; answer.textContent = `Your recorded result: ${first.changes}`;
        for (const symbol of ['🔋', '🌡️', '🌀']) button(symbol, () => { answer.hidden = false; });
        panel.append(answer);
      }
      for (const text of older ? connections : connections.slice(0, 1)) paragraph(text);
      button('Where our data comes from', showDataScreen);
      button('Choose a challenge to replay', showChallenges);
      button('Choose another region', showRegions);
    };
    const finishCurrent = () => {
      if (!currentAttempt) return;
      const challenge = currentAttempt.challenge;
      saveAttempt();
      progress = finishChallenge(progress, challenge);
      try { localStorage.setItem(trainingStorageKey, JSON.stringify({ completed: progress.completed, entries, attempts })); } catch { /* The current session still works. */ }
      if (progress.finished) {
        replayMode = true;
        showFinalDebrief();
      } else launch(nextChallenge(progress)!);
    };
    const showWhatIf = (host: HTMLElement, attempt: TrainingAttempt, day: number, recommended?: TrainingChoice) => {
      const region = document.createElement('section'); region.setAttribute('aria-label', `What if day ${day}`);
      const heading = document.createElement('h3'); heading.textContent = `What if? Day ${day}`; region.append(heading);
      const valid = alternatives(attempt, day).filter(choice => {
        try { replayAttempt(attempt, { day, choice }); return true; } catch { return false; }
      });
      const choices = recommended ? valid.filter(choice => choice.action === recommended.action && choice.oxygen === recommended.oxygen) : valid;
      if (!choices.length) { const note = document.createElement('p'); note.textContent = 'No different available choice can be compared for this day.'; region.append(note); host.append(region); return; }
      const select = document.createElement('select'); select.setAttribute('aria-label', 'Different choice');
      choices.forEach((choice, index) => {
        const option = document.createElement('option'); option.value = String(index);
        option.textContent = `${choice.action}${attempt.challenge === 'Into the dark' || attempt.challenge === 'Storm alert' ? `, ${choice.oxygen} kg oxygen` : ''}`;
        select.append(option);
      });
      if (!recommended) region.append(select);
      else { const p = document.createElement('p'); p.textContent = `Try ${select.options[0].textContent}.`; region.append(p); }
      const compare = document.createElement('button'); compare.type = 'button'; compare.textContent = 'Compare choices';
      const results = document.createElement('div'); results.setAttribute('aria-live', 'polite');
      compare.addEventListener('click', () => {
        const choice = choices[Number(select.value)];
        const original = replayAttempt(attempt);
        const changed = replayAttempt(attempt, { day, choice });
        results.replaceChildren();
        const columns = document.createElement('div'); columns.className = 'survival-what-if-columns';
        for (const [label, replay] of [['What you did', original], [`What if: ${choice.action}${attempt.challenge === 'Into the dark' || attempt.challenge === 'Storm alert' ? `, ${choice.oxygen} kg oxygen` : ''}`, changed]] as const) {
          const column = document.createElement('section'); const title = document.createElement('h4'); title.textContent = label; column.append(title);
          for (const gauge of replay.summary.gauges) {
            const p = document.createElement('p');
            if (getPlayerProfile().ageRange === '10-12') p.textContent = `${gauge.name}: ${gauge.value} ${gauge.unit}`;
            else {
              const ids: Record<string, ResourceId> = { Energy: 'energy', Air: 'air', Dose: 'dose', Food: 'food', Water: 'water', 'Data to send': 'data' };
              const capacities: Record<ResourceId, number> = { energy: attempt.challenge === 'Fresh food' ? settings.foodStartingEnergy : attempt.challenge === 'Ice to air' ? settings.iceStartingEnergy : attempt.challenge === 'Can you hear us?' ? settings.contactStartingEnergy : settings.startingEnergy, air: attempt.challenge === 'Ice to air' ? settings.iceStartingAir : settings.startingAir, dose: attempt.challenge === 'Storm alert' ? stormAlert.stormLimit : chapter5Facts['radiation.careerLimit'].value, food: settings.foodStartingSupply + settings.foodDeliveryAmount, water: settings.foodStartingWater, data: settings.scienceGoal };
              const model = gaugeModel(ids[gauge.name], { value: gauge.value, capacity: capacities[ids[gauge.name]] }, '7-9', settings.crewCount);
              p.textContent = `${model.icon} ${model.title}: ${model.status} `;
              const bar = document.createElement('progress'); bar.max = 1; bar.value = model.fraction; bar.setAttribute('aria-label', model.title); bar.setAttribute('aria-valuetext', model.status); p.append(bar);
            }
            if (attempt.challenge === 'Storm alert' && gauge.name === 'Dose') p.append(' (game estimate)');
            column.append(p);
          }
          const science = document.createElement('p');
          if (getPlayerProfile().ageRange === '10-12') science.textContent = `Science: ${replay.summary.science}`;
          else {
            const goal = attempt.challenge === 'Fresh food' || attempt.challenge === 'Ice to air' ? settings.experimentScience : settings.scienceGoal;
            science.textContent = '📈 Science: '; const bar = document.createElement('progress'); bar.max = goal; bar.value = Math.min(goal, replay.summary.science); bar.setAttribute('aria-label', 'Science goal'); bar.setAttribute('aria-valuetext', replay.summary.science >= goal ? 'Goal reached' : 'Keep exploring'); science.append(bar);
          }
          column.append(science); columns.append(column);
        }
        results.append(columns);
        const fair = document.createElement('p'); fair.textContent = `Same storms, same dark spell. Only Day ${day} changed.`; results.append(fair);
        if (changed.fallbackDays.length) { const note = document.createElement('p'); note.textContent = `Rest replaced an unavailable later choice on day${changed.fallbackDays.length > 1 ? 's' : ''} ${changed.fallbackDays.join(', ')}.`; results.append(note); }
        if (changed.usedChoices.length < attempt.choices.length) { const note = document.createElement('p'); note.textContent = 'The replay ended early, so there were no later choices to play.'; results.append(note); }
        const retry = document.createElement('button'); retry.type = 'button'; retry.textContent = `Try it for real from Day ${day}`;
        retry.addEventListener('click', () => { pendingBranch = { attempt, morning: day }; launch(attempt.challenge); }); results.append(retry);
      });
      region.append(compare, results); host.append(region);
    };
    const appendCommonDebrief = () => {
      if (!currentAttempt) return;
      const attempt = currentAttempt;
      const turning = bestTrainingChange([attempt]);
      paragraph(turning ? `★ Day ${turning.day}: try ${turning.choice.action}${turning.choice.oxygen ? ` and ${turning.choice.oxygen} kg oxygen` : ''}.` : '★ You did well! No single change improved this challenge.');
      if (getPlayerProfile().ageRange !== '10-12' && turning) showWhatIf(panel, attempt, turning.day, turning.choice);
      if (getPlayerProfile().ageRange === '10-12') {
        const cards = document.createElement('div'); cards.className = 'survival-day-cards';
        const detail = document.createElement('section'); detail.setAttribute('aria-label', 'Day details');
        const records = entries.filter(entry => entry.challenge === attempt.challenge).slice(-attempt.choices.length);
        for (const [index, entry] of records.entries()) {
          const card = document.createElement('button'); card.type = 'button'; card.textContent = `Day ${entry.day} · ${entry.changes}`;
          card.addEventListener('click', () => {
            detail.replaceChildren();
            for (const [q, a] of [['What did I do?', entry.description], ['What did it cost?', `${entry.energyUsed} kWh for this choice.`], ['What happened later?', records[index + 1] ? `Day ${records[index + 1].day}: ${records[index + 1].changes}` : 'There was no later recorded day in this challenge.'], ['What could I try?', turning?.day === entry.day ? `Try ${turning.choice.action}.` : 'Try another choice and compare the result.']]) {
              const h = document.createElement('h3'); h.textContent = q; const p = document.createElement('p'); p.textContent = a; detail.append(h, p);
            }
            const open = document.createElement('button'); open.type = 'button'; open.textContent = 'What if?';
            open.addEventListener('click', () => { open.remove(); showWhatIf(detail, attempt, entry.day); }); detail.append(open);
          }); cards.append(card);
        }
        panel.append(cards, detail);
      }
      button(replayMode ? 'Finish replay' : 'Next challenge', finishCurrent);
    };
    let chapterLog: readonly DecisionLogEntry[] = [];
    const showIntoTheDark = () => {
      const resumed = beginAttempt('Into the dark');
      let challengeState = resumed ? resumed as ReturnType<typeof startIntoTheDark> : startIntoTheDark();
      const previousLog = chapterLog;
      const render = (showResult = false) => {
        heading(intoTheDark.title);
        progressStrip('Into the dark');
        const layout = document.createElement('div');
        layout.className = 'survival-challenge-layout';
        const sidebarHost = document.createElement('div');
        renderSidebar(sidebarHost, intoTheDark.gauges, {
          energy: { value: challengeState.energy, capacity: intoTheDark.startingEnergy },
          air: { value: challengeState.air, capacity: intoTheDark.startingAir },
          dose: { value: challengeState.dose, capacity: intoTheDark.doseGaugeCapacity },
        }, challengeState.science, getPlayerProfile().ageRange, intoTheDark.crewCount);
        const content = document.createElement('main');
        content.className = 'survival-challenge-main';
        const addText = (tag: 'p' | 'h2' | 'small', value: string) => {
          const element = document.createElement(tag);
          element.textContent = value;
          content.append(element);
        };
        const timeline = document.createElement('ol');
        timeline.className = 'survival-light-timeline';
        timeline.setAttribute('aria-label', 'Example light pattern');
        for (let day = 1; day <= intoTheDark.lengthDays; day++) {
          const item = document.createElement('li');
          item.textContent = `Day ${day}: ${isDark(day) ? 'dark' : 'sunny'}`;
          if (day === challengeState.day) item.setAttribute('aria-current', 'step');
          timeline.append(item);
        }
        content.append(timeline);
        addText('small', 'An example, not a forecast. Every region uses this same training pattern.');
        if (challengeState.lastResult && showResult) {
          const result = challengeState.lastResult;
          addText('h2', `Day ${result.day} results`);
          const list = document.createElement('ul');
          for (const change of result.changes) {
            const item = document.createElement('li');
            item.dataset.gauge = change.gauge;
            item.textContent = change.because;
            list.append(item);
          }
          const science = document.createElement('li');
          science.textContent = result.scienceBecause;
          list.append(science);
          content.append(list);
          if (result.ending) {
            addText('h2', result.ending === 'air'
              ? 'Mission ended early: the crew flew home before the air ran out.'
              : result.ending === 'energy'
                ? 'Mission ended early: the base ran out of energy, and the crew flew home safely.'
                : 'Challenge complete!');
            if (result.endingBecause) addText('p', result.endingBecause);
            addText('p', `Science reached: ${challengeState.science} of ${intoTheDark.scienceGoal} points.`);
            addText('h2', 'Challenge debrief');
            const turning = findTurningPoint(challengeState.history);
            if (turning) {
              const changedOxygen = turning.original.oxygenKg !== turning.alternative.oxygenKg;
              const description = changedOxygen
                ? `make ${turning.alternative.oxygenKg} kg of oxygen instead of ${turning.original.oxygenKg} kg`
                : `choose ${intoTheDark.actions.find(action => action.id === turning.alternative.action)?.title} instead of ${intoTheDark.actions.find(action => action.id === turning.original.action)?.title}`;
              addText('p', `★ Your turning point: Day ${turning.day}. Try ${description}. In this replay, the crew ${turning.result.ending === 'complete' ? 'completed the challenge' : `reached the end of day ${turning.result.day - 1}`} with ${turning.result.science} science points.`);
              const tryTurning = document.createElement('button');
              tryTurning.type = 'button';
              tryTurning.textContent = `Try this idea from day ${turning.day}`;
              tryTurning.addEventListener('click', () => { challengeState = replayToMorning(challengeState.history, turning.day); chapterLog = [...previousLog, ...challengeState.log]; if (currentAttempt) { entries = entries.slice(0, entries.length - currentAttempt.choices.length + turning.day - 1); currentAttempt = { ...currentAttempt, choices: currentAttempt.choices.slice(0, turning.day - 1) }; } render(); });
              content.append(tryTurning);
              if (getPlayerProfile().ageRange !== '10-12' && currentAttempt) showWhatIf(content, currentAttempt, turning.day, { action: turning.alternative.action, oxygen: turning.alternative.oxygenKg });
            } else addText('p', '★ You did well! No single change improved this replay.');
            if (getPlayerProfile().ageRange === '10-12') {
              const cards = document.createElement('div');
              cards.className = 'survival-day-cards';
              const detail = document.createElement('section');
              detail.setAttribute('aria-label', 'Day details');
              for (const entry of challengeState.log) {
                const card = document.createElement('button');
                card.type = 'button';
                card.textContent = `Day ${entry.day} · ${entry.changes.map(change => `${change.gauge}: ${Number((change.after - change.before).toFixed(1))}`).join(' · ')}`;
                card.addEventListener('click', () => {
                  detail.replaceChildren();
                  const answers = [
                    ['What did I do?', `${entry.actionName}; made ${entry.decision.oxygenKg} kg oxygen.`],
                    ['What did it cost?', `${entry.actionEnergy + entry.oxygenEnergy} kWh for your choices.`],
                    ['What happened later?', entry.links.length ? entry.links.map(link => `Energy was low on day ${link.day}.`).join(' ') : 'No later low-energy link was recorded for this day.'],
                    ['What could I try?', turning?.day === entry.day ? `Try ${turning.alternative.oxygenKg} kg oxygen and ${turning.alternative.action}.` : 'Try another oxygen amount or action and compare the result.'],
                  ];
                  for (const [question, answer] of answers) {
                    const title = document.createElement('h3'); title.textContent = question;
                    const text = document.createElement('p'); text.textContent = answer;
                    detail.append(title, text);
                  }
                  if (currentAttempt) {
                    const attempt = currentAttempt;
                    const open = document.createElement('button'); open.type = 'button'; open.textContent = 'What if?';
                    open.addEventListener('click', () => { open.remove(); showWhatIf(detail, attempt, entry.day); }); detail.append(open);
                  }
                });
                cards.append(card);
              }
              content.append(cards, detail);
            }
            if (result.ending !== 'complete') {
              const retry = document.createElement('button');
              retry.type = 'button';
              retry.textContent = `Try again from day ${result.day}`;
              retry.addEventListener('click', () => { challengeState = replayToMorning(challengeState.history, result.day); chapterLog = [...previousLog, ...challengeState.log]; if (currentAttempt) { entries = entries.slice(0, entries.length - currentAttempt.choices.length + result.day - 1); currentAttempt = { ...currentAttempt, choices: currentAttempt.choices.slice(0, result.day - 1) }; } render(); });
              content.append(retry);
              const onward = document.createElement('button');
              onward.type = 'button';
              onward.textContent = 'Go on to the next challenge anyway';
              onward.addEventListener('click', finishCurrent);
              content.append(onward);
            } else {
              const back = document.createElement('button');
              back.type = 'button';
              back.textContent = replayMode ? 'Back to challenges' : 'Next challenge';
              back.addEventListener('click', replayMode ? showChallenges : finishCurrent);
              content.append(back);
            }
          } else {
            const next = document.createElement('button');
            next.type = 'button';
            next.textContent = `Continue to day ${challengeState.day}`;
            next.addEventListener('click', () => render());
            content.append(next);
          }
        } else {
          const day = challengeState.day;
          addText('h2', `Day ${day} of ${intoTheDark.lengthDays}`);
          addText('p', `Today: ${isDark(day) ? 'dark, no solar energy' : 'sunny, solar panels can add energy'}. Tomorrow: ${day === intoTheDark.lengthDays ? 'challenge ends' : isDark(day + 1) ? 'dark' : 'sunny'}.`);
          if (getPlayerProfile().ageRange !== '10-12') {
            const tip = document.createElement('p'); tip.dataset.ageTip = 'true'; tip.textContent = `💡 tip: ${intoTheDark.tips[(day - 1) % intoTheDark.tips.length]}`; content.append(tip);
          }
          const oxygenLabel = document.createElement('label');
          oxygenLabel.textContent = 'Make oxygen today (kg)';
          const oxygen = document.createElement('select');
          oxygen.setAttribute('aria-label', 'Make oxygen today (kg)');
          for (const amount of intoTheDark.oxygenChoices) {
            const option = document.createElement('option');
            option.value = String(amount);
            option.textContent = `${amount} kg — ${amount * chapter5Facts['lifeSupport.oxygenEnergyModel'].value} kWh`;
            oxygen.append(option);
          }
          oxygenLabel.append(oxygen);
          content.append(oxygenLabel);
          addText('p', 'Choose one action:');
          for (const action of intoTheDark.actions) {
            const choice = document.createElement('button');
            choice.type = 'button';
            choice.textContent = `${action.title} · +${action.science} science · ${action.energy} kWh`;
            choice.dataset.action = action.id;
            choice.addEventListener('click', () => {
              const before = challengeState;
              challengeState = advanceIntoTheDark(challengeState, { oxygenKg: Number(oxygen.value), action: action.id });
              record(action.id, Number(oxygen.value), action.energy + Number(oxygen.value) * chapter5Facts['lifeSupport.oxygenEnergyModel'].value, `${action.title}, ${oxygen.value} kg oxygen`, `Energy ${before.energy} → ${challengeState.energy} kWh; air ${before.air} → ${challengeState.air} kg.`, action.science, challengeState.energy, settings.startingEnergy);
              chapterLog = [...previousLog, ...challengeState.log];
              render(true);
            });
            content.append(choice);
          }
        }
        layout.append(sidebarHost, content);
        panel.append(layout);
        appendTrainingLog();
        const sources = document.createElement('div');
        sources.className = 'survival-challenge-sources';
        sources.append(factElement('lifeSupport.oxygenPerDay'), factElement('lifeSupport.oxygenEnergyModel'), factElement('power.emptyBaseHeating'), factElement('power.darkSpells'));
        sources.append(factElement('radiation.doseQuietSun'));
        panel.append(sources);
      };
      render();
    };
    const showStormPlanning = () => {
      let sun: Sun = pendingBranch?.attempt.plan?.sun ?? 'busy';
      let cargo: Cargo = pendingBranch?.attempt.plan?.cargo ?? 'shelter';
      const renderPlanning = () => {
        heading('Plan Storm alert');
        progressStrip('Storm alert');
        paragraph('A what-if: NASA picks dates for other reasons.');
        const choices = document.createElement('div');
        choices.className = 'survival-planning-options';
        const sunGroup = document.createElement('section');
        sunGroup.className = 'survival-planning-group';
        sunGroup.setAttribute('aria-label', 'Choose the Sun');
        const sunTitle = document.createElement('h2'); sunTitle.textContent = 'Choose the Sun'; sunGroup.append(sunTitle);
        for (const choice of ['busy', 'quiet'] as const) {
          const item = button(choice === 'busy' ? 'Busy Sun' : 'Quiet Sun', () => { sun = choice; renderPlanning(); }, sunGroup);
          item.setAttribute('aria-pressed', String(sun === choice));
          item.dataset.planChoice = choice;
        }
        const cargoGroup = document.createElement('section');
        cargoGroup.className = 'survival-planning-group';
        cargoGroup.setAttribute('aria-label', 'Choose your cargo');
        const cargoTitle = document.createElement('h2'); cargoTitle.textContent = 'Choose your cargo'; cargoGroup.append(cargoTitle);
        for (const choice of ['shelter', 'science'] as const) {
          const item = button(choice === 'shelter' ? 'Shelter supplies' : 'Extra science kit', () => { cargo = choice; renderPlanning(); }, cargoGroup);
          item.setAttribute('aria-pressed', String(cargo === choice));
          item.dataset.planChoice = choice;
        }
        choices.append(sunGroup, cargoGroup);
        panel.append(choices);
        const plan = pendingBranch?.attempt.plan ?? { sun, cargo, region: this.state.chosenRegion ?? 'haworth', seed: settings.stormChallengeSeed };
        const estimate = prediction(plan);
        paragraph(`Predicted cosmic rays: ${estimate.cosmic} mSv. An unshielded storm could be anywhere from 0 to ${estimate.maxStorm} mSv (game estimate); nobody can predict storms. A moonwalk can add more. Single-storm line: ${estimate.limit} mSv.`);
        paragraph(archiveLabel(sun === 'busy' ? '2024-05' : '2019-12'));
        panel.append(factElement('radiation.watershield'));
        panel.append(factElement(sun === 'busy' ? 'radiation.doseBusySun' : 'radiation.doseQuietSun'));
        paragraph(`Archive source references: ${stormArchive.sourceKeys.join(', ')}.`);
        if (plan.region === 'mons-mouton') paragraph(getPlayerProfile().ageRange === '10-12' ? 'Mons Mouton has challenging ground, so in this training the walk back adds 20% of the storm dose instead of 10%.' : 'Mons Mouton has rough ground. The longer walk back adds more radiation.');
        const start = button('Start Storm alert', () => {
          const resumed = beginAttempt('Storm alert', plan);
          let state = resumed ? resumed as ReturnType<typeof startStormAlert> : startStormAlert(plan);
          const renderDay = () => {
            heading('Storm alert');
            progressStrip('Storm alert'); appendTrainingLog();
            const host = document.createElement('div');
            renderSidebar(host, stormAlert.gauges, {
              energy: { value: state.base.energy, capacity: settings.startingEnergy },
              air: { value: state.base.air, capacity: settings.startingAir },
              dose: { value: state.stormDose, capacity: stormAlert.stormLimit },
            }, state.science, getPlayerProfile().ageRange, settings.crewCount);
            panel.append(host);
            paragraph(`Storm gauge: ${state.stormDose} mSv (game estimate) · Single-storm line: ${stormAlert.stormLimit} mSv · Total this mission: ${state.totalDose} mSv.`);
            if (state.lastMessage) paragraph(state.lastMessage);
            if (state.ended) {
              paragraph(state.ending ?? '');
              paragraph(`Debrief: planned cosmic dose ${estimate.cosmic} mSv; simulated dose ${state.totalDose} mSv because daily cosmic rays and estimated storm doses accumulated.${state.unknownDose ? ' Some event doses were unknown, so the total is incomplete.' : ''}`);
              if (state.safetyPraise) paragraph('With the information you had, keeping the crew safe was a smart choice. It cost one day of science.');
              appendCommonDebrief();
              button('Back to challenges', showChallenges);
              return;
            }
            const day = state.base.day;
            paragraph(`Day ${day} of ${stormAlert.lengthDays}. Shelter ${state.built ? 'built' : 'not built'}.`);
            paragraph('Building a shelter stacks water bags around the bunks and costs the day’s science. Taking shelter also costs the day’s science.');
            const warnings = state.alerts.filter(alert => alert.warningDay === day || alert.arrivalDay === day);
            if (warnings.length) paragraph('Space weather alert: an event may arrive today or tomorrow.');
            const oxygenChoiceLabel = document.createElement('label');
            oxygenChoiceLabel.htmlFor = 'storm-oxygen-choice';
            oxygenChoiceLabel.textContent = 'How many kilograms of oxygen should we make today?';
            panel.append(oxygenChoiceLabel);
            const select = document.createElement('select');
            select.id = 'storm-oxygen-choice';
            select.setAttribute('aria-label', 'Oxygen to make today (kg)');
            for (const amount of settings.oxygenChoices) {
              const option = document.createElement('option'); option.value = String(amount); option.textContent = `${amount} kg`; select.append(option);
            }
            panel.append(select);
            const actions: { id: StormAction; title: string }[] = [
              { id: 'lab', title: 'Lab science' }, { id: 'moonwalk', title: 'Moonwalk for science' }, { id: 'rest', title: 'Rest' },
              ...(!state.built ? [{ id: 'build' as const, title: 'Build the shelter' }] : []),
              ...(warnings.length ? [{ id: 'shelter' as const, title: 'Take shelter' }] : []),
            ];
            for (const action of actions) button(action.title, () => { const before = state; const oxygen = Number(select.value); state = advanceStormAlert(state, oxygen, action.id); const expense = action.id === 'lab' ? settings.labScienceCost : action.id === 'moonwalk' ? settings.moonwalkCost : 0; record(action.id, oxygen, expense + oxygen * chapter5Facts['lifeSupport.oxygenEnergyModel'].value, action.title, `Energy ${before.base.energy} → ${state.base.energy} kWh; air ${before.base.air} → ${state.base.air} kg.`, state.science - before.science, state.base.energy, settings.startingEnergy); renderDay(); });
          };
          renderDay();
        });
        if (pendingBranch) { start.click(); return; }
        button('Back to challenges', showChallenges);
      };
      renderPlanning();
    };
    const showContact = () => {
      const region = pendingBranch?.attempt.region ?? this.state.chosenRegion ?? 'haworth';
      const resumed = beginAttempt('Can you hear us?');
      let state = resumed ? resumed as ReturnType<typeof startContact> : startContact(region, settings.stormChallengeSeed);
      const render = () => {
        heading(canYouHearUs.title);
        progressStrip('Can you hear us?'); appendTrainingLog();
        const timeline = document.createElement('ol');
        timeline.className = 'survival-light-timeline';
        timeline.setAttribute('aria-label', 'Earth contact timeline');
        for (let day = 1; day <= canYouHearUs.lengthDays; day++) {
          const item = document.createElement('li');
          item.textContent = `Day ${day}: ${contactDays(region).includes(day) ? 'Earth in view' : 'blocked'}`;
          timeline.append(item);
        }
        panel.append(timeline);
        paragraph('An example, not a forecast.');
        if (region === 'malapart-massif') { paragraph(factText('moonPlaces.malpertEarthView', getPlayerProfile().ageRange)); paragraph('Five of six days is a training rule.'); }
        else if (region === 'nobile-rim-2') { paragraph(factText('moonPlaces.nobileRim2EarthView', getPlayerProfile().ageRange)); paragraph('One study, at one spot.'); }
        else paragraph('An example, not real data for this region.');
        const sidebar = document.createElement('div');
        renderSidebar(sidebar, canYouHearUs.gauges, {
          data: { value: state.waiting, capacity: settings.scienceGoal },
          energy: { value: state.energy, capacity: settings.contactStartingEnergy },
          dose: { value: state.dose, capacity: chapter5Facts['radiation.careerLimit'].value },
        }, state.sent, getPlayerProfile().ageRange, settings.crewCount);
        panel.append(sidebar);
        if (state.message) paragraph(state.message);
        if (state.ended) {
          paragraph(state.ending === 'complete' ? 'Challenge complete!' : 'Mission ended early: the crew flew home safely.');
          paragraph(`Data sent to Earth: ${state.sent}. ${state.sent === 0 ? 'Your science stayed on the Moon.' : state.sent >= settings.scienceGoal ? 'Science goal reached!' : 'Some science did not reach Earth.'}`);
          if (state.unknownDose) paragraph('Some particle-event doses were unknown, so the dose total is incomplete.');
          appendCommonDebrief();
          button('Back to challenges', showChallenges);
          return;
        }
        const inView = contactDays(region).includes(state.day);
        paragraph(`Day ${state.day} of ${canYouHearUs.lengthDays}: ${inView ? 'Earth in view' : 'Earth blocked'}.`);
        if (contactWarning(state)) { paragraph('Mission Control: space weather alert.'); paragraph(factText('communication.radioDelay', getPlayerProfile().ageRange)); }
        if (state.relay) paragraph('One relay transmission is booked for a blocked day.');
        const actions: { id: ContactAction; label: string; available: boolean }[] = [
          { id: 'lab', label: `Lab science · +1 data · ${settings.labScienceCost} kWh`, available: true },
          { id: 'send', label: `Send data · ${settings.sendDataCost} kWh`, available: inView || state.relay },
          { id: 'relay', label: `Book relay time · ${settings.relayBookingCost} kWh`, available: !state.relay },
          { id: 'rest', label: 'Rest', available: true },
        ];
        for (const action of actions) {
          const item = button(action.label, () => { const before = state; state = advanceContact(state, action.id); const expense = action.id === 'lab' ? settings.labScienceCost : action.id === 'send' ? settings.sendDataCost : action.id === 'relay' ? settings.relayBookingCost : 0; record(action.id, 0, expense, action.label, `Energy ${before.energy} → ${state.energy} kWh; data sent ${before.sent} → ${state.sent}.`, state.sent - before.sent, state.energy, settings.contactStartingEnergy); render(); });
          item.disabled = !action.available;
        }
        panel.append(factElement('communication.poleHillsBlock'), factElement('communication.relaySatellites'), factElement('communication.radioDelay'));
        if (region === 'malapart-massif') panel.append(factElement('moonPlaces.malpertEarthView'));
        if (region === 'nobile-rim-2') panel.append(factElement('moonPlaces.nobileRim2EarthView'));
      };
      render();
    };
    const showFreshFood = () => {
      const resumed = beginAttempt('Fresh food');
      let state = resumed ? resumed as ReturnType<typeof startFreshFood> : startFreshFood();
      const render = () => {
        heading(freshFood.title);
        progressStrip('Fresh food'); appendTrainingLog();
        const sidebar = document.createElement('div');
        renderSidebar(sidebar, freshFood.gauges, {
          food: { value: state.food, capacity: settings.foodStartingSupply + settings.foodDeliveryAmount },
          energy: { value: state.energy, capacity: settings.foodStartingEnergy },
          water: { value: state.water, capacity: settings.foodStartingWater },
        }, state.science, getPlayerProfile().ageRange, settings.crewCount);
        panel.append(sidebar);
        if (state.message) paragraph(getPlayerProfile().ageRange === '10-12' ? state.message : 'Your choices changed the food, water and energy supplies. Check the bars.');
        if (state.ending) {
          paragraph(state.ending === 'complete' ? 'Challenge complete!' : state.ending === 'food' ? 'Mission ended early: the crew flew home safely before the food ran out.' : `Mission ended early: the crew flew home safely because ${state.ending} ran low.`);
          paragraph(`Debrief: the plants grew ${Number((state.freshGrown * 1000).toFixed(1))} g, while the crew used ${state.crewAte} kg of packed food, because the small plant box produces only a little food for the energy it uses.`);
          if (getPlayerProfile().ageRange === '10-12') panel.append(factElement('food.cropAreaFullDiet'));
          appendCommonDebrief();
          button('Back to challenges', showChallenges);
          return;
        }
        paragraph(`Day ${state.day} of ${freshFood.lengthDays}. Cargo was expected on day ${settings.foodExpectedDeliveryDay} and will be one day late.`);
        paragraph(`Grow lamps: ${settings.plantArea} m² × ${chapter5Facts['food.plantPower'].value} kW/m² × ${settings.lampHours} hours = ${freshFood.lampEnergy} kWh. The low estimate is ${chapter5Facts['food.gramsPerKwh'].range[0]} g per kWh.`);
        const choices: { id: FoodAction; title: string }[] = [{ id: 'lamps', title: 'Run the grow lamps' }, { id: 'rest', title: 'Rest' }];
        for (const choice of choices) button(choice.title, () => { const before = state; state = advanceFreshFood(state, choice.id); record(choice.id, 0, choice.id === 'lamps' ? freshFood.lampEnergy : 0, choice.title, `Energy ${before.energy} → ${state.energy} kWh; food ${before.food} → ${state.food} kg.`, state.science - before.science, state.energy, settings.foodStartingEnergy); render(); });
        panel.append(factElement('food.allFoodFromEarth'), factElement('food.veggie'), factElement('food.leaf'), factElement('food.packedFoodPerDay'), factElement('food.plantPower'), factElement('food.gramsPerKwh'), factElement('food.plantWater'));
      };
      render();
    };
    const showIceToAir = () => {
      const region = pendingBranch?.attempt.region ?? this.state.chosenRegion ?? 'haworth';
      const resumed = beginAttempt('Ice to air');
      let state = resumed ? resumed as ReturnType<typeof startIceToAir> : startIceToAir(region, settings.stormChallengeSeed);
      const render = () => {
        heading(iceToAir.title);
        progressStrip('Ice to air'); appendTrainingLog();
        const timeline = document.createElement('ol');
        timeline.className = 'survival-light-timeline';
        timeline.setAttribute('aria-label', 'Example light pattern');
        for (let day = 1; day <= iceToAir.lengthDays; day++) {
          const item = document.createElement('li'); item.textContent = `Day ${day}: ${isDark(day) ? 'dark' : 'sunny'}`; timeline.append(item);
        }
        panel.append(timeline);
        paragraph('An example, not a forecast.');
        const sidebar = document.createElement('div');
        renderSidebar(sidebar, iceToAir.gauges, {
          air: { value: state.air, capacity: settings.iceStartingAir },
          energy: { value: state.energy, capacity: settings.iceStartingEnergy },
          dose: { value: state.dose, capacity: chapter5Facts['radiation.careerLimit'].value },
        }, state.science, getPlayerProfile().ageRange, settings.crewCount);
        panel.append(sidebar);
        if (state.message) paragraph(state.message);
        if (state.ending) {
          paragraph(state.ending === 'complete' ? 'Challenge complete!' : 'Mission ended early: the crew flew home safely.');
          if (state.unknownDose) paragraph('Some event doses were unknown, so the dose total is incomplete.');
          appendCommonDebrief();
          button('Back to challenges', showChallenges);
          return;
        }
        paragraph(`Day ${state.day} of ${iceToAir.lengthDays}. Ice: ${state.ice} kg.`);
        if (state.alerts.some(alert => alert.warningDay === state.day || alert.arrivalDay === state.day)) paragraph('Space weather alert: a moonwalk can add radiation dose.');
        if (region === 'haworth') {
          paragraph('One study found Haworth had the most ice-friendly ground; this training rule gives 1.5 times as much ice per dig.');
          panel.append(factElement('moonPlaces.iceFriendlyGround'));
        }
        paragraph(`Melt and split: ${iceToAir.waterPerBatch} kg water makes ${settings.oxygenPerSplit} kg oxygen for ${iceToAir.energyPerBatch} kWh, including melting. The water amount is an approximate training rule.`);
        const actions: { id: IceAction; title: string }[] = [
          { id: 'dig', title: 'Dig ice' }, { id: 'split', title: 'Melt and split' },
          { id: 'lab', title: 'Lab science' }, { id: 'rest', title: 'Rest' },
        ];
        for (const action of actions) {
          const item = button(action.title, () => { const before = state; state = advanceIceToAir(state, action.id); const expense = action.id === 'dig' ? settings.moonwalkCost : action.id === 'split' ? iceToAir.energyPerBatch : action.id === 'lab' ? settings.labScienceCost : 0; record(action.id, 0, expense, action.title, `Energy ${before.energy} → ${state.energy} kWh; air ${before.air} → ${state.air} kg.`, state.science - before.science, state.energy, settings.iceStartingEnergy); render(); });
          if (action.id === 'split') item.disabled = state.ice < iceToAir.waterPerBatch;
        }
        panel.append(factElement('moonPlaces.iceUses'), factElement('lifeSupport.splitWater'), factElement('lifeSupport.oxygenEnergyMinimum'), factElement('lifeSupport.oxygenEnergyModel'));
      };
      render();
    };
    const launch = (name: TrainingChallenge) => {
      if (name === 'Into the dark') showIntoTheDark();
      else if (name === 'Storm alert') showStormPlanning();
      else if (name === 'Can you hear us?') showContact();
      else if (name === 'Fresh food') showFreshFood();
      else showIceToAir();
    };
    const showChallenges = () => {
      heading('Choose a training challenge');
      const region = regions.find((entry) => entry.id === this.state.chosenRegion);
      paragraph(`Chosen region: ${region?.name}`);
      paragraph(replayMode ? 'Choose a challenge to replay.' : 'Complete your training in order.');
      const next = nextChallenge(progress);
      for (const name of trainingOrder) {
        if (replayMode || name === next) button(`Begin ${name}`, () => launch(name));
        else paragraph(`${name} · ${progress.completed.includes(name) ? 'Complete' : 'Coming next'}`);
      }
      button('Back to regions', showRegions);
    };
    const showRegions = () => {
      heading('Choose a south pole region');
      panel.append(factElement('moonPlaces.nineRegions'));
      paragraph('Check before using: no final landing site has been chosen.');
      const cards = document.createElement('div');
      cards.className = 'survival-region-grid';
      for (const region of regions) {
        const card = document.createElement('article');
        card.className = 'survival-region-card';
        card.setAttribute('aria-label', region.name);
        const name = document.createElement('h2');
        name.textContent = region.name;
        const picture = document.createElement('figure');
        picture.className = `survival-region-picture survival-region-picture-${region.id}`;
        const image = document.createElement('img');
        image.src = southPoleMosaicUrl;
        image.alt = `NASA Clementine mosaic showing the lunar south-pole terrain around ${region.name}; regional context view, not a site close-up.`;
        const credit = document.createElement('figcaption');
        const sourceLink = document.createElement('a');
        sourceLink.href = 'https://images.nasa.gov/details/PIA00001';
        sourceLink.target = '_blank';
        sourceLink.rel = 'noopener noreferrer';
        sourceLink.textContent = 'NASA/JPL/USGS ? Clementine south-pole mosaic (1996)';
        credit.append(sourceLink, document.createTextNode(' ? regional context, not a site close-up'));
        picture.append(image, credit);
        card.append(name, picture);
        for (const id of region.factIds) card.append(factElement(id));
        if ('note' in region) {
          const note = document.createElement('p');
          note.className = 'survival-region-note';
          note.textContent = region.note;
          card.append(note);
        }
        const effectsTitle = document.createElement('h3');
        effectsTitle.textContent = 'What this changes in your training';
        const effect = document.createElement('p');
        effect.textContent = region.effect.description;
        const assumption = document.createElement('small');
        assumption.textContent = 'Training rule inspired by the facts.';
        const select = document.createElement('button');
        select.type = 'button';
        select.textContent = `Choose ${region.name}`;
        select.setAttribute('aria-pressed', String(this.state.chosenRegion === region.id));
        select.addEventListener('click', () => {
          this.state = chooseRegion(this.state, region.id);
          showChallenges();
        });
        card.append(effectsTitle, effect, assumption, select);
        cards.append(card);
      }
      panel.append(cards);
      const lightNote = document.createElement('small');
      lightNote.className = 'survival-light-note';
      lightNote.textContent = 'Every region uses the same light pattern in this training. NASA has not published sunlight or dark-spell numbers for each region.';
      panel.append(lightNote);
      button('Back to site choice', () => showSites(true));
    };
    const showEquator = () => {
      heading('Why look beyond the equator?');
      panel.classList.add('survival-equator-briefing');
      const backdrop = document.createElement('figure');
      backdrop.className = 'survival-equator-backdrop';
      const image = document.createElement('img');
      image.src = equatorImageUrl;
      image.alt = 'Apollo 11 astronaut Buzz Aldrin standing on the Moon near the lunar equator';
      const credit = document.createElement('figcaption');
      credit.textContent = 'Apollo 11 near the Moon?s equator ? NASA / Neil Armstrong ? NASA Image Library';
      backdrop.append(image, credit);
      panel.append(backdrop);
      const facts = document.createElement('ul');
      for (const fact of equatorBriefing(getPlayerProfile().ageRange)) {
        const item = document.createElement('li');
        item.dataset.factId = fact.id;
        const text = document.createElement('p');
        text.textContent = fact.text;
        const sources = document.createElement('small');
        sources.textContent = `${fact.label} · Source references: ${fact.sources.join(', ')}`;
        item.append(text, sources);
        facts.append(item);
      }
      panel.append(facts);
      paragraph("NASA is looking at the south pole instead. Let's go there!");
      button('Back to site choice', () => showSites(true));
    };
    const showSites = (highlightSouthPole = false) => {
      heading('Where will you train?');
      paragraph('Choose a place to explore for your Moon base.');
      button('Near the equator', showEquator);
      const south = button('Near the south pole', showRegions);
      if (highlightSouthPole) {
        south.dataset.recommended = 'true';
        paragraph('Try the south pole next.');
        south.focus();
      }
    };
    showSites();
  }
}
