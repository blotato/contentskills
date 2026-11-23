// Grunge theme drawing kit. Every piece in this theme draws with these colours, fonts, textures and
// helpers, which is what keeps overlays, text, diagrams and captions looking like one world.
//
// THE STYLE (studied from the user's reference; nothing of it is reproduced)
//   Palette   Soot black and charcoal; footage is drained to grey. Type is bone/off-white. ONE hot
//             red-orange does all the shouting, a highlighter lime is used in single strokes only.
//             Tinted washes (teal, plum, brick) appear for a frame or two at cuts, never as fills.
//   Texture   Everything looks printed badly and handled a lot: white hairline cracks like old
//             plaster, dust specks and scratches, creased paper, toner dropout eating the ink,
//             torn paper with a white fibre edge, masking tape, halftone dots, rubber stamps.
//   Type      Heavy grotesque capitals (Montserrat Black), an extra-wide black for one huge word
//             (Unbounded), tall condensed caps (Anton), battered typewriter for small labels
//             (Special Elite), fat marker for handwriting (Permanent Marker). Big word + tiny label;
//             red word stacked on a bone word; a red box holding one small word.
//   Layout    Collage: paper scraps and strips at slight angles, taped down, overlapping; marks
//             scrawled on top (underline zigzag, circle, cross, arrow, burst). Never tidy grids.
//   Motion    Stop-motion. Things do not glide: they are typed on letter by letter with a block
//             cursor, slammed down like a stamp, ripped across, or pop on and then BOIL: the
//             same drawing redrawn 8 times a second with a slightly different wobble. Moves are
//             held on twos (12 fps). Cuts are a few frames of rips, tints and doodles, then a hard cut.
//
// HOW THAT IS BUILT HERE
//   stage()    an SVG whose layers are drawn through the `print` filter: turbulence displacement
//              (wobbly cut/drawn edges) + patchy speckle dropout (worn ink). stage.tick(t) re-seeds
//              it from t at 8 fps, cycling 3 seeds: the boil. Nothing is random at run time.
//   hold(t)    time held on twos; feed it to span()/ease for stepped moves.
//   shapes     torn(), rip(), tapeStrip(), brush(), splat(), scribble.*, stamp(), halftone(),
//              cracks(), dust(): all seeded, all pure functions of their arguments.
//   text       measure/fit/wrap/flow/txt/glyphs/pose with type roles head, wide, cond, type, hand, small.
import {clamp, span, mix, easeOut, easeInOut, easeBack} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut, easeBack};

export const C = {
  soot: '#0b0a09', char: '#1b1a18', ash: '#3a3835', dust: '#8e887d', paper: '#d6cdb9', bone: '#ece6d8', white: '#fbf8f0',
  red: '#f2440f', lime: '#b9f227', tape: '#d8c592', teal: '#3fb7a2', plum: '#4a3d8c', brick: '#a8452d',
};
export const series = [C.red, C.bone, C.dust, C.lime, C.tape, C.ash];
export const F = {head: 'Montserrat', wide: 'Unbounded', cond: 'Anton', type: '"Special Elite"', hand: '"Permanent Marker"', small: 'Montserrat'};
export const FRAME = {width: 1080, height: 1920};
/** Type roles. spacing is in em. */
export const TYPE = {
  head: {font: F.head, weight: 900, spacing: -.02},
  wide: {font: F.wide, weight: 900, spacing: -.02},
  cond: {font: F.cond, weight: 400, spacing: .01},
  type: {font: F.type, weight: 400, spacing: .04},
  hand: {font: F.hand, weight: 400, spacing: .01},
  small: {font: F.small, weight: 600, spacing: .06},
};
/** The accents a piece can be led by. */
export const ACCENTS = {red: C.red, lime: C.lime, bone: C.bone};
export const tone = c => ACCENTS[c] ?? C[c] ?? c ?? C.red;
/** Readable ink on a fill of this colour. */
export const inkOn = c => [C.soot, C.char, C.ash, C.plum, C.brick].includes(tone(c)) ? C.bone : C.soot;
/** The inks of a piece led by one accent. */
export function look(name) {
  const names = Object.keys(ACCENTS), i = Math.max(0, names.indexOf(name)), accent = tone(names[i]);
  return {accent, alt: i === 0 ? C.bone : C.red, mark: i === 1 ? C.bone : C.lime, on: inkOn(accent), text: C.bone, dim: C.dust, bg: C.soot, paper: C.bone, ink: C.soot};
}
export const up = s => String(s ?? '').toUpperCase();

