# anti-slop-design

A free, research-first, anti-AI-slop design skill for any AI model.
Ask first, research second, commit to one direction third, build
fourth, audit before delivering. Never purple gradients, never generic
3-card layouts, never invented stats.

Works for **logo, brand/graphic, social media, ad creative, landing
page/web, and UI/app** work. No API key, no paid account, no npm
dependencies. Node's standard library only, for the three scripts.

Based on the research report `research_notes/anti-slop-design-research-20261122-1420/report.md`
(22 November 2026, public pages only) and the companion research page
`anti-slop-design-research`. Ideas are restated in our own words with
attribution to Hallmark, Taste-Skill, Impeccable, ui-ux-pro-max,
awesome-design-md, Anthropic frontend-design, blader/humanizer, and
stop-slop — see `SKILL.md` Attribution.

## Install

### Claude Code

```bash
npx skills add <owner>/anti-slop-design
```

or clone into your personal skills folder:

```bash
git clone <repo-url> ~/.claude/skills/anti-slop-design
```

For one project only, clone into `.claude/skills/anti-slop-design`
inside that project.

### Cursor

Copy or clone this folder to Cursor's skills location (Cursor follows
the same Agent Skills layout — a folder containing `SKILL.md`), then
restart Cursor. Or use `npx skills add <owner>/anti-slop-design` if
your Cursor setup supports it.

### Codex

Clone into Codex's skills directory (same layout: a folder with
`SKILL.md`), then restart Codex:

```bash
git clone <repo-url> ~/.codex/skills/anti-slop-design
```

### Copilot

Clone into Copilot's skills directory, then restart the Copilot
agent / editor:

```bash
git clone <repo-url> ~/.copilot/skills/anti-slop-design
```

### Gemini CLI

```bash
git clone <repo-url> ~/.gemini/skills/anti-slop-design
```

### Windsurf

Clone into Windsurf's skills directory, then restart Windsurf:

```bash
git clone <repo-url> ~/.windsurf/skills/anti-slop-design
```

### OpenCode

```bash
git clone <repo-url> ~/.config/opencode/skills/anti-slop-design
```

If a location above does not match your install, use the location your
agent documents for Agent Skills (a folder named `anti-slop-design`
containing `SKILL.md`). The skill is a folder, not a server — there is
nothing to run and no key to paste.

Verify the install: ask your agent to list its skills, or invoke it
directly (below). `SKILL.md` must be under 500 lines — check with
`wc -l SKILL.md`.

## How to invoke

The skill triggers on its description: ask to design, redesign, or
review a logo, brand piece, social post, ad, landing page, website,
or app screen — or say a design "looks generic / templated / AI-made".

Explicit invocation (works in most agents):

```
/anti-slop-design [logo | brand | social | ad | web | ui] [brief]
```

Examples:

```
/anti-slop-design logo Acme Coffee Roasters, a small roastery in Karachi
/anti-slop-design social Launch post for a handmade soap brand, Instagram 4:5
/anti-slop-design web Landing page for a bookkeeping app for freelancers
```

You may also invoke it by name in plain language: "Use the
anti-slop-design skill to design …".

## How it works — the 6 gates

0. **Route** — detect the type; load only the references that job needs.
1. **Intake (STOP)** — `node scripts/intake.mjs <type>` asks all
   questions in one message. No design with gaps.
2. **Research** — at least 5 sources and 2–3 named designers, written
   into `research-notes.md`, with principles extracted and a record of
   what was intentionally not copied.
3. **Direction** — `node scripts/deal-direction.mjs --type <type>`
   deals 3 directions; pick 1; write `DESIGN.md` (the template in this
   folder) and check it against the banned list.
4. **Build** — real content only, one accent, one theme, states for
   every interactive element.
5. **Audit** — `node scripts/lint.mjs <file>` plus the QC checklist
   (`references/qc-checklist.md`), screenshots at 320 / 768 / 1280px
   for web and UI, and the 35/50 score. Below 35: rewrite, do not ship.
6. **Deliver** — the artefact plus sources, the references chosen,
   what was deliberately not copied, the QC result, and open questions.

## Example briefs — all 6 types

### Logo

