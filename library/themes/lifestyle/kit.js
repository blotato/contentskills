// Lifestyle theme drawing kit. Every piece in the theme draws with these colours, fonts, shapes and
// motion helpers, which is what keeps overlays, text, diagrams, 3D and captions looking like one system.
//
// THE STYLE (studied from the user's reference: a bright, airy lifestyle opener)
//   Palette   A pale mint-cream paper field (never white, never dark) with warm brown-black ink.
//             Over footage, type is the same cream as the paper. One fresh leaf green leads; a soft
//             sage/teal, sun-yellow, clay and blush come from the faded, sunlit footage itself.
//   Type      One heavy, tight-set grotesque (Inter Tight 900, negative tracking) does almost
//             everything, small in the middle of a lot of air or enormous and running off the frame.
//             It is paired with wide-tracked caps (Montserrat 800) for short words and labels, bold
//             lowercase for soft phrases, a serif italic for the elegant word and a handwritten
//             face (Caveat) for notes in the margin.
//   Layout    Flat and calm: square-cornered pictures butted into drifting collage grids with thin
//             paper gutters, paper mats around footage, small centred lockups, giant outlined
//             letters as wallpaper, pill tags, arches, soft blobs and a brushed scribble.
//   Texture   Faint paper grain; footage is graded faded and warm (lifted blacks, teal shadows,
//             cream highlights) with soft bloom, light leaks and fine grain.
//   Motion    Nothing bounces, flickers or slams. Things glide to rest on long ease-outs:
//             tracking that starts wide and settles tight, words that fade up one after another
//             (grey first, then ink), letters that rise softly in a stagger, huge type sliding
//             sideways, pictures wiping open while they slowly push in, panels sliding up over
//             each other, brush strokes drawing on. Everything keeps drifting slowly once it lands.
//
// Everything here is a pure function of its inputs: pieces set every animated value from t.
import {clamp, span, mix, easeOut, easeInOut} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut};

// ---------------------------------------------------------------- colours and type
export const C = {
  paper: '#E8F1DA', deep: '#D7E5C4', line: '#BFCFA9', cream: '#F5F8E9',
  ink: '#2B221C', soft: '#5E5A4C', dim: '#8C947D',
  leaf: '#6CAE48', sage: '#8FBBAA', teal: '#3E8B89', sky: '#A9D3D6',
  sun: '#E9B44C', clay: '#D8694A', blush: '#EFC6B2',
};
/** Data colours, in the order diagrams should use them. */
export const series = [C.leaf, C.teal, C.sun, C.clay, C.sage, C.blush];
/** A piece is led by one accent (`accent` prop); the next one along is its second colour. */
export const accents = {leaf: C.leaf, clay: C.clay, teal: C.teal, sun: C.sun};
export const F = {head: '"Inter Tight"', wide: 'Montserrat', text: '"Inter Tight"', hand: 'Caveat', serif: '"Instrument Serif Italic"'};
/** Type roles. spacing is in em. */
export const type = {
  head: {font: F.head, weight: 900, spacing: -.035, word: .1},    // the heavy tight grotesque
  wide: {font: F.wide, weight: 800, spacing: .14},      // wide-tracked caps for short words
  label: {font: F.head, weight: 700, spacing: .16},     // micro labels, always caps
  text: {font: F.text, weight: 600, spacing: -.005},    // sentences
  soft: {font: F.head, weight: 800, spacing: -.03, word: .08},     // bold lowercase phrases
  serif: {font: F.serif, weight: 400, spacing: -.01},   // the elegant word
  hand: {font: F.hand, weight: 700, spacing: 0},        // handwritten notes
};
export const FRAME = {width: 1080, height: 1920};

/** A colour by name (accent or palette name) or any CSS colour passed through. */
export const tone = c => C[c] ?? c ?? C.leaf;
/** Readable ink on a fill of this colour. */
export const inkOn = c => [C.ink, C.teal, C.clay, C.soft].includes(tone(c)) ? C.cream : C.ink;
/** The inks of a piece led by one accent. `over` = drawn straight on footage (cream type). */
export function look(name, over = false) {
  const names = Object.keys(accents), i = Math.max(0, names.indexOf(name)), accent = accents[names[i]];
  return {bg: C.paper, head: over ? C.cream : C.ink, text: over ? C.cream : C.ink, soft: over ? C.cream : C.soft, dim: over ? C.cream : C.dim, line: over ? C.cream : C.line,
    accent, alt: accents[names[(i + 1) % names.length]], third: accents[names[(i + 2) % names.length]], on: inkOn(accent)};
}
export const up = s => String(s ?? '').toUpperCase();