// ---------------------------------------------------------------- numbers
/** Seeded pseudo-random 0..1. Pieces may not use Math.random. */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A stream of seeded numbers: const r = rng(7); r() -> 0..1, r(a, b) -> a..b. */
export function rng(seed = 1) {
  let a = (Math.floor(seed * 2654435761) ^ 0x9e3779b9) >>> 0;
  return (lo, hi) => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; const v = ((t ^ t >>> 14) >>> 0) / 4294967296; return lo == null ? v : lo + (hi - lo) * v; };
}
/** Smoothly wandering 0..1. */
export const noise = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
export const spring = x => { x = clamp(x); return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
export const easeIn = x => { x = clamp(x); return x * x * x; };
export const comma = n => Math.round(n).toLocaleString('en-US');

// ---------------------------------------------------------------- stop-motion time
/** The boil step: an integer that changes `fps` times a second. Re-seed drawings with it. */
export const boil = (t, fps = 8) => Math.floor(Math.max(0, t) * fps + 1e-6);
/** Time held on twos: moves made from hold(t) step instead of gliding. */
export const hold = (t, fps = 12) => Math.floor(t * fps + 1e-6) / fps;
/** A small stop-motion wobble for step `s`: {x, y, r} in px and degrees. Give each object its own seed. */
export const jit = (s, seed = 0, amp = 3, rot = .6) => ({x: (hash(s, seed) - .5) * 2 * amp, y: (hash(s, seed + 9.1) - .5) * 2 * amp, r: (hash(s, seed + 4.7) - .5) * 2 * rot});
/** transform string for a jittering object placed at (x, y) with a base rotation and scale. */
export const jtf = (x, y, s, seed = 0, {amp = 2.5, rot = .5, tilt = 0, scale = 1} = {}) => { const j = jit(s, seed, amp, rot); return `translate(${x + j.x} ${y + j.y}) rotate(${tilt + j.r}) scale(${scale})`; };
/** Pops on at `at` (stepped, with overshoot): returns a scale 0..~1.1..1. */
export const pop = (t, at = 0, len = .3) => { const q = span(hold(t), at, len); return q <= 0 ? 0 : easeBack(q); };
/** A stamp slam at `at`: comes down from oversized in 3 frames, hits, shakes. {s, o, hit} */
export function slam(t, at = 0, {from = 2.6, len = .14} = {}) {
  const q = span(hold(t, 24), at, len), after = t - at - len;
  return {s: q <= 0 ? from : mix(from, 1, easeIn(q)) * (after > 0 && after < .09 ? .96 : 1), o: q <= 0 ? 0 : Math.min(1, q * 2.5), hit: after < 0 ? 0 : Math.max(0, 1 - after / .3)};
}
/** 0 while an overlay is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .25) => life ? span(hold(t), life - len, len) : 0;
/** Overall opacity of an overlay: flickers on like a bad splice and cuts off at the end of its life. */
export const presence = (t, life) => { const s = Math.floor(t * 24); return (t < .04 ? 0 : t < .17 ? (s % 2 ? .35 : 1) : 1) * (life && t > life - .04 ? 0 : 1); };
/** Text that types itself; `cursor` is appended while typing and blinks after. */
export const typed = (value, q, t = 0, cursor = '▌') => { q = clamp(q); const n = Math.round(value.length * q); return value.slice(0, n) + (q < 1 ? cursor : Math.floor(t * 3) % 2 ? cursor : ''); };

// ---------------------------------------------------------------- stage
let stages = 0;
/**
 * An SVG stage.
 *   overlay: true -> transparent 1080x1920, to sit on footage
 *   tall: true    -> full-frame card, 1080 wide and as tall as the element (1080 square .. 1920)
 *   otherwise     -> 1000x1000 card. clear: true keeps the element transparent (no field).
 *   field         -> 'soot' (default), 'paper' or 'red': the wall a card is pasted on.
 * Returns {svg, defs, under, root, fine, W, H, k, sq, id, layer(kind), tick(t)}.
 *   root  draws through the rough print filter (wobbly edges, worn ink);
 *   fine  draws through a lighter one, for small type; it sits above root.
 *   layer('rough' | 'fine' | 'none') adds another layer on top.
 *   tick(t) MUST be called from seek(t): it boils the filters and the field's dust.
 */
export function stage(el, {overlay = false, tall = false, clear = false, field = 'soot', seed = 1, grime = true} = {}) {
  const d3 = window.d3, id = `gr${++stages}`, cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const W = overlay || tall ? 1080 : 1000, H = overlay ? 1920 : tall ? Math.round(clamp(W * ch / cw, 1080, 1920)) : 1000;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), under = svg.append('g'), st = {svg, defs, under, id, W, H, k: H / 1920, sq: H < 1500, n: 0, seed, overlay};
  const turbs = [];
  const print = (name, warp, wear, thr) => {
    const f = defs.append('filter').attr('id', `${id}-${name}`).attr('filterUnits', 'userSpaceOnUse').attr('primitiveUnits', 'userSpaceOnUse').attr('x', -40).attr('y', -40).attr('width', W + 80).attr('height', H + 80).attr('color-interpolation-filters', 'sRGB');
    turbs.push([f.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', name === 'fine' ? '.05' : '.022 .03').attr('numOctaves', 2).attr('result', 'w'), 0]);
    f.append('feDisplacementMap').attr('in', 'SourceGraphic').attr('in2', 'w').attr('scale', warp).attr('xChannelSelector', 'R').attr('yChannelSelector', 'G').attr('result', 'd');
    turbs.push([f.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '.75').attr('numOctaves', 2).attr('result', 's'), 40]);
    f.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '.011 .017').attr('numOctaves', 2).attr('seed', seed + 3).attr('result', 'c');
    f.append('feComposite').attr('in', 's').attr('in2', 'c').attr('operator', 'arithmetic').attr('k1', 0).attr('k2', .62).attr('k3', .58).attr('k4', -.1).attr('result', 'n');
    // alpha = 1 almost everywhere, dropping to 0 where fine noise and a slow patchy noise are both high: worn patches.
    f.append('feColorMatrix').attr('in', 'n').attr('type', 'matrix').attr('values', `0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 ${-wear} 0 0 0 ${wear * thr}`).attr('result', 'm');
    f.append('feComposite').attr('in', 'd').attr('in2', 'm').attr('operator', 'in');
  };
  print('rough', 9, 22, .632); print('fine', 3, 26, .66);
  const soft = defs.append('filter').attr('id', `${id}-soft`).attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%'); soft.append('feGaussianBlur').attr('stdDeviation', 14);
  el.style.background = overlay || clear ? 'transparent' : field === 'paper' ? C.bone : field === 'red' ? C.red : C.soot;
  let wall = null;
  if (!overlay && !clear) wall = drawField(under, st, field, grime);
  st.layer = kind => { const g = svg.append('g'); if (kind !== 'none') g.attr('filter', `url(#${id}-${kind})`); return g; };
  st.root = st.layer('rough'); st.fine = st.layer('fine');
  let last = -1;
  st.tick = t => { const s = boil(t); if (s === last) return s; last = s; for (const [node, off] of turbs) node.attr('seed', seed * 7 + off + s % 3); wall?.(s); return s; };
  st.tick(0);
  return st;
}
export const uid = st => `${st.id}-${++st.n}`;
/** A clip rectangle whose box is animated: {url, set(x, y, w, h)}. */
export function clipLive(st) { const id = uid(st), rect = st.defs.append('clipPath').attr('id', id).append('rect'); return {url: `url(#${id})`, rect, set(x, y, w, h) { rect.attr('x', x).attr('y', y).attr('width', Math.max(0, w)).attr('height', Math.max(0, h)); return this; }}; }
/** A clip from any path: {url, path}. */
export function clipPath(st, d) { const id = uid(st), path = st.defs.append('clipPath').attr('id', id).append('path').attr('d', d); return {url: `url(#${id})`, path}; }

