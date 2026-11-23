#!/usr/bin/env node
// Writes the lifestyle theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and license-clean.
// Run: node library/themes/lifestyle/lottie/generate.mjs
// The look: brushed round strokes and flat soft shapes in the theme palette on mint-cream paper;
// everything draws on or fades up on long soft eases, nothing bounces.
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {bg: '#E8F1DA', paper: '#E8F1DA', deep: '#D7E5C4', line: '#BFCFA9', cream: '#F5F8E9', ink: '#2B221C', soft: '#5E5A4C', dim: '#8C947D', leaf: '#6CAE48', sage: '#8FBBAA', teal: '#3E8B89', sky: '#A9D3D6', sun: '#E9B44C', clay: '#D8694A', blush: '#EFC6B2'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
// Easing between one key and the next: soft (default), lin (constant speed, for loops), back (overshoots and settles), in (slow start).
const EASE = {soft: {i: {x: [.2], y: [1]}, o: {x: [.4], y: [0]}}, lin: {i: {x: [1], y: [1]}, o: {x: [0], y: [0]}}, back: {i: {x: [.3], y: [1.12]}, o: {x: [.3], y: [0]}}, in: {i: {x: [.7], y: [1]}, o: {x: [.6], y: [0]}}};
/** Animated property from [[frame, value, ease?], ...]. ease 'hold' jumps to the next value with no in-between. */
const keys = frames => ({a: 1, k: frames.map(([t, s, e], i) => i < frames.length - 1 ? (e === 'hold' ? {t, s: arr(s), h: 1} : {t, s: arr(s), ...EASE[e || 'soft']}) : {t, s: arr(s)})});
const prop = v => Array.isArray(v) && Array.isArray(v[0]) ? keys(v) : still(v);
/**
 * Keys for a seamless loop of n frames, started `shift` frames late: the pattern (frame 0 to frame n) is laid
 * down three times so the layer is mid-cycle from frame 0. If the last value differs from the first, the
 * property snaps back at the end of each pass (a conveyor: move across, reappear at the start).
 */
const loop = (n, shift, frames) => [-1, 0, 1].flatMap((k, j) => frames.map(([t, v, e], i) => i === frames.length - 1 && j < 2 ? [t + k * n + (shift % n) - .01, v, 'hold'] : [t + k * n + (shift % n), v, e]));

const fill = (color, o) => ({ty: 'fl', c: still(rgb(color)), o: prop(o ?? 100), r: 1});
/** opts: o (opacity), dash [dash, gap], offset (animate it to make dashes march), cap (1 butt, 2 round, 3 square) */
const stroke = (color, width, {o, dash, offset, cap = 2} = {}) => ({ty: 'st', c: still(rgb(color)), o: prop(o ?? 100), w: prop(width), lc: cap, lj: 2,
  ...(dash ? {d: [{n: 'd', nm: 'dash', v: still(dash[0])}, {n: 'g', nm: 'gap', v: still(dash[1])}, {n: 'o', nm: 'offset', v: prop(offset ?? 0)}]} : {})});
/** Linear gradient fill. stops: [[position 0..1, color, opacity 0..1], ...] */
const gradient = (stops, from, to) => ({ty: 'gf', o: still(100), r: 1, t: 1, s: still(from), e: still(to),
  g: {p: stops.length, k: still([...stops.flatMap(([p, c]) => [p, ...rgb(c).slice(0, 3)]), ...stops.flatMap(([p, , o = 1]) => [p, o])])}});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const rect = (size, at = [0, 0], radius = 0) => ({ty: 'rc', p: prop(at), s: prop(size), r: still(radius)});
const trim = (end, start = 0, offset = 0) => ({ty: 'tm', s: prop(start), e: prop(end), o: prop(offset), m: 1});
const bezier = (v, i, o, c = false) => ({v, i: i || v.map(() => [0, 0]), o: o || v.map(() => [0, 0]), c});
const line = (points, closed = false) => ({ty: 'sh', ks: still(bezier(points, null, null, closed))});
const curve = (v, i, o, closed = true) => ({ty: 'sh', ks: still({v, i, o, c: closed})});
/** A path that changes shape: [[frame, bezier(...)], ...], constant speed between keys. */
const morph = frames => ({ty: 'sh', ks: {a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: [s], i: {x: 1, y: 1}, o: {x: 0, y: 0}} : {t, s: [s]})}});
/** Star (inner given) or regular polygon. */
const star = (points, outer, inner, rotation = 0) => ({ty: 'sr', sy: inner ? 1 : 2, d: 1, pt: still(points), p: still([0, 0]), r: prop(rotation), or: prop(outer), os: still(0), ...(inner ? {ir: prop(inner), is: still(0)} : {})});
/** Repeats everything before it in its group; each copy is moved/turned/scaled by tr again. */
const repeat = (copies, {p = [0, 0], r = 0, s = [100, 100], fade = 100} = {}) => ({ty: 'rp', c: still(copies), o: still(0), m: 1, tr: {ty: 'tr', p: still(p), a: still([0, 0]), s: still(s), r: still(r), so: still(100), eo: still(fade)}});
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: prop(tr.a ?? [0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
let index = 0;
/** extra: parent (name of another layer whose transform this one follows), mask (a bezier, or [[frame, bezier], ...]) */
const layer = (name, shapes, ks = {}, {parent, mask} = {}) => ({ddd: 0, ind: ++index, ty: shapes ? 4 : 3, nm: name, sr: 1, ao: 0, bm: 0, ip: 0, op: 9999, st: 0, ...(parent ? {parentName: parent} : {}),
  ...(mask ? {hasMask: true, masksProperties: [{inv: false, mode: 'a', nm: 'mask', o: still(100), x: still(0), pt: Array.isArray(mask) ? morph(mask).ks : still(mask)}]} : {}),
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: prop(ks.a ?? [0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, ...(shapes ? {shapes} : {})});
/** A layer with nothing to draw, used as a parent to move or spin other layers together. */
const nul = (name, ks = {}, extra) => layer(name, null, ks, extra);
/** loop: true means the last frame flows into the first, so players should not pause on the end. */
const doc = (name, frames, layers, loop = false) => {
  index = 0; const list = layers();
  for (const l of list) if (l.parentName) { l.parent = list.find(other => other.nm === l.parentName).ind; delete l.parentName; }
  return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: list, meta: {g: 'library/themes/lifestyle/lottie/generate.mjs', background: P.bg, loop}};
};

// ---- small drawing vocabulary shared by the animations below -------------------------------------------------
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const polar = (r, deg) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];          // 0 degrees is up, clockwise
/** A smooth bezier through points (Catmull-Rom tangents): the hand-drawn line of the theme. */
const smoothBez = (pts, closed = false, k = 1 / 6) => {
  const n = pts.length, at = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const tan = pts.map((_, i) => [(at(i + 1)[0] - at(i - 1)[0]) * k, (at(i + 1)[1] - at(i - 1)[1]) * k]);
  return bezier(pts, tan.map(([x, y]) => [-x, -y]), tan, closed);
};
const smooth = (pts, closed = false) => ({ty: 'sh', ks: still(smoothBez(pts, closed))});
/** A stroked shape. opts: trim, tr (group transform), and the stroke options. */
const ink = (shape, color, width, opts = {}) => group([...arr(shape), ...(opts.trim ? [opts.trim] : []), stroke(color, width, opts)], opts.tr);
/** A shape that draws itself between two frames. */
const draws = (shape, color, width, from, to, opts = {}) => ink(shape, color, width, {...opts, trim: trim([[from, 0], [to, 100]])});
const solid = (shape, color, tr, o) => group([...arr(shape), fill(color, o)], tr);
/** A soft organic blob of radius r; phase shifts its bumps (for morphing). */
const blobBez = (r, seed, phase = 0, n = 7) => smoothBez(Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, rr = r * (.84 + .22 * rnd(i + seed * 13) + .07 * Math.sin(phase + i * 1.9)); return [Math.cos(a) * rr, Math.sin(a) * rr]; }), true);
/** A leaf of length L and half-width H growing from (0, 0) to the right. */
const leaf = (L, H = L * .36) => curve([[0, 0], [L, 0]], [[L * .3, H], [-L * .3, -H]], [[L * .3, -H], [-L * .3, H]]);
/** A heart about r wide, centred near (0, 0). */
const heart = r => smooth(Array.from({length: 20}, (_, i) => { const a = i / 20 * Math.PI * 2; return [r / 16 * 16 * Math.sin(a) ** 3, -r / 16 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))]; }), true);
/** A map pin whose tip is at (0, 0); r is the head radius. */
const pin = r => curve([[0, 0], [-r, -2.1 * r], [0, -3.1 * r], [r, -2.1 * r]], [[r * .45, -r * .8], [0, r * .75], [-r * .55, 0], [0, -r * .55]], [[-r * .45, -r * .8], [0, -r * .55], [r * .55, 0], [0, r * .75]]);
/** The theme's brush mark: a row of loose loops, w wide and h tall. */
const loopsPath = (w, h, n = 3) => smooth(Array.from({length: n * 14 + 1}, (_, i) => { const u = i / (n * 14), a = u * n * Math.PI * 2; return [-w / 2 + w * u + h * .33 * Math.sin(a) + h * .1, h * .42 * Math.cos(a) * (1 - .12 * u) + 4 * Math.sin(u * 9)]; }));
const wave = (w, amp, waves, y = 0, wob = 0) => smooth(Array.from({length: waves * 2 + 1}, (_, i) => [-w / 2 + w * i / (waves * 2), y + (i % 2 ? -1 : 1) * amp * (.8 + .4 * rnd(i + wob)) * (i === 0 || i === waves * 2 ? .3 : 1)]));

