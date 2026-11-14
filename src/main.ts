import StartGame from './game/main';
import { chapters, type ChapterInfo } from './game/chapters/catalog';
import { missionDirectory } from './missionDirectory';

function chapterButton(chapter: ChapterInfo, accessibleName: string, open: (chapter: ChapterInfo) => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'chapter-card';
  button.type = 'button';
  button.disabled = true;
  button.dataset.chapter = chapter.id;
  button.setAttribute('aria-label', accessibleName);
  button.innerHTML = '<span class="chapter-number"></span><span class="chapter-stage"></span><strong></strong><span class="chapter-summary"></span><span class="chapter-focus"></span><span class="chapter-arrow" aria-hidden="true">↗</span>';
  button.querySelector('.chapter-number')!.textContent = `MISSION ${String(chapter.number).padStart(2, '0')}`;
  button.querySelector('.chapter-stage')!.textContent = chapter.stage;
  button.querySelector('strong')!.textContent = chapter.title;
  button.querySelector('.chapter-summary')!.textContent = chapter.summary;
  button.querySelector('.chapter-focus')!.textContent = chapter.focus.join(' · ');
  button.addEventListener('click', () => open(chapter));
  return button;
}

function boot(): void {
  const app = document.querySelector<HTMLElement>('#app');
  if (!app) throw new Error('Missing app element');
  app.innerHTML = `
    <div id="game-container" aria-hidden="true"></div>
    <div class="shell">
      <header class="topbar"><span class="brand-mark" aria-hidden="true">✦</span><span class="brand">JUNIOR ASTRONAUT<br><strong>MISSION TRAINER</strong></span><span class="topbar-label">MOON BASE PROGRAM / 2026</span></header>
      <main id="home">
        <section class="missions" id="missions" aria-labelledby="missions-title"><div class="section-heading"><div><p class="eyebrow">BUILD A HOME ON THE MOON</p><h1 id="missions-title">Pick your next mission</h1></div><p>Start anywhere. Every mission is open.</p></div><div class="chapter-grid" id="chapter-grid"></div></section>
      </main>
      <main id="chapter-view" hidden><div class="chapter-toolbar"><button id="back-button" type="button">← All missions</button><span id="chapter-label"></span></div></main>
    </div>`;

  const home = app.querySelector<HTMLElement>('#home')!;
  const chapterView = app.querySelector<HTMLElement>('#chapter-view')!;
  const chapterLabel = app.querySelector<HTMLElement>('#chapter-label')!;
  const grid = app.querySelector<HTMLElement>('#chapter-grid')!;
  const game = StartGame('game-container');

  function open(chapter: ChapterInfo): void {
    game.scene.start(chapter.id);
    chapterLabel.textContent = `MISSION ${String(chapter.number).padStart(2, '0')} / ${chapter.title}`;
    home.hidden = true;
    chapterView.hidden = false;
    window.scrollTo(0, 0);
  }

  for (const entry of missionDirectory(chapters)) grid.append(chapterButton(entry.chapter, entry.accessibleName, open));
  app.querySelector<HTMLButtonElement>('#back-button')!.addEventListener('click', () => {
    game.scene.start('menu');
    chapterView.hidden = true;
    home.hidden = false;
  });

  game.events.once('ready', () => {
    for (const scene of game.scene.getScenes(false)) {
      scene.events.on('start', () => { app.dataset.activeScene = scene.scene.key; });
    }
    app.dataset.activeScene = 'menu';
    grid.querySelectorAll<HTMLButtonElement>('button').forEach((button) => { button.disabled = false; });
  });
}

document.addEventListener('DOMContentLoaded', boot);