/** The wall behind a card: flat colour, paper grain, plaster cracks, creases, a vignette, and dust that boils. Returns step => void. */
function drawField(g, st, field, grime) {
  const {W, H, id, defs, seed} = st, dark = field !== 'paper', base = field === 'paper' ? C.bone : field === 'red' ? C.red : C.soot, ink = dark && field !== 'red' ? C.bone : C.soot;
  g.append('rect').attr('width', W).attr('height', H).attr('fill', base);
  const gf = defs.append('filter').attr('id', id + '-grain').attr('filterUnits', 'userSpaceOnUse').attr('primitiveUnits', 'userSpaceOnUse').attr('x', 0).attr('y', 0).attr('width', W).attr('height', H);
  gf.append('feTurbulence').attr('type', 'fractalNoise').attr('baseFrequency', '.008 .012').attr('numOctaves', 4).attr('seed', seed + 11);
  // Clouds of slightly lighter/darker tone, like uneven toner or damp plaster.
  gf.append('feColorMatrix').attr('type', 'matrix').attr('values', dark ? '0 0 0 0 .93 0 0 0 0 .9 0 0 0 0 .84 0 0 0 1.5 -.62' : '0 0 0 0 .2 0 0 0 0 .17 0 0 0 0 .12 0 0 0 1.6 -.62').attr('result', 'g');
  // Keyed to the rectangle itself, so a hidden card (visibility: hidden in the player) paints nothing.
  gf.append('feComposite').attr('in', 'g').attr('in2', 'SourceGraphic').attr('operator', 'in');
  g.append('rect').attr('width', W).attr('height', H).attr('filter', `url(#${id}-grain)`).attr('opacity', field === 'red' ? .35 : dark ? .22 : .3);
  if (grime) {
    cracks(g, W, H, {seed: seed + 5, n: Math.round(7 * H / 1080), color: ink, opacity: dark ? .34 : .4});
    creases(g, W, H, {seed: seed + 2, color: ink});
  }
  const vg = defs.append('radialGradient').attr('id', id + '-vig').attr('cx', .5).attr('cy', .5).attr('r', .75);
  vg.append('stop').attr('offset', .45).attr('stop-color', '#000').attr('stop-opacity', 0); vg.append('stop').attr('offset', 1).attr('stop-color', '#000').attr('stop-opacity', dark ? .75 : .3);
  g.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-vig)`);
  const specks = dust(g.append('g'), W, H, {color: ink, n: grime ? 46 : 20, seed: seed + 20});
  return s => specks.set(s);
}

// ---------------------------------------------------------------- textures drawn as shapes
/** Plaster cracks: thin branching hairlines wandering in from the edges. */
export function cracks(g, W, H, {seed = 1, n = 7, color = C.bone, opacity = .22, x = 0, y = 0} = {}) {
  const r = rng(seed); let d = '';
  let k = 0;
  const walk = (px, py, base, len, depth) => {
    const id = ++k; d += `M${px.toFixed(1)} ${py.toFixed(1)}`;
    for (let i = 0; i < len; i++) {
      // A crack keeps its heading and meanders around it, with the odd sharp kink.
      const a = base + (noise(i * .55, seed + id) - .5) * 1.5 + (r() < .2 ? r(-.7, .7) : 0), s = r(16, 60); px += Math.cos(a) * s; py += Math.sin(a) * s; d += `L${px.toFixed(1)} ${py.toFixed(1)}`;
      if (depth < 2 && r() < .2) { walk(px, py, a + (r() < .5 ? 1 : -1) * r(.6, 1.2), Math.ceil(len * .35), depth + 1); d += `M${px.toFixed(1)} ${py.toFixed(1)}`; }
      if (px < -20 || px > W + 20 || py < -20 || py > H + 20) break;
    }
  };
  for (let i = 0; i < n; i++) { const side = Math.floor(r(0, 4)), px = side % 2 ? (side === 1 ? W : 0) : r(0, W), py = side % 2 ? r(0, H) : side ? H : 0; walk(px, py, Math.atan2(H * r(.2, .8) - py, W * r(.2, .8) - px), Math.round(r(6, 16)), 0); }
  return g.append('path').attr('transform', `translate(${x} ${y})`).attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('stroke-linejoin', 'round').attr('opacity', opacity);
}
/** Fold lines in paper: a couple of long faint straight creases with a light and a dark side. */
export function creases(g, W, H, {seed = 1, color = C.bone} = {}) {
  const r = rng(seed), out = g.append('g');
  for (let i = 0; i < 3; i++) { const v = r() < .5, p = r(.15, .85), a = r(-.06, .06), d = v ? `M${W * p} -10L${W * p + H * a} ${H + 10}` : `M-10 ${H * p}L${W + 10} ${H * p + W * a}`;
    out.append('path').attr('d', d).attr('stroke', color).attr('stroke-width', 2).attr('opacity', .07); out.append('path').attr('d', d).attr('stroke', '#000').attr('stroke-width', 5).attr('opacity', .16).attr('transform', 'translate(3 3)'); }
  return out;
}
/** Dust, hairs and scratches that change every boil step. Returns {set(step)}. */
export function dust(g, W, H, {color = C.bone, n = 46, seed = 1, x = 0, y = 0, opacity = .5} = {}) {
  const frames = Array.from({length: 6}, (_, f) => {
    const r = rng(seed * 13 + f * 7 + 1); let dots = '', hairs = '';
    for (let i = 0; i < n; i++) { const px = r(0, W), py = r(0, H), s = r() < .85 ? r(.7, 2.2) : r(2.5, 5); dots += `M${px.toFixed(1)} ${py.toFixed(1)}l${(s * r(.5, 1.4)).toFixed(1)} ${(s * r(-.6, .6)).toFixed(1)}l${(-s * r(.2, 1)).toFixed(1)} ${(s * r(.5, 1.5)).toFixed(1)}z`; }
    for (let i = 0; i < Math.ceil(n / 12); i++) { const px = r(0, W), py = r(0, H), a = r(0, 6.3), l = r(14, 60), b = r(-.9, .9); hairs += `M${px.toFixed(1)} ${py.toFixed(1)}q${(Math.cos(a) * l / 2 - Math.sin(a) * l * b / 2).toFixed(1)} ${(Math.sin(a) * l / 2 + Math.cos(a) * l * b / 2).toFixed(1)} ${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`; }
    if (r() < .6) { const px = r(0, W); hairs += `M${px.toFixed(1)} ${r(0, H * .4).toFixed(1)}l${r(-6, 6).toFixed(1)} ${r(H * .2, H * .6).toFixed(1)}`; }      // a long scratch
    const fg = g.append('g').attr('transform', `translate(${x} ${y})`).attr('opacity', 0);
    fg.append('path').attr('d', dots).attr('fill', color).attr('opacity', opacity); fg.append('path').attr('d', hairs).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.3).attr('opacity', opacity * .7);
    return fg;
  });
  return {set(s) { frames.forEach((f, i) => f.attr('opacity', i === s % frames.length ? 1 : 0)); }};
}
/** A halftone dot screen as a fill: returns the value for a fill attribute. */
export function halftone(st, {color = C.bone, cell = 14, dot = .32, angle = 30} = {}) {
  const id = uid(st), p = st.defs.append('pattern').attr('id', id).attr('width', cell).attr('height', cell).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', `rotate(${angle})`);
  p.append('circle').attr('cx', cell / 2).attr('cy', cell / 2).attr('r', cell * dot).attr('fill', color); return `url(#${id})`;
}
/** Ruled hatching as a fill. */
export function hatch(st, {color = C.bone, gap = 12, width = 3, angle = -38} = {}) {
  const id = uid(st), p = st.defs.append('pattern').attr('id', id).attr('width', gap).attr('height', gap).attr('patternUnits', 'userSpaceOnUse').attr('patternTransform', `rotate(${angle})`);
  p.append('rect').attr('width', gap).attr('height', width).attr('fill', color); return `url(#${id})`;
}

// ---------------------------------------------------------------- paper
/** Points along a→b with a ragged, torn offset. amp in px; step is the grain of the tear. */
function tearPts(ax, ay, bx, by, seed, amp, step) {
  const len = Math.hypot(bx - ax, by - ay), n = Math.max(2, Math.round(len / step)), nx = -(by - ay) / len, ny = (bx - ax) / len, pts = [];
  for (let i = 0; i < n; i++) { const q = i / n, o = amp ? ((noise(q * len / 46, seed) - .5) * 1.5 + (hash(i, seed + 3) - .5) * .9) * amp : 0, along = amp ? (hash(i, seed + 8) - .5) * step * .6 : 0;
    pts.push([ax + (bx - ax) * q + nx * o + (bx - ax) / len * along, ay + (by - ay) * q + ny * o + (by - ay) / len * along]); }
  return pts;
}
const P = pts => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';
/**
 * A torn sheet: path for the rectangle (x, y, w, h) with ragged edges. `sides` names the torn
 * ones ('t', 'r', 'b', 'l' in any combination); the others are cut straight (slightly off-square).
 */
export function torn(x, y, w, h, {seed = 1, amp = 9, step = 13, sides = 'trbl', skew = 3} = {}) {
  const k = i => (hash(i, seed + 50) - .5) * 2 * skew, c = [[x + k(1), y + k(2)], [x + w + k(3), y + k(4)], [x + w + k(5), y + h + k(6)], [x + k(7), y + h + k(8)]], names = 'trbl';
  return P(c.flatMap((a, i) => { const b = c[(i + 1) % 4]; return tearPts(a[0], a[1], b[0], b[1], seed + i * 17, sides.includes(names[i]) ? amp : 0, step); }));
}
/**
 * A piece of paper whose box can be animated. Draws a soft shadow, the white torn fibre edge and
 * the sheet. set(x, y, w, h) reshapes it (the tear pattern stays put while the box grows).
 */
export function sheet(g, {fill = C.bone, seed = 1, sides = 'trbl', amp = 9, rim = C.white, shadow = .45, step = 13} = {}) {
  const group = g.append('g'), sh = shadow ? group.append('path').attr('fill', '#000').attr('opacity', shadow).attr('transform', 'translate(7 9)') : null;
  const edge = rim ? group.append('path').attr('fill', rim) : null, face = group.append('path').attr('fill', fill);
  return {g: group, face, set(x, y, w, h) {
    if (w < 2 || h < 2) { face.attr('d', ''); edge?.attr('d', ''); sh?.attr('d', ''); return this; }
    const d = torn(x, y, w, h, {seed, amp, sides, step}); face.attr('d', d); sh?.attr('d', d);
    edge?.attr('d', torn(x - 4, y - 4, w + 8, h + 8, {seed: seed + 31, amp: amp * 1.25, sides, step: step * .8}));
    return this;
  }};
}
/** A rip across the frame from a to b: a thin ragged band of exposed white paper, thickness varying along it. */
export function rip(ax, ay, bx, by, {seed = 1, thick = 12, amp = 16, step = 12} = {}) {
  const top = tearPts(ax, ay, bx, by, seed, amp, step), len = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / len, ny = (bx - ax) / len;
  const bottom = top.map((p, i) => { const q = i / top.length, w = thick * (.25 + 1.3 * noise(q * 9, seed + 77) * Math.sin(Math.PI * Math.min(1, q * 1.04 + .02)) ** .5) + hash(i, seed + 5) * thick * .35; return [p[0] + nx * w, p[1] + ny * w]; }).reverse();
  return P([...top, ...bottom]);
}
/** Masking tape: a translucent strip with pinked (zigzag) short ends, centred on its own origin. Returns the group. */
export function tapeStrip(g, w = 190, h = 54, {color = C.tape, seed = 1, opacity = .86} = {}) {
  const teeth = 6, th = h / teeth, zig = (x, dir) => Array.from({length: teeth * 2 + 1}, (_, i) => [x + (i % 2 ? dir * 7 : 0) + (hash(i, seed) - .5) * 3, -h / 2 + i * th / 2]);
  const group = g.append('g'), pts = [...zig(-w / 2, -1).reverse(), ...zig(w / 2, 1)];
  group.append('path').attr('d', P(pts)).attr('fill', color).attr('opacity', opacity);
  group.append('path').attr('d', `M${-w / 2 + 8} ${-h * .22}H${w / 2 - 8}`).attr('stroke', C.white).attr('stroke-width', h * .12).attr('opacity', .22);
  group.append('path').attr('d', `M${-w / 2 + 8} ${h * .3}H${w / 2 - 8}`).attr('stroke', '#000').attr('stroke-width', h * .08).attr('opacity', .1);
  return group;
}
/** A brush or marker stroke filling (x, y, w, h): ragged ends, uneven edges, dry streaks. Path string (use fill-rule evenodd). */
export function brush(x, y, w, h, {seed = 1, dry = 3} = {}) {
  const n = Math.max(6, Math.round(w / 22)), top = [], bot = [];
  for (let i = 0; i <= n; i++) { const q = i / n, px = x + w * q; top.push([px + (hash(i, seed) - .5) * 8, y + (noise(q * 5, seed + 1) - .5) * h * .22 - (i === 0 || i === n ? -h * .2 * hash(i, seed + 2) : 0)]); bot.push([px + (hash(i, seed + 3) - .5) * 8, y + h + (noise(q * 5, seed + 4) - .5) * h * .22]); }
  const end = (px, dir, s) => Array.from({length: 7}, (_, i) => [px + dir * (i % 2 ? hash(i, s) * h * .5 : -hash(i, s + 1) * h * .12), y + h * (i + .5) / 7]);
  let d = P([...top, ...end(x + w, 1, seed + 5), ...bot.reverse(), ...end(x, -1, seed + 6).reverse()]);
  for (let i = 0; i < dry; i++) { const sy = y + h * (.2 + .6 * hash(i, seed + 20)), sx = x + w * (.25 + .5 * hash(i, seed + 21)), sw = w * (.15 + .3 * hash(i, seed + 22)), sh = Math.max(2, h * .05); d += `M${sx} ${sy}l${sw} ${-sh * .4}l${sw * .1} ${sh}l${-sw * 1.05} ${sh * .3}Z`; }
  return d;
}
/** An ink splat around (cx, cy): a lumpy blob with thrown droplets. */
export function splat(cx, cy, r, {seed = 1, drops = 14} = {}) {
  const n = 22, pts = Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, rr = r * (.62 + .5 * noise(i * .9, seed) + (hash(i, seed + 1) > .78 ? .5 * hash(i, seed + 2) : 0)); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]; });
  let d = 'M' + pts.map((p, i) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';
  for (let i = 0; i < drops; i++) { const a = hash(i, seed + 9) * 6.283, dist = r * (1.15 + 1.5 * hash(i, seed + 10) ** 2), dr = r * (.03 + .12 * hash(i, seed + 11)), px = cx + Math.cos(a) * dist, py = cy + Math.sin(a) * dist; d += `M${(px - dr).toFixed(1)} ${py.toFixed(1)}a${dr.toFixed(1)} ${(dr * (.7 + .6 * hash(i, seed + 12))).toFixed(1)} 0 1 0 ${(dr * 2).toFixed(1)} 0a${dr.toFixed(1)} ${dr.toFixed(1)} 0 1 0 ${(-dr * 2).toFixed(1)} 0Z`; }
  return d;
}

