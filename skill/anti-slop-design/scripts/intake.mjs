#!/usr/bin/env node
/**
 * intake.mjs — print a per-type questionnaire, and check answers.
 * Node standard library only. No network, no API key, no npm deps.
 *
 * Usage:
 *   node scripts/intake.mjs                  # list types
 *   node scripts/intake.mjs logo             # print the logo questionnaire
 *   node scripts/intake.mjs web --json       # print as JSON
 *   node scripts/intake.mjs logo --answers answers.json
 *   node scripts/intake.mjs logo --answers answers.json --waive colour,mark-type
 *
 * Answers file: a JSON object mapping question id -> answer string.
 *   { "purpose": "…", "audience": "…", "brand-name": "Acme Coffee" }
 * A question counts as answered when its value is a non-empty string.
 *
 * Blocking rule (Gate 1): progress is blocked while any REQUIRED
 * question is unanswered and not explicitly waived. The command exits
 * 1 in that case and lists the gaps. Pass --waive with a comma list
 * of question ids only when the user has explicitly waived them in
 * writing — waived items are recorded as assumptions to confirm,
 * never as silent inventions.
 */

import { readFileSync, existsSync } from 'node:fs';

const UNIVERSAL = [
  { id: 'purpose', required: true, text: 'What is it for — what is the one action the viewer should take after seeing this?' },
  { id: 'audience', required: true, text: 'Who is it for (audience, age, context, where they will meet it)?' },
  { id: 'placement', required: true, text: 'Where will it be seen (sizes, surfaces, light and dark contexts)?' },
  { id: 'existing', required: true, text: 'What exists already (brand, logo, colours, fonts, photos, copy)? Attach files or links.' },
  { id: 'not-like', required: true, text: 'What must it NOT look like, and who are the competitors to differ from?' },
  { id: 'deadline-format', required: true, text: 'What is the deadline and the deliverable format (file types, sizes, variants)?' },
  { id: 'unknown', required: false, text: 'What is unknown — and who can answer it?' },
];

