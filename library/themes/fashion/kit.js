// Fashion theme drawing kit. Every piece in the theme draws with these colours, fonts, shapes and
// motion helpers, which is what keeps overlays, text, diagrams, 3D and captions looking like one system.
//
// THE STYLE (studied frame by frame from the user's reference: a 14-second fashion-film opener)
//   Footage   The picture carries everything. Graphics never decorate it: at any moment there is
//             at most ONE short word in the middle of the frame, plus (optionally) one tiny line
//             of small print near the bottom edge. Nothing else. No boxes, badges, icons or bars.
//   Type      White, clean sans capitals only, about a third of the frame wide. Two voices:
//             a HEAVY WIDE geometric (Montserrat 800, set tight) for most words, and a TALL
//             LIGHT CONDENSED (Oswald) for the opening word, whose tracking starts enormously
//             wide and closes up. Small print is the wide face at 500, tiny and tracked out.
//   Reveal    Letter by letter, each one fading out of a soft blur over ~0.2 s: left to right
//             like typing for the wide face, in scattered order for the condensed one. A word
//             holds for under a second and leaves by dimming (or is carried off by the cut).
//   Frames    The shot is shown as a clean, sharp card (soft shadow, no border) floating over a
//             blurred, enlarged copy of itself; or cut into tall vertical panels of unequal width
//             that slide in at their own pace before closing up into the whole picture.
//   Cuts      Soft and fast (5-8 frames): a sideways whip smear, a zoom-blur push through, and
//             once a loud one — a radial burst where the picture's own colours stretch into
//             saturated red / blue / yellow streaks with the channels split.
//   Grade     Gentle film: soft contrast, slightly lifted blacks, natural colour. The close is a
//             slow dim to near-black with one white mark and one small line under it.
//   Colour    White on picture; near-black and bone for cards; the burst's poppy red is the one
//             accent (cobalt and sun are its partners), used as a dot, a hairline or one bar.
//   Motion    Nothing bounces, slams, flickers or loops. Fast soft arrivals, long settles,
//             a barely visible push-in while anything holds.
//
//   Fast edits  (second iteration, for short-form pace) The same look, driven harder — the energy comes from
//             motion, rhythm, scale and layout changes, never from ornament. Three families of overlays
//             relax the "one word, no boxes" rule in a controlled way (overlays/pieces/_ui.js):
//             Interface  flat bone or near-black cards, square corners, soft shadow, hairline fields, small
//                        print; an ink pointer that glides (never bounces) and presses, types and ticks;
//                        the accent marks only what was just pressed or finished.
//             Kinetic    type and figures that arrive a size too large and soft and settle sharp in a few
//                        frames — hard landings, still no overshoot — and marks that ride the face track.
//             Charts     thin numerals and bars on the same cards, fed from the project where possible.
//             Use them over a light or blurred backdrop beside the clip (storyboard "layouts"), or in the
//             band above the head; one card at a time, and still only one accent.
//
// Pieces without footage (title cards, diagrams, 3D) stand in for it with a `field`: a soft,
// out-of-focus wash in footage tones (sky, meadow, stone, dusk), near-black (noir) or bone.
// Everything here is a pure function of its inputs: pieces set every animated value from t.
import {clamp, span, mix, easeOut, easeInOut} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut};

// ---------------------------------------------------------------- colours and type
export const C = {
  white: '#FFFFFF', bone: '#F1EEE8', paper: '#E6E1D8', ink: '#0D0D0F', coal: '#1B1B1F', smoke: '#8D8D92', ash: '#B9B6B0',
  poppy: '#E8402A', cobalt: '#2450E6', sun: '#F4B62B',
};
/** Data colours, in the order diagrams should use them: the accent first, then quiet greys. */
export const series = [C.poppy, C.cobalt, C.sun, C.smoke, C.ash, C.coal];
export const accents = {poppy: C.poppy, cobalt: C.cobalt, sun: C.sun, white: C.white};
/** Stand-ins for footage: [base, three out-of-focus lights, is it dark enough for white type]. */
export const fields = {
  noir: ['#0D0D0F', '#26222B', '#2B2520', '#141B26'],
  sky: ['#6F8FA3', '#A9C3CF', '#4E7088', '#C9C2B2'],
  meadow: ['#58724A', '#93A66C', '#2F4A38', '#C2BD8E'],
  stone: ['#7A7268', '#A69D90', '#4D4842', '#C4BCAE'],
  dusk: ['#96604C', '#D0956F', '#5A3A47', '#E2BE96'],
  bone: ['#F1EEE8', '#FFFFFF', '#E3DED4', '#F8F5EF'],
  // The bold grounds, for fast edits: the accent and its two partners as the whole card. Poppy and cobalt take white type, sun takes ink.
  poppy: ['#E8402A', '#F26A4B', '#C92F1C', '#EE5236'],
  cobalt: ['#2450E6', '#4A72F2', '#1637B4', '#3560EE'],
  sun: ['#F4B62B', '#FBD067', '#E79F12', '#F8C445'],
};
/** Grounds that take near-black type. */
export const LIGHT = ['bone', 'sun'];
export const F = {wide: 'Montserrat', tall: 'Oswald'};
/** Type roles. spacing is in em. */
export const type = {
  wide: {font: F.wide, weight: 800, spacing: -.012},    // THE word: heavy wide caps
  tall: {font: F.tall, weight: 400, spacing: .06},      // the condensed word
  num: {font: F.tall, weight: 300, spacing: .01},       // thin tall numerals
  label: {font: F.wide, weight: 500, spacing: .22},     // small print, always caps
  text: {font: F.wide, weight: 500, spacing: .005},     // sentences
  bold: {font: F.wide, weight: 700, spacing: .0},       // short emphasised phrases
};
export const FRAME = {width: 1080, height: 1920};

