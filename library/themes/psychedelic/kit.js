// Psychedelic theme drawing kit. Every piece in the theme draws with these colours, fonts, shapes and
// motion helpers. The theme extends `fashion` (theme.json "extends"): pieces it does not have are fashion's,
// drawn with this kit, so this file keeps fashion's exports and changes what they look like.
//
// THE STYLE (full spec: STYLE.md beside this file)
//   Idea      An image model paints the art; code only animates it and draws the letters.
//   Art       UV blacklight poster art in art/: a deep space sky with a ringed planet, and a moonlit
//             mushroom forest, each in 16:9 and 9:16, plus transparent cutouts (jellyfish, sparkle).
//             Every ground that stands in for footage is one of the two paintings, never a flat wash.
//   Darkness  Deep navy and indigo carry the frame. There are no light grounds: cards and panels are
//             navy with a thin cyan edge. Neon is an accent, not a fill.
//   Type      Poppins Bold capitals. Big words have dark navy bodies (#0b1452 to #040a2e), a thin
//             neon cyan rim, a second thin line just inside the rim, and a soft magenta glow.
//             Never a rainbow or coloured fill. Small print is plain white.
//   Colour    Cyan rims, magenta glow. Highlighter yellow marks the ONE emphasised word or mark
//             (the accent). Hot pink is a tiny accent only: the inner letter line, sparkle halos.
//   Motion    Subtle and slow: the painting drifts, sways and breathes; jellyfish float and bob;
//             9 to 16 sparkles twinkle; text arrives letter by letter out of a soft blur.
//
// Everything here is a pure function of its inputs: pieces set every animated value from t.
import {clamp, span, mix, easeOut, easeInOut} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut};

// ---------------------------------------------------------------- colours and type
// Names are fashion's (its pieces ask for them): `poppy` is THE accent (highlighter), `cobalt` the rim cyan,
// `sun` the hot pink; `bone` is the panel navy and `ink` the deepest navy. Extra names are this theme's own.
export const C = {
  white: '#FFFFFF', bone: '#0B1452', paper: '#101A6B', ink: '#040A2E', coal: '#0B1452', smoke: '#8F86C9', ash: '#B9B0E8',
  poppy: '#E6FF3D', cobalt: '#19E3FF', sun: '#FF4FE0',
  deep: '#050826', magenta: '#FF2BD6', coral: '#FF6A3D', violet: '#A24BFF', lime: '#7DFF3A',
};
/** Data colours, in the order diagrams should use them: the accent first, then quiet greys. */
export const series = [C.poppy, C.cobalt, C.sun, C.smoke, C.ash, C.coal];
export const accents = {poppy: C.poppy, cobalt: C.cobalt, sun: C.sun, white: C.white};
/** Stand-ins for footage: [base, three out-of-focus lights, is it dark enough for white type]. */
export const fields = {
  // Painted grounds (see PAINTING below): the colours are only the fallback if the art cannot be loaded.
  noir: ['#050826', '#2A0A6E', '#0B1452', '#3A0B5E'],
  sky: ['#050826', '#2A0A6E', '#0B1452', '#3A0B5E'],
  dusk: ['#050826', '#3A0B5E', '#0B1452', '#2A0A6E'],
  meadow: ['#04102A', '#0B3A5E', '#0B1452', '#2A0A6E'],
  stone: ['#04102A', '#0B3A5E', '#0B1452', '#2A0A6E'],
  // `bone` is the space painting dimmed (the quiet ground). The three bold grounds are flat, deep and tinted. All take white type.
  bone: ['#0B1452', '#1B2A8A', '#101A6B', '#2A1466'],
  poppy: ['#141A4A', '#4A6212', '#0B1040', '#2A0A6E'],
  cobalt: ['#06245C', '#0E5C9E', '#051A44', '#19A3C8'],
  sun: ['#3A0B5E', '#7A1FA8', '#2A0A4A', '#B01E9A'],
};
/** Which painting stands in for footage on each ground. */
const PAINTING = {noir: 'space', sky: 'space', dusk: 'space', bone: 'space', meadow: 'forest', stone: 'forest'};
/** Grounds that take near-black type: none, the theme is dark throughout. */
export const LIGHT = [];
export const F = {wide: 'Poppins', tall: 'Poppins'};
/** Type roles. spacing is in em. */
export const type = {
  wide: {font: F.wide, weight: 700, spacing: .015},     // THE word: bold caps
  tall: {font: F.tall, weight: 700, spacing: .08},      // the second voice: the same face, tracked out
  num: {font: F.tall, weight: 700, spacing: .01},       // numerals
  label: {font: F.wide, weight: 600, spacing: .2},      // small print, always caps
  text: {font: F.wide, weight: 600, spacing: .005},     // sentences
  bold: {font: F.wide, weight: 700, spacing: .0},       // short emphasised phrases
};
export const FRAME = {width: 1080, height: 1920};