const SPECIFIC = {
  logo: [
    { id: 'brand-name', required: true, text: 'Brand name — exact spelling and case. Any tagline? Is the tagline part of the mark or separate?' },
    { id: 'does', required: true, text: 'What does the company or project do, in one sentence?' },
    { id: 'values-3-words', required: true, text: 'Values and personality in exactly 3 words.' },
    { id: 'logo-surfaces', required: true, text: 'Where must the logo work — favicon at 16px, app icon, website, print, signage, embroidery, single colour, reversed on dark?' },
    { id: 'colour-constraints', required: true, text: 'Colour constraints, and colours that must be avoided (competitor colours, cultural meanings, print limits)?' },
    { id: 'existing-marks', required: false, text: 'Existing marks to keep or kill — what came before, and why is it being replaced?' },
    { id: 'competitor-marks', required: false, text: "Competitors' marks to differ from — name them and say how." },
    { id: 'mark-type', required: false, text: 'Preferred mark type, or none: wordmark, monogram, icon, combination mark, emblem?' },
    { id: 'trademark-check', required: false, text: 'Has any trademark or availability check been done? (Never invent a check.)' },
    { id: 'feeling-3s', required: false, text: 'What feeling should it give in 3 seconds — trustworthy, playful, premium, rebellious, calm, technical?' },
    { id: 'must-appear', required: false, text: 'Any words, letters, or symbols that must appear — or must never appear?' },
  ],
  brand: [
    { id: 'brand-story', required: true, text: 'Brand story in 2–3 sentences, and brand voice (formal, playful, luxury, technical, warm, rebellious — pick, do not hedge)?' },
    { id: 'deliverables', required: true, text: 'Full deliverables list: stationery, slide deck, packaging, social templates, guidelines document, signage, merchandise?' },
    { id: 'palette', required: true, text: 'Primary and secondary palette — existing hex values, or free choice? Any colour already owned by the brand?' },
    { id: 'font-licences', required: false, text: 'Type licences already owned — which fonts, and may they be used in this deliverable?' },
    { id: 'imagery-style', required: false, text: 'Imagery style: photography, illustration, 3D, none — and whose photos or illustrations?' },
    { id: 'logo-files', required: false, text: 'Logo files available (vector, colour, mono, reversed)? Who owns the logo?' },
    { id: 'accessibility', required: false, text: 'Accessibility needs (contrast, legibility, language, reading level)?' },
    { id: 'print-specs', required: false, text: 'Print versus digital specs: bleed, CMYK versus RGB, paper, sizes, finishes?' },
    { id: 'guidelines-home', required: false, text: 'Where will the guidelines live, and who must be able to follow them without a designer present?' },
    { id: 'competitor-brands', required: false, text: 'Competitor brands to differ from — name them and say how.' },
    { id: 'done-looks-like', required: false, text: 'What does "done" look like — a PDF guideline, a template set, a single poster, a full identity?' },
  ],
  social: [
    { id: 'platforms-ratios', required: true, text: 'Platform(s) and exact aspect ratios: 1:1, 4:5, 9:16, 16:9 — one file per ratio, or one ratio only?' },
    { id: 'format', required: true, text: 'Feed post, story, reel cover, carousel (how many slides?), or profile asset?' },
    { id: 'one-message', required: true, text: 'The one message in 10 words or fewer. If it takes more, it is two posts.' },
    { id: 'caption-hashtags', required: true, text: 'Caption and hashtags — who writes them, and are they approved? Attach the exact text.' },
    { id: 'cta', required: true, text: 'Call to action: link in bio, comment a word, share, save, follow, visit, buy — exactly one.' },
    { id: 'brand-template', required: false, text: 'Brand template to follow or to break — attach it if it exists.' },
    { id: 'posting-date', required: false, text: 'Posting date and any campaign tie-in (launch, sale, event, trend)?' },
    { id: 'safe-area', required: false, text: 'Safe-area and legibility needs: text over image, small screens, auto-captions, language?' },
    { id: 'photos-supplied', required: false, text: 'Photos or video supplied, or to be sourced? Who is in them, and is there permission to use them?' },
    { id: 'success-looks-like', required: false, text: 'What does success look like — saves, shares, comments, clicks, or simply looking professional in the grid?' },
  ],
  ad: [
    { id: 'objective-kpi', required: true, text: 'Objective and KPI: click, install, purchase, awareness, sign-up — and how will success be measured?' },
    { id: 'audience-placements', required: true, text: 'Audience, targeting, and placement list: feed, story, display — with exact pixel sizes for every placement.' },
    { id: 'approved-copy', required: true, text: 'Headline, body copy, and CTA — exact approved wording, and who approves it? Attach it.' },
    { id: 'offer-price-deadline', required: true, text: 'Offer, price, and deadline — exact and verifiable. No invented discounts, no fake urgency.' },
    { id: 'compliance', required: false, text: 'Brand and legal / compliance constraints: claims allowed, claims banned, disclaimers required, no before-and-after?' },
    { id: 'competitor-ads', required: false, text: "Competitors' ads to beat — link them and say what makes them work." },
    { id: 'variants', required: false, text: 'Variants needed: how many sizes, how many hooks, how many concepts?' },
    { id: 'budget-dates', required: false, text: 'Budget and run dates, if they change the design (for example a sale ending on a date that must be on the creative).' },
    { id: 'proof', required: false, text: 'What proof exists — reviews, ratings, numbers, awards — with sources and permission to use them?' },
  ],
  web: [
    { id: 'one-job', required: true, text: 'The one job of the page, and the one action — sign up, buy, book, download, contact. Exactly one primary action.' },
    { id: 'objection', required: true, text: "Audience, and the objection to overcome — price, trust, time, complexity, 'is this for me?'" },
    { id: 'sections', required: true, text: 'Sections needed: hero, proof, how it works, pricing, FAQ, footer — and which of these are truly needed?' },
    { id: 'real-proof', required: true, text: 'Real proof: numbers, testimonials with names, client logos with permission. Attach them. No invented proof, ever.' },
    { id: 'pricing-offer', required: false, text: 'Pricing and offer details — exact prices, plans, terms, guarantees.' },
    { id: 'existing-site', required: false, text: 'Existing site, brand, or DESIGN.md to keep — link it.' },
    { id: 'stack-hosting', required: false, text: 'Tech stack and hosting: static HTML, Next.js, Webflow, WordPress, other? Who will maintain it after delivery?' },
    { id: 'seo-og', required: false, text: 'SEO, meta, and Open Graph needs: title, description, social image?' },
    { id: 'form-destination', required: false, text: 'Analytics and form destination — real. Never a fake "thanks" form. Where does a submission actually go?' },
    { id: 'copy-final', required: false, text: 'Content: who writes the copy, and is it final?' },
    { id: 'accessibility-bar', required: false, text: 'Accessibility bar: WCAG AA? Keyboard navigation? Reduced motion?' },
  ],
  ui: [
    { id: 'platform-devices', required: true, text: 'Platform and devices: iOS, Android, web, desktop — and which screen sizes matter most?' },
    { id: 'task-flow', required: true, text: 'The user task and the flow — map the steps: onboarding, core action, success, empty, and error states. Which screens are in scope, exactly?' },
    { id: 'design-system', required: true, text: 'Existing design system or components: shadcn/ui, Material, custom, none? Attach the system or its link.' },
    { id: 'real-data', required: true, text: 'Data — real content examples and edge cases: long names, empty lists, errors, offline, loading, no permission. Supply examples.' },
    { id: 'accessibility-ui', required: false, text: 'Accessibility bar: WCAG AA, touch targets, colour independence?' },
    { id: 'motion-expectations', required: false, text: 'Motion expectations: subtle, expressive, none — and what motion must communicate?' },
    { id: 'shipped-references', required: false, text: 'What the shipped references are: 3 apps the user admires, and why each one — for a named dimension.' },
    { id: 'build-stack', required: false, text: 'Who builds it, in what stack, and what component library will be used to implement it?' },
    { id: 'out-of-scope', required: false, text: 'What is out of scope — settings, admin, billing, notifications — so the flow does not silently grow?' },
  ],
};