export const tone = c => C[c] ?? c ?? C.poppy;
export const up = s => String(s ?? '').toUpperCase();
export const flat = s => String(s ?? '').replace(/\n/g, ' ');
/** The inks of a piece: `field` decides light or dark type, `accent` the one colour. */
export function look(accent, field = 'noir') {
  const light = LIGHT.includes(field), a = accents[accent] ?? (field === 'poppy' ? C.white : C.poppy);
  return {light, head: light ? C.ink : C.white, soft: light ? '#4A4A4E' : '#E9E7E2', dim: light ? '#8D8D92' : field === 'noir' ? '#B9B6B0' : '#DEDBD5', line: light ? C.ink : C.white, accent: a === C.white && light ? C.ink : a, bg: fields[field]?.[0] ?? C.ink};
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
  const d3 = window.d3, id = `fa${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
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
 * The stand-in for footage: an out-of-focus wash filling the box, three soft lights wandering
 * slowly over a base tone, darkened toward the edges. set(t) moves it. `gain` > 1 enlarges it
 * (the "blurred, enlarged copy" behind a card); `dim` 0..1 darkens it.
 */
export function backdrop(g, st, x, y, w, h, name = 'noir', {gain = 1, dim = 0, seed = 0} = {}) {
  const [base, a, b, c] = fields[name] ?? fields.noir, light = LIGHT.includes(name) || name === 'poppy' || name === 'cobalt', box = g.append('g').attr('clip-path', clipBox(st, x, y, w, h));
  box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', base);
  const r = Math.max(w, h) * .62 * gain, lights = [a, b, c].map((col, i) => box.append('circle').attr('r', r * (.8 + .25 * hash(i, seed + 1))).attr('fill', glow(st, col, name === 'noir' ? .9 : .95)));
  if (!light) box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', gradient(st, [['#000', .34], ['#000', .04], ['#000', .22]], 90));
  if (dim) box.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', '#000').attr('opacity', dim);
  const home = [[.22, .2], [.8, .55], [.3, .92]];
  return {g: box, set(t) { lights.forEach((l, i) => l.attr('cx', x + w * (home[i][0] + .1 * Math.sin(t * .23 + i * 2.1 + seed))).attr('cy', y + h * (home[i][1] + .07 * Math.cos(t * .19 + i * 1.3 + seed)))); return this; }};
}
/**
 * The theme's frame device without footage: a clean, sharp card over the blurred field.
 * The card shows the same wash at normal size and full brightness, with a soft shadow.
 * Returns {g, set(t, q)}: q 0..1 opens it (ease it yourself); t keeps its wash moving.
 */
export function plate(g, st, x, y, w, h, name = st.field, {seed = 4} = {}) {
  const outer = g.append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`), inner = outer.append('g');
  inner.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', '#000').attr('filter', st.lift);
  const wash = backdrop(inner, st, -w / 2, -h / 2, w, h, name, {gain: .7, seed});
  if (name !== 'bone') inner.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', '#fff').attr('opacity', .07);
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
/** Plain text; '\n' starts a new line. role: wide | tall | num | label | text | bold. */
export function txt(g, x, y, str, {size = 30, color = C.white, role = 'text', anchor = 'start', leading = 1.4, ...rest} = {}) {
  const f = face({role, ...rest}), node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`);
  if (anchor === 'middle') node.attr('dx', f.spacing * size / 2); else if (anchor === 'end') node.attr('dx', f.spacing * size);     // tracking is added after each letter: keep the ink centred / flush
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
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
/** A flat card (sharp corners), optionally lifted off the picture with st.lift. */
export function sheet(g, x, y, w, h, {fill = C.bone, lift = null, opacity = 1} = {}) {
  return g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', fill).attr('fill-opacity', opacity).attr('filter', lift);
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
  for (let i = -1; i < n; i++) group.append('text').attr('x', i * w).attr('y', y).attr('fill', outline ? 'none' : color).attr('stroke', outline ? color : null).attr('stroke-width', outline || null).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).text(unit);
  return {g: group, width: w, set(offset) { group.attr('transform', `translate(${-(((offset % w) + w) % w)} 0)`); }};
}
/**
 * Shared diagram card (1000x1000). A lot of empty space: small print top-left, a quiet title, one
 * hairline. `field` picks the ground ('bone' by default; 'noir' or a footage tone for white lines);
 * `clear: true` draws white lines straight on footage. Content area is roughly y 250..900, x 90..910.
 * Call st.header(t) from seek.
 */
export function card(el, props = {}) {
  const st = stage(el, {mode: 'card', clear: props.clear, accent: props.accent, field: props.field ?? 'bone'}), {root, ink} = st;
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
