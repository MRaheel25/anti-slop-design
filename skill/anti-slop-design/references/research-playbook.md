# Research Playbook — find top designs and designers, then extract principles

Gate 2. No design work starts until `research-notes.md` exists. Research
is web search plus direct browsing of public pages, no sign-in, no paid
keys, no scraping of paywalled libraries.

## Step 1 — Define the niche in searchable terms

Turn the brief into 3–5 search axes. Never search just "best logo
design" or "best website design".

- Niche plus type: "fintech onboarding flow", "skincare brand identity",
  "coffee shop loyalty app".
- Audience: "Gen-Z skincare", "small business accountants", "parents
  of toddlers".
- Feel: "editorial", "brutalist", "calm", "playful", "luxury" — only
  after the intake has named a tone; do not invent a feel here.
- Constraint: "mobile-first", "Arabic RTL", "print packaging",
  "low-bandwidth".

Write the axes down. They are the search plan.

## Step 2 — Run the free-web circuit, in this order

### 1. Award and jury lists — the "top 100" shortcut

These *are* curated top-design lists, with a jury and a date. Note
both.

- Awwwards — Sites of the Day, Developer, Honorable Mentions; filter
  by category and tag. https://www.awwwards.com
- FWA — https://thefwa.com
- CSS Design Awards — https://www.cssdesignawards.com
- The Webby Awards — https://www.webbyawards.com

### 2. Galleries by type

- Web: SiteInspire (free MCP and REST API, no account),
  https://www.siteinspire.com — One Page Love (free MCP in beta),
  https://onepagelove.com — Minimal Gallery, Recent (formerly Godly),
  https://recent.design — Land-book free tier, https://land-book.com
- Sections and flows: Design Details (free MCP),
  https://designdetails.io — regards (free plan),
  https://www.regards.design — Mobbin free tier, https://mobbin.com
- Motion: 60fps free browse, https://60fps.design — LottieFiles free
  tier for animation files.
- Components: shadcn/ui, https://ui.shadcn.com (MIT, free).

### 3. People, not just pages

Find 5–10 named designers, studios, or agencies, with portfolio URLs:

- Search `"best [niche] designers" site:awwwards.com`
- Search `"[niche] designer" behance` and studio portfolios.
- Awwwards jury lists and conference speaker lists for the niche.
- Behance case studies and Dribbble shots — label them as concepts,
  not shipped proof.

Record for each person or studio: name, what they are known for, one
portfolio or award URL. A list of page URLs with no names is not a
designer list.

### 4. Systems, not just screens

- This skill's own `references/design-systems/` corpus — read
  `INDEX.md` first, then 1–2 files only.
- The awesome-design-md pattern (VoltAgent, MIT):
  https://github.com/VoltAgent/awesome-design-md — 74 brand DESIGN.md
  files. Tokens there are inferred hypotheses, not official brand
  documents. Treat them as such.
- Google Fonts for type options: https://fonts.google.com
- Iconify for icons (no key): https://iconify.design

### 5. Query templates that work

- `site:awwwards.com [niche]`
- `[niche] landing page design awwwards 2026`
- `best [niche] app onboarding flow mobbin`
- `[niche] brand identity behance case study`
- `[competitor] website design analysis`
- `"[niche]" "site of the day"`
- `[niche] logo design behance`
- `[niche] social media ad creative examples`

Use the current year in queries. Note the date you saw each source.

## Step 3 — Extract principles, not pictures

For each of at least 5 sources, write one row in `research-notes.md`:

| Source + URL + date seen | What it does (job, audience) | Principle | Mechanism | What NOT to copy |
|---|---|---|---|---|

Example principle, in words: "Proof before pitch: the stats row sits
above the fold because trust is the objection." Example mechanism:
"type scale, colour roles, grid, motion timing" — the concrete means,
not a mood word.

Then synthesise:

- Keep only principles that appear in at least 2 independent sources
  or that solve *this* brief's named objection.
- Pick 1 primary reference plus at most 1 secondary reference, each
  for a named dimension (the awesome-design-md rule).
- Blend at least 2 sources plus the brief's own brand tokens. A
  single-source design is a copy with extra steps.

## Step 4 — Copyright and plagiarism line

Educational guidance, not legal advice. Under 17 U.S.C. §102(b),
copyright protects *expression*, not ideas, procedures, principles,
or concepts.

Safe to learn from: style and genre; layout *concepts* ("headline
over hero over CTA"); copy *formulas* (problem, agitation, solution);
colour *roles*; type *roles*; UX patterns; genre conventions that
everyone in the category uses.

Never: reuse a photo, illustration, body copy, logo, trademark, trade
dress, distinctive composition, or code; never present a reference's
work as your own; never hotlink or re-host paywalled screenshots —
link and describe instead. Attribute the source in your research
notes and, for MIT and Creative Commons assets, in the deliverable.

When in doubt: change the subject, the palette, the type, *and* the
composition. If an ordinary observer would still see the original,
you are too close. Keep the "intentionally not copied" record — it
is both legal hygiene and taste proof.

## research-notes.md template

```markdown
# Research notes — [brief, date]

## Search axes
- …

## Sources (min 5)
1. [Name](URL) — seen YYYY-MM-DD — job/audience:
   Principle: …
   Mechanism: …
   Do NOT copy: …

## Designers / studios (min 2–3 named)
1. Name — known for … — [portfolio/award URL]

## Synthesised principles (kept only if in 2+ sources or solves the brief's objection)
1. …

## References chosen
- Primary: [name] — dimension: …
  Intentionally NOT copied: …
- Secondary (optional): [name] — dimension: …
  Intentionally NOT copied: …

## Proof gaps (things the intake or research did not answer)
- …
```

## Free MCPs you may link to (do not rebuild them)

SiteInspire, One Page Love, and Design Details already offer free
MCPs with no account. Link to them and, where the host agent
supports it, let the user connect them alongside this skill. Do not
scrape Mobbin, ThinkUI, Uizze, or 60fps paid tiers to reproduce
their corpora. Their screenshot libraries are their product; the
free tiers and the sources above are the free substitute.
