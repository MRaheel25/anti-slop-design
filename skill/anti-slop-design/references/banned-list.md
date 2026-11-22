# Banned List — full version

Read this before Gate 3 (Direction) and again at Gate 5 (Audit). Every
item below is named by at least one of the sources in SKILL.md
Attribution. A banned item is not "a style I dislike" — it is a pattern
so overused by default model output that its presence is, on its own,
a signal the work was not designed.

A single tell does not always condemn a piece. The discipline in the
strongest writing skills is cluster, not single tell: several tells
together mean slop. The discipline in the strongest visual skills is
stricter: a banned visual pattern in the hero or the palette is enough
to rework. When in doubt, rework. The cost of a rework is minutes; the
cost of shipping slop is the whole piece.

## Visual, layout, and colour

- Purple-to-blue gradients; purple-to-magenta gradients; purple or
  magenta neon glows; cyan on dark; dark mode plus glowing accents
  as the default look.
- Gradient text. Glowing blobs. Glassmorphism and glassy cards used
  by default, with no reason from the subject.
- Centred hero, two buttons, three identical feature cards — the
  "SaaS card kit". Identical rounded cards, one radius everywhere,
  the same soft grey shadow everywhere, decorative gradient washes.
- Hero-metric layouts. Identical-card feature grids. Sparkline
  decorations that mean nothing.
- Cards inside cards. Floating card cascades with no purpose. Fake
  chatbot popups. Fake browser frames. Cards with a coloured
  left border used as the only variation.
- ALL-CAPS eyebrow above *every* heading. Tracked-capital labels
  everywhere. `A · B · C` meta strings. Labels built with spaced
  em dashes. Monospace data labels used as decoration. An arrow on
  every button. Numbered markers (01, 02, 03) when the content is
  not a sequence. A large icon with rounded corners above every
  heading.
- One coloured or accented word in a headline. Italic headings used
  as the main display style.
- Pure black `#000` and pure white `#fff`. Grey text on coloured
  backgrounds (it washes out — use a shade of the background colour).
  Untinted neutrals.
- Generic pill buttons everywhere. Placeholder lorem ipsum. Invented
  stats, invented testimonials, invented client logos ("Trusted by
  10,000+ teams"). An email sign-up at the end of every page. A form
  that says "thanks" without sending anything. A page of empty frames
  or nothing but photographs. A hero that overflows or misses its
  screen.

## Type

- Inter, Roboto, Arial, or Open Sans "for everything", with no stated
  reason.
- The second-wave replacement defaults, used the same way: DM Sans,
  Outfit, Plus Jakarta Sans, Space Grotesk, Instrument Serif,
  Fraunces, Playfair Display, Lora. Swapping one default for another
  default is not a type decision.
- One weight, one size, grey body text throughout. No hierarchy you
  can feel.

Rule: a font needs a stated reason — a role, a pairing, a link to the
subject — not a swap of one default for another.

## Copy and writing

- "It's not X, it's Y" and "not only X but Y" negative parallelisms.
- Forced rule of three: three abstract nouns in a row, three vague
  benefits, three interchangeable adjectives.
- Synonym cycling (the same idea restated with different words to
  fill space). Uniform paragraph length and rhythm. Every sentence
  the same shape.
- Em-dash overuse. In the strictest forks, zero tolerance; in the
  main skill, treat a cluster of em dashes as a tell and keep at
  most one per passage.
- "Serves as", "stands as", "boasts" instead of "is" or "has".
  "-ing" analysis phrases: showcasing, fostering, underscoring,
  highlighting, demonstrating.
- Significance inflation: pivotal, testament, landscape, seamless,
  delve, elevate, unlock, empower, cutting-edge, state-of-the-art —
  used without evidence.
- Vague attribution: "experts believe", "studies show", "research
  suggests" with no study named. Actorless claims. Invented metrics
  and outcome claims ("faster decisions", "reduced friction") with
  no evidence.
- Throat-clearing openers. Rhetorical self-answering questions.
  Wh-sentence starters in a row. Staccato fragmentation. Dramatic
  one-line closers that repeat the point. Summary endings on every
  piece.
- Bold mini-heading lists (`**Performance:** Performance has…`).
  Title case on everything. Decorative emoji in professional copy.
- Chatbot leftovers: "Certainly!", "As an AI…", drafting notes left
  in the deliverable. Fake-candid openings. Unraised objections.
  Fake alternatives.
- Padded lists. Every sentence carrying no claim, example, number,
  constraint, or image.

## Motion and diagrams

- Animating everything. Motion used to hide weak information
  architecture. Gratuitous blobs, fake 3D, neon overload.
- Mermaid-default diagrams ("Mermaid slop"). Shadows in diagrams.
  Diagram rules that replace them: one accent, 1px hairlines, 4px
  grid, no shadows, editorial restraint.

## Second-order tells

These are the tells that survive the first round of bans, because
they are what models reach for once purple gradients are forbidden:

- If you can guess the theme and palette from the *category alone*
  ("AI tool, so dark plus purple"; "finance, so navy plus serif"),
  it is a training reflex. Rework.
- If you can guess it from the category *plus* the obvious
  anti-reference, rework again.
- Current clusters to watch for: warm cream plus high-contrast serif
  plus terracotta accent; near-black plus acid-green or vermilion
  accent; broadsheet hairline-rules layout used as a reflex rather
  than a decision from the subject.

## How to use this list

1. At Gate 3, check the dealt direction against this list before
   building. A match means deal again.
2. At Gate 5, run `scripts/lint.mjs` for the machine-checkable
   items, then check the rest by hand with `references/qc-checklist.md`.
3. When you keep a flagged item, write the reason down. "I liked it"
   is not a reason. A reason names the subject, the audience, or a
   researched reference.
4. Never treat a banned word as a banned idea. The writing skills
   are explicit on this: flag only meaningless formula. Preserve
   the author's voice and deliberate fragments or parallelism when
   they carry meaning.
