# Building a theme

A theme is one unified visual style. Everything a video shows — text effects, footage overlays,
diagrams, 3D, Lottie accents, captions, effects — comes from a single theme, so it all matches.
This is the checklist for adding one. `futuristic` is the reference implementation: read its
`theme.json`, its kit `hud.js`, each category's `catalog.json` and a few pieces from each folder first.
Also read `docs/REFERENCE.md` (storyboard formats), `CLAUDE.md`, and `library/_shared/` (`loader.js`,
`kit.js`, `captions.js`, `stage.html`, `effects_engine.py`, `shader_transitions.py`).

## Ground rules

- **Original work in a genre.** A reference shows the look to aim for: palette, texture, shapes,
  type, rhythm of motion. Never reproduce its specific words, layouts, logos, characters or assets,
  and never download art made by someone else. Pieces are drawn in code (SVG, canvas, shaders).
- **Painted art is allowed when it is original.** Some looks cannot be drawn in code (painted,
  airbrushed, photographic). A theme may ship images it generated itself with an AI image model, in
  `library/themes/<theme>/art/`. See "Painted art" below for the conditions. Code still does all the
  lettering and all the motion; the images are only scenery and cutouts.
- **One kit.** Each theme has one drawing kit (`library/themes/<theme>/kit.js`) holding its colours,
  fonts, textures and shape helpers. Every piece draws with it. If two pieces disagree about what
  the theme looks like, the kit is missing something.
- **The piece contract.** One ES module per piece: `export const meta = {duration, live?, loop?}`,
  optional `export const defaults = {...}` (everything a storyboard may override: all text, data,
  colours, positions), `export function mount(el, props) -> {seek(t)}`. `seek(t)` is a pure
  function of `t`: no timers, CSS animations or transitions, `Math.random`, `Date.now`. Seeded
  hashes only. D3 v7 is `window.d3` for `overlays`, `text` and `d3`; Three.js r160 core (no addons)
  is `window.THREE` for `three`.
- **No fake facts.** Sample data is labelled illustrative. Sample text is generic.
- **Look at everything.** A piece that runs without errors can still be unreadable or off-style.

## Folder layout — `library/themes/<theme>/`

