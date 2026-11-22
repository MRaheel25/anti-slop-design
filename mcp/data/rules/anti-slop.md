# Anti-Slop Rules

Restated in our own words from the research report §1.1 (2026-11-22), which synthesises
Hallmark, Impeccable, Taste-Skill, Anthropic frontend-design, stop-slop, blader/humanizer,
unslop, slopbeth and diagram-design. Rule IDs are stable so tools can cite them.

## Colour

- **C01 — Purple-to-blue gradient.** Banned. The single most common AI default.
- **C02 — Purple/magenta neon glow, cyan-on-dark, glowing dark mode by default.** Banned.
- **C03 — Gradient text.** Banned. Solid colour text only.
- **C04 — Glowing blobs / glassmorphism / glassy cards by default.** Banned.
- **C05 — Pure black #000 / pure white #fff.** Banned. Tint neutrals toward the brand hue.
- **C06 — Grey text on a coloured background.** Banned. Use a shade of the background colour.
- **C07 — Second-wave default clusters** (warm-cream + high-contrast serif + terracotta;
  near-black + acid-green/vermilion; broadsheet hairline-rules as a reflex). Warning:
  these replaced the purple gradient as the new defaults.

## Typography

- **T01 — Inter / Roboto / Arial / Open Sans / system defaults for everything.** Banned
  unless a reason is stated. A font needs a role-based reason.
- **T02 — Replacement defaults used the same way** (DM Sans, Outfit, Plus Jakarta,
  Space Grotesk, Instrument Serif, Fraunces, Playfair, Lora). Warning.
- **T03 — Italic headings as a decorative default.** Warning.
- **T04 — One coloured/accented word inside a headline.** Banned.

## Layout and components

- **L01 — Centred hero + 2 buttons + 3 identical feature cards.** Banned.
- **L02 — Identical-card feature grids; hero-metric layouts; sparkline decorations.** Banned.
- **L03 — Cards inside cards; floating card cascades; fake chatbot popups; fake browser
  frames; coloured left-border cards.** Banned.
- **L04 — ALL-CAPS eyebrow above every heading.** Banned. At most 1 per 3 sections.
- **L05 — Arrow on every button; numbered markers when content is not a sequence;
  large icon above every heading.** Banned.
- **L06 — Generic pill buttons everywhere; h-screen hero that overflows on mobile.** Banned.
- **L07 — `A · B · C` meta strings; spaced-em-dash labels; monospace data labels as
  decoration.** Warning.

## Content and trust

- **N01 — Lorem ipsum in a delivered design.** Banned.
- **N02 — Invented stats, testimonials or logos** ("Trusted by 10,000+ teams"). Banned.
- **N03 — Email sign-up at the end of every page; a form that says "thanks" without
  sending anything.** Banned.
- **N04 — A page of empty frames, or nothing but photographs.** Banned.

## Copy / writing

- **W01 — "It's not X, it's Y" / "not only X but Y".** Banned.
- **W02 — Forced rule of three; synonym cycling.** Banned.
- **W03 — Em-dash overuse.** Warning (more than 1 per passage).
- **W04 — "Serves as / stands as / boasts"; "-ing" analysis phrases.** Banned.
- **W05 — Significance inflation** (pivotal, testament, landscape, seamless, delve). Warning.
- **W06 — Vague attribution** ("experts believe", "studies show" with no study). Banned.
- **W07 — Chatbot leftovers** ("Certainly!", "As an AI…", drafting notes). Banned.
- **W08 — Bold mini-heading lists; title-case everything; decorative emoji.** Warning.

## Motion and diagrams

- **M01 — Animating everything; motion hiding weak IA.** Banned.
- **M02 — Gratuitous blobs, fake 3D, neon overload.** Banned.
- **M03 — Mermaid-default diagrams; shadows in diagrams.** Warning.

## The two-order test

If the look is guessable from the category alone ("AI tool = dark + purple",
"finance = navy + serif"), it is a training reflex — rework. If it is guessable
from category + the obvious anti-reference, rework again.

## The reminder

Take principles, not pictures. Record 1 primary + at most 1 secondary reference,
each for a NAMED dimension, and list what was intentionally NOT copied.
