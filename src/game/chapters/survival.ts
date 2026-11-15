import { ChapterScene } from './ChapterScene';
import { chapters } from './catalog';
import { getPlayerProfile } from '../../playerProfile';
import { equatorBriefing, factText } from '../../data/chapter5/site';
import { chapter5Facts, type Chapter5FactId } from '../../data/chapter5/facts';
import { regions } from '../../data/chapter5/regions';
import { initialChapter5State, chooseRegion, type Chapter5State } from '../../rules/chapter5/state';
import { LABEL_WORDS } from '../../facts/types';
import { intoTheDark } from '../../data/chapter5/challenges/into-the-dark';
import { advanceIntoTheDark, isDark, replayToMorning, startIntoTheDark } from '../../rules/chapter5/into-the-dark';
import { renderSidebar } from './survival/sidebar';
import './survival/site.css';

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
    const button = (title: string, action: () => void) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.textContent = title;
      element.addEventListener('click', action);
      panel.append(element);
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
    const showIntoTheDark = () => {
      let challengeState = startIntoTheDark();
      const render = (showResult = false) => {
        heading(intoTheDark.title);
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
            if (result.ending !== 'complete') {
              const retry = document.createElement('button');
              retry.type = 'button';
              retry.textContent = `Try again from day ${result.day}`;
              retry.addEventListener('click', () => { challengeState = replayToMorning(challengeState.history, result.day); render(); });
              content.append(retry);
              const onward = document.createElement('button');
              onward.type = 'button';
              onward.textContent = 'Go on to the next challenge anyway';
              onward.addEventListener('click', showChallenges);
              content.append(onward);
            } else {
              const back = document.createElement('button');
              back.type = 'button';
              back.textContent = 'Back to challenges';
              back.addEventListener('click', showChallenges);
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
          addText('p', intoTheDark.tips[(day - 1) % intoTheDark.tips.length]);
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
              challengeState = advanceIntoTheDark(challengeState, { oxygenKg: Number(oxygen.value), action: action.id });
              render(true);
            });
            content.append(choice);
          }
        }
        layout.append(sidebarHost, content);
        panel.append(layout);
        const sources = document.createElement('div');
        sources.className = 'survival-challenge-sources';
        sources.append(factElement('lifeSupport.oxygenPerDay'), factElement('lifeSupport.oxygenEnergyModel'), factElement('power.emptyBaseHeating'), factElement('power.darkSpells'));
        const assumption = document.createElement('small');
        assumption.textContent = 'Training assumption: dose rises 0.9 mSv each quiet day; this number has no source in the fact catalog.';
        sources.append(assumption);
        panel.append(sources);
      };
      render();
    };
    const showChallenges = () => {
      heading('Choose a training challenge');
      const region = regions.find((entry) => entry.id === this.state.chosenRegion);
      paragraph(`Chosen region: ${region?.name}`);
      paragraph('Choose your first resource challenge.');
      button('Begin Into the dark', showIntoTheDark);
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
        const picture = document.createElement('div');
        picture.className = 'survival-picture-placeholder';
        picture.textContent = 'Picture coming soon';
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
