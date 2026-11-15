// Rebuild the TypeScript catalog from the supplied generated source-list snapshot.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = await readFile(resolve(root, 'docs/knowledge/sources-list.md'), 'utf8');
const sections = new Map();
let section = '';
for (const line of input.replace(/^\uFEFF/, '').split(/\r?\n/)) {
  if (line.startsWith('## ')) section = line.slice(3).trim();
  else if (line.startsWith('|')) {
    const cells = line.slice(1, -1).split('|').map(cell => cell.trim());
    if (!sections.has(section)) sections.set(section, []);
    sections.get(section).push(cells);
  }
}
const sources = (sections.get('Sources') ?? []).filter(row => /^\d+$/.test(row[0]));
if (sources.length !== 154 || sources.some((row, index) => row.length !== 11 || Number(row[0]) !== index + 1)) throw new Error('Expected 154 sequential source rows with 11 fields');
if (new Set(sources.map(row => row[1])).size !== sources.length) throw new Error('Duplicate source key');
const groups = new Set(['nasaChallengeResource', 'nasa', 'nasaMedia', 'partner', 'other', 'media']);
const checked = new Set(['read', 'searchResultOnly', 'notVerified', 'other', 'unknown']);
const list = value => value ? value.split(',').map(item => item.trim()).filter(Boolean) : [];
const records = sources.map(([, key, title, organisation, url, group, challengeResource, licence, status, topics, usedBy]) => {
  if (!key || !title || !organisation || !groups.has(group) || !checked.has(status)) throw new Error(`Invalid source: ${key}`);
  return { key, title, organisation, ...(url && { url }), group, ...(challengeResource && { challengeResource }), ...(licence && { licence }), checked: status, topics: list(topics), usedBy: list(usedBy) };
});
const header = `// Generated from docs/knowledge/sources-list.md; run node scripts/generate-source-catalog.mjs.\n`;
const types = `export type SourceGroup = 'nasaChallengeResource' | 'nasa' | 'nasaMedia' | 'partner' | 'other' | 'media';\nexport type SourceChecked = 'read' | 'searchResultOnly' | 'notVerified' | 'other' | 'unknown';\nexport interface Source { key: string; title: string; organisation: string; url?: string; group: SourceGroup; challengeResource?: string; licence?: string; checked: SourceChecked; topics: readonly string[]; usedBy: readonly string[]; }\nexport const GROUP_WORDS: Record<SourceGroup, string> = { nasaChallengeResource: '🚀 NASA data named in the challenge', nasa: '🚀 NASA', nasaMedia: '🖼️ NASA pictures and sounds', partner: '🤝 Other space and science agencies', other: '🌎 Other sources', media: '🎨 Free game art and sounds' };\n`;
const cuts = [0, 36, 77, 120, 154];
for (let i = 0; i < 4; i++) {
  const prefix = i === 0 ? types : `import type { Source } from './sources1';\n`;
  const body = `${header}${prefix}\nexport const sources${i + 1}: readonly Source[] = ${JSON.stringify(records.slice(cuts[i], cuts[i + 1]), null, 2)};\n`;
  await writeFile(resolve(root, `src/facts/sources${i + 1}.ts`), body, 'utf8');
}
const mediaRows = (sections.get('Media items and their source (mediaSourceKey)') ?? []).slice(2);
const textRows = (sections.get('Team text sections (textFacts and textSources)') ?? []).slice(2);
const media = Object.fromEntries(mediaRows.map(row => {
  if (row.length !== 2 || !row[0] || !row[1]) throw new Error('Invalid media source row');
  return [row[0], row[1]];
}));
const textFacts = Object.fromEntries(textRows.map(row => {
  if (row.length !== 3 || !row[0]) throw new Error('Invalid team text row');
  return [row[0], list(row[1])];
}));
const textSources = Object.fromEntries(textRows.map(row => [row[0], list(row[2])]));
const barrel = `${header}import { sources1 } from './sources1';\nimport { sources2 } from './sources2';\nimport { sources3 } from './sources3';\nimport { sources4 } from './sources4';\nimport type { Source } from './sources1';\nexport type { Source, SourceGroup, SourceChecked } from './sources1';\nexport { GROUP_WORDS } from './sources1';\n\nexport const sources: readonly Source[] = [...sources1, ...sources2, ...sources3, ...sources4];\nconst index = new Map(sources.map(source => [source.key, source]));\nexport function getSource(key: string): Source | undefined { return index.get(key); }\nexport const mediaSourceKey: Readonly<Record<string, string>> = ${JSON.stringify(media, null, 2)};\nexport const textFacts: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(textFacts, null, 2)};\nexport const textSources: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(textSources, null, 2)};\n`;
await writeFile(resolve(root, 'src/facts/sources.ts'), barrel, 'utf8');
console.log(`Generated ${records.length} sources, ${Object.keys(media).length} media links, ${textRows.length} text sections.`);
