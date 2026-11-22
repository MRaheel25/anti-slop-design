---
name: anti-slop-design
description: "Research-first, anti-AI-slop design for logo, brand/graphic, social media, ad creative, landing page/web, and UI/app work. Use when the user asks to design, redesign, or review any of those, or says a design looks generic, templated, or AI-made. ALWAYS asks all intake questions first, researches top designs and designers for the niche on the free web, then designs from principles, never from defaults. Never produces purple gradients, generic 3-card layouts, or invented stats."
argument-hint: "[logo | brand | social | ad | web | ui] [brief]"
allowed-tools: WebSearch WebFetch Read Write Bash
---

# Anti-Slop Design

Design like a top designer would: ask first, research second, commit to one
direction third, build fourth, and audit before you deliver. Never skip a
gate. A gate is only passed when its artefact exists in writing.

This skill is free and open. It needs no API key, no paid account, and no
npm package. It works in Claude Code, Cursor, Codex, Copilot, Gemini CLI,
Windsurf, OpenCode, and any agent that follows the Agent Skills standard.
It is built from public, attributed ideas — see Attribution at the end —
restated here in our own words. It does not copy any design, image, layout,
piece of copy, or logo. Inspiration is principles, never pictures.

## The one rule underneath everything

Without direction, a model samples the safest, most common patterns in its
training data. That is why so much AI design looks the same. A top
designer's work is the opposite: a small number of specific, committed,
slightly risky decisions that all trace back to the subject itself.

