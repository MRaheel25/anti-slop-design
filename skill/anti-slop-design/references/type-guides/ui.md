# Type Guide — UI / App Screen

## Craft rules

- Design the flow, not the screen. Map the steps first: onboarding,
  core action, success, empty, error, offline, loading. A screen
  with no empty state and no error state is unfinished.
- One primary action per screen, unmistakable in 5 seconds. Every
  other element supports it or is removed.
- Real data, real edge cases: long names, empty lists, errors,
  no permission, slow network. Design with the intake's real
  content examples, not with "John Doe" and three perfect rows.
- Follow the existing design system where one exists (shadcn/ui,
  Material, custom). Do not invent a second system inside one app.
  Where no system exists, write the tokens down in `DESIGN.md`
  first: colours with roles, type scale, spacing, radius, states.
- States are part of the design: hover, focus, disabled, loading,
  error, empty, success. Touch targets, contrast AA, colour never
  the only signal.
- Motion communicates state, hierarchy, or continuity — trigger,
  move, settle, with real timing. Study shipped motion (60fps free
  browse) for timing, not for decoration.
- Density is a decision: a dashboard, a consumer app, and a
  professional tool need different densities. Name the density in
  `DESIGN.md` and hold it.

## Anti-slop for UI

- No generic dashboard with three stat cards, a chart, and a table
  when the task is something else. No purple gradient sidebar, no
  glassy cards by default, no fake data presented as real.
- No identical card grids, no decorative charts with no data, no
  onboarding flow copied from another app's screenshots.
- No screen that only works with perfect data.

## Research notes for UI

Research shipped flows (Mobbin free tier, Design Details, regards)
for this task, not just pretty screens. Extract: the step order,
the empty and error handling, the density, the primary action
placement. Record what was not copied — especially other apps'
layouts and copy.

## Deliverable

Screens for the agreed flow (including empty, error, loading, and
success states), the token set, and the QC result at 3 widths or
on the target devices.
