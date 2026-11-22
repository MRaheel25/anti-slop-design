# Assets — free sources, keyless first

Real photos of the subject's world beat stock-photo-everything.
Use this order: user-supplied assets first, then keyless free
sources, then free-key sources with the user's own key. Never use
an image you do not have a right to use, and never present a
reference's image as your own work.

## Keyless — no account, no key

- **Iconify** — 200+ icon sets, 300,000+ icons, unlimited API.
  https://iconify.design — icons are under various open licences;
  check the set licence and attribute where required.
- **Openverse** — openly licensed images and audio.
  https://openverse.org — filter by licence; attribute as the
  licence requires.
- **Wikimedia Commons** — freely licensed media.
  https://commons.wikimedia.org — check each file's licence.
- **Google Fonts** — fonts are free to load and use (mostly OFL).
  https://fonts.google.com — loading a font needs no key. The
  metadata API needs a Google Cloud key; do not use it. Pick fonts
  from the public catalogue.
- **llms.txt files** — machine-readable catalogues served over plain
  HTTP, for example Mobbin, SiteInspire, 60fps, Cosmos. Read them;
  do not scrape the sites behind them.
- **Lucide icons** (MIT) — https://lucide.dev

## Free key — email signup, a few minutes, user's own key only

- **Pexels API** — photos and video, about 200 requests per hour.
  https://www.pexels.com/api/ — no attribution required, but give
  it where you can. Never put a key in a file you share.
- **Unsplash API** — 50 requests per hour on the demo tier.
  https://unsplash.com/developers — Unsplash+ images are paid; do
  not use them. Attribute photographers.
- **Pixabay API** — photos and video.
  https://pixabay.com/api/docs/ — check the licence per asset.

Keys go in environment variables, never in the skill files, never
in a deliverable, never in chat. If the user has no key, use the
keyless sources above.

## Code, not pixels — free 3D and illustration

- **img2threejs** pattern — procedural Three.js built from code,
  zero-dependency Python scripts, quality-gated passes.
  https://github.com/img2threejs/img2threejs — useful when a
  3D object is needed and no photo exists. Code is the asset; no
  model key is needed.
- **shadcn/ui** — copy-paste components, MIT.
  https://ui.shadcn.com — ship the code, attribute the licence.
- **Procedural SVG and CSS** — patterns, textures, and simple
  illustrations drawn in code. Free, licence-free, and impossible
  to mistake for a copied photo.

## What cannot be free — say so honestly

Image generation itself still needs a model subscription or API key.
This skill can direct image work — prompts, art direction, real-photo
sourcing, procedural alternatives — but it cannot generate images
without a model. Free mitigation: real photography from the sources
above, procedural SVG, CSS, and Three.js, and user-supplied photos.

## Licence checklist (before delivery)

- [ ] Every photo, icon, and font has a named source and licence.
- [ ] MIT and Creative Commons assets are attributed in the
  deliverable where the licence requires it.
- [ ] No paywalled screenshot has been re-hosted or hotlinked.
- [ ] No trademarked logo has been redrawn or reused.
- [ ] User-supplied assets are used only for this brief.