> Design a logo for "Acme Coffee Roasters", a small roastery in
> Karachi that roasts in small batches and sells at weekend markets.
> It must work as a favicon and on a market stall sign, in one colour.
> Competitors to differ from: [names]. No gradient fill as the idea.

Expected: intake questions first, then research into roastery and
coffee brand identities, a dealt direction, a one-colour-first mark.

### Brand / graphic

> A one-page brand sheet and a poster for a community library's
> reading festival. Voice: warm, not childish. Deliverables: poster
> (A3 print), social template, one-page guidelines. Existing logo
> attached.

Expected: story and voice confirmed, deliverables list locked, print
specs (bleed, CMYK) asked before designing.

### Social media

> Instagram launch post, 4:5, for a handmade soap brand. One message:
> "Soap made with olive oil, nothing else." CTA: comment OLIVE for
> the ingredient list. Caption attached.

Expected: platform, ratio, message, and CTA confirmed; the post
recomposed for 4:5, not cropped from another ratio.

### Ad creative

> Meta feed ad, 1080×1080 and 1080×1920, for a language-learning app.
> Objective: installs. Headline and offer attached and approved.
> Competitor ads linked. Three hooks, one concept.

Expected: objective, audience, approved copy, and verifiable offer
confirmed; hooks tested as hooks, not as resizes.

### Landing page / web

> Landing page for a bookkeeping app for freelancers. One job: get a
> free trial signup. Objection to overcome: "I already use a
> spreadsheet." Real testimonials attached (names included). Stack:
> static HTML.

Expected: one job, one action, one objection, real proof — then
research, direction, build, and screenshots at 3 widths.

### UI / app

> Onboarding flow (3 screens) plus empty and error states for a
> habit-tracking app, iOS. Existing system: shadcn/ui. Real content
> examples attached, including a long habit name and an empty list.

Expected: task and flow mapped, real data and edge cases confirmed,
states designed — not one pretty screen.

## Scripts (Node stdlib only, no install step)

```bash
node scripts/intake.mjs web            # print the web questionnaire
node scripts/intake.mjs logo --answers answers.json
node scripts/intake.mjs logo --answers answers.json --waive "colour constraints"

node scripts/deal-direction.mjs --type web
node scripts/deal-direction.mjs --type logo --count 3 --reset

node scripts/lint.mjs index.html
node scripts/lint.mjs ./dist --json
```

Test them before first use:

```bash
node --check scripts/intake.mjs
node --check scripts/deal-direction.mjs
node --check scripts/lint.mjs
```

## File map

```
anti-slop-design/
├── SKILL.md                  # the procedure, 6 gates, banned-list summary
├── README.md                 # this file
├── DESIGN.md                 # output template (9-section, fill per brief)
├── references/
│   ├── banned-list.md        # full banned list (visual + copy + motion)
│   ├── principles.md         # positive principles + taste synthesis
│   ├── intake/               # logo, brand-graphic, social, ad, web, ui
│   ├── research-playbook.md  # free-web circuit, query templates, copyright line
│   ├── type-guides/          # logo, graphic, social, ad, web, ui
│   ├── design-systems/       # INDEX.md + 12 hand-written DESIGN.md analyses
│   ├── assets.md             # keyless / free-key sources + licences
│   └── qc-checklist.md       # Gate A + Gate B + 35/50 scoring
└── scripts/
    ├── deal-direction.mjs    # deals 3 directions, avoids repeats
    ├── lint.mjs              # deterministic banned-pattern scan
    └── intake.mjs            # prints questionnaire, checks answers
```

## Rules this skill will not break

- No paid API keys, no npm dependencies, no scraping of paywalled
  libraries, no copied images, layouts, copy, or logos.
- Inspiration is principles, never pictures. Every deliverable names
  its sources and what was intentionally not copied.
- Image generation still needs a model — this skill directs image
  work (prompts, art direction, real-photo sourcing, procedural
  SVG / Three.js) but cannot generate images without one.
- A 600,000-screenshot corpus cannot be built for free. The free
  substitute is linking to free tiers and free MCPs (SiteInspire,
  One Page Love, Design Details) plus a small hand-curated text corpus.
- Prices and corpus sizes in the research report are vendor-stated
  as of 22 November 2026. Re-check before publishing or buying.