| Path | Contents | Minimum |
| --- | --- | --- |
| `theme.json` | `id`, `title`, `summary`, `categories` (in the order below), `pieceFonts`, `colors`, `frame` | |
| `kit.js` | the drawing kit | |
| `overlays/` | see-through graphics for footage, 1080×1920, `"over": true` in the catalog. Positions are props; defaults keep the middle of the frame (the face) clear; `props.life` makes them animate out before their time ends | 12 |
| `text/` | text effects — the same set in every theme so storyboards can switch themes. Title cards (`"tall": true`, must work from 1000×1000 square to 1080×1920): `headline-slam`, `split-stack`, `marquee-wall`, `statement`, `big-number`, `quote-card`, `agenda`, `versus`, `chapter`, `countdown`, `end-card`. Overlays (`"over": true`): `keyword-slam`, `highlight-swipe`, `lower-third`, `side-text`, `marquee-band`, `corner-labels`, `pip-frame`, `sticker` | all 19 |
| `effects/` | `catalog.json`, `make_previews.py`, `clips/`, and `theme_effects.py` with `EFFECTS = {name: fn(img, progress, amount, frame, seed) -> img}` for effects only this theme has. The catalog may also list effects from the shared engine | 6 own |
| `transitions/` | `catalog.json`, `make_previews.py`, `clips/`: the theme's own transitions plus a selection from `library/_shared/shader_transitions.py` that suits the theme | 8 |
| `transitions/theme_transitions.py` | `PALETTE` (the theme's backdrop, edge and glow colours for the shared transitions, plus its own colour names), and `PIXEL = {name: fragment GLSL}` / `VERTEX = {name: mesh spec}` for transitions only this theme has, written with the shared engine's helpers. Deterministic: hashes of cell ids and `seed` only. See README, Transitions | 6 own |
| `fonts/` | `files/*.ttf` with licence texts, `catalog.json`. Open licences only (google/fonts raw URLs) | 10 |
| `captions/` | `styles.js` (uses `library/_shared/captions.js`), `catalog.json` | 5 |
| `d3/` | diagrams on 1000×1000 cards; support `clear: true` | 10 |
| `three/` | 3D scenes | 6 |
| `lottie/` | `generate.mjs` writing `animations/*.json` | 10 |
| `art/` | optional: original painted images with `catalog.json` (see "Painted art") | |
| `borumi/` | optional: the theme's graphics as Borumi editor compositions (see "Borumi compositions") | |

Category order in `theme.json`: `overlays`, `text`, `effects`, `transitions`, `fonts`, `captions`,
`voiceover`, `d3`, `three`, `lottie`. (`voiceover` is shared: list it, add no folder.) Catalog items
keep the shape `{id, name, group, piece: "<category>/<id>", description}`.

## Painted art (`art/`)

For themes whose look is painted rather than drawn. The rule: the image model paints, code animates
and draws the letters.

- **Original only.** Every image is generated for this theme. Nothing taken from the web, a stock
  site, a game, a film or another artist's work.
- **Clean prompts.** No real people, no logos or brand names, no named characters, no "in the style
  of <living artist>". No text inside the image; all words are drawn in code.
- **Provenance.** `art/catalog.json` lists every image: file, role, aspect, size, the full prompt,
  the model used and the date. An image without a catalog entry does not ship.
- **Every frame shape.** Backgrounds come in each aspect the theme supports: `art/16x9/` and
  `art/9x16/` (square frames centre-crop the tall one). Do not stretch, and do not crop a wide
  painting to tall if it loses the subject; generate a tall version. Cutouts (transparent PNGs in
  `art/cutouts/`) work at any shape and are placed by code.
- **Calm centre.** Backgrounds keep a darker, quieter area where text and the speaker go.
- **Weight.** Backgrounds are JPEG, at most 2560 px on the long side. Cutouts are PNG with alpha,
  trimmed to their content. Keep a theme's `art/` under about 15 MB. Images in `art/` are stored
  with Git LFS (see `.gitattributes`); `catalog.json` is a normal file.
- **Still props.** Text, colours of the lettering, positions and timing stay props. The painted
  palette is fixed, so the kit's colours are chosen to match the art, not the other way round.

## Borumi compositions (`borumi/`)

Optional. A theme may carry versions of its graphics for the Borumi editor, for editing real footage
there: `library/themes/<theme>/borumi/*.js`, each a self-contained Borumi composition module
(`/* @borumi {...} */` header plus `export function render(...)`), with readable sources in
`borumi/src/`. They are a separate engine from the pieces above (no `mount`/`seek`, no D3 or
Three.js) and are not loaded by the pipeline or the dashboard. They share the theme's `art/` and
must follow the same style spec as its pieces. A theme may exist with only `art/` and `borumi/`
while its pieces are being built; leave it out of `index.json` until the pieces meet the minimums.

## A theme that restyles another (`"extends"`)

When a new theme is an existing theme drawn with a different kit, do not copy its pieces. Put `"extends": "<parent>"` in
the new theme's `theme.json` and give it only its own `kit.js`, fonts, catalogs and the pieces that really differ. A piece
it does not have is the parent's file, loaded at the child's address, so its `../../kit.js` import picks up the child's
kit (the local server and the frame cache both follow this: `themeFile` in `pipeline/tools.mjs`). The child's
`catalog.json` files still list every piece it offers. Glass extends fashion this way.

A piece that shows a person's name, handle or call to action takes it from the user's settings: write
`handle: '{me.handle}'` (or `{me.name}`, `{me.role}`, `{me.keyword}`) in `defaults`, never a real name.

## Demos

- `projects/<theme>-demo/storyboard.json`: a shot storyboard, 5 shots, 2–3 candidates each marked
  usable, with transitions. A candidate may be just a full-frame `background` title card.
- `projects/talking-head-<theme>/`: `npm run footage talking-head-<theme> sample-talking-head.mov library/_shared/sample/words.json`,
  then author overlays, text effects, zooms, effects and transitions timed to the words in
  `words.json`, with graphics kept off the face using `faces.json`. `projects/talking-head/` shows how.
- `npm run make` must succeed on both.

## Checking

The server is usually running on port 4600 (`node dashboard/serve.mjs` starts it).

```sh
CH=$(find .tools/browser -type f -name chrome-headless-shell | head -1)
"$PWD/$CH" --headless --no-sandbox --hide-scrollbars --use-angle=swiftshader --enable-unsafe-swiftshader \
  --window-size=500,500 --virtual-time-budget=5000 --screenshot=/tmp/out.png \
  "http://localhost:4600/library/_shared/stage.html?theme=<theme>&piece=<category>/<id>&t=2"
```

- Overlays: `--window-size=432,768 --default-background-color=30405000` and `&clear=1`. Title cards: check both 432,768 and 500,500.
- Props: `&props=<url-encoded json>`. Try long and short text.
- Errors print in red in the page. A black WebGL frame usually means a shader failed to compile.
  In this software renderer, lines that pass behind the camera can vanish.
- Look at every piece at 2–3 moments, at frames from every effect and transition preview, at frames
  from both demo videos, and at `http://localhost:4600/dashboard/?theme=<theme>` (no console errors,
  every section present).
- Put the reference and your pieces side by side and judge honestly whether a stranger would say
  they belong to the same style. If not, fix the kit, not individual pieces.
- `npm run check` on the existing projects must still pass.
