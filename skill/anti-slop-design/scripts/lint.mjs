#!/usr/bin/env node
/**
 * lint.mjs — deterministic banned-pattern scan of HTML / CSS / copy.
 * Node standard library only. No network, no API key, no npm deps.
 *
 * Usage:
 *   node scripts/lint.mjs index.html
 *   node scripts/lint.mjs ./dist
 *   node scripts/lint.mjs index.html style.css --json
 *   echo "<html>…" | node scripts/lint.mjs --stdin
 *
 * Exit code: 1 if any BANNED pattern is found, 0 otherwise.
 * Warnings do not fail the run, but each one needs a written reason
 * to keep (see references/qc-checklist.md, Gate B).
 *
 * Scoring: start at 100. Each banned hit costs 12, each warning 5.
 * Floor is 0. This is a deterministic check, not a taste score — the
 * 35/50 judgment rubric lives in references/qc-checklist.md.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCANNABLE = new Set(['.html', '.htm', '.css', '.md', '.txt', '.js', '.jsx', '.tsx', '.vue', '.svelte']);

const CHECKS = [
  {
    id: 'purple-gradient',
    severity: 'banned',
    label: 'Purple-to-blue / purple-to-magenta gradient',
    test: (t) => /linear-gradient\([^)]*(?:#(?:7c3aed|8b5cf6|a855f7|9333ea|6d28d9|7e22ce)|purple|violet|magenta)[^)]*(?:#(?:2563eb|3b82f6|1d4ed8|0ea5e9|06b6d4)|blue|cyan)[^)]*\)/i.test(t)
      || /linear-gradient\([^)]*(?:#(?:2563eb|3b82f6)|blue)[^)]*(?:#(?:7c3aed|8b5cf6|a855f7)|purple|violet)[^)]*\)/i.test(t),
    fix: 'Replace the gradient with a solid colour field. One dominant colour plus one sharp accent.',
  },
  {
    id: 'gradient-text',
    severity: 'banned',
    label: 'Gradient text',
    test: (t) => /background-clip:\s*text/i.test(t) || /-webkit-text-fill-color:\s*transparent/i.test(t),
    fix: 'Use solid colour text only.',
  },
  {
    id: 'cyan-on-dark',
    severity: 'banned',
    label: 'Cyan on dark (cyan text / glow on a dark background)',
    test: (t) => /#00(?:e5ff|ffff|d9ff)|color:\s*(?:cyan|#0ff|#00ffff)/i.test(t) && /#0[0-9a-f]{5}|background:\s*#1[0-9a-f]{5}|dark/i.test(t),
    fix: 'Use a muted tint of the background colour for secondary text, not cyan.',
  },
  {
    id: 'neon-glow',
    severity: 'banned',
    label: 'Neon glow (large blurred coloured box-shadow / drop-shadow)',
    test: (t) => /box-shadow:[^;]{0,120}(?:0\s+0\s+(?:4[0-9]|[5-9][0-9])px)[^;]*(?:#(?:7c3aed|8b5cf6|a855f7|06b6d4|22d3ee|a3e635)|purple|cyan|neon)/i.test(t)
      || /filter:\s*drop-shadow\([^)]*(?:#(?:7c3aed|8b5cf6|a855f7|06b6d4)|purple|cyan)/i.test(t),
    fix: 'Remove the glow. Use a flat shadow or a hairline border.',
  },
  {
    id: 'default-font-only',
    severity: 'warning',
    label: 'Default font as the only choice (Inter / Roboto / Arial / Open Sans) with no stated reason',
    test: (t) => {
      const m = t.match(/font-family:[^;]+/gi) || [];
      if (!m.length) return false;
      return m.every((f) => /inter|roboto|arial|open sans|system-ui|sans-serif/i.test(f));
    },
    fix: 'Name a font choice with a stated reason (role, pairing, link to the subject) in DESIGN.md.',
  },
  {
    id: 'pure-black-white',
    severity: 'warning',
    label: 'Pure #000 / #fff used as the main page background or body text',
    // Narrow on purpose: white text on a coloured button (e.g. #FFFFFF
    // on a burnt-orange button) is legitimate contrast, not slop.
    // Flag only pure black/white as a body/hero/main background or
    // as the main body text colour.
    test: (t) => /(?:body|\.hero|main|html)[^{]*\{[^}]*(?:background(?:-color)?|color)\s*:\s*#(?:000|000000|fff|ffffff)\b/i.test(t),
    fix: 'Use a near-black / near-white with a tint toward the brand hue for page backgrounds and body text.',
  },
  {
    id: 'eyebrow-overuse',
    severity: 'warning',
    label: 'ALL-CAPS eyebrow above many headings',
    test: (t) => {
      const eyebrows = (t.match(/eyebrow/gi) || []).length;
      const upper = (t.match(/text-transform:\s*uppercase/gi) || []).length;
      return eyebrows + upper > 2;
    },
    fix: 'Ration ornaments: at most one eyebrow label per three sections.',
  },
  {
    id: 'accented-headline-word',
    severity: 'warning',
    label: 'Single accented word inside a headline',
    test: (t) => /<h1[^>]*>[\s\S]{0,200}<(?:span|em|strong)[^>]*(?:accent|highlight|text-[a-z-]+)[^>]*>/i.test(t),
    fix: 'Make the whole headline carry the idea, not one coloured word.',
  },
  {
    id: 'h-screen',
    severity: 'warning',
    label: 'h-screen hero (overflows on mobile)',
    test: (t) => /\bh-screen\b/.test(t),
    fix: 'Use min-h-100dvh (or equivalent) so the hero fits its screen.',
  },
  {
    id: 'lorem',
    severity: 'banned',
    label: 'Lorem ipsum placeholder text',
    test: (t) => /lorem ipsum/i.test(t),
    fix: 'Replace with real copy in the user’s words, or mark the section as a proof gap.',
  },
  {
    id: 'invented-social-proof',
    severity: 'banned',
    label: 'Invented social proof ("Trusted by 10,000+ teams" or similar)',
    test: (t) => /trusted by\s+(?:10,?000\+|thousands|over\s+\d)/i.test(t) || /10,?000\+\s+(?:teams|customers|users|happy)/i.test(t),
    fix: 'Remove it, or replace with a sourced number from the intake or research.',
  },
  {
    id: 'not-just-x',
    severity: 'banned',
    label: '"It’s not X, it’s Y" / "not just X, it’s Y" phrasing',
    test: (t) => /not just [^,.;]{1,60},?\s+it'?s /i.test(t) || /it'?s not [^,.;]{1,60},?\s+it'?s /i.test(t),
    fix: 'Say what it is, directly, without the negative parallelism.',
  },
  {
    id: 'fake-form',
    severity: 'warning',
    label: 'Form with no destination, or a "thanks" with no send',
    test: (t) => /<form(?![\s\S]{0,300}action=)[\s\S]{0,200}>/i.test(t),
    fix: 'Give the form a real destination and a success / error state. Never a fake thanks.',
  },
  {
    id: 'pill-buttons-everywhere',
    severity: 'warning',
    label: 'Generic pill buttons everywhere (border-radius 999px used repeatedly)',
    test: (t) => ((t.match(/border-radius:\s*999(?:9)?px/gi) || []).length > 2),
    fix: 'Use one button shape with intent; not every action needs a pill.',
  },
  {
    id: 'emdash-overuse',
    severity: 'warning',
    label: 'Em-dash overuse (4 or more em dashes)',
    test: (t) => ((t.match(/—/g) || []).length >= 4),
    fix: 'Keep at most one em dash per passage. Restructure or use a comma.',
  },
];

function collectFiles(targets) {
  const files = [];
  for (const target of targets) {
    if (!existsSync(target)) {
      console.error(`lint: no such file or directory: ${target}`);
      process.exitCode = 2;
      continue;
    }
    const st = statSync(target);
    if (st.isDirectory()) {
      for (const entry of readdirSync(target)) {
        files.push(...collectFiles([join(target, entry)]));
      }
    } else if (SCANNABLE.has(extname(target).toLowerCase())) {
      files.push(target);
    }
  }
  return files;
}

async function readStdin() {
  let out = '';
  for await (const chunk of process.stdin) out += chunk;
  return out;
}

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const useStdin = argv.includes('--stdin');
  const targets = argv.filter((a) => !a.startsWith('--'));

  let inputs = [];
  if (useStdin) {
    inputs = [{ name: '<stdin>', text: await readStdin() }];
  } else {
    if (!targets.length) {
      console.error('Usage: node scripts/lint.mjs <file-or-folder> [--json]  |  node scripts/lint.mjs --stdin');
      process.exitCode = 2;
      return;
    }
    const files = collectFiles(targets);
    if (!files.length) {
      console.error('lint: no scannable files found (.html, .css, .md, .txt, .js, .jsx, .tsx, .vue, .svelte).');
      process.exitCode = 2;
      return;
    }
    inputs = files.map((f) => ({ name: f, text: readFileSync(f, 'utf8') }));
  }

  const findings = [];
  for (const { name, text } of inputs) {
    for (const check of CHECKS) {
      let hit = false;
      try { hit = check.test(text); } catch { hit = false; }
      if (hit) findings.push({ file: name, ...check, test: undefined });
    }
  }

  const banned = findings.filter((f) => f.severity === 'banned');
  const warnings = findings.filter((f) => f.severity === 'warning');
  const score = Math.max(0, 100 - banned.length * 12 - warnings.length * 5);
  const result = {
    files: inputs.map((i) => i.name),
    score,
    banned: banned.length,
    warnings: warnings.length,
    findings: findings.map(({ id, severity, label, fix, file }) => ({ id, severity, label, fix, file })),
  };

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Lint score: ${score}/100 — ${banned.length} banned, ${warnings.length} warnings, across ${inputs.length} file(s).`);
    if (!findings.length) {
      console.log('No banned patterns found. Check Gate B (judgment) in references/qc-checklist.md before delivering.');
    }
    for (const f of findings) {
      console.log(`\n[${f.severity.toUpperCase()}] ${f.label} — ${f.file}`);
      console.log(`  Fix: ${f.fix}`);
    }
    if (banned.length) console.log('\nResult: FAIL — fix every banned hit before delivery.');
    else if (warnings.length) console.log('\nResult: PASS with warnings — each warning needs a written reason to keep.');
    else console.log('\nResult: PASS.');
  }
  process.exitCode = banned.length ? 1 : 0;
}

main();