If the look is guessable from the category alone ("AI tool, so dark plus
purple"), it is still slop. Rework it.

## Gate 0 — Route

1. Detect the design type from the brief: `logo`, `brand` (brand/graphic),
   `social`, `ad`, `web` (landing page / website), or `ui` (app / product
   screen). The `$ARGUMENTS` hint may already name it.
2. If the brief names two types (for example a logo plus a social post),
   treat them as two jobs in order and run the gates separately for each.
3. If the type is ambiguous, ask which one it is before anything else.
4. Load only the references this job needs:
   - Intake: `references/intake/<type>.md`
   - Craft rules: `references/type-guides/<type>.md`
   - Research: `references/research-playbook.md`
   - Banned list and principles: `references/banned-list.md`,
     `references/principles.md`
   - Audit: `references/qc-checklist.md`
   - Design systems: read `references/design-systems/INDEX.md` first,
     then at most 1–2 system files.
   - Assets: `references/assets.md` when real photos, icons, or fonts
     are needed.

Do not load every reference file. Progressive disclosure is part of the
skill: the right file at the right gate, nothing more.

## Gate 1 — Intake (STOP)

Run `node scripts/intake.mjs <type>` and ask **all** of its questions in
**one message**. Do not design with gaps.

- Ask a minimum of four questions even for a tiny job: what it is for,
  who it is for, the one action the viewer should take, and the tone.
- Ask the universal questions plus every per-type question in
  `references/intake/<type>.md`.
- If the user cannot answer something, record it as an explicit
  assumption to confirm. Never silently invent a fact, a number, a
  testimonial, a price, a date, or a claim.
- If the user says "just make something", still ask. A vague brief is
  the reason for this gate, not an excuse to skip it.
- You may only proceed when either (a) every required question is
  answered, or (b) the user explicitly waives a question in writing.
  `node scripts/intake.mjs <type> --answers answers.json` checks this;
  it exits non-zero while required answers are missing and no waiver
  is recorded.

Write the answers down as `intake.md` next to the work. The intake is
the source of truth for every claim in the design. Anything not in the
intake or in research is a proof gap, not copy.

## Gate 2 — Research (no design yet)

Follow `references/research-playbook.md` exactly. Minimum bar:

1. At least **5 sources**, each with a URL and a date seen.
2. At least **2–3 named designers, studios, or agencies** for this
   niche, with portfolio or award URLs.
3. For every source, write one row: what it does, the principle it
   teaches, the mechanism behind it, and what must **not** be copied.
4. Keep only principles that appear in at least 2 independent sources
   or that solve this brief's named objection.
5. Pick **1 primary reference and at most 1 secondary reference**,
   each for a *named dimension* only (for example: "primary: proof
   before pitch; secondary: editorial type scale"). Record what was
   intentionally **not** copied from each.
6. Write `research-notes.md` with all of the above before any design
   work starts.

Free sources first, in this order: award and jury lists (Awwwards,
FWA, CSS Design Awards, Webby Awards), free galleries (SiteInspire,
One Page Love, Minimal Gallery, Recent, Land-book free tier), free
section and flow libraries (Design Details, regards, Mobbin free tier),
motion (60fps free browse), then portfolio networks (Behance, Dribbble)
labelled as concepts, not shipped proof. Link out. Never re-host or
scrape screenshots from paywalled libraries. Never hotlink a
paywalled image.

Copyright line, in plain words: ideas, principles, patterns, and
genre conventions are safe to learn from. Specific photos,
illustrations, body copy, logos, trademarks, trade dress, distinctive
compositions, code, and 1:1 layouts are not. If an ordinary observer
would still see the original after your changes, you are too close.
Change the subject, the palette, the type, *and* the composition.
This is educational guidance, not legal advice.

## Gate 3 — Direction (deal, do not invent)

1. Run `node scripts/deal-direction.mjs --type <type>`. It deals
   **3 directions** from the local library and avoids repeating
   recent picks.
2. Show all 3 to the user, or pick 1 yourself when the user has
   delegated the choice, and say which one you picked and why.
3. Write `DESIGN.md` from the template in this folder before
   building. It must name: the one idea from the subject that runs
   the design; 4–6 named colours with roles; 1–2 typefaces with
   roles; spacing and radius intent; an ASCII layout sketch; the
   hero; the sections or screens; and the motion intent.
4. Check the direction against `references/banned-list.md` before
   building. If it matches a banned pattern, deal again.
5. Spend your boldness in one place. One accent, one theme, one
   memorable element per page or piece. Everything else stays quiet
   so the loud part can work.

A direction dealt from a researched library is not a default. A look
invented on the spot from training-data averages is.

## Gate 4 — Build

Build from `DESIGN.md`, the type guide, and the intake — nothing else.

- **Real content only.** Real photos of this subject's world, real
  numbers, real copy in the user's words. No lorem ipsum, no invented
  stats, no fake testimonials, no "Trusted by 10,000+ teams" without
  a source, no form that says "thanks" without sending anything.
- **One accent, one theme.** 4–6 named colours as tokens, tinted
  neutrals, solid colour text only. No gradient washes as a crutch.
- **Type with intent.** A modular scale with fluid sizing, a clear
  hierarchy by weight and size, lines under 80 characters, a
  distinctive display face paired with a refined body face. Every
  font choice needs a stated reason.
- **Every element earns its place.** Ration ornaments: at most one
  eyebrow label per three sections, no icon above every heading, no
  arrow on every button. If removing an element changes nothing,
  remove it.
- **States are part of the design.** For web and UI: hover, focus,
  disabled, loading, error, empty, and success states. Visible focus.
  Honour `prefers-reduced-motion`. Motion only to communicate state,
  hierarchy, or continuity.
- **Assets:** keyless sources first (Iconify, Openverse, Wikimedia
  Commons, Google Fonts). Free-key sources (Pexels, Unsplash, Pixabay)
  only with the user's own free key. See `references/assets.md` for
  licences. Attribute MIT and Creative Commons assets in the
  deliverable.
- **Do not copy.** Blend at least 2 sources plus the brief's own
  brand tokens. A single-source design is a copy with extra steps.

## Gate 5 — Audit (before delivery, every time)

1. Run `node scripts/lint.mjs <file-or-folder>` — the deterministic
   banned-pattern scan. Fix every banned hit. Warnings must each
   have a written reason to keep.
2. Work through `references/qc-checklist.md`: Gate A (machine
   checkable, must all pass) then Gate B (judgment, answered in
   writing).
3. For web and UI, render and screenshot at **320px, 768px, and
   1280px**. No overflow, no clipped hero, CTAs visible without
   scrolling on desktop. Check contrast (AA: 4.5:1 text, 3:1 large).
4. Score the work with the 35/50 rubric in the QC checklist
   (Direction, Hierarchy, Restraint, Realness, Craft — or Directness,
   Rhythm, Trust, Authenticity, Density for writing). Below 35/50:
   rewrite, do not ship.
5. Fresh-eyes pass: read it as a first-time visitor. What is the one
   action, and is it unmistakable in 5 seconds? If not, fix the
   hierarchy, not the decoration.
6. If a page still works with all decoration removed — type,
   hierarchy, and content alone — it has substance. If it reads as
   thin, add substance, not ornaments.

## Gate 6 — Deliver

Deliver the artefact plus, in the same message:

1. The artefact itself (file, code, or image prompt — never a claim
   that an image was generated when it was not).
2. The sources used, with URLs, and the 1 primary + at most 1
   secondary reference with their named dimensions.
3. What was **deliberately not copied**, and why.
4. The direction picked and the one idea from the subject behind it.
5. Open questions and assumptions that still need confirming.
6. The QC result: lint outcome and 35/50 score.

Never deliver on a tool-success report alone. Verify the artefact
yourself first.

## Banned-list summary

Read the full list in `references/banned-list.md`. The short version:

**Visual:** purple-to-blue or purple-to-magenta gradients, cyan on
dark, neon glows, gradient text, glowing blobs and default
glassmorphism, centred hero plus two buttons plus three identical
cards, identical rounded cards with one radius and one soft shadow
everywhere, cards inside cards, fake browser frames and fake chatbot
popups, ALL-CAPS eyebrow above every heading, one accented word in a
headline, pure `#000` / `#fff`, grey text on coloured backgrounds,
generic pill buttons everywhere, a hero that overflows its screen.

**Type:** Inter, Roboto, Arial, or Open Sans as the only choice with
no stated reason — and the same rule for the replacement defaults
(DM Sans, Outfit, Space Grotesk, Instrument Serif, Fraunces,
Playfair). A font needs a reason, not a swap of one default for
another.

**Copy:** "It's not X, it's Y", forced rule of three with abstract
nouns, em-dash overuse, "serves as / stands as / boasts", "-ing"
analysis phrases, significance inflation ("pivotal", "testament",
"seamless", "delve"), vague attribution ("experts believe", "studies
show" with no study), invented metrics and testimonials, lorem ipsum.

**Motion and diagrams:** animating everything, motion to hide weak
structure, Mermaid-default diagrams, shadows in diagrams.

**Second-order tells:** if the look is guessable from the category
alone, or from the category plus the obvious anti-reference, rework
it. That includes the current clusters: warm cream plus high-contrast
serif plus terracotta accent; near-black plus acid-green or vermilion
accent; broadsheet hairline-rules layout used as a reflex.

## Positive principles summary

Read the full version in `references/principles.md`. In short: commit
to one bold named direction; design from the subject; dominant colour
plus one sharp accent; tinted neutrals; a modular type scale; real
content only; rationed ornaments; verified in a real browser at real
widths; one primary reference for a named dimension, and a written
record of what was not copied.

## Attribution

Ideas in this skill are restated in our own words, with thanks to
their sources. Study the originals before adapting any of them:

- Hallmark (Nutlope, MIT) — https://github.com/Nutlope/hallmark —
  dealt themes, pre-flight, hero-first build, sloplint, 58-point
  checklist.
- Taste-Skill / design-taste-frontend (leonxlnx) —
  https://github.com/leonxlnx/taste-skill — 20 directions distilled
  from 247 award sites, browser inspector, look-and-fix loop.
- Impeccable (pbakaus) — https://github.com/pbakaus/impeccable —
  Context Gathering Protocol, deterministic detector rules.
- ui-ux-pro-max (nextlevelbuilder, MIT) —
  https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — local
  style, palette, font, and UX-rule database.
- awesome-design-md (VoltAgent, MIT) —
  https://github.com/VoltAgent/awesome-design-md — DESIGN.md format
  and the "principles, not identity" rule.
- Anthropic frontend-design — https://github.com/anthropics/skills —
  direction-first process and the current slop clusters.
- blader/humanizer — https://github.com/blader/humanizer — 55
  writing patterns, cluster-not-single-tell discipline.
- stop-slop (hardikpandya) —
  https://github.com/hardikpandya/stop-slop — 35/50 scored rubric.
- shadcn/ui (MIT) — https://ui.shadcn.com — copy-paste components.
- Free reference MCPs and galleries: SiteInspire, One Page Love,
  Design Details, regards, Minimal Gallery, Recent (formerly Godly),
  Land-book, Mobbin, ThinkUI, Uizze, 60fps.design — see
  `references/research-playbook.md` and `references/assets.md`.

Research behind this skill: `research_notes/anti-slop-design-research-20261122-1420/report.md`
(22 November 2026, public pages only, no sign-in). Prices and corpus
sizes there are vendor-stated as of that date; re-check before
publishing or buying anything.