// ---------------------------------------------------------------- motion
/** Seeded pseudo-random 0..1 (pieces may not use Math.random). */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A smoothly wandering value 0..1 over time. */
export const noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
/** THE theme ease: arrive fast, settle for a long time, never overshoot. */
export const glide = x => 1 - Math.pow(1 - clamp(x), 4);
/** Slow start and slow stop, for panels that slide across the whole frame. */
export const swell = x => { x = clamp(x); return x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; };
export const easeIn = x => { x = clamp(x); return x * x * x; };
/** Opacity of something that fades up starting at `start`. */
export const fade = (t, start, length = .5) => easeInOut(span(t, start, length));
/** 0 while a piece is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .45) => life ? easeIn(span(t, life - len, len)) : 0;
/** Overall opacity of an overlay: fades up, and fades away before `life` ends. */
export const presence = (t, life, len = .45) => fade(t, 0, .35) * (1 - leave(t, life, len));
/** The slow push-in everything keeps doing once it has landed: a scale factor. */
export const drift = (t, amount = .05, over = 10) => 1 + amount * (1 - Math.exp(-t / over * 2.2));
/** Reveal a stroked path by drawing along its length. q is 0..1 (ease it yourself). */
export function draw(path, q) {
  const node = path.node(), length = node.__len ??= node.getTotalLength() || 1;
  path.attr('stroke-dasharray', `${length} ${length}`).attr('stroke-dashoffset', length * (1 - clamp(q))).attr('visibility', q <= 0 ? 'hidden' : null);   // null, not 'visible': that would show through a hidden parent (an overlay whose time is over)
}
export const comma = n => Math.round(n).toLocaleString('en-US');

// ---------------------------------------------------------------- stage
let stages = 0, grainUrl;
/** A tile of faint seeded paper grain, as a data URL (drawn once). */
function grainTile() {
  if (grainUrl) return grainUrl;
  const n = 160, cv = document.createElement('canvas'); cv.width = cv.height = n; const ctx = cv.getContext('2d'), img = ctx.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const v = hash(i, 3), dark = v < .5; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = dark ? 60 : 255; img.data[i * 4 + 3] = Math.abs(v - .5) * 34; }
  ctx.putImageData(img, 0, 0); return grainUrl = cv.toDataURL();
}
/**
 * An SVG stage.
 *   mode 'overlay' -> transparent 1080x1920, to sit on footage (type is cream, with a soft shadow).
 *   mode 'title'   -> a full-frame paper card, 1080 wide and as tall as its element (1080..1920): lay out from W and H.
 *   mode 'card'    -> a 1000x1000 paper card for diagrams; `clear: true` floats a paper sheet on footage instead.
 * Returns {svg, defs, under, root, id, W, H, ink, k, sq, soft, lift}: `under` is behind `root`;
 * `soft` is a filter url for cream type on footage, `lift` a filter url for paper lifted off the picture.
 */