export const tone = c => C[c] ?? c ?? C.poppy;
export const up = s => String(s ?? '').toUpperCase();
export const flat = s => String(s ?? '').replace(/\n/g, ' ');
/** The inks of a piece: `field` decides light or dark type, `accent` the one colour. */
export function look(accent, field = 'noir') {
  const a = accents[accent] ?? C.poppy;
  return {light: false, head: C.white, soft: '#E4DEFF', dim: C.ash, line: C.cobalt, accent: a, bg: fields[field]?.[0] ?? C.deep};
}

// ---------------------------------------------------------------- motion
/** Seeded pseudo-random 0..1 (pieces may not use Math.random). */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** THE theme ease: arrive fast, settle for a long time, never overshoot. */
export const glide = x => 1 - Math.pow(1 - clamp(x), 4);
/** Slow start and slow stop, for panels and cards that travel. */
export const swell = x => { x = clamp(x); return x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; };
export const easeIn = x => { x = clamp(x); return x * x * x; };
/** Opacity of something that fades up starting at `start`. */
export const fade = (t, start, length = .4) => easeInOut(span(t, start, length));
/** 0 while a piece is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .3) => life ? easeInOut(span(t, life - len, len)) : 0;
/** Overall opacity of an overlay: fades up, and dims away before `life` ends. */
export const presence = (t, life, len = .3) => fade(t, 0, .25) * (1 - leave(t, life, len));
/** The barely visible push-in everything keeps doing while it holds: a scale factor. */
export const drift = (t, amount = .03, over = 8) => 1 + amount * (1 - Math.exp(-t / over * 2.2));
/** Reveal a stroked path by drawing along its length. q is 0..1 (ease it yourself). */
export function draw(path, q) {
  const node = path.node(), length = node.__len ??= node.getTotalLength() || 1;
  path.attr('stroke-dasharray', `${length} ${length}`).attr('stroke-dashoffset', length * (1 - clamp(q))).attr('visibility', q <= 0 ? 'hidden' : null);   // null, not 'visible': that would show through a hidden parent (an overlay whose time is over)
}
export const comma = n => Math.round(n).toLocaleString('en-US');
export const pad2 = n => String(n).padStart(2, '0');

// ---------------------------------------------------------------- painted art
// Loaded and decoded once, before any piece mounts (top-level await), so a frame never shows a half-loaded picture.
const ART = '/library/themes/psychedelic/art/';
async function picture(file) {
  try {
    const response = await fetch(ART + file); if (!response.ok) return null;
    const url = URL.createObjectURL(await response.blob()), img = new Image();
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = url; });
    return {url, w: img.naturalWidth, h: img.naturalHeight};
  } catch { return null; }      // a missing image falls back to the field's colours
}
const [tallSpace, tallForest, wideSpace, wideForest, SPARKLE, JELLY_A, JELLY_B] = await Promise.all(
  ['9x16/bg-space.jpg', '9x16/bg-forest.jpg', '16x9/bg-space.jpg', '16x9/bg-forest.jpg', 'cutouts/sparkle.png', 'cutouts/jellyfish-pink.png', 'cutouts/jellyfish-cyan.png'].map(picture));
const TALL = {space: tallSpace, forest: tallForest}, WIDE = {space: wideSpace, forest: wideForest};

// ---------------------------------------------------------------- stage
let stages = 0, grainUrl;
function grainTile() {
  if (grainUrl) return grainUrl;
  const n = 160, cv = document.createElement('canvas'); cv.width = cv.height = n; const ctx = cv.getContext('2d'), img = ctx.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = hash(i, 3), dark = v < .5; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = dark ? 0 : 255; img.data[i * 4 + 3] = Math.abs(v - .5) * 26; }
  ctx.putImageData(img, 0, 0); return grainUrl = cv.toDataURL();
}
/**
 * An SVG stage.
 *   mode 'overlay' -> transparent 1080x1920, to sit on footage (white type with a soft shadow).
 *   mode 'title'   -> a full-frame card, 1080 wide and as tall as its element (1080..1920): lay out from W and H.
 *                     Its background is an out-of-focus `field`; call st.tick(t) in seek so it keeps breathing.
 *   mode 'card'    -> a 1000x1000 card for diagrams; `clear: true` leaves it see-through for footage.
 * Returns {svg, defs, under, root, id, W, H, ink, k, sq, soft, lift, tick}: `under` is behind `root`;
 * `soft` is a filter url for white type on footage, `lift` a filter url for a card lifted off the picture.
 */
