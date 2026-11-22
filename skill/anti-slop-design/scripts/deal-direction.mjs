#!/usr/bin/env node
/**
 * deal-direction.mjs — deal 3 design directions from a local library.
 * Node standard library only. No network, no API key, no npm deps.
 *
 * Usage:
 *   node scripts/deal-direction.mjs --type web
 *   node scripts/deal-direction.mjs --type logo --count 3
 *   node scripts/deal-direction.mjs --list
 *   node scripts/deal-direction.mjs --reset
 *   node scripts/deal-direction.mjs --type web --json
 *   node scripts/deal-direction.mjs --type web --seed 7
 *
 * Behaviour: deals `count` directions, avoiding directions dealt in
 * recent runs (recorded in .deal-history.json next to this script).
 * When the library is exhausted, the history resets automatically.
 * The model must never invent a look from its defaults; it deals one
 * from this library, picks one, and writes DESIGN.md from it.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = join(HERE, '.deal-history.json');

export const DIRECTIONS = [
  {
    id: 'night-laboratory',
    name: 'Night Laboratory',
    feel: 'Precise, dark, scientific — a lab bench at night.',
    palette: ['#0B0F14', '#131A22', '#E8EDF2', '#7A8A99', '#2DD4A7'],
    roles: { background: '#0B0F14', surface: '#131A22', text: '#E8EDF2', muted: '#7A8A99', accent: '#2DD4A7' },
    type: { display: 'A grotesque with tabular figures', body: 'The same grotesque, regular' },
    hero: 'A single measurement, instrument, or specimen — large, lit, alone.',
    sections: 'Data first, then method, then result. No decorative panels.',
    motion: 'Short, precise fades; numbers count up once.',
    bestFor: ['web', 'ui', 'brand'],
    avoid: 'Purple gradients, neon glows, cyan on dark as a fashion choice.',
  },
  {
    id: 'warm-workshop',
    name: 'Warm Workshop',
    feel: 'Hands, wood, paper, and honest work — a workshop, not a showroom.',
    palette: ['#F7F1E6', '#FFFFFF', '#2B2118', '#8A7A63', '#C2571B'],
    roles: { background: '#F7F1E6', surface: '#FFFFFF', text: '#2B2118', muted: '#8A7A63', accent: '#C2571B' },
    type: { display: 'A sturdy serif for headlines', body: 'A warm grotesque, regular' },
    hero: 'The maker, the material, or the tool — photographed honestly, large.',
    sections: 'Process in steps, materials named, people named.',
    motion: 'Almost none; the work is the motion.',
    bestFor: ['brand', 'social', 'web', 'logo'],
    avoid: 'Warm cream plus high-contrast serif plus terracotta used as a reflex — earn it from the subject.',
  },
  {
    id: 'swiss-industrial',
    name: 'Swiss Industrial',
    feel: 'Grid, black, white, one red — the poster as a machine.',
    palette: ['#FFFFFF', '#111111', '#E5E5E5', '#6B6B6B', '#E2001A'],
    roles: { background: '#FFFFFF', surface: '#F5F5F5', text: '#111111', muted: '#6B6B6B', accent: '#E2001A' },
    type: { display: 'A neo-grotesque, bold, tight', body: 'The same family, regular' },
    hero: 'A huge number, word, or diagram on the grid — nothing else.',
    sections: 'Strict grid, hairline rules, one red element per view.',
    motion: 'None, or a single hard cut.',
    bestFor: ['web', 'brand', 'ad', 'logo'],
    avoid: 'Decorative grids, red used everywhere, hairlines as a fashion reflex.',
  },
  {
    id: 'editorial-broadsheet',
    name: 'Editorial Broadsheet',
    feel: 'A newspaper that knows its reader — columns, rules, and one big story.',
    palette: ['#FDFCF8', '#FFFFFF', '#1A1A1A', '#6E6E6E', '#1F4E79'],
    roles: { background: '#FDFCF8', surface: '#FFFFFF', text: '#1A1A1A', muted: '#6E6E6E', accent: '#1F4E79' },
    type: { display: 'A refined serif for headlines', body: 'A readable serif or grotesque for text' },
    hero: 'The headline is the hero. One story, set large, with a rule beneath it.',
    sections: 'Columns, rules, captions that actually say something.',
    motion: 'None.',
    bestFor: ['web', 'brand', 'social'],
    avoid: 'Broadsheet hairline-rules layout used as a reflex rather than a decision from the subject.',
  },
  {
    id: 'brutalist-poster',
    name: 'Brutalist Poster',
    feel: 'Loud, flat, and honest — a poster wheat-pasted on a wall.',
    palette: ['#FFD400', '#111111', '#FFFFFF', '#E5E5E5', '#0057FF'],
    roles: { background: '#FFD400', surface: '#FFFFFF', text: '#111111', muted: '#555555', accent: '#0057FF' },
    type: { display: 'A heavy grotesque, huge, tight', body: 'The same family, bold for emphasis' },
    hero: 'One huge word or phrase, filling the frame.',
    sections: 'Flat colour fields, hard edges, no shadows, no gradients.',
    motion: 'Hard cuts only.',
    bestFor: ['social', 'ad', 'brand'],
    avoid: 'Brutalism as noise — every element must still earn its place.',
  },
  {
    id: 'soft-apothecary',
    name: 'Soft Apothecary',
    feel: 'Amber glass, stone, and quiet shelves — restraint as luxury.',
    palette: ['#F6F1E7', '#E8E0D0', '#33302A', '#8A7F70', '#8A6D3B'],
    roles: { background: '#F6F1E7', surface: '#FFFFFF', text: '#33302A', muted: '#8A7F70', accent: '#8A6D3B' },
    type: { display: 'A refined serif, used sparingly', body: 'A clear grotesque, generous line height' },
    hero: 'One bottle or object, photographed large on a plain warm background.',
    sections: 'Generous space, narrow text columns, one product per view.',
    motion: 'Slow and minimal.',
    bestFor: ['brand', 'web', 'social'],
    avoid: 'Warm cream plus serif used as a reflex; quiet must come from the material.',
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    feel: 'Dark teal, deep and calm — the sea at depth, not a neon aquarium.',
    palette: ['#062A2E', '#0B3D42', '#EAF4F2', '#7FA3A0', '#F2A541'],
    roles: { background: '#062A2E', surface: '#0B3D42', text: '#EAF4F2', muted: '#7FA3A0', accent: '#F2A541' },
    type: { display: 'A clear grotesque, large and calm', body: 'The same family, regular' },
    hero: 'One deep field of colour with a single warm light in it.',
    sections: 'Deep fields, warm accent used once per view.',
    motion: 'Slow drift, never a glow.',
    bestFor: ['web', 'ui', 'brand'],
    avoid: 'Cyan on dark, neon glows, gradient washes.',
  },
  {
    id: 'desert-modern',
    name: 'Desert Modern',
    feel: 'Sun, sand, and a single sharp shadow — mid-century, not a stock photo.',
    palette: ['#F4EDE1', '#E3D5B8', '#2E2620', '#9A8B74', '#B4552D'],
    roles: { background: '#F4EDE1', surface: '#FFFFFF', text: '#2E2620', muted: '#9A8B74', accent: '#B4552D' },
    type: { display: 'A geometric grotesque, confident', body: 'The same family, regular' },
    hero: 'Architecture or landscape in hard light, one shadow doing the work.',
    sections: 'Flat fields, hard shadows, honest photography.',
    motion: 'Almost none.',
    bestFor: ['brand', 'web', 'social'],
    avoid: 'Terracotta as a reflex; it must come from the subject, not the palette.',
  },
  {
    id: 'field-notes',
    name: 'Field Notes',
    feel: 'A notebook in the field — paper, ink, stamps, and measurements.',
    palette: ['#FAF6EC', '#FFFFFF', '#22271F', '#6B7263', '#2F5D3A'],
    roles: { background: '#FAF6EC', surface: '#FFFFFF', text: '#22271F', muted: '#6B7263', accent: '#2F5D3A' },
    type: { display: 'A sturdy grotesque for labels', body: 'A readable grotesque; monospace for data' },
    hero: 'A real observation — a measurement, a sketch, a specimen — presented plainly.',
    sections: 'Labels, rules, and data; stamps and marks used once, with meaning.',
    motion: 'None.',
    bestFor: ['brand', 'web', 'ui', 'social'],
    avoid: 'Vintage paper texture as decoration; the notes must be real.',
  },
  {
    id: 'signal-black',
    name: 'Signal Black',
    feel: 'Black, white, and one signal colour — a control room, not a nightclub.',
    palette: ['#000000', '#141414', '#FFFFFF', '#8A8A8A', '#FF5A1F'],
    roles: { background: '#000000', surface: '#141414', text: '#FFFFFF', muted: '#8A8A8A', accent: '#FF5A1F' },
    type: { display: 'A bold grotesque, huge', body: 'The same family, regular' },
    hero: 'One signal — a word, a number, a status — in the accent colour, alone.',
    sections: 'Black fields, white type, accent used once per view.',
    motion: 'Fast, short, state-driven.',
    bestFor: ['ui', 'web', 'ad'],
    avoid: 'Near-black plus acid accent used as a reflex; the signal must mean a real state.',
  },
  {
    id: 'garden-market',
    name: 'Garden Market',
    feel: 'A market stall in the morning — green, paper, and real produce.',
    palette: ['#F2F5E9', '#FFFFFF', '#22301F', '#6F7D63', '#3E7A2E'],
    roles: { background: '#F2F5E9', surface: '#FFFFFF', text: '#22301F', muted: '#6F7D63', accent: '#3E7A2E' },
    type: { display: 'A friendly grotesque, bold', body: 'The same family, regular' },
    hero: 'Real produce or a real person at the stall, photographed in daylight.',
    sections: 'Paper labels, real prices, real names.',
    motion: 'Almost none.',
    bestFor: ['brand', 'social', 'ad'],
    avoid: 'Leaf icons and green washes as a substitute for real photography.',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    feel: 'A drawing board — blue lines on white, measurements, and precision.',
    palette: ['#FFFFFF', '#EAF0F7', '#12233D', '#5B728F', '#1450C8'],
    roles: { background: '#FFFFFF', surface: '#EAF0F7', text: '#12233D', muted: '#5B728F', accent: '#1450C8' },
    type: { display: 'A technical grotesque, precise', body: 'The same family; monospace for measurements' },
    hero: 'A diagram or a measurement, drawn clearly, with labels that mean something.',
    sections: 'Hairline rules, numbered steps, diagrams that explain.',
    motion: 'Diagrams animate to explain a flow, nothing else.',
    bestFor: ['web', 'ui', 'brand'],
    avoid: 'Blueprint texture as decoration; the diagram must explain a real thing.',
  },
];

function readHistory() {
  try {
    if (!existsSync(HISTORY_FILE)) return [];
    const raw = JSON.parse(readFileSync(HISTORY_FILE, 'utf8'));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeHistory(ids) {
  try {
    writeFileSync(HISTORY_FILE, JSON.stringify(ids, null, 2) + '\n', 'utf8');
  } catch {
    // History is a convenience, not a gate. A read-only install still deals.
  }
}

function seededShuffle(items, seed) {
  const arr = [...items];
  let s = seed >>> 0 || 1;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseArgs(argv) {
  const out = { type: null, count: 3, json: false, list: false, reset: false, seed: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--type' && argv[i + 1]) out.type = argv[++i].toLowerCase();
    else if (a.startsWith('--type=')) out.type = a.slice(7).toLowerCase();
    else if (a === '--count' && argv[i + 1]) out.count = Math.max(1, Math.min(5, Number(argv[++i]) || 3));
    else if (a === '--json') out.json = true;
    else if (a === '--list') out.list = true;
    else if (a === '--reset') out.reset = true;
    else if (a === '--seed' && argv[i + 1]) out.seed = Number(argv[++i]);
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node scripts/deal-direction.mjs [--type logo|brand|social|ad|web|ui] [--count 3] [--json] [--list] [--reset] [--seed N]');
    return;
  }
  if (args.list) {
    for (const d of DIRECTIONS) {
      console.log(`- ${d.id}: ${d.name} — ${d.feel} [${d.bestFor.join(', ')}]`);
    }
    return;
  }
  if (args.reset) {
    writeHistory([]);
    console.log('Deal history cleared. The full library is available again.');
    return;
  }

  let pool = DIRECTIONS;
  if (args.type) {
    const filtered = DIRECTIONS.filter((d) => d.bestFor.includes(args.type));
    if (filtered.length >= args.count) pool = filtered;
    // If fewer than `count` fit the type, fall back to the full library
    // rather than dealing duplicates — the type is a preference, not a lock.
  }

  let history = readHistory();
  let available = pool.filter((d) => !history.includes(d.id));
  if (available.length < args.count) {
    available = [...pool];
    history = [];
  }
  const shuffled = args.seed != null
    ? seededShuffle(available, args.seed)
    : [...available].sort(() => Math.random() - 0.5);
  const dealt = shuffled.slice(0, args.count);
  writeHistory([...history, ...dealt.map((d) => d.id)]);

  if (args.json) {
    console.log(JSON.stringify({ type: args.type || null, dealt }, null, 2));
    return;
  }
  console.log(`Dealt ${dealt.length} direction(s)${args.type ? ` for ${args.type}` : ''}. Pick ONE, write it into DESIGN.md, and check it against references/banned-list.md.\n`);
  for (const d of dealt) {
    console.log(`### ${d.name}  (${d.id})`);
    console.log(`Feel: ${d.feel}`);
    console.log(`Palette: ${d.palette.join('  ')}`);
    console.log(`Roles: background ${d.roles.background}, surface ${d.roles.surface}, text ${d.roles.text}, muted ${d.roles.muted}, accent ${d.roles.accent}`);
    console.log(`Type: display — ${d.type.display}; body — ${d.type.body}.`);
    console.log(`Hero: ${d.hero}`);
    console.log(`Sections: ${d.sections}`);
    console.log(`Motion: ${d.motion}`);
    console.log(`Avoid: ${d.avoid}\n`);
  }
}

main();