export function stage(el, {mode = 'card', clear = false, accent, bg = C.paper, grain = true} = {}) {
  const d3 = window.d3, id = `ls${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const W = mode === 'card' ? 1000 : 1080, H = mode === 'card' ? 1000 : overlay ? 1920 : Math.round(clamp(W * ch / cw, 1080, 1920));
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), under = svg.append('g'), root = svg.append('g');
  const shadow = (name, dy, blur, opacity) => { const f = defs.append('filter').attr('id', `${id}-${name}`).attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%');   // relative to the filtered element, so it works inside moved groups
    f.append('feDropShadow').attr('dx', 0).attr('dy', dy).attr('stdDeviation', blur).attr('flood-color', '#1c2618').attr('flood-opacity', opacity); return `url(#${id}-${name})`; };
  const st = {svg, defs, under, root, id, W, H, ink: look(accent, overlay), k: H / 1920, sq: H < 1500, n: 0, overlay, soft: shadow('soft', 3, 14, .7), lift: shadow('lift', 14, 22, .28)};
  el.style.background = overlay || clear ? 'transparent' : bg;
  if (!overlay && !clear) {
    under.append('rect').attr('width', W).attr('height', H).attr('fill', bg);
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
/** A clip made from any path; returns {url, path}. */
export function clipPath(st, d) { const id = uid(st), path = st.defs.append('clipPath').attr('id', id).append('path').attr('d', d); return {url: `url(#${id})`, path}; }
/** A linear gradient; returns the value for a fill. Angle 0 runs left to right, 90 bottom to top. Stops: colour or [colour, opacity]. */
export function gradient(st, stops, angle = 90) {
  const id = uid(st), a = angle * Math.PI / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
  const g = st.defs.append('linearGradient').attr('id', id).attr('x1', .5 - dx).attr('y1', .5 + dy).attr('x2', .5 + dx).attr('y2', .5 - dy);
  stops.forEach((s, i) => { const [color, opacity = 1] = [].concat(s); g.append('stop').attr('offset', i / (stops.length - 1)).attr('stop-color', color).attr('stop-opacity', opacity); });
  return `url(#${id})`;
}
/** A soft round colour wash (radial gradient fading to nothing); returns the value for a fill. */
export function glow(st, color, opacity = 1) {
  const id = uid(st), g = st.defs.append('radialGradient').attr('id', id);
  [[0, opacity], [.55, opacity * .45], [1, 0]].forEach(([o, a]) => g.append('stop').attr('offset', o).attr('stop-color', color).attr('stop-opacity', a));
  return `url(#${id})`;
}

// ---------------------------------------------------------------- text: measuring, fitting, splitting
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const face = (o = {}) => ({...type[o.role ?? 'head'], ...Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null && k !== 'role'))});
const css = (size, f) => `${f.weight} ${size}px ${f.font}`;
/** Width of a string in px. `o` = {role, font, weight, spacing}. */
export function measure(str, size, o) { const f = face(o); ctx.font = css(100, f); return (ctx.measureText(str).width + f.spacing * 100 * [...str].length + (f.word || 0) * 100 * (String(str).split(' ').length - 1)) * size / 100; }
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
export function flow(str, width, height, max, min = 30, o, leading = 1.5) {
  for (let size = max; ; size -= 3) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/** Plain text; '\n' starts a new line. role: head | wide | label | text | soft | serif | hand. */
export function txt(g, x, y, str, {size = 30, color = C.ink, role = 'text', anchor = 'start', leading = 1.25, ...rest} = {}) {
  const f = face({role, ...rest}), node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).style('word-spacing', `${f.word || 0}em`);
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}
/**
 * A line of text split into separately animated units: by 'letter', 'word' or 'all'.
 * Returns [{g, text, cx, y, w, cap, size, i, n, str, mid}] (mid = x of the middle of the whole line);
 * move a unit with pose(), or use the motions below. `outline` draws the letters as thin outlines.
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = C.ink, outline = 0, ...rest} = {}) {
  const o = {role: 'head', ...(outline ? {spacing: .01} : {}), ...rest}, f = face(o), pad = f.spacing * size, total = measure(str, size, o) - pad, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - pad, cx = x0 + measure(str.slice(0, at), size, o) + w / 2, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    const text = inner.append('text').attr('text-anchor', 'middle').attr('fill', outline ? 'none' : color).attr('stroke', outline ? color : null).attr('stroke-width', outline || null).style('font', css(size, f)).style('letter-spacing', by === 'letter' ? null : `${f.spacing}em`).style('word-spacing', `${f.word || 0}em`).text(c);
    if (by !== 'letter') text.attr('dx', pad / 2);
    return {g: inner, text, cx, y, w, cap, size, i, n: all.length, str: c, mid: x0 + total / 2};
  });
}
/** Move, scale (about the middle of the cap height), rotate and fade one unit from glyphs(). */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, rot = 0, o = 1} = {}) {
  u.g.attr('transform', `translate(${x} ${y - u.cap / 2}) rotate(${rot}) scale(${sx} ${sy}) translate(0 ${u.cap / 2})`).attr('opacity', o);
}
/** Signature motion 1: tracking that starts wide and settles tight while the letters fade up. q 0..1, x = leave 0..1. */
export function settle(units, q, x = 0, spread = .55) {
  const e = glide(q), o = easeInOut(span(q, 0, .45)) * (1 - x);
  units.forEach(u => pose(u, {x: (u.cx - u.mid) * (spread * (1 - e) + x * .25), o}));
}
/** Signature motion 2: one unit rises softly into place (t seconds since its own start). */
export function rise(u, t, {x = 0, dist = .6, length = .7} = {}) {
  const q = span(t, 0, length); pose(u, {y: (1 - glide(q)) * u.cap * dist - x * u.cap * .4, o: easeInOut(span(q, 0, .5)) * (1 - x)});
}
/** Signature motion 3: words that arrive one after another, pale first and then at full strength. */
export function wordsIn(units, t, {start = 0, step = .22, x = 0, length = .5} = {}) {
  units.forEach(u => { const q = span(t, start + u.i * step, length); pose(u, {y: (1 - glide(q)) * u.cap * .18, o: (.0 + easeInOut(q)) * (1 - x)}); });
}

