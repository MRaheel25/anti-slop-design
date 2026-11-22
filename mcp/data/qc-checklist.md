# QC Checklist — self-check before delivering

From the research report §5. Gate A is machine-checkable (the `audit_design` tool
runs it). Gate B is judgment: answer in writing before delivery.

## Gate A — automatic (must all pass)

- [ ] No purple-to-blue / purple-to-magenta gradient, no cyan-on-dark, no neon glow,
      no gradient text anywhere (search the CSS).
- [ ] No Inter / Roboto / Arial / Open Sans / system-default as the *only* font choice
      without a stated reason; no pure #000 / #fff.
- [ ] No ALL-CAPS eyebrow above more than 1 heading per 3 sections; no single accented
      word in a headline; no em-dash labels.
- [ ] Hero headline at most 2 lines on desktop, subtext at most 20 words, CTAs visible
      without scrolling; no `h-screen` (use `min-h-100dvh`).
- [ ] No lorem ipsum; no invented numbers, testimonials or logos; every stat traced
      to intake or research.
- [ ] No "not just X, it's Y", no forced 3-item abstract-noun list, no "Trusted by
      10,000+ teams" without a source; em dashes at most 1 per passage.
- [ ] Layout renders at 320px / 768px / 1280px with no overflow and no clipped hero
      (screenshot check).
- [ ] Contrast AA (4.5:1 text / 3:1 large), visible focus, `prefers-reduced-motion`
      honoured.
- [ ] Every button / interactive element has hover, focus, disabled, loading and error
      states — or a stated reason it does not.

## Gate B — judgment (answer in writing)

- [ ] Name the one idea from the subject that runs the design. If you cannot, stop.
- [ ] Name the 1 primary + at most 1 secondary reference and the *named dimension*
      each supplied; list what was intentionally not copied.
- [ ] Two-order test: could someone guess this look from the category alone? From
      category + the obvious anti-reference? If yes, rework.
- [ ] Is there a real photo / asset of this subject's world (not a generic stock hero)?
      Is every section carrying full real content?
- [ ] Would this page still work with all decoration removed (type, hierarchy, content
      alone)? If it reads as thin, add substance, not ornaments.
- [ ] Fresh-eyes pass: read it as a first-time visitor — what is the one action, and
      is it unmistakable in 5 seconds?

## Scoring (borrowed from stop-slop)

Rate 1–10 on Direction, Hierarchy, Restraint, Realness, Craft (visual) — or
Directness, Rhythm, Trust, Authenticity, Density (writing). Total under 35/50 =
rewrite, do not ship. The `audit_design` tool reports its deterministic checks on
the same 0–50 scale.