// ---------------------------------------------------------------- scribbles (marker marks)
const wob = (i, seed, amp) => (hash(i, seed) - .5) * 2 * amp;
/** Hand-drawn path strings. Every one takes a seed; draw three seeds and boil between them with scrawl(). */
export const scribble = {
  /** A fast underline that doubles back on itself. */
  underline(x0, x1, y, seed = 1, amp = 7) { const w = x1 - x0; return `M${x0 + wob(1, seed, amp)} ${y + wob(2, seed, amp)}Q${x0 + w * .5} ${y - amp * 1.6 + wob(3, seed, amp)} ${x1 + wob(4, seed, amp)} ${y + wob(5, seed, amp)}Q${x0 + w * .55} ${y + amp * 2.6 + wob(6, seed, amp)} ${x0 + w * .12 + wob(7, seed, amp)} ${y + amp * 2.4 + wob(8, seed, amp)}`; },
  /** A sawtooth scrawl, like testing a pen. */
  zigzag(x0, x1, y, seed = 1, h = 34, teeth = 5) { let d = `M${x0} ${y + wob(0, seed, 5)}`; for (let i = 1; i <= teeth * 2; i++) { const q = i / (teeth * 2); d += `L${x0 + (x1 - x0) * (q + (i % 2 ? .06 : -.03)) + wob(i, seed, 6)} ${y + (i % 2 ? -h : h * .35) * (.6 + .5 * hash(i, seed + 1)) + wob(i, seed + 2, 4)}`; } return d + `L${x1 + 40 + wob(9, seed, 8)} ${y - h * .5 + wob(10, seed, 6)}`; },
  /** A circle drawn one and a half times round, not closing. */
  circle(cx, cy, rx, ry = rx, seed = 1) { let d = ''; const n = 30, a0 = -2.2 + wob(0, seed, .3); for (let i = 0; i <= n * 1.45; i++) { const a = a0 + i / n * Math.PI * 2, grow = 1 + i / n * .07, px = cx + Math.cos(a) * rx * grow * (1 + wob(i, seed, .035)), py = cy + Math.sin(a) * ry * grow * (1 + wob(i, seed + 1, .035)); d += `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`; } return d; },
  /** An arrow from a to b with a bowed shaft and a two-stroke head. */
  arrow(ax, ay, bx, by, seed = 1, bow = .22) { const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy), mx = (ax + bx) / 2 - dy * bow + wob(1, seed, 8), my = (ay + by) / 2 + dx * bow + wob(2, seed, 8), a = Math.atan2(by - my, bx - mx), hl = Math.min(70, len * .3);
    return `M${ax + wob(3, seed, 5)} ${ay + wob(4, seed, 5)}Q${mx} ${my} ${bx} ${by}M${bx + Math.cos(a + 2.5 + wob(5, seed, .15)) * hl} ${by + Math.sin(a + 2.5) * hl}L${bx} ${by}L${bx + Math.cos(a - 2.5 + wob(6, seed, .15)) * hl} ${by + Math.sin(a - 2.5) * hl}`; },
  /** A cross: two slashes. */
  cross(cx, cy, r, seed = 1) { const p = i => wob(i, seed, r * .12); return `M${cx - r + p(1)} ${cy - r + p(2)}L${cx + r + p(3)} ${cy + r + p(4)}M${cx + r + p(5)} ${cy - r + p(6)}L${cx - r + p(7)} ${cy + r + p(8)}`; },
  /** A tick. */
  check(cx, cy, r, seed = 1) { const p = i => wob(i, seed, r * .1); return `M${cx - r + p(1)} ${cy + p(2)}L${cx - r * .3 + p(3)} ${cy + r * .7 + p(4)}L${cx + r * 1.1 + p(5)} ${cy - r * .9 + p(6)}`; },
  /** A spiky starburst outline. */
  burst(cx, cy, r, seed = 1, points = 9) { let d = ''; for (let i = 0; i <= points * 2; i++) { const a = i / (points * 2) * Math.PI * 2 + wob(i % (points * 2), seed, .09), rr = (i % 2 ? r * (.5 + wob(i % (points * 2), seed + 1, .1)) : r * (1 + wob(i % (points * 2), seed + 2, .22))); d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr * .8).toFixed(1)}`; } return d; },
  /** A box drawn in one go, corners overshooting. */
  box(x, y, w, h, seed = 1) { const p = i => wob(i, seed, 6); return `M${x - 14 + p(1)} ${y + p(2)}L${x + w + p(3)} ${y + p(4)}L${x + w + p(5)} ${y + h + p(6)}L${x + p(7)} ${y + h + p(8)}L${x + p(9)} ${y - 16 + p(10)}`; },
  /** Scribbled fill: back-and-forth strokes across a box. */
  fill(x, y, w, h, seed = 1, gap = 16) { let d = `M${x} ${y}`; const n = Math.max(2, Math.round(h / gap)); for (let i = 0; i <= n; i++) { const py = y + h * i / n; d += `L${(i % 2 ? x : x + w) + wob(i, seed, 8)} ${py + wob(i, seed + 1, 4)}`; } return d; },
  /** A wavy line. */
  wave(x0, x1, y, seed = 1, amp = 10, waves = 5) { let d = `M${x0} ${y}`; for (let i = 1; i <= waves * 2; i++) { const px = x0 + (x1 - x0) * i / (waves * 2); d += `Q${px - (x1 - x0) / (waves * 4)} ${y + (i % 2 ? -1 : 1) * amp * 2 + wob(i, seed, amp * .4)} ${px} ${y + wob(i, seed + 1, 3)}`; } return d; },
};
/**
 * A marker mark that draws itself on and then boils. `make(seed)` returns a path string; three
 * versions are kept and swapped by boil step. draw(q, step): q 0..1 is how much is drawn.
 */
export function scrawl(g, make, {color = C.bone, width = 9, seed = 1, fill = 'none', opacity = 1} = {}) {
  const group = g.append('g').attr('opacity', opacity), paths = [0, 1, 2].map(i => group.append('path').attr('d', make(seed + i * 5.3)).attr('fill', fill).attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round'));
  const lens = paths.map(p => p.node().getTotalLength());
  return {g: group, paths, draw(q, s = 0) { q = clamp(q); paths.forEach((p, i) => { const on = i === s % 3 && q > 0; p.attr('display', on ? null : 'none'); if (on) p.attr('stroke-dasharray', q >= 1 ? null : `${lens[i] * q} ${lens[i]}`); }); return this; }};
}

// ---------------------------------------------------------------- text
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const face = (o = {}) => ({...TYPE[o.role ?? 'head'], ...Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null && ['font', 'weight', 'spacing'].includes(k)))});
const css = (size, f) => `${f.weight} ${size}px ${f.font}`;
/** Width of a string in px. o = {role, font?, weight?, spacing?} */
export function measure(str, size, o) { const f = face(o); ctx.font = css(100, f); return (ctx.measureText(str).width + f.spacing * 100 * [...str].length) * size / 100; }
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
/** The largest size (max down to min) at which the sentence wraps inside a width x height box. */
export function flow(str, width, height, max, min = 30, o, leading = 1.3) {
  for (let size = max; ; size -= 4) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/** Plain text; '\n' starts a new line. `shade` outlines it in soot so it reads over footage. */
export function txt(g, x, y, str, {size = 28, color = C.bone, role = 'type', anchor = 'start', leading = 1.25, shade = false, ...rest} = {}) {
  const f = face({role, ...rest}), node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).style('white-space', 'pre');
  if (shade) node.attr('stroke', C.soot).attr('stroke-width', size * .22).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}
/**
 * A line of text split into separately animated units: by 'letter', 'word' or 'all'.
 * Returns [{g, text, cx, y, w, cap, size, i, n, str}]; move a unit with pose().
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = C.bone, ...rest} = {}) {
  const o = {role: 'head', ...rest}, f = face(o), pad = f.spacing * size, total = measure(str, size, o) - pad, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - pad, cx = x0 + measure(str.slice(0, at), size, o) + w / 2, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    const text = inner.append('text').attr('text-anchor', 'middle').attr('fill', color).style('font', css(size, f)).style('letter-spacing', by === 'letter' ? null : `${f.spacing}em`).text(c);
    return {g: inner, text, cx, y, w, cap, size, i, n: all.length, str: c, x0, total};
  });
}
/** Move, scale (about the middle of the cap height), rotate and fade one unit from glyphs(). */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, rot = 0, skew = 0, o = 1} = {}) {
  u.g.attr('transform', `translate(${x} ${y - u.cap / 2}) rotate(${rot}) skewX(${skew}) scale(${sx} ${sy}) translate(0 ${u.cap / 2})`).attr('opacity', o);
}
/**
 * The theme's standard way for a line to arrive: typed on letter by letter in held steps, each
 * letter landing a little big and crooked before it settles; all of them keep a tiny boil.
 * q 0..1 over the line; s is the boil step; x is the leave amount.
 */
export function typeOn(units, q, s = 0, {x = 0, seed = 0, wobble = 1} = {}) {
  const n = units.length;
  units.forEach((u, i) => {
    const local = clamp(q * (n + 1.5) - i), fresh = local > 0 && local < 1, j = jit(s, seed + i * 3.1, 1.6 * wobble, .7 * wobble);
    pose(u, {x: j.x + (fresh ? u.size * .03 : 0), y: j.y - (fresh ? u.size * .06 : 0) + x * u.cap * .4, sx: fresh ? 1.22 : 1, rot: j.r + (fresh ? (hash(i, seed) - .5) * 14 : 0), o: local <= 0 ? 0 : x > 0 ? (hash(i, seed + Math.floor(x * 6)) < x ? 0 : 1) : 1});
  });
}
/** The block cursor that follows a typed line. Returns {set(units, q, t)}. */
export function cursor(g, color = C.bone) {
  const r = g.append('rect').attr('fill', color);
  return {node: r, set(units, q, t) { const n = units.length, i = Math.min(n - 1, Math.floor(clamp(q) * (n + 1.5))), u = units[Math.max(0, i)], done = q >= 1; if (!u) return; r.attr('x', u.cx + u.w / 2 + u.size * (done ? .06 : .16)).attr('y', u.y - u.cap).attr('width', u.size * .09).attr('height', u.cap).attr('opacity', q <= 0 ? 0 : done ? (t != null && Math.floor(t * 3) % 2 === 0 && q < 1.6 ? 1 : 0) : 1); }};
}
/**
 * A label on its own scrap: text on a torn strip (or a flat box when torn = false), centred on
 * (0, 0) of the returned group. Use it for tags, name plates, the red box holding a small word.
 */
export function chip(g, str, {size = 40, role = 'head', fill = C.red, color = inkOn(fill), padX = .5, padY = .42, seedv = 1, torn: ragged = true, sides = 'rl', tape = false} = {}) {
  const group = g.append('g'), o = {role}, w = measure(str, size, o), cap = capH(size, o), bw = w + size * padX * 2, bh = cap + size * padY * 2;
  if (ragged) sheet(group, {fill, seed: seedv, sides, amp: Math.min(7, size * .16), rim: fill === C.bone || fill === C.paper ? C.white : null, shadow: .4}).set(-bw / 2, -bh / 2, bw, bh);
  else group.append('rect').attr('x', -bw / 2).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('fill', fill);
  txt(group, 0, cap / 2, str, {size, color, role, anchor: 'middle'});
  if (tape) tapeStrip(group, 84, 30, {seed: seedv}).attr('transform', `translate(${-bw / 2 - 2} ${-bh / 2 + 2}) rotate(-32)`);
  return Object.assign(group, {bw, bh});
}
/**
 * A rubber stamp centred on (0, 0): a double-ruled box, a big word and an optional small line.
 * Returns the group with .bw/.bh; scale it with slam().
 */
export function stamp(g, word, {size = 110, color = C.red, sub = '', role = 'cond', round = false} = {}) {
  const group = g.append('g'), o = {role}, w = measure(word, size, o), cap = capH(size, o), ss = size * .25, bw = Math.max(w, sub ? measure(sub, ss, {role: 'small', weight: 800}) : 0) + size * .7, bh = cap + size * .62 + (sub ? ss * 1.5 : 0);
  if (round) { const r = Math.max(bw, bh) * .56; group.append('circle').attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .09); group.append('circle').attr('r', r - size * .13).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .03); }
  else { group.append('rect').attr('x', -bw / 2).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .09); group.append('rect').attr('x', -bw / 2 + size * .12).attr('y', -bh / 2 + size * .12).attr('width', bw - size * .24).attr('height', bh - size * .24).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .03); }
  txt(group, 0, -bh / 2 + size * .31 + cap, word, {size, color, role, anchor: 'middle'});
  if (sub) txt(group, 0, bh / 2 - size * .25, sub, {size: ss, color, role: 'small', weight: 800, anchor: 'middle'});
  return Object.assign(group, {bw, bh});
}
/**
 * Ransom-note lettering: every letter cut from a different page (its own scrap, face, tilt).
 * Returns units [{g, cx, ...}] centred on x; pose each with ransomPose(u, scale, step).
 */
export function ransom(g, str, x, y, size, {seed = 1, anchor = 'middle', gap = .1} = {}) {
  const roles = ['head', 'cond', 'wide', 'type', 'head', 'cond'], looks = [[C.bone, C.soot], [C.soot, C.bone], [C.red, C.soot], [C.paper, C.soot], [C.bone, C.red], [C.char, C.bone]];
  const chars = [...str], specs = chars.map((c, i) => { const role = roles[Math.floor(hash(i, seed) * roles.length)], sz = size * (.82 + .3 * hash(i, seed + 1)) * (role === 'wide' ? .72 : role === 'cond' ? 1.12 : 1), w = c === ' ' ? size * .4 : measure(c, sz, {role}) + size * .3; return {c, role, sz, w}; });
  const total = specs.reduce((a, b) => a + b.w + size * gap, -size * gap); let px = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x;
  return specs.map((sp, i) => {
    const cx = px + sp.w / 2; px += sp.w + size * gap; if (sp.c === ' ') return null;
    const [fill, ink] = looks[Math.floor(hash(i, seed + 2) * looks.length)], cap = capH(sp.sz, {role: sp.role}), bh = cap + size * .34, outer = g.append('g').attr('transform', `translate(${cx} ${y - capH(size) / 2 + (hash(i, seed + 3) - .5) * size * .14})`), inner = outer.append('g');
    sheet(inner, {fill, seed: seed + i, amp: 4, sides: hash(i, seed + 4) > .5 ? 'tb' : 'rl', rim: null, shadow: .5}).set(-sp.w / 2, -bh / 2, sp.w, bh);
    txt(inner, 0, cap / 2, sp.c, {size: sp.sz, color: ink, role: sp.role, anchor: 'middle', spacing: 0});
    return {g: inner, cx, i, tilt: (hash(i, seed + 5) - .5) * 16, w: sp.w, h: bh};
  }).filter(Boolean);
}
export const ransomPose = (u, scale = 1, s = 0, o = 1) => { const j = jit(s, u.i * 2.3, 2, 1.2); u.g.attr('transform', `translate(${j.x} ${j.y}) rotate(${u.tilt + j.r}) scale(${scale})`).attr('opacity', scale <= 0 ? 0 : o); };

// ---------------------------------------------------------------- stand-in picture
/**
 * A photocopied picture to stand in where a storyboard supplies no image: a dark xerox block with a
 * halftone sky, a rough skyline and toner streaks. Centred on (0, 0). Pass `image` (a URL) to show a
 * real picture instead (it is drawn in greyscale with high contrast).
 */
export function xerox(g, st, w, h, {seed = 1, image = null, tint = C.bone} = {}) {
  const id = uid(st), group = g.append('g'), r = rng(seed + 3);
  st.defs.append('clipPath').attr('id', id).append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h);
  const pic = group.append('g').attr('clip-path', `url(#${id})`);
  pic.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', C.char);
  if (image) {
    const fid = uid(st), f = st.defs.append('filter').attr('id', fid); f.append('feColorMatrix').attr('type', 'saturate').attr('values', 0);
    const tr = f.append('feComponentTransfer'); for (const ch of ['R', 'G', 'B']) tr.append('feFunc' + ch).attr('type', 'linear').attr('slope', 1.5).attr('intercept', -.22);
    pic.append('image').attr('href', image).attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('preserveAspectRatio', 'xMidYMid slice').attr('filter', `url(#${fid})`);
  } else {
    pic.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h * .62).attr('fill', halftone(st, {color: tint, cell: Math.max(9, w / 34), dot: .3})).attr('opacity', .55);
    pic.append('circle').attr('cx', w * (r() - .5) * .5).attr('cy', -h * .16).attr('r', Math.min(w, h) * .17).attr('fill', tint).attr('opacity', .9);
    let d = `M${-w / 2} ${h / 2}`, px = -w / 2; while (px < w / 2) { const bw = w * r(.05, .13), top = h * r(-.12, .26); d += `V${top}H${px + bw}`; px += bw; } pic.append('path').attr('d', d + `V${h / 2}Z`).attr('fill', C.soot);
    for (let i = 0; i < 26; i++) pic.append('rect').attr('x', r(-w / 2, w / 2)).attr('y', r(.02, .42) * h).attr('width', w * .012).attr('height', w * .016).attr('fill', tint).attr('opacity', r(.3, .9));
  }
  for (let i = 0; i < 5; i++) pic.append('rect').attr('x', -w / 2).attr('y', r(-h / 2, h / 2)).attr('width', w).attr('height', r(1, 5)).attr('fill', i % 2 ? '#000' : tint).attr('opacity', r(.12, .35));     // toner streaks
  return group;
}