// ---------------------------------------------------------------- shapes
/** An arch: a box with a half-round top. */
export const arch = (x, y, w, h) => `M${x} ${y + h}V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2}V${y + h}Z`;
/** A pill / rounded box path. */
export const pill = (x, y, w, h, r = h / 2) => { r = Math.min(r, w / 2, h / 2); return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`; };
/** A soft organic blob of radius r around (0, 0). `wobble` (radians) lets it breathe over time. */
export function blob(r, seed = 0, wobble = 0, n = 7) {
  const pts = Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, rr = r * (.78 + .34 * hash(i, seed) + .05 * Math.sin(wobble + i * 1.7)); return [Math.cos(a) * rr, Math.sin(a) * rr]; });
  return window.d3.line().curve(window.d3.curveBasisClosed)(pts);
}
/** A hand-drawn wavy underline from (x, y) going right. */
export function squiggle(x, y, w, amp = 10, waves = 4, seed = 0) {
  let d = `M${x} ${y}`; const step = w / (waves * 2);
  for (let i = 0; i < waves * 2; i++) { const s = i % 2 ? 1 : -1, a = amp * (.75 + .5 * hash(i, seed)); d += `Q${x + step * (i + .5)} ${y + s * a} ${x + step * (i + 1)} ${y + (hash(i, seed + 5) - .5) * amp * .3}`; }
  return d;
}
/** The theme's brush mark: a row of loose overlapping loops, about w wide and h tall, centred on (0, 0). Stroke it thick and round. */
export function loops(w, h, n = 3) {
  let d = `M${-w / 2} ${h * .25}`; const step = w / (n + .6);
  for (let i = 0; i < n; i++) { const x = -w / 2 + step * (i + .3); d += `C${x + step * .9} ${h * .3} ${x + step * 1.1} ${-h * .55} ${x + step * .55} ${-h * .5}C${x + step * .05} ${-h * .45} ${x + step * .2} ${h * .45} ${x + step} ${h * .25}`; }
  return d + `q${step * .25} ${-h * .03} ${step * .3} ${-h * .2}`;
}
/** A brushed zig of strokes that fills a w x h box centred on (0, 0): draw it thick to wipe a picture on. */
export function sweep(w, h, rows = 5) {
  let d = ''; for (let i = 0; i < rows; i++) { const y = -h / 2 + h * (i + .5) / rows, l = i % 2 ? w / 2 : -w / 2; d += `${i ? 'L' : 'M'}${l} ${y - h / rows * .3}L${-l} ${y + h / rows * .3}`; }
  return d;
}
/** A five-point star of radius r around (0, 0), softly rounded by its stroke. */
export const starPath = (r, inner = .46) => 'M' + Array.from({length: 10}, (_, i) => { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * inner : r; return `${Math.cos(a) * rr} ${Math.sin(a) * rr}`; }).join('L') + 'Z';
/** A map pin whose tip is at (0, 0), r = head radius. */
export const pinPath = r => `M0 0C${-r * .5} ${-r * .9} ${-r} ${-r * 1.4} ${-r} ${-r * 2.1}A${r} ${r} 0 1 1 ${r} ${-r * 2.1}C${r} ${-r * 1.4} ${r * .5} ${-r * .9} 0 0ZM${-r * .36} ${-r * 2.1}a${r * .36} ${r * .36} 0 1 0 ${r * .72} 0a${r * .36} ${r * .36} 0 1 0 ${-r * .72} 0Z`;
/** A leaf of length r growing from (0, 0) to the right; rotate it. */
export const leafPath = r => `M0 0C${r * .3} ${-r * .42} ${r * .8} ${-r * .34} ${r} 0C${r * .8} ${r * .34} ${r * .3} ${r * .42} 0 0Z`;
/** A tick mark inside an s x s box whose top-left is (x, y). */
export const tickPath = (x, y, s) => `M${x + s * .2} ${y + s * .54}L${x + s * .42} ${y + s * .76}L${x + s * .82} ${y + s * .26}`;
/** A hand-drawn arrow from (x0, y0) curving to (x1, y1), with a head. */
export function arrowPath(x0, y0, x1, y1, bend = .25) {
  const mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend, a = Math.atan2(y1 - my, x1 - mx), l = Math.min(26, Math.hypot(x1 - x0, y1 - y0) * .22);
  return `M${x0} ${y0}Q${mx} ${my} ${x1} ${y1}M${x1 - Math.cos(a - .5) * l} ${y1 - Math.sin(a - .5) * l}L${x1} ${y1}L${x1 - Math.cos(a + .5) * l} ${y1 - Math.sin(a + .5) * l}`;
}
/** A stroked line in the theme's hand: round caps and joins. */
export const stroke = (g, d, color = C.ink, width = 5) => g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
/** A sheet of paper: flat, square-cornered (small radius), optionally lifted off the picture with st.lift. */
export function sheet(g, x, y, w, h, {fill = C.paper, radius = 6, lift = null, opacity = 1} = {}) {
  return g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', radius).attr('fill', fill).attr('fill-opacity', opacity).attr('filter', lift);
}
/** A strip of translucent paper tape centred on (x, y). */
export const tape = (g, x, y, w = 150, h = 44, rot = -4, color = C.sun) => g.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', color).attr('fill-opacity', .72).attr('transform', `translate(${x} ${y}) rotate(${rot})`);
/**
 * A tag: a pill (or `shape: 'box'`) holding a short caps label, with an optional leading dot.
 * (x, y) is its left-middle (anchor 'start'), middle or right-middle. Returns {g, w, h} — g is
 * centred on the tag's own middle so it can be scaled or slid.
 */
export function tag(g, x, y, label, {fill = C.ink, color = inkOn(fill), size = 26, role = 'label', anchor = 'start', shape = 'pill', dot = null, outline = null, caps = true} = {}) {
  const str = caps ? up(label) : String(label), o = {role}, tw = measure(str, size, o) - type[role].spacing * size, h = size * 2.1, padX = size * .95, w = tw + padX * 2 + (dot ? size * .9 : 0);
  const cx = anchor === 'start' ? x + w / 2 : anchor === 'end' ? x - w / 2 : x, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
  inner.append('path').attr('d', pill(-w / 2, -h / 2, w, h, shape === 'box' ? 5 : h / 2)).attr('fill', fill).attr('stroke', outline).attr('stroke-width', outline ? 3 : null);
  if (dot) inner.append('circle').attr('cx', -w / 2 + padX + size * .1).attr('r', size * .26).attr('fill', dot);
  txt(inner, -w / 2 + padX + (dot ? size * .9 : 0), capH(size, o) / 2, str, {size, color, role});
  return {g: inner, w, h};
}
/** Handwriting that writes itself on, left to right. Returns {node, w, set(q)}. `rot` tilts it about its start. */
export function hand(g, st, x, y, str, {size = 64, color = C.ink, anchor = 'start', rot = -3} = {}) {
  const o = {role: 'hand'}, lines = String(str).split('\n'), w = Math.max(...lines.map(l => measure(l, size, o))), x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const mask = clipLive(st), group = g.append('g').attr('transform', `rotate(${rot} ${x0} ${y})`), node = txt(group.append('g').attr('clip-path', mask.url), x, y, str, {size, color, role: 'hand', anchor, leading: 1.0});
  return {node: group, w, set(q) { mask.set(x0 - 20, y - size * 1.2, (w + 40) * clamp(q), size * (1.5 + lines.length)); group.attr('opacity', q <= 0 ? 0 : 1); }};
}

// ---------------------------------------------------------------- pictures
/** Stand-in scenes for picture frames when the storyboard supplies no image: sky, sun, far and near ground. */
export const scenes = {
  meadow: ['#F1F0D2', '#DCE8C9', '#F7E3A6', '#9DBB6C', '#6C9A4C'],
  coast: ['#CFE8E2', '#A9D3D6', '#F6F1DC', '#5FA7A6', '#E6D3A8'],
  dusk: ['#F6D9C0', '#EFC6B2', '#F7E7B7', '#D58A66', '#9A5A48'],
  alley: ['#C9DFE3', '#9CC3CF', '#F2F0DA', '#5E93A6', '#3F6F86'],
  grove: ['#E9EFD0', '#CFE0B8', '#F4E2A0', '#7FAE7A', '#3E8B6A'],
};
/** Draw a stand-in scene filling a w x h box centred on (0, 0). */
export function scene(g, st, w, h, name = 'meadow', seed = 0) {
  const [sky, low, sun, far, near] = scenes[name] ?? scenes.meadow, top = -h / 2, left = -w / 2;
  g.append('rect').attr('x', left).attr('y', top).attr('width', w).attr('height', h).attr('fill', gradient(st, [low, sky], 90));
  const sx = left + w * (.25 + .5 * hash(1, seed)), sy = top + h * (.26 + .12 * hash(2, seed)), r = Math.min(w, h) * .13;
  g.append('circle').attr('cx', sx).attr('cy', sy).attr('r', r * 3).attr('fill', glow(st, sun, .8)); g.append('circle').attr('cx', sx).attr('cy', sy).attr('r', r).attr('fill', sun);
  const hill = (base, amp, s, fill, o) => { let d = `M${left} ${h / 2}V${top + h * base}`; for (let i = 0; i <= 12; i++) d += `L${left + w * i / 12} ${top + h * (base + amp * (Math.sin(i * .7 + s * 5) * .6 + Math.sin(i * 1.9 + s * 9) * .25))}`; g.append('path').attr('d', d + `V${h / 2}Z`).attr('fill', fill).attr('opacity', o); };
  hill(.58, .05, hash(3, seed), far, .7); hill(.72, .06, hash(4, seed), near, .95);
  g.append('rect').attr('x', left).attr('y', top).attr('width', w).attr('height', h).attr('fill', gradient(st, [['#F5F8E9', .0], ['#F5F8E9', .25]], 90));
}
/**
 * A square-cornered picture: `image` (a URL) if the storyboard supplies one, otherwise a stand-in
 * scene. It opens with a wipe while the picture inside slowly pushes in.
 * set(q, t, x): q 0..1 = how open (ease it yourself, usually glide), t = seconds for the push-in, x = leave 0..1.
 * `from`: 'up' | 'down' | 'left' | 'right' | 'fade' — the side the wipe grows towards. `shape`: 'box' | 'arch' | 'circle'.
 */
export function photo(g, st, x, y, w, h, {image, scene: name = 'meadow', seed = 0, from = 'up', shape = 'box', radius = 0} = {}) {
  const outer = g.append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`), wipe = clipLive(st), win = outer.append('g').attr('clip-path', wipe.url);
  const shaped = shape === 'box' ? win.append('g').attr('clip-path', clipBox(st, -w / 2, -h / 2, w, h, radius)) : win.append('g').attr('clip-path', clipPath(st, shape === 'arch' ? arch(-w / 2, -h / 2, w, h) : `M${-w / 2} 0a${w / 2} ${h / 2} 0 1 0 ${w} 0a${w / 2} ${h / 2} 0 1 0 ${-w} 0Z`).url);
  const pic = shaped.append('g');
  scene(pic, st, w * 1.12, h * 1.12, name, seed);
  if (image) pic.append('image').attr('href', image).attr('x', -w * .56).attr('y', -h * .56).attr('width', w * 1.12).attr('height', h * 1.12).attr('preserveAspectRatio', 'xMidYMid slice');
  return {g: outer, pic, x, y, w, h, set(q, t = 0, leaving = 0) {
    q = clamp(q) * (1 - leaving); const s = drift(t, .07) * (1.08 - .08 * q);
    pic.attr('transform', `scale(${s})`); outer.attr('opacity', from === 'fade' ? q : q <= 0 ? 0 : 1);
    if (from === 'up') wipe.set(-w / 2, h / 2 - h * q, w, h * q); else if (from === 'down') wipe.set(-w / 2, -h / 2, w, h * q);
    else if (from === 'left') wipe.set(w / 2 - w * q, -h / 2, w * q, h); else if (from === 'right') wipe.set(-w / 2, -h / 2, w * q, h); else wipe.set(-w / 2, -h / 2, w, h);
  }};
}
/**
 * Giant outlined letters as wallpaper: the word repeated across the frame in thin outline,
 * sliding slowly sideways. set(t) moves it. y is the baseline, size the font size.
 */
