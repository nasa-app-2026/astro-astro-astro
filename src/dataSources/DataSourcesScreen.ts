import './dataSources.css';
import { getPlayerProfile } from '../playerProfile';
import { chapter5Data } from '../data/chapter5/data-screen';
import { createDataSourcesInput } from './sourceData';
import { buildDataSourcesModel, isSearchResultOnly, type ChapterFilter, type ListedSource } from './model';

const input = createDataSourcesInput();

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

function sourceLink(source: ListedSource): string {
  if (!source.url) return '<span class="ds-no-link">Link unavailable in catalog</span>';
  const url = escapeHtml(source.url);
  return `<a href="${url}" target="_blank" rel="noopener noreferrer">Open source in a new tab <span aria-hidden="true">↗</span></a>`;
}

function checkedNote(source: ListedSource, showNotes: boolean): string {
  return showNotes && isSearchResultOnly(source.checked)
    ? '<small class="ds-check-note">(not fully checked)</small>'
    : '';
}

function sourceCard(source: ListedSource, showNotes: boolean, extra?: string, badge?: string): string {
  return `<article class="ds-source" data-source-key="${escapeHtml(source.key)}"><div class="ds-source-heading"><h3>${escapeHtml(source.title)}</h3>${badge ?? ''}${checkedNote(source, showNotes)}</div><p>${escapeHtml(source.organisation)}</p>${extra ?? ''}${sourceLink(source)}</article>`;
}

function mediaCards(kind: 'image' | 'audio', model: ReturnType<typeof buildDataSourcesModel>): string {
  const entries = input.mediaFiles.filter((file) => file.kind === kind);
  const creditedById = new Map(model.creditedMedia.map((entry) => [entry.id, entry]));
  const cards = entries.map((file) => {
    const credit = creditedById.get(file.id);
    if (!credit) return `<li class="ds-media ds-needs-credit"><strong>${escapeHtml(file.fileName)}</strong><span>Needs a credit</span></li>`;
    return `<li class="ds-media"><strong>${escapeHtml(file.fileName)}</strong><span>${escapeHtml(credit.credit)}</span><small>Collection: ${escapeHtml(credit.collectionTitle)}</small></li>`;
  });
  return `<details class="ds-media-kind"><summary>${kind === 'image' ? 'Pictures' : 'Sounds'} <span>(${entries.length})</span></summary><ul>${cards.join('')}</ul></details>`;
}

function dataForFilter(filter: ChapterFilter, showNotes: boolean): string {
  const model = buildDataSourcesModel(input, filter);
  const nasaCards = model.nasaChallengeSources.map((source) => sourceCard(
    source,
    showNotes,
    `<p class="ds-why"><strong>Why we used it</strong><br>${escapeHtml(source.whyUsed)}</p>`,
    source.archivedNotLive ? '<span class="ds-archived">Archived, not live</span>' : '',
  )).join('');
  const sourceRows = model.allSourcesRows.map((row) => row.kind === 'heading'
    ? `<h3 class="ds-group-heading">${escapeHtml(row.title)}</h3>`
    : sourceCard(row.source, showNotes)).join('');
  const media = model.creditedMedia;
  const needsCredit = model.mediaNeedingCredit;
  const numbers = chapter5Data().gameNumbers.map((entry) => `<li><span>${escapeHtml(entry.name)}</span><strong>${escapeHtml(String(entry.value))}</strong></li>`).join('');

  return `<section class="ds-section" aria-labelledby="nasa-data-title"><h2 id="nasa-data-title">NASA data in this game</h2><div class="ds-card-list">${nasaCards || '<p class="ds-empty">No NASA challenge data sources match this chapter.</p>'}</div></section>
    <section class="ds-section" aria-labelledby="all-sources-title"><h2 id="all-sources-title">All our sources</h2><div class="ds-source-list">${sourceRows || '<p class="ds-empty">No sources match this chapter.</p>'}</div></section>
    <section class="ds-section" aria-labelledby="pictures-sounds-title"><h2 id="pictures-sounds-title">Pictures and sounds</h2><details id="pictures-and-sounds"><summary>Pictures and sounds</summary>${mediaCards('image', model)}${mediaCards('audio', model)}${needsCredit.length ? `<section class="ds-needs-section"><h3>Needs a credit</h3><ul>${needsCredit.map((file) => `<li>${escapeHtml(file.fileName)}</li>`).join('')}</ul></section>` : ''}</details><p class="ds-media-count">${media.length} credited files · ${needsCredit.length} needing a credit</p></section>
    <section class="ds-section" aria-labelledby="game-numbers-title"><h2 id="game-numbers-title">Game numbers</h2><p class="ds-made-up">Made up to make the game playable</p><ul class="ds-number-list">${numbers}</ul></section>
    <footer class="ds-footer">This game was made by students, not by NASA.</footer>`;
}

export function mountDataSourcesScreen(root: HTMLElement, onBack: () => void): void {
  const render = (filter: ChapterFilter = 'all'): void => {
    const isYounger = getPlayerProfile().ageRange === '7-9';
    const options = input.chapters
      .slice()
      .sort((left, right) => left.number - right.number)
      .map((chapter) => `<option value="${chapter.number}" ${filter === chapter.number ? 'selected' : ''}>${chapter.number} ${escapeHtml(chapter.title)}</option>`)
      .join('');
    root.innerHTML = `<div class="ds-page"><header class="ds-header"><button id="data-sources-back" type="button">← Back</button><p class="eyebrow">JUNIOR ASTRONAUT MISSION TRAINER</p><h1>Where our data comes from</h1>${isYounger ? '<p class="ds-intro">These are the real places our facts and pictures come from</p>' : ''}<label for="data-sources-filter">Show sources for:</label><select id="data-sources-filter"><option value="all" ${filter === 'all' ? 'selected' : ''}>All</option>${options}</select></header><div class="ds-content">${dataForFilter(filter, !isYounger)}</div></div>`;
    root.querySelector<HTMLButtonElement>('#data-sources-back')!.addEventListener('click', onBack);
    root.querySelector<HTMLSelectElement>('#data-sources-filter')!.addEventListener('change', (event) => {
      const value = (event.currentTarget as HTMLSelectElement).value;
      render(value === 'all' ? 'all' : Number(value));
      root.querySelector<HTMLSelectElement>('#data-sources-filter')!.focus();
    });
  };
  render();
}