// ---------------------------------------------------------------- card furniture
/** Four typewriter labels in the corners of a card (TL, TR, BL, BR). Returns the nodes. */
export function cornerLabels(g, st, labels = [], {m = 70, size = 26, color = C.bone, accent = C.red} = {}) {
  const {W, H} = st;
  return [[m, m + 30, 'start'], [W - m, m + 30, 'end'], [m, H - m - 40, 'start'], [W - m, H - m - 40, 'end']].map(([x, y, a], i) => txt(g, x, y, up(labels?.[i] ?? ''), {size, anchor: a, color: i === 1 ? accent : color}));
}
/** Switch nodes on one after another in held steps from `at`. */
export const reveal = (nodes, t, at = .2, gap = .17) => nodes.forEach((n, i) => n.attr('opacity', hold(t) >= at + i * gap ? 1 : 0));
/** A marquee: the text repeated end to end with a separator. set(offset) scrolls it (px, either sign). y is the baseline. */
export function strip(g, st, str, y, size, {color = C.bone, role = 'head', sep = '×', sepColor = color} = {}) {
  const o = {role}, unit = up(str), gap = measure(sep, size, o) + size * .7, w = measure(unit, size, o) + gap, n = Math.ceil(st.W / w) + 3, group = g.append('g');
  for (let i = -1; i < n; i++) { txt(group, i * w + gap / 2, y, unit, {size, color, role}); txt(group, i * w, y, sep, {size, color: sepColor, role, anchor: 'middle'}); }
  return {g: group, width: w, set(offset) { group.attr('transform', `translate(${-(((offset % w) + w) % w)} 0)`); }};
}
/** A roughly round scrap of paper of radius r around (0, 0): path string. */
export const disc = (r, seed = 1, n = 44) => 'M' + Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, rr = r * (1 + (noise(i * .7, seed) - .5) * .07 + (hash(i, seed + 1) - .5) * .03); return `${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`; }).join('L') + 'Z';