export function wallpaper(g, st, word, y, size, {color = C.line, width = 2.5, speed = 26, opacity = 1} = {}) {
  const str = up(word) + ' ', o = {role: 'head', spacing: .01}, w = Math.max(40, measure(str, size, o)), n = Math.ceil(st.W / w) + 2, group = g.append('g').attr('opacity', opacity);
  for (let i = -1; i < n; i++) group.append('text').attr('x', i * w).attr('y', y).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).style('font', css(size, face(o))).style('letter-spacing', '.01em').style('word-spacing', `${type.head.word}em`).text(str);
  return {g: group, width: w, set(t) { group.attr('transform', `translate(${-(((t * speed) % w) + w) % w} 0)`); }};
}
/** A band of repeated text for marquees. set(offset) scrolls it (px, either sign). y is the baseline. */
export function strip(g, st, str, y, size, {color = C.ink, sep = '•', sepColor = color, outline = 0, ...rest} = {}) {
  const o = {role: 'head', ...(outline ? {spacing: .01} : {}), ...rest}, f = face(o), unit = String(str), gap = size * .9, w = measure(unit, size, o) + gap, n = Math.ceil(st.W / w) + 3, group = g.append('g');
  for (let i = -1; i < n; i++) {
    group.append('text').attr('x', i * w + gap / 2).attr('y', y).attr('fill', outline ? 'none' : color).attr('stroke', outline ? color : null).attr('stroke-width', outline || null).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).style('word-spacing', `${f.word || 0}em`).text(unit);
    group.append('circle').attr('cx', i * w).attr('cy', y - capH(size, o) / 2).attr('r', size * .09).attr('fill', sepColor);
  }
  return {g: group, width: w, set(offset) { group.attr('transform', `translate(${-(((offset % w) + w) % w)} 0)`); }};
}
/** Shared diagram card (1000x1000): paper, a small caps kicker, a heavy title and a hairline. Content area is roughly y 230..930, x 80..920. */
export function card(el, props = {}) {
  const st = stage(el, {mode: 'card', clear: props.clear, accent: props.accent}), {root} = st;
  if (props.clear) sheet(st.under, 30, 30, 940, 940, {radius: 10, lift: st.lift, opacity: .95});
  const title = String(props.title ?? ''), size = fit(title, 840, 62);
  st.kicker = txt(root, 80, 104, up(props.unit ?? ''), {size: 21, role: 'label', color: C.dim});
  st.title = txt(root, 80, 104 + 26 + capH(size) , title, {size, role: 'head'});
  st.rule = stroke(root, 'M80 206H920', C.line, 2.5);
  /** Call from seek: the header fades up and the rule draws. */
  st.header = t => { st.kicker.attr('opacity', fade(t, 0, .5)); st.title.attr('opacity', fade(t, .1, .5)).attr('transform', `translate(0 ${(1 - glide(span(t, .1, .7))) * 16})`); draw(st.rule, glide(span(t, .15, .9))); };
  return st;
}
/**
 * Small caps labels in the corners of a title card (up to four: top-left, top-right, bottom-left,
 * bottom-right; '\n' is allowed). The first sits in an outlined pill. Returns {set(t, start)}.
 */
export function cornerLabels(st, labels = [], {m = 70, size = 21, color = C.ink, top = 104} = {}) {
  const {root, W, H} = st, flat = s => up(s).replace(/\n/g, ' '), nodes = [];
  labels.slice(0, 4).forEach((label, i) => {
    if (!label) return; const right = i % 2 === 1, low = i > 1, y = low ? H - top + 30 : top;
    nodes.push(i === 0 ? tag(root, m, y - size * .35, flat(label), {fill: 'none', outline: color, color, size}).g : txt(root, right ? W - m : m, y, flat(label), {size, role: 'label', color, anchor: right ? 'end' : 'start'}));
  });
  return {nodes, set(t, start = .5) { nodes.forEach((n, i) => n.attr('opacity', fade(t, start + i * .12, .6))); }};
}
