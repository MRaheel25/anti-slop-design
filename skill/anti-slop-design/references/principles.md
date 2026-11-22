# Positive Principles — what replaces slop

Slop is not fixed by adding more decoration. It is fixed by a concept
taken from the subject, executed with restraint, then verified against
reality. Every principle below is the positive side of an item in
`banned-list.md`.

## 1. Commit to one bold named direction

Before any code or pixels, name the direction in words: brutally
minimal, editorial, brutalist, luxury, playful, industrial, apothecary,
laboratory, broadsheet. Write it in `DESIGN.md` with 4–6 named hex
colours as tokens, 1–2 typefaces chosen for roles, and one memorable
element. "Spend your boldness in one place."

A direction dealt from a researched library (see
`scripts/deal-direction.mjs`) is a commitment. A look invented on the
spot is usually an average.

## 2. Design from the subject

Take the idea from the thing itself: its materials, its vocabulary,
its industry, its users' world. The hero opens with the most
characteristic thing — the headline, the image, the animation, the
live demo — not with a generic greeting.

Ask: what is the one idea from the subject that runs this design? If
you cannot name it, stop. Do not build yet.

## 3. Colour discipline

Dominant colour plus one sharp accent. Neutrals tinted toward the
brand hue, never flat grey. Perceptually uniform ramps where a ramp
is needed. Colour used in whole fields, not in washes. Solid colour
text only. 4–6 tokens, each with a role (background, surface, text,
muted text, accent, line). If a colour has no role, remove it.

## 4. Type as personality

A chosen pairing: a distinctive display face plus a refined body
face. A modular type scale with fluid sizing, so hierarchy survives
every width. Hierarchy you can feel — jumps in size and weight, not
just bold. Lines under 80 characters. Type carries the personality
when decoration is removed; a page set in good type with no
ornaments should still read as designed.

## 5. Layout and grid with intent

An asymmetric or editorial grid committed to for a reason, or a
quiet centred grid chosen deliberately and stated as such. Varied
section compositions, not the same card row repeated down the page.
One radius system with intent. A hero that fits its screen, with
calls to action visible without scrolling. Responsive down to 320px,
checked at real widths, not assumed.

## 6. Hierarchy and restraint

Ration ornaments: at most one eyebrow label per three sections, no
icon above every heading, no arrow on every button. Boldness spent
in one place; quiet sections that let the loud one work. Every
element earns its place — if removing it changes nothing, remove it.
One accent and one theme per page or piece.

## 7. Real content, nothing invented

Real photos of the subject's world (found, licensed, or drawn), real
numbers, real copy in the user's words. Unsupported claims become
proof gaps or questions in the intake, never finished copy. A page
stripped of ornaments with nothing added reads as thin — and blind
reviewers prefer a richer page with a tell over a thin clean one.
So add substance, not ornaments: a real example, a real number, a
real step, a real quote with a name.

## 8. Micro-detail is the difference

Buttons and interactive elements have hover, focus, disabled,
loading, and error states. Focus is visible. Empty, error, and
success states are designed, not left blank. `prefers-reduced-motion`
is honoured. Motion communicates state, hierarchy, or continuity —
trigger, move, settle, with real timing — and nothing else.

## 9. One reference, for a named dimension

1 primary reference plus at most 1 secondary reference, each for a
named dimension only. Record what was intentionally **not** copied
from each. Blend at least two sources plus the brief's own brand
tokens. A single-source design is a copy with extra steps.

## 10. Verify in a real browser

Screenshots at 320px, 768px, and 1280px. A fresh-context reviewer:
read it as a first-time visitor. Deterministic checks first
(`scripts/lint.mjs`, the QC checklist), judgment second. Never
deliver on a tool-success report alone.

## Taste — the synthesis

AI work is the average of everything. Top work is a decision about
this thing. The two-order test, applied at Gate 5:

1. Could someone guess this look from the category alone? If yes,
   rework.
2. Could someone guess it from the category plus the obvious
   anti-reference? If yes, rework again.

The fix is never "add more decoration". It is a concept taken from
the subject, executed with restraint, then verified against reality
(browser, checklist, fresh eyes).

## Writing principles (for copy in any design)

- Every sentence carries a claim, an example, a number, a
  constraint, or an image.
- Active voice with a real human subject. Vary sentence length.
- Preserve the author's voice and sample over the rulebook. A
  deliberate fragment or parallelism that carries meaning stays.
- Evidence-bound: if the brief is vague, mark the gap. Do not fill
  it with an invented claim.
- Directness, rhythm, trust, authenticity, density — the five
  dimensions of the 35/50 rubric in `qc-checklist.md`.