export function stage(el, {mode = 'card', clear = false, accent, field = 'noir', grain = true} = {}) {
  const d3 = window.d3, id = `ps${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const W = mode === 'card' ? 1000 : 1080, H = mode === 'card' ? 1000 : overlay ? 1920 : Math.round(clamp(W * ch / cw, 1080, 1920));
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), under = svg.append('g'), root = svg.append('g'), see = overlay || clear;
  const shadow = (name, dy, blur, opacity) => { const f = defs.append('filter').attr('id', `${id}-${name}`).attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');
    f.append('feDropShadow').attr('dx', 0).attr('dy', dy).attr('stdDeviation', blur).attr('flood-color', '#000').attr('flood-opacity', opacity); return `url(#${id}-${name})`; };
  const st = {svg, defs, under, root, id, W, H, field: see ? 'noir' : field, ink: look(accent, see ? 'noir' : field), k: H / 1920, sq: H < 1500, n: 0, overlay, clear, soft: shadow('soft', 2, 12, .62), lift: shadow('lift', 24, 40, .45), tick: () => {}};
  el.style.background = see ? 'transparent' : st.ink.bg;
  if (!see) {
    const wash = backdrop(under, st, 0, 0, W, H, field); st.tick = t => wash.set(t);
    if (grain) { defs.append('pattern').attr('id', id + '-grain').attr('width', 160).attr('height', 160).attr('patternUnits', 'userSpaceOnUse').append('image').attr('href', grainTile()).attr('width', 160).attr('height', 160);
      svg.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-grain)`).style('pointer-events', 'none'); }
  }
  return st;
}
const uid = st => `${st.id}-${++st.n}`;
/** A clip rectangle; returns the value for a clip-path attribute. */
export function clipBox(st, x, y, w, h, r = 0) { const id = uid(st); st.defs.append('clipPath').attr('id', id).append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', r); return `url(#${id})`; }
/** A clip rectangle whose box is animated; returns {url, rect, set(x, y, w, h)}. */
export function clipLive(st) { const id = uid(st), rect = st.defs.append('clipPath').attr('id', id).append('rect'); return {url: `url(#${id})`, rect, set(x, y, w, h) { rect.attr('x', x).attr('y', y).attr('width', Math.max(0, w)).attr('height', Math.max(0, h)); return this; }}; }
/** A linear gradient; returns the value for a fill. Angle 0 runs left to right, 90 bottom to top. Stops: colour or [colour, opacity]. */
export function gradient(st, stops, angle = 90) {
  const id = uid(st), a = angle * Math.PI / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
  const g = st.defs.append('linearGradient').attr('id', id).attr('x1', .5 - dx).attr('y1', .5 + dy).attr('x2', .5 + dx).attr('y2', .5 - dy);
  stops.forEach((s, i) => { const [color, opacity = 1] = [].concat(s); g.append('stop').attr('offset', i / (stops.length - 1)).attr('stop-color', color).attr('stop-opacity', opacity); });
  return `url(#${id})`;
}
/** A soft round light (radial gradient fading to nothing); returns the value for a fill. */
export function glow(st, color, opacity = 1) {
  const id = uid(st), g = st.defs.append('radialGradient').attr('id', id);
  [[0, opacity], [.5, opacity * .5], [1, 0]].forEach(([o, a]) => g.append('stop').attr('offset', o).attr('stop-color', color).attr('stop-opacity', a));
  return `url(#${id})`;
}
/**
 * The stand-in for footage. On a painted ground it is the painting itself (the tall one, or the wide
 * one in a box clearly wider than tall), drifting, swaying and breathing very slowly, with sparkles
 * twinkling over it and, in a full frame, two jellyfish floating at the edges. On a flat ground it is
 * three soft lights over a navy base. set(t) moves it. `gain` > 1 enlarges and softens it (the copy
 * behind a card); `dim` 0..1 darkens it; `other` shows the other painting (a card over the ground).
 */
export function backdrop(g, st, x, y, w, h, name = 'noir', {gain = 1, dim = 0, seed = 0, other = false} = {}) {
  if (name === 'bone') dim = Math.max(dim, .28);
  const [base, a, b, c] = fields[name] ?? fields.noir, own = PAINTING[name], key = other && own ? (own === 'space' ? 'forest' : 'space') : own, art = key && ((w > h * 1.15 ? WIDE[key] : TALL[key]) ?? TALL[key] ?? WIDE[key]);
  const box = g.append('g').attr('clip-path', clipBox(st, x, y, w, h)), cx = x + w / 2, cy = y + h / 2, movers = [];
  box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', base);
  if (art) {
    const k = Math.max(w / art.w, h / art.h) * 1.07 * gain, iw = art.w * k, ih = art.h * k, pic = box.append('g');
    pic.append('image').attr('href', art.url).attr('x', -iw / 2).attr('y', -ih / 2).attr('width', iw).attr('height', ih).attr('preserveAspectRatio', 'none').style('filter', gain > 1.05 ? `blur(${Math.round(w * .014)}px)` : null);
    movers.push(t => pic.attr('transform', `translate(${cx + Math.sin(t * .18 + seed) * w * .018} ${cy + Math.cos(t * .13 + seed) * h * .01}) rotate(${Math.sin(t * .11 + seed) * .25}) scale(${1 + .01 * Math.sin(t * .35 + seed)})`));
    const full = gain <= 1.05 && w >= 900 && h >= 900;
    if (full) [[JELLY_A, .075, .2, 0], [JELLY_B, .925, .7, 1]].forEach(([j, fx, fy, i]) => {
      if (!j) return;
      const jw = w * .15, jh = jw * j.h / j.w, node = box.append('image').attr('href', j.url).attr('width', jw).attr('height', jh).attr('opacity', .9);
      movers.push(t => node.attr('x', x + w * fx - jw / 2 + Math.sin(t * .5 + i * 2 + seed) * w * .008).attr('y', y + h * fy - jh / 2 - t * h * .003 + Math.sin(t * .8 + i * 1.7 + seed) * h * .007));
    });
    box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', gradient(st, [[C.deep, .42], [C.deep, .1], [C.deep, .3]], 90));
    if (SPARKLE) {
      const n = Math.round(clamp(w * h / (1080 * 1920) * 14, 0, 1) * 7) + 9;
      for (let i = 0; i < n; i++) {
        const size = (26 + 70 * hash(i, seed + 11)) * Math.min(w, h * .6) / 1080, rate = 1.2 + 2.2 * hash(i, seed + 12), sx = x + w * (.04 + .92 * hash(i, seed + 13)), sy = y + h * (.04 + .92 * hash(i, seed + 14));
        const node = box.append('image').attr('href', SPARKLE.url).attr('x', sx - size / 2).attr('y', sy - size / 2).attr('width', size).attr('height', size * SPARKLE.h / SPARKLE.w);
        movers.push(t => node.attr('opacity', Math.pow(.5 + .5 * Math.sin(t * rate + i * 2.1 + seed), 2.2) * .9));
      }
    }
  } else {
    const r = Math.max(w, h) * .62 * gain, home = [[.22, .2], [.8, .55], [.3, .92]];
    const lights = [a, b, c].map((col, i) => box.append('circle').attr('r', r * (.8 + .25 * hash(i, seed + 1))).attr('fill', glow(st, col, .9)));
    box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', gradient(st, [[C.deep, .4], [C.deep, .06], [C.deep, .28]], 90));
    movers.push(t => lights.forEach((l, i) => l.attr('cx', x + w * (home[i][0] + .1 * Math.sin(t * .23 + i * 2.1 + seed))).attr('cy', y + h * (home[i][1] + .07 * Math.cos(t * .19 + i * 1.3 + seed)))));
  }
  if (dim) box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', C.deep).attr('opacity', dim);
  return {g: box, set(t) { movers.forEach(m => m(t)); return this; }};
}
/**
 * The theme's frame device without footage: a clean, sharp card over the blurred field.
 * The card shows the same wash at normal size and full brightness, with a soft shadow.
 * Returns {g, set(t, q)}: q 0..1 opens it (ease it yourself); t keeps its wash moving.
 */
export function plate(g, st, x, y, w, h, name = st.field, {seed = 4} = {}) {
  const outer = g.append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`), inner = outer.append('g');
  inner.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', '#000').attr('filter', st.lift);
  const wash = backdrop(inner, st, -w / 2, -h / 2, w, h, name, {gain: 1, seed, other: true});      // the card shows the other painting, so it reads as a window, not a copy
  inner.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', 'none').attr('stroke', C.cobalt).attr('stroke-width', 2).attr('stroke-opacity', .7);     // the theme's thin cyan edge
  return {g: inner, x, y, w, h, set(t, q = 1) { wash.set(t + 9); inner.attr('opacity', easeInOut(span(q, 0, .5))).attr('transform', `scale(${.9 + .1 * clamp(q)})`); return this; }};
}

// ---------------------------------------------------------------- text: measuring, fitting, splitting
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const face = (o = {}) => ({...type[o.role ?? 'wide'], ...Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null && k !== 'role'))});
const css = (size, f) => `${f.weight} ${size}px ${f.font}`;
/** Width of a string in px. `o` = {role, font, weight, spacing}. */
export function measure(str, size, o) { const f = face(o); ctx.font = css(100, f); return (ctx.measureText(str).width + f.spacing * 100 * [...String(str)].length) * size / 100; }
/** Height of a capital letter at this size. */
export function capH(size, o) { const key = css(100, face(o)); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 72; } return caps[key] * size / 100; }
/** The largest size (up to max) at which every line fits the width. */
export const fit = (lines, width, max, o) => Math.min(max, ...[].concat(lines).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
/** Break a sentence into lines no wider than `width` at this size. */
export function wrap(str, size, width, o) {
  const lines = []; let line = '';
  for (const word of String(str).split(/\s+/).filter(Boolean)) { const next = line ? line + ' ' + word : word; if (line && measure(next, size, o) > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
/** The largest size (max down to min) at which the sentence wraps inside a width x height box: {size, lines, pitch}. */
export function flow(str, width, height, max, min = 26, o, leading = 1.7) {
  for (let size = max; ; size -= 2) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines: balance(str, size, width, lines, o), pitch}; }
}
/** Even out a wrapped block so the last line is not a lone word: the narrowest wrap that keeps the same number of lines. */
function balance(str, size, width, lines, o) {
  if (lines.length < 2) return lines;
  let best = lines;
  for (let w = width * .96; w > width * .45; w -= width * .04) { const next = wrap(str, size, w, o); if (next.length !== lines.length || next.some(l => measure(l, size, o) > width)) break; best = next; }
  return best;
}
// ---------------------------------------------------------------- neon lettering
/** Big words (this size and up, in a display role) get the theme's lettering; smaller text stays plain. */
const NEON_MIN = 54, DISPLAY = ['wide', 'tall', 'num', 'bold'], made = new WeakMap();
const isWhite = c => /^(#fff(fff)?|white|#e4deff)$/i.test(String(c).trim());
/**
 * THE lettering: a dark navy body, a thin neon rim, a second thin line just inside the rim and a soft
 * glow. `color` is what the piece asked for: white becomes the cyan rim with a magenta glow and a hot
 * pink inner line; any other colour (the accent) is rim, inner line and glow alike. `per` = the node is
 * one letter or word (a roomier filter box, so the glow of a narrow letter is not cut off).
 */
function neon(node, size, color, per = false) {
  const svg = node.node()?.ownerSVGElement; if (!svg) return node;
  let ids = made.get(svg); if (!ids) made.set(svg, ids = new Map());
  const defs = window.d3.select(svg).select('defs'), plain = isWhite(color), rim = plain ? C.cobalt : color, s = Math.max(1, Math.round(size / 20)) * 20;
  if (!ids.has('body')) { const id = `psb${++stages}`, lg = defs.append('linearGradient').attr('id', id).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
    lg.append('stop').attr('offset', 0).attr('stop-color', '#0B1452'); lg.append('stop').attr('offset', 1).attr('stop-color', '#040A2E'); ids.set('body', id); }
  const key = `${rim}|${s}|${per}`;
  if (!ids.has(key)) {
    const id = `psn${++stages}`, f = defs.append('filter').attr('id', id).attr('color-interpolation-filters', 'sRGB').attr('x', per ? '-120%' : '-12%').attr('y', '-60%').attr('width', per ? '340%' : '124%').attr('height', '220%');
    const layers = ['glow', 'SourceGraphic'];
    f.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', s * (s >= 90 ? .12 : .08)).attr('result', 'soft');
    f.append('feFlood').attr('flood-color', plain ? C.magenta : rim).attr('flood-opacity', (plain ? .9 : .6) * (s >= 90 ? 1 : .7)).attr('result', 'gc');
    f.append('feComposite').attr('in', 'gc').attr('in2', 'soft').attr('operator', 'in').attr('result', 'glow');
    if (s >= 90) {      // the second thin line just inside the rim: a narrow band of the blurred shape (round, unlike an eroded one)
      const band = Array.from({length: 50}, (_, i) => i === 46 ? 1 : 0).join(' ');
      f.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', s * .05).attr('result', 'in');
      f.append('feComponentTransfer').attr('in', 'in').attr('result', 'ring').append('feFuncA').attr('type', 'discrete').attr('tableValues', band);
      f.append('feFlood').attr('flood-color', plain ? C.sun : rim).attr('flood-opacity', .85).attr('result', 'lc');
      f.append('feComposite').attr('in', 'lc').attr('in2', 'ring').attr('operator', 'in').attr('result', 'contour');
      layers.push('contour');
    }
    const m = f.append('feMerge'); layers.forEach(n => m.append('feMergeNode').attr('in', n));
    ids.set(key, id);
  }
  return node.attr('fill', `url(#${ids.get('body')})`).attr('stroke', rim).attr('stroke-width', size * (size >= 90 ? .06 : .08)).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke fill').attr('filter', `url(#${ids.get(key)})`);
}
const lettered = (role, size) => DISPLAY.includes(role ?? 'wide') && size >= NEON_MIN;

/** Text; '\n' starts a new line. role: wide | tall | num | label | text | bold. Big display roles get the neon lettering. */
export function txt(g, x, y, str, {size = 30, color = C.white, role = 'text', anchor = 'start', leading = 1.4, ...rest} = {}) {
  const f = face({role, ...rest}), node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`);
  if (anchor === 'middle') node.attr('dx', f.spacing * size / 2); else if (anchor === 'end') node.attr('dx', f.spacing * size);     // tracking is added after each letter: keep the ink centred / flush
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  if (lettered(role, size)) neon(node, size, color);
  return node;
}
/** Small print: tiny tracked-out caps, the theme's only secondary text. */
export const label = (g, x, y, str, {size = 22, color = C.white, anchor = 'start', ...rest} = {}) => txt(g, x, y, up(flat(str)), {size: size * SMALL, color, anchor, role: 'label', ...rest});
/** Small print is drawn this much larger than the sizes pieces ask for: tiny on a cinema screen is unreadable on a phone. */
export const SMALL = 1.18;
/**
 * A line of text split into separately animated units: by 'letter', 'word' or 'all'.
 * Returns [{g, text, cx, y, w, cap, size, i, n, str, mid}] (mid = x of the middle of the whole line);
 * move a unit with pose(), or use reveal() below.
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = C.white, ...rest} = {}) {
  const o = {role: 'wide', ...rest}, f = face(o), pad = f.spacing * size, total = measure(str, size, o) - pad, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - pad, cx = x0 + measure(str.slice(0, at), size, o) + w / 2, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    const text = inner.append('text').attr('text-anchor', 'middle').attr('fill', color).style('font', css(size, f)).style('letter-spacing', by === 'letter' ? null : `${f.spacing}em`).text(c);
    if (by !== 'letter') text.attr('dx', pad / 2);
    if (lettered(o.role, size)) neon(text, size, color, true);
    return {g: inner, text, cx, y, w, cap, size, i, n: all.length, str: c, mid: x0 + total / 2};
  });
}
/** Move, scale (about the middle of the cap height), fade and soften one unit from glyphs(). `blur` is in px. */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, o = 1, blur = 0} = {}) {
  u.g.attr('transform', `translate(${x} ${y - u.cap / 2}) scale(${sx} ${sy}) translate(0 ${u.cap / 2})`).attr('opacity', o).style('filter', blur > .3 && o > 0 ? `blur(${blur.toFixed(2)}px)` : null);
}
/**
 * THE signature motion: a word arrives letter by letter out of a soft blur.
 *   mode 'type'    left to right, like typing (the heavy wide word)
 *   mode 'scatter' in scattered order while very wide tracking closes up (the tall condensed word)
 *   mode 'settle'  all together, tracking closing up (small print, second lines)
 * `start` seconds, `step` between letters, `len` each letter's fade; `x` 0..1 is the piece leaving (dims, softens).
 * Returns the time at which the last letter has landed.
 */
export function reveal(units, t, {mode = 'type', start = 0, step = .06, len = .26, x = 0, spread = 1.1, seed = 1} = {}) {
  const n = units.length, order = units.map((u, i) => i);
  if (mode === 'scatter') order.sort((a, b) => hash(a, seed) - hash(b, seed));
  const rank = []; order.forEach((idx, r) => rank[idx] = r);
  const total = mode === 'settle' ? len * 2.2 : (n - 1) * step + len, track = mode === 'type' ? 0 : spread * (1 - glide(span(t, start, total * 1.5)));
  units.forEach((u, i) => {
    const q = mode === 'settle' ? span(t, start, len * 1.6) : span(t, start + rank[i] * step, len), e = glide(q);
    pose(u, {x: (u.cx - u.mid) * (track + x * .06), o: easeInOut(q) * (1 - x), blur: ((1 - e) * .16 + x * .08) * u.size});
  });
  return start + total;
}
/** How long reveal() takes for a string, so pieces can cue what follows. */
export const revealTime = (str, {mode = 'type', step = .06, len = .26} = {}) => mode === 'settle' ? len * 2.2 : (Math.max(1, [...String(str).replace(/\s/g, '')].length) - 1) * step + len;

// ---------------------------------------------------------------- shapes
/** A hairline (round caps off: the theme's lines are crisp). */
export const stroke = (g, d, color = C.white, width = 2) => g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width);
/** A horizontal hairline that draws from its middle outwards. Returns {node, set(q)}. */
export function rule(g, x, y, w, color = C.white, width = 2) {
  const node = g.append('rect').attr('y', y - width / 2).attr('height', width).attr('fill', color);
  return {node, set(q) { q = clamp(q); node.attr('x', x + w / 2 * (1 - q)).attr('width', w * q); return this; }};
}
/** A small registration cross centred on (x, y). */
export const cross = (g, x, y, r = 12, color = C.white, width = 2) => stroke(g, `M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}`, color, width);
/** Corner ticks of a box (an open frame: four L shapes of length l). */
export const ticks = (x, y, w, h, l = 36) => `M${x} ${y + l}V${y}H${x + l}M${x + w - l} ${y}H${x + w}V${y + l}M${x + w} ${y + h - l}V${y + h}H${x + w - l}M${x + l} ${y + h}H${x}V${y + h - l}`;
/** The one accent mark: a small solid dot. */
export const dot = (g, x, y, r = 7, color = C.poppy) => g.append('circle').attr('cx', x).attr('cy', y).attr('r', r).attr('fill', color);
/** A thin ring. */
export const ring = (g, x, y, r, color = C.white, width = 2) => g.append('circle').attr('cx', x).attr('cy', y).attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width);
/** A tick mark inside an s x s box whose top-left is (x, y). */
export const tickPath = (x, y, s) => `M${x + s * .18} ${y + s * .54}L${x + s * .42} ${y + s * .78}L${x + s * .84} ${y + s * .24}`;
/** A flat navy panel with the theme's thin cyan edge, optionally lifted off the picture with st.lift. */
export function sheet(g, x, y, w, h, {fill = C.bone, lift = null, opacity = 1} = {}) {
  return g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 14).attr('fill', fill).attr('fill-opacity', opacity).attr('stroke', C.cobalt).attr('stroke-width', 2).attr('stroke-opacity', .6 * opacity).attr('filter', lift);
}
/**
 * The line of small print along the bottom of a card or the frame, centred, like a credit:
 * parts joined by thin bars. Returns {node, set(t, start, x)}.
 */
export function credit(g, st, parts, y, {size = 20, color = C.white, opacity = .82} = {}) {
  const str = [].concat(parts).filter(Boolean).map(s => up(flat(s))).join('   |   '), s = Math.min(size, fit(str, st.W - 160, size, {role: 'label'}));
  const node = label(g, st.W / 2, y, str, {size: s, color, anchor: 'middle'});
  return {node, set(t, start = .5, x = 0) { node.attr('opacity', fade(t, start, .6) * opacity * (1 - x)); return this; }};
}
/**
 * Small print in the corners of a title card (up to four: top-left, top-right, bottom-left,
 * bottom-right). Returns {set(t, start)}.
 */
export function cornerLabels(st, labels = [], {m = 70, size = 20, color = st.ink.head, top = 96} = {}) {
  const {root, W, H} = st, nodes = [];
  labels.slice(0, 4).forEach((text, i) => { if (!text) return; const right = i % 2 === 1, low = i > 1; nodes.push(label(root, right ? W - m : m, low ? H - top + 22 : top, text, {size, color, anchor: right ? 'end' : 'start'})); });
  return {nodes, set(t, start = .5) { nodes.forEach((n, i) => n.attr('opacity', fade(t, start + i * .1, .6) * .82)); }};
}
/** A band of repeated text for marquees. set(offset) scrolls it (px, either sign). y is the baseline. */
export function strip(g, st, str, y, size, {color = C.white, outline = 0, gap = size * .7, ...rest} = {}) {
  const o = {role: 'wide', ...rest}, f = face(o), unit = String(str), w = measure(unit, size, o) + gap, n = Math.ceil(st.W / w) + 3, group = g.append('g');
  for (let i = -1; i < n; i++) { const node = group.append('text').attr('x', i * w).attr('y', y).attr('fill', outline ? 'none' : color).attr('stroke', outline ? (isWhite(color) ? C.cobalt : color) : null).attr('stroke-width', outline || null).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).text(unit);
    if (!outline && lettered(o.role, size)) neon(node, size, color); }
  return {g: group, width: w, set(offset) { group.attr('transform', `translate(${-(((offset % w) + w) % w)} 0)`); }};
}
/**
 * Shared diagram card (1000x1000). A lot of empty space: small print top-left, a quiet title, one
 * hairline. `field` picks the ground (the painted 'noir' by default; 'bone' is the flat navy panel);
 * `clear: true` draws white lines straight on footage. Content area is roughly y 250..900, x 90..910.
 * Call st.header(t) from seek.
 */
export function card(el, props = {}) {
  const st = stage(el, {mode: 'card', clear: props.clear, accent: props.accent, field: props.field ?? 'noir'}), {root, ink} = st;
  if (props.clear) st.under.append('rect').attr('x', 20).attr('y', 20).attr('width', 960).attr('height', 960).attr('fill', '#000').attr('opacity', .42);
  const g = props.clear ? root.append('g').attr('filter', st.soft) : root; st.body = g;
  const title = up(flat(props.title)), size = fit(title, 820, 40, {role: 'wide'});
  st.kicker = label(g, 90, 108, props.unit ?? '', {size: 19, color: ink.dim});
  st.title = txt(g, 90, 108 + 34 + capH(size), title, {size, role: 'wide', color: ink.head});
  st.rule = rule(g, 90, 214, 820, ink.line, 1.5); st.mark = dot(g, 903, 101, 7, ink.accent);
  st.header = t => { st.tick(t); st.kicker.attr('opacity', fade(t, 0, .5)); st.title.attr('opacity', fade(t, .1, .5)); st.rule.set(glide(span(t, .15, .9))); st.rule.node.attr('opacity', .5); st.mark.attr('opacity', fade(t, .5, .4)); };
  return st;
}

// ---------------------------------------------------------------- the word
/**
 * One word in one of the theme's two voices, ready to reveal: face 'wide' (heavy caps, typed on
 * left to right) or 'tall' (light condensed caps, scattered order, tracking closing up).
 * (x, y) is the baseline anchor. Returns {units, time, set(t, start, x)}; `time` is how long the reveal takes.
 */
export function word(g, str, x, y, size, {face = 'wide', anchor = 'middle', color = C.white, step, len, seed = 1, role} = {}) {
  const tall = face === 'tall', s = up(flat(str)), units = glyphs(g, s, x, y, size, {anchor, color, role: role ?? (tall ? 'tall' : 'wide')});
  const o = {mode: tall ? 'scatter' : 'type', step: step ?? (tall ? .045 : .05), len: len ?? (tall ? .42 : .24), seed};
  return {units, time: revealTime(s, o), set(t, start = 0, x = 0) { return reveal(units, t, {...o, start, x}); }};
}
/** The largest size for word(): fits `width`, at most `max`. */
export const wordFit = (lines, width, max, face = 'wide') => fit([].concat(lines).map(l => up(flat(l))), width, max, {role: face === 'tall' ? 'tall' : 'wide'});
/** Scale a group about a point (for the hold drift). */
export const about = (g, x, y, s) => g.attr('transform', `translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`);
/** A block of words that fade up out of blur one after another (sentences). Returns {units, set(t, start, x), time}. */
export function phrase(g, lines, x, top, size, pitch, {role = 'bold', color = C.white, step = .06, len = .3, anchor = 'middle'} = {}) {
  const o = {role}, cap = capH(size, o), units = lines.flatMap((line, i) => glyphs(g, line, x, top + cap + i * pitch, size, {by: 'word', anchor, color, role}).map(u => ({...u, line: i})));
  units.forEach((u, i) => u.k = i);
  return {units, cap, time: (units.length - 1) * step + len, set(t, start = 0, x = 0) { units.forEach(u => { const q = span(t, start + u.k * step, len); pose(u, {y: (1 - glide(q)) * cap * .15, o: easeInOut(q) * (1 - x), blur: (1 - glide(q)) * size * .1}); }); }};
}