export const TYPES = Object.keys(SPECIFIC);
export function questionsFor(type) {
  return [...UNIVERSAL, ...(SPECIFIC[type] || [])];
}

function parseArgs(argv) {
  const out = { type: null, json: false, answers: null, waive: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') out.json = true;
    else if (a === '--answers' && argv[i + 1]) out.answers = argv[++i];
    else if (a.startsWith('--answers=')) out.answers = a.slice(10);
    else if (a === '--waive' && argv[i + 1]) out.waive = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--waive=')) out.waive = a.slice(8).split(',').map((s) => s.trim()).filter(Boolean);
    else if (!a.startsWith('-') && !out.type) out.type = a.toLowerCase();
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.type) {
    console.log('Usage: node scripts/intake.mjs <logo|brand|social|ad|web|ui> [--json] [--answers answers.json] [--waive id1,id2]');
    console.log('Types: ' + TYPES.join(', '));
    console.log('Aliases: brand = brand-graphic. Run with a type to print its questionnaire.');
    return;
  }
  const type = args.type === 'brand-graphic' ? 'brand' : args.type;
  if (!SPECIFIC[type]) {
    console.error(`intake: unknown type "${args.type}". Types: ${TYPES.join(', ')} (brand-graphic is an alias for brand).`);
    process.exitCode = 2;
    return;
  }
  const questions = questionsFor(type);

  if (!args.answers) {
    if (args.json) {
      console.log(JSON.stringify({ type, questions }, null, 2));
    } else {
      console.log(`Intake — ${type} (${questions.length} questions). Ask ALL of these in ONE message. Do not design with gaps.\n`);
      questions.forEach((q, i) => {
        console.log(`${i + 1}. [${q.required ? 'REQUIRED' : 'optional'}] (${q.id}) ${q.text}`);
      });
      console.log('\nRecord unanswered items as explicit assumptions to confirm. Never silently invent a fact, a number, a testimonial, a price, a date, or a claim.');
      console.log('Check answers with: node scripts/intake.mjs ' + type + ' --answers answers.json');
    }
    return;
  }

  if (!existsSync(args.answers)) {
    console.error(`intake: no such answers file: ${args.answers}`);
    process.exitCode = 2;
    return;
  }
  let answers;
  try {
    answers = JSON.parse(readFileSync(args.answers, 'utf8'));
  } catch (e) {
    console.error(`intake: could not parse ${args.answers} as JSON: ${e.message}`);
    process.exitCode = 2;
    return;
  }
  const answered = (q) => {
    const v = answers[q.id];
    return typeof v === 'string' ? v.trim().length > 0 : v != null && String(v).trim().length > 0;
  };
  const missing = questions.filter((q) => q.required && !answered(q) && !args.waive.includes(q.id));
  const waived = questions.filter((q) => q.required && !answered(q) && args.waive.includes(q.id));
  const result = {
    type,
    total: questions.length,
    required: questions.filter((q) => q.required).length,
    answered: questions.filter(answered).length,
    missing: missing.map((q) => q.id),
    waived: waived.map((q) => q.id),
    blocked: missing.length > 0,
  };
  if (args.json) console.log(JSON.stringify(result, null, 2));
  else {
    console.log(`Intake check — ${type}: ${result.answered}/${result.total} answered, ${result.required} required.`);
    if (waived.length) console.log(`Waived (record as assumptions to confirm): ${waived.map((q) => q.id).join(', ')}`);
    if (missing.length) {
      console.log('BLOCKED — unanswered required questions:');
      for (const q of missing) console.log(`  - (${q.id}) ${q.text}`);
      console.log('Ask these before designing, or get an explicit waiver from the user.');
    } else {
      console.log('Intake complete — you may proceed to Gate 2 (Research).');
    }
  }
  process.exitCode = missing.length ? 1 : 0;
}

main();
