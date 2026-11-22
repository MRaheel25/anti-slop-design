# QC Checklist — self-check before delivering

Work through Gate A first, then Gate B. Gate A must all pass.
Gate B must be answered in writing. Then score. Below 35/50:
rewrite, do not ship.

## Gate A — machine-checkable (must all pass)

Run `node scripts/lint.mjs <file-or-folder>` first. It covers the
items marked [lint]. Check the rest by hand.

- [ ] [lint] No purple-to-blue or purple-to-magenta gradient, no
  cyan-on-dark, no neon glow, no gradient text anywhere (search the
  CSS, do not eyeball it).
- [ ] [lint] No `font-family` Inter, Roboto, Arial, or Open Sans as
  the *only* choice without a stated reason; no pure `#000` / `#fff`.
- [ ] [lint] No ALL-CAPS eyebrow above more than 1 heading per
  3 sections; no single accented word in a headline; no em-dash
  labels.
- [ ] Hero headline is at most 2 lines on desktop, subtext at most
  20 words, calls to action visible without scrolling; no `h-screen`
  (use `min-h-100dvh` or equivalent).
- [ ] [lint] No lorem ipsum; no invented numbers, testimonials, or
  logos; every stat is traced to the intake or to research.
- [ ] [lint] No "not just X, it's Y", no forced 3-item abstract-noun
  list, no "Trusted by 10,000+ teams" without a source; em dashes
  at most 1 per passage (writing).
- [ ] Layout renders at 320px, 768px, and 1280px with no overflow
  and no clipped hero (screenshot check, not assumption).
- [ ] Contrast AA (4.5:1 text, 3:1 large text), visible focus,
  `prefers-reduced-motion` honoured.
- [ ] Every button and interactive element has hover, focus,
  disabled, loading, and error states — or a stated reason it does
  not. Empty and success states are designed.

## Gate B — judgment (answer in writing before delivery)

- [ ] Name the one idea from the subject that runs the design.
  If you cannot, stop.
- [ ] Name the 1 primary plus at most 1 secondary reference and
  the *named dimension* each supplied. List what was intentionally
  not copied from each.
- [ ] Two-order test: could someone guess this look from the
  category alone? From the category plus the obvious anti-reference?
  If yes to either, rework.
- [ ] Is there a real photo or asset of this subject's world, not a
  generic stock hero? Is every section carrying full real content?
- [ ] Would this page still work with all decoration removed — type,
  hierarchy, and content alone? If it reads as thin, add substance,
  not ornaments.
- [ ] Fresh-eyes pass: read it as a first-time visitor. What is the
  one action, and is it unmistakable in 5 seconds?
- [ ] For writing: does every sentence carry a claim, an example,
  a number, a constraint, or an image? Is the author's voice
  preserved over the rulebook?

## Scoring — 35/50 gate (borrowed from stop-slop)

Rate 1–10 on each dimension. Total under 35/50 means rewrite,
do not ship. Write the scores down in the delivery message.

Visual work — Direction, Hierarchy, Restraint, Realness, Craft:

| Dimension | 1–3 | 4–7 | 8–10 |
|---|---|---|---|
| Direction | No named direction; defaults | A direction, weakly held | One bold named direction, held throughout |
| Hierarchy | Everything equally loud | Some hierarchy | One action unmistakable in 5 seconds |
| Restraint | Ornaments everywhere | Some rationing | Boldness spent in one place; quiet sections work |
| Realness | Invented or stock content | Mixed | Real photos, numbers, and copy throughout |
| Craft | Missing states, overflow, poor contrast | Mostly sound | All states, 3 widths clean, AA contrast |

Writing (when the deliverable is mainly copy) — Directness, Rhythm,
Trust, Authenticity, Density, same 1–10 scale, same 35/50 gate.

## Delivery checklist

- [ ] Lint output attached or quoted (pass, or warnings with written
  reasons).
- [ ] Gate B answers written down.
- [ ] Score written down (for example "41/50").
- [ ] Sources with URLs, primary and secondary references, and
  "intentionally not copied" list included.
- [ ] Open questions and assumptions listed.
