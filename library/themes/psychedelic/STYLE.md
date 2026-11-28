# Psychedelic blacklight theme

The style spec for this theme. The theme ships painted art (`art/`), Borumi compositions (`borumi/`) and the pipeline pieces: its own `kit.js` (painted grounds, neon lettering) over the fashion theme's piece set (`"extends": "fashion"`), plus its own captions, fonts, effects, transitions and Lottie accents. Any piece added or overridden later must follow this spec.

Core idea: **AI paints the art; code only animates it and draws the letters.**

## 1. Art (AI-generated, never drawn with code)

Vibe: blacklight UV poster art. Deep navy darkness with fluorescent cyan, magenta and lime glow. Painted, airbrushed detail; never flat vector shapes.

| File (in `art/`) | Size | Media parameter | Used by |
|---|---|---|---|
| `16x9/bg-space.jpg` | 2560x1440 | `background` | keyword, list |
| `16x9/bg-forest.jpg` | 2560x1440 | `background` | chapter card, wipe |
| `cutouts/jellyfish-pink.png` | alpha | `jellyfishA` | keyword, list, chapter, wipe |
| `cutouts/jellyfish-cyan.png` | alpha | `jellyfishB` | keyword, chapter, wipe |
| `cutouts/mushrooms-a.png` | alpha | `mushroomsLeft` | chapter, wipe |
| `cutouts/mushrooms-b.png` | alpha | `mushroomsRight` | chapter, wipe |
| `cutouts/sparkle.png` | alpha | `sparkle` | all 4 |

- `bg-space`: deep space sky, indigo and violet nebula, glowing ringed planet upper right, thousands of stars, darker calm centre and left.
- `bg-forest`: moonlit mushroom forest from the forest floor, big full moon top centre, twisted trees with cyan and magenta rim light, calm dark centre.
- Cutouts were generated on pure black, then the black was removed (keyed to alpha) so they float on top. Backgrounds are 16:9, upscaled to 2560x1440. Tall 9:16 versions (1440x2560) of both are in `art/9x16/` under the same file names, for vertical frames: planet in the upper third, moon top centre, calm dark lower middle. The Borumi compositions were laid out for 16:9; for a vertical project pass the `9x16/` background, and check placement on a frame, since vertical layouts have not been tuned yet.

Making new art (only when asked): shared prompt suffix "UV blacklight poster art, deep navy #070a2a darkness, neon cyan, magenta, hot pink, lime green, orange glow accents, rich painted airbrushed illustration detail, fluorescent paint on black velvet, psychedelic 1970s blacklight poster, no text." For cutouts add: "on a perfectly flat pure black #000000 background with nothing else in the frame, no stars, no particles, lots of empty black margin." Per-image prompts are in `art/catalog.json`; add an entry for every new image.

## 2. Lettering (the signature look)

- Font: Poppins Bold (700).
- Letter bodies are dark navy, `#0b1452` fading down to `#040a2e`. Never a rainbow or gradient-colour fill.
- Thin neon cyan rim (`#19e3ff`), a second thin line just inside the rim (inner contour), and a soft magenta glow (`#ff2bd6`) that slowly pulses.
- One rim colour per word, never a gradient across letters.
- Letters pop in one after another, then gently wave and tilt.

## 3. Colours

- Base: navy and indigo, cyan rims, magenta glow.
- Hot pink `#FF4FE0` and hot coral `#FF6A3D` are tiny accents only, together under 2% of the frame: inner letter lines, sparkle halos (every 4th sparkle), small glints on mushroom caps, chapter number rim, wipe line core.
- Highlighter yellow `#E6FF3D` goes on **exactly 1** most-emphasized word or phrase per text (e.g. FREE, 30 MILLION). The `highlight` parameter is matched as one contiguous phrase.

## 4. Placement in talking-head shots

- About 80% of keywords: `layout: top-behind`. Big text on 1 straight line behind the author's head, so hair covers part of the middle letters (intended). Space sky fades down from the top, a jellyfish in each top corner. Segment has behind-subject on (balanced).
- About 20%: `layout: side`. Text stacked on up to 3 lines beside the head, on the emptier side (`side: left|right`), in a sky panel that fades toward the author. Behind-subject off, so the column must stay clear of face and hair. Use it where the head sits highest in the frame.
- Text never goes below the chin. The room is never dimmed.

## 5. Motion (subtle and slow)

- Backgrounds drift slowly with a slight sway and gentle breathing.
- Foreground mushrooms move about 2x faster than the background (depth).
- Jellyfish float up and bob.
- Stars twinkle, 9 to 16 per frame.
- Glows pulse every 2 to 2.5 seconds.
- Text fades in over about 0.2 seconds.

## 6. Lists

- Space panel on the left that fades into the room, twinkling stars, one jellyfish. Behind-subject on (balanced).
- Each number has its own coloured badge, in order: pink, cyan, lime, coral, violet, cyan.
- Newest item is highlighter yellow; earlier items settle to the cyan rim.
- Text column ends at 0.235 of frame width so long items finish before the author's hair.

## 7. Borumi compositions

Built files in `borumi/` (each = `borumi/src/<name>.head` + `borumi/src/kit.js` + `borumi/src/<name>.body`; edit the parts, then rebuild by concatenating):

| File | Borumi name | Text parameters | Behind subject |
|---|---|---|---|
| `keyword.js` | Psychedelic keyword | `text`, `highlight`, `layout`, `side`, `kicker` | top-behind: balanced; side: off |
| `list.js` | Psychedelic bullet list | `items`, `times` | balanced |
| `chapter.js` | Psychedelic chapter card | `number`, `title`, `kicker`, `highlight` | off (full screen) |
| `wipe.js` | Psychedelic wipe reveal | `left`, `right`, `times`, `wipe`, `layer` | `back` segment: high; `line` segment: off |

Every composition still renders without the images (dark fallback), but that is not the look: always set all media parameters.

## 8. Setting it up in a Borumi project

Borumi has no project-wide theme. Images reach a composition only through the `media_parameters` each segment sets.

1. `begin_project_edit`.
2. `import_media` the 2 files in `art/16x9/` and the 5 in `art/cutouts/` (once per project; reuse the media IDs).
3. For each of the 4 files in `borumi/`: `composition_source` `open` with `{"path": "<absolute path>"}`, then `create_composition` (once per project).
4. `add_segments` / `update_segments` with text `parameters` and `media_parameters`, e.g. `[{"name":"background","media_id":"<bg-space id>"},{"name":"jellyfishA","media_id":"<pink id>"},...]`.
5. `inspect_timeline` on a frame, then `commit_project_edit`.

Shortcut: `copy_segments` from an existing psychedelic project brings images and compositions along.
