import StartGame from './game/main';
import { chapters, type ChapterInfo } from './game/chapters/catalog';
import { missionDirectory } from './missionDirectory';
import { setAgeRange, type AgeRange } from './playerProfile';
import { SplashGate } from './splashGate';

function chapterButton(chapter: ChapterInfo, accessibleName: string, open: (chapter: ChapterInfo) => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'chapter-card';
  button.type = 'button';
  button.disabled = true;
  button.dataset.chapter = chapter.id;
  button.setAttribute('aria-label', accessibleName);
  button.innerHTML = '<span class="chapter-stage"></span><strong></strong><span class="chapter-summary"></span><span class="chapter-focus"></span><span class="chapter-arrow" aria-hidden="true">↗</span>';
  button.querySelector('.chapter-stage')!.textContent = chapter.stage;
  button.querySelector('strong')!.textContent = chapter.title;
  button.querySelector('.chapter-summary')!.textContent = chapter.summary;
  button.querySelector('.chapter-focus')!.textContent = chapter.focus.join(' · ');
  button.addEventListener('click', () => open(chapter));
  return button;
}

function boot(): void {
  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Missing app element');
  const app = root;
  app.dataset.screen = 'splash';
  app.innerHTML = `
    <div id="game-container" aria-hidden="true"></div>
    <div class="shell">
      <header class="topbar"><span class="brand-mark" aria-hidden="true">✦</span><span class="brand">JUNIOR ASTRONAUT<br><strong>MISSION TRAINER</strong></span><span class="topbar-label">MOON BASE PROGRAM / 2026</span></header>
      <main id="splash-screen" class="onboarding-screen"><h1 class="visually-hidden">Junior Astronaut Mission Trainer</h1><button id="splash-skip" class="splash-skip" type="button">Skip</button></main>
      <main id="age-screen" class="onboarding-screen" hidden><form id="age-form" class="onboarding-card"><h1>Choose your age range</h1><p>This helps us show the right explanations during your missions.</p><fieldset><legend>How old are you?</legend><label><input type="radio" name="ageRange" value="7-9" required> 7 to 9 years old</label><label><input type="radio" name="ageRange" value="10-12"> 10 to 12 years old</label></fieldset><button type="submit">Continue to missions</button></form></main>
      <main id="home" hidden>
        <section class="missions" id="missions" aria-labelledby="missions-title"><div class="section-heading"><div><p class="eyebrow">BUILD A HOME ON THE MOON</p><h1 id="missions-title">Pick your next mission</h1></div><p>Start anywhere. Every mission is open.</p></div><div class="chapter-grid" id="chapter-grid"></div></section>
      </main>
      <main id="mission-info" hidden aria-labelledby="info-title"></main>
      <main id="chapter-view" hidden><div class="chapter-toolbar"><button id="back-button" type="button">← All missions</button><span id="chapter-label"></span></div></main>
    </div>`;

  const splashScreen = app.querySelector<HTMLElement>('#splash-screen')!;
  const ageScreen = app.querySelector<HTMLElement>('#age-screen')!;
  const home = app.querySelector<HTMLElement>('#home')!;
  const infoView = app.querySelector<HTMLElement>('#mission-info')!;
  const chapterView = app.querySelector<HTMLElement>('#chapter-view')!;
  const chapterLabel = app.querySelector<HTMLElement>('#chapter-label')!;
  const grid = app.querySelector<HTMLElement>('#chapter-grid')!;
  let ready = false;
  let splashDone = false;
  const splashGate = new SplashGate(showAgeScreen);
  const game = StartGame('game-container', () => {
    app.dataset.splashReady = 'true';
    splashGate.ready();
  });

  function startMenuAfterSplash(): void {
    if (!ready || !splashDone) return;
    game.scene.stop('splash');
    game.scene.start('menu');
  }

  function showAgeScreen(): void {
    if (splashDone) return;
    splashDone = true;
    splashScreen.hidden = true;
    ageScreen.hidden = false;
    app.dataset.screen = 'age';
    startMenuAfterSplash();
  }
  app.querySelector<HTMLButtonElement>('#splash-skip')!.addEventListener('click', () => splashGate.skip());
  app.querySelector<HTMLFormElement>('#age-form')!.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget as HTMLFormElement).get('ageRange');
    if (value !== '7-9' && value !== '10-12') return;
    setAgeRange(value as AgeRange);
    ageScreen.hidden = true;
    home.hidden = false;
    app.dataset.screen = 'home';
  });

  function renderDirectory(): void {
    grid.replaceChildren(...missionDirectory(chapters).map((entry) => {
      const button = chapterButton(entry.chapter, entry.accessibleName, showInfo);
      button.disabled = !ready;
      return button;
    }));
  }

  function leaveCurrentScene(): void {
    const current = app.dataset.activeScene;
    if (current) game.scene.stop(current);
    chapterView.querySelectorAll(':scope > :not(.chapter-toolbar)').forEach((panel) => panel.remove());
  }

  function open(chapter: ChapterInfo): void {
    infoView.hidden = true;
    leaveCurrentScene();
    const lockMissionScroll = chapter.stage === 'Exploration' || chapter.stage === 'Establishing a presence';
    document.documentElement.classList.toggle('mission-no-scroll', lockMissionScroll);
    document.body.classList.toggle('mission-no-scroll', lockMissionScroll);
    game.scene.start(chapter.id);
    chapterLabel.textContent = chapter.title;
    home.hidden = true;
    chapterView.hidden = false;
    app.dataset.screen = 'chapter';
    window.scrollTo(0, 0);
  }

  function showInfo(chapter: ChapterInfo): void {
    leaveCurrentScene();
    document.documentElement.classList.remove('mission-no-scroll');
    document.body.classList.remove('mission-no-scroll');
    const story = chapter.story.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    const focus = chapter.focus.map((item) => `<span class="info-focus-chip">${escapeHtml(item)}</span>`).join('');
    infoView.innerHTML = `<div class="info-shell"><button class="info-back" type="button">← All missions</button><section class="info-card"><p class="eyebrow">MISSION BRIEFING</p><h1 id="info-title">${escapeHtml(chapter.title)}</h1><p class="info-lead">${escapeHtml(chapter.briefing)}</p><div class="info-grid"><section class="info-story"><h2>What you should know</h2><ul>${story}</ul></section><aside class="info-challenge"><span class="info-orbit" aria-hidden="true">◉</span><p class="info-kicker">YOUR CHALLENGE</p><p>${escapeHtml(chapter.challenge)}</p><div class="info-focus">${focus}</div></aside></div></section><div class="info-actions"><span>Ready to take command?</span><button class="info-continue" type="button">Continue to mission <span aria-hidden="true">→</span></button></div></div>`;
    infoView.querySelector('.info-back')!.addEventListener('click', returnToDirectory);
    infoView.querySelector('.info-continue')!.addEventListener('click', () => open(chapter));
    home.hidden = true;
    chapterView.hidden = true;
    infoView.hidden = false;
    app.dataset.screen = 'info';
    window.scrollTo(0, 0);
  }

  function returnToDirectory(): void {
    game.scene.start('menu');
    infoView.hidden = true;
    home.hidden = false;
    app.dataset.screen = 'home';
    renderDirectory();
  }

  function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
  }

  renderDirectory();
  app.querySelector<HTMLButtonElement>('#back-button')!.addEventListener('click', () => {
    leaveCurrentScene();
    game.scene.start('menu');
    document.documentElement.classList.remove('mission-no-scroll');
    document.body.classList.remove('mission-no-scroll');
    chapterView.hidden = true;
    returnToDirectory();
  });

  game.events.once('ready', () => {
    for (const scene of game.scene.getScenes(false)) {
      scene.events.on('start', () => { app.dataset.activeScene = scene.scene.key; });
    }
    app.dataset.activeScene = 'splash';
    ready = true;
    grid.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = false; });
    startMenuAfterSplash();
  });
}

document.addEventListener('DOMContentLoaded', boot);