const animations = {
  'scribble-loops': doc('Scribble loops', 90, () => [
    layer('dot', [solid(ellipse([20, 20]), P.leaf)], {p: [318, 262, 0], s: [[52, [0, 0, 100]], [66, [100, 100, 100]]]}),
    layer('loops', [draws(loopsPath(250, 150), P.leaf, 22, 6, 56)], {p: [190, 200, 0], r: -6}),
    layer('ghost', [draws(loopsPath(250, 150), P.deep, 22, 0, 44)], {p: [198, 212, 0], r: -6}),
  ]),

  'underline-squiggle': doc('Underline squiggle', 80, () => [
    layer('line', [draws(wave(280, 14, 4, 0, 2), P.leaf, 14, 6, 44)], {p: [200, 190, 0]}),
    layer('second', [draws(wave(170, 9, 3, 0, 7), P.ink, 7, 34, 62)], {p: [232, 236, 0]}),
  ]),

  'heart-pop': doc('Heart pop', 90, () => [
    layer('heart', [solid(heart(92), P.clay)], {p: [200, 208, 0], s: [[4, [0, 0, 100]], [30, [104, 104, 100]], [48, [100, 100, 100]], [68, [104, 104, 100]], [90, [100, 100, 100]]], o: [[4, 0], [16, 100]]}),
    layer('shine', [draws(smooth([[-52, -30], [-58, -52], [-36, -64]]), P.cream, 9, 30, 46)], {p: [200, 208, 0]}),
    ...Array.from({length: 7}, (_, i) => { const a = -90 + i * 30, [x0, y0] = polar(128, a), [x1, y1] = polar(160, a);
      return layer('ray ' + i, [group([line([[x0, y0], [x1, y1]]), trim([[22 + i, 0], [40 + i, 100]], [[34 + i, 0], [56 + i, 100]]), stroke([P.sun, P.leaf, P.blush][i % 3], 9)])], {p: [200, 214, 0]}); }),
    layer('halo', [solid(ellipse([250, 250]), P.blush)], {p: [200, 208, 0], s: [[0, [40, 40, 100]], [40, [100, 100, 100]]], o: [[0, 0], [14, 70], [90, 45]]}),
  ]),

  'star-rating': doc('Star rating', 100, () => [
    ...Array.from({length: 5}, (_, i) => layer('fill ' + i, [group([star(5, 30, 13.5), fill(P.sun), stroke(P.sun, 7)])], {p: [72 + i * 64, 200, 0], s: [[14 + i * 9, [0, 0, 100]], [36 + i * 9, [100, 100, 100]]], r: [[14 + i * 9, -40], [40 + i * 9, 0]], o: i === 4 ? [[50, 0], [62, 45]] : 100})),
    ...Array.from({length: 5}, (_, i) => layer('outline ' + i, [group([star(5, 30, 13.5), stroke(P.line, 5)])], {p: [72 + i * 64, 200, 0], o: [[i * 3, 0], [10 + i * 3, 100]]})),
    layer('rule', [draws(wave(250, 5, 3, 0, 4), P.ink, 5, 56, 84)], {p: [200, 262, 0]}),
  ]),

  'check-tick': doc('Check tick', 80, () => [
    layer('tick', [draws(smooth([[-46, 4], [-14, 38], [52, -40]]), P.cream, 20, 26, 46)], {p: [200, 200, 0]}),
    layer('disc', [solid(ellipse([210, 210]), P.leaf)], {p: [200, 200, 0], s: [[4, [0, 0, 100]], [30, [100, 100, 100]]], o: [[4, 0], [14, 100]]}),
    layer('ring', [draws(ellipse([262, 262]), P.sage, 6, 0, 36)], {p: [200, 200, 0], r: -90}),
    ...[[-128, -110, 16], [136, -96, 10], [124, 118, 14]].map(([x, y, s], i) => layer('dot ' + i, [solid(ellipse([s, s]), [P.sun, P.clay, P.sage][i])], {p: [200 + x, 200 + y, 0], s: [[40 + i * 5, [0, 0, 100]], [58 + i * 5, [100, 100, 100]]]})),
  ]),

  'sun-turn': doc('Sun turn', 120, () => [
    layer('disc', [solid(ellipse([132, 132]), P.sun)], {s: loop(120, 0, [[0, [100, 100, 100]], [60, [106, 106, 100]], [120, [100, 100, 100]]])}),
    layer('rays', [group([line([[0, -96], [0, -132]]), stroke(P.sun, 14), repeat(12, {r: 30})])], {r: loop(120, 0, [[0, 0, 'lin'], [120, 30]])}),
    layer('glow', [solid(ellipse([330, 330]), P.cream)], {o: loop(120, 0, [[0, 55], [60, 85], [120, 55]]), s: loop(120, 0, [[0, [96, 96, 100]], [60, [104, 104, 100]], [120, [96, 96, 100]]])}),
  ], true),

  'sprig-grow': doc('Sprig grow', 100, () => {
    const stem = [[0, 150], [-8, 80], [6, 10], [-4, -60], [10, -130]], leaves = [[-6, 96, -150, 62, P.leaf], [-2, 52, -32, 70, P.sage], [4, 6, -148, 66, P.leaf], [1, -38, -30, 62, P.leaf], [-2, -84, -146, 52, P.sage], [10, -130, -80, 58, P.leaf]];
    return [
      ...leaves.map(([x, y, r, L, c], i) => layer('leaf ' + i, [solid(leaf(L), c)], {p: [200 + x, 205 + y, 0], r: [[16 + i * 9, r + (i % 2 ? 30 : -30)], [50 + i * 9, r]], s: [[16 + i * 9, [0, 0, 100]], [46 + i * 9, [100, 100, 100]]]})),
      layer('stem', [draws(smooth(stem), P.ink, 7, 0, 60)], {p: [200, 205, 0]}),
      layer('ground', [draws(wave(170, 5, 3, 0, 3), P.line, 7, 0, 24)], {p: [200, 362, 0]}),
    ];
  }),

  'pin-drop': doc('Pin drop', 90, () => [
    layer('eye', [solid(ellipse([40, 40]), P.cream)], {p: [0, 0, 0]}, {parent: 'pin'}),
    layer('pin', [solid(pin(54), P.clay, {p: [0, 113]})], {p: [[0, [200, 20, 0]], [34, [200, 162, 0]]], o: [[0, 0], [12, 100]]}),
    layer('pulse', [group([ellipse([150, 52]), stroke(P.clay, 5)])], {p: [200, 278, 0], s: [[30, [30, 30, 100]], [76, [150, 150, 100]]], o: [[30, 0], [38, 80], [76, 0]]}),
    layer('shadow', [solid(ellipse([120, 36]), P.deep)], {p: [200, 278, 0], s: [[6, [20, 20, 100]], [34, [100, 100, 100]]], o: [[6, 0], [30, 100]]}),
  ]),

  'sparkles': doc('Sparkles', 90, () => [[200, 190, 78, P.sun, 0], [96, 112, 40, P.leaf, 30], [308, 104, 30, P.clay, 55], [104, 300, 32, P.sage, 70], [300, 296, 46, P.sun, 16], [206, 62, 22, P.teal, 44]].map(([x, y, r, c, shift], i) =>
    layer('sparkle ' + i, [group([star(4, r, r * .3), fill(c), stroke(c, r * .12)])], {p: [x, y, 0], s: loop(90, shift, [[0, [18, 18, 100]], [32, [100, 100, 100]], [60, [70, 70, 100]], [90, [18, 18, 100]]]), r: loop(90, shift, [[0, -20], [45, 12], [90, -20]]), o: loop(90, shift, [[0, 0], [16, 100], [70, 100], [90, 0]])})), true),

  'coffee-steam': doc('Coffee steam', 90, () => [
    ...[-34, 4, 42].map((x, i) => layer('steam ' + i, [group([smooth([[0, 0], [12, -22], [-8, -46], [10, -70], [0, -92]]), trim(loop(90, i * 28, [[0, 0, 'lin'], [60, 100, 'lin'], [90, 100]]), loop(90, i * 28, [[0, 0, 'lin'], [30, 0, 'lin'], [90, 100]])), stroke(P.sage, 9)])], {p: [188 + x, 168, 0]})),
    layer('rim', [solid(ellipse([174, 34]), P.ink)], {p: [190, 196, 0]}),
    layer('cup', [solid(curve([[-90, 0], [90, 0], [40, 108], [-40, 108]], [[0, 70], [0, 0], [36, 0], [0, 0]], [[0, 0], [0, 70], [0, 0], [-36, 0]]), P.clay)], {p: [190, 196, 0]}),
    layer('handle', [group([ellipse([74, 66]), stroke(P.clay, 16)])], {p: [278, 240, 0]}),
    layer('saucer', [solid(rect([260, 16], [0, 0], 8), P.ink)], {p: [196, 316, 0]}),
  ], true),

  'arrow-draw': doc('Arrow draw', 80, () => [
    layer('head', [draws(smooth([[-34, -8], [8, 0], [-22, 38]]), P.ink, 13, 36, 52)], {p: [296, 268, 0], r: 28}),
    layer('shaft', [draws(smooth([[-120, -100], [-128, -20], [-70, 40], [-20, 10], [-34, -40], [-80, -10], [-40, 70], [60, 80], [100, 66]]), P.ink, 13, 4, 40)], {p: [200, 200, 0]}),
    layer('dot', [solid(ellipse([40, 40]), P.leaf)], {p: [82, 80, 0], s: [[0, [0, 0, 100]], [16, [100, 100, 100]]]}),
  ]),

  'circle-highlight': doc('Circle highlight', 80, () => [
    layer('ring', [draws(smooth([[-10, -84], [90, -70], [150, -6], [96, 70], [-30, 88], [-140, 50], [-150, -24], [-66, -86], [50, -92], [120, -66]]), P.clay, 11, 4, 46)], {p: [200, 200, 0], r: -4}),
    ...[[-12, 16], [0, 20], [14, 16]].map(([r, len], i) => layer('tick ' + i, [draws(line([polar(118, 46 + r), polar(118 + len * 2.2, 46 + r)]), P.ink, 8, 44 + i * 4, 58 + i * 4)], {p: [226, 196, 0]})),
    layer('word', [solid(rect([190, 26], [0, 0], 13), P.ink), solid(rect([120, 18], [-35, 40], 9), P.line)], {p: [200, 190, 0], o: [[0, 0], [12, 100]]}),
  ]),

  'blob-breathe': doc('Blob breathe', 150, () => {
    const breath = (r, seed) => morph([0, 1, 2, 3, 4, 5, 6].map(k => [k * 25, blobBez(r, seed, k === 6 ? 0 : k * Math.PI / 3)]));
    return [
      layer('dot', [solid(ellipse([34, 34]), P.sun)], {p: loop(150, 0, [[0, [286, 118, 0]], [75, [296, 104, 0]], [150, [286, 118, 0]]])}),
      layer('inner', [group([breath(78, 2), fill(P.leaf)])], {p: [214, 190, 0], r: loop(150, 0, [[0, 0, 'lin'], [150, -360]])}),
      layer('mid', [group([breath(122, 5), fill(P.sage)])], {p: [190, 208, 0], r: loop(150, 0, [[0, 0, 'lin'], [150, 360]])}),
      layer('outer', [group([breath(168, 9), fill(P.deep)])], {r: loop(150, 0, [[0, 0, 'lin'], [150, -360]])}),
    ];
  }, true),

  'petal-drift': doc('Petal drift', 150, () => Array.from({length: 22}, (_, i) => {
    const x = 20 + rnd(i + 1) * 360, L = 22 + rnd(i + 40) * 30, shift = Math.floor(rnd(i + 80) * 150), sway = 14 + rnd(i + 120) * 30, color = [P.leaf, P.sage, P.blush, P.sun, P.clay, P.sky][Math.floor(rnd(i + 160) * 6)], turn = rnd(i + 200) * 360;
    return layer('petal ' + i, [group([leaf(L, L * .4), fill(color, 85)], {a: [L / 2, 0], p: loop(150, shift * 2, [[0, [0, 0]], [38, [sway, 0]], [112, [-sway, 0]], [150, [0, 0]]]), r: loop(150, shift, [[0, turn, 'lin'], [150, turn + (i % 2 ? 360 : -360)]])})], {p: loop(150, shift, [[0, [x, -30, 0], 'lin'], [150, [x + (rnd(i + 240) - .5) * 80, 430, 0]]])});
  }), true),
};

mkdirSync(new URL('animations/', import.meta.url), {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`animations/${id}.json`, import.meta.url), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations.`);
