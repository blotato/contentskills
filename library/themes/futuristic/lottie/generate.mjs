#!/usr/bin/env node
// Writes the futuristic theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and license-clean.
// Run: node library/themes/futuristic/lottie/generate.mjs
import {writeFileSync} from 'node:fs';

const P = {bg: '#04070c', cyan: '#3ef0ff', teal: '#17b9cf', magenta: '#ff3fa4', amber: '#ffb300', red: '#ff4d5a', white: '#e9fcff', dim: '#6c93a8', grid: '#1d4a5e'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
// Easing between one key and the next: soft (default), lin (constant speed, for loops), back (overshoots and settles), in (slow start).
const EASE = {soft: {i: {x: [.2], y: [1]}, o: {x: [.4], y: [0]}}, lin: {i: {x: [1], y: [1]}, o: {x: [0], y: [0]}}, back: {i: {x: [.3], y: [1.6]}, o: {x: [.3], y: [0]}}, in: {i: {x: [.7], y: [1]}, o: {x: [.6], y: [0]}}};
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
  return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: list, meta: {g: 'library/themes/futuristic/lottie/generate.mjs', background: P.bg, loop}};
};

// ---- small drawing vocabulary shared by the animations below -------------------------------------------------
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const polar = (r, deg) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];          // 0 degrees is up, clockwise
const ngon = (n, r, turn = 0) => Array.from({length: n}, (_, i) => polar(r, turn + i * 360 / n));
const hexagon = (r, turn = 0) => line(ngon(6, r, turn), true);
const chamferBox = (w, h, c = 18) => line([[-w / 2 + c, -h / 2], [w / 2, -h / 2], [w / 2, h / 2 - c], [w / 2 - c, h / 2], [-w / 2, h / 2], [-w / 2, -h / 2 + c]], true);
const corners = (w, h, len = 34) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => line([[x * w / 2, y * (h / 2 - len)], [x * w / 2, y * h / 2], [x * (w / 2 - len), y * h / 2]]));
/** A stroked shape. opts: trim, tr (group transform), and the stroke options. */
const ink = (shape, color, width, opts = {}) => group([...arr(shape), ...(opts.trim ? [opts.trim] : []), stroke(color, width, opts)], opts.tr);
/** A shape that draws itself between two frames. */
const draws = (shape, color, width, from, to, opts = {}) => ink(shape, color, width, {...opts, trim: trim([[from, 0], [to, 100]])});
const chevron = (size, at = [0, 0], turn = 0) => { const [x, y] = at, q = polar(size, turn + 135), r = polar(size, turn - 135); return line([[x + q[0], y + q[1]], [x, y], [x + r[0], y + r[1]]]); };
const SEGMENTS = {a: [[-22, -46], [22, -46]], b: [[26, -42], [26, -4]], c: [[26, 4], [26, 42]], d: [[-22, 46], [22, 46]], e: [[-26, 4], [-26, 42]], f: [[-26, -42], [-26, -4]], g: [[-22, 0], [22, 0]]};
const DIGITS = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abfgcd'];
/** A seven-segment digit about 60 wide and 100 tall. */
const digit = (n, color, width = 9) => [...DIGITS[n]].map(s => ink(line(SEGMENTS[s]), color, width, {cap: 3}));

const animations = {
  'reticle-spin': doc('Reticle spin', 90, () => [
    layer('dot', [group([rect([14, 14]), fill(P.amber)], {r: 45})], {s: [[0, [100, 100, 100]], [45, [170, 170, 100]], [89, [100, 100, 100]]]}),
    layer('cross', [group([line([[-150, 0], [-110, 0]]), stroke(P.cyan, 4)]), group([line([[110, 0], [150, 0]]), stroke(P.cyan, 4)]), group([line([[0, -150], [0, -110]]), stroke(P.cyan, 4)]), group([line([[0, 110], [0, 150]]), stroke(P.cyan, 4)])]),
    layer('inner', [group([ellipse([150, 150]), trim(70, 5), stroke(P.cyan, 6)])], {r: [[0, 0], [89, 360]]}),
    layer('outer', [group([ellipse([230, 230]), trim(38, 0), stroke(P.magenta, 4)])], {r: [[0, 0], [89, -360]]}),
    layer('track', [group([ellipse([230, 230]), stroke(P.dim, 2)])], {o: 40}),
  ], true),

  'ping': doc('Ping', 60, () => [
    layer('core', [group([rect([26, 26]), fill(P.cyan)], {r: 45})]),
    ...[0, 20].map((delay, n) => layer('wave ' + n, [group([rect([60, 60]), stroke(P.cyan, 4)], {r: 45})], {
      s: [[delay, [60, 60, 100]], [delay + 38, [420, 420, 100]]], o: [[0, 0], [delay, 0], [delay + 2, 90], [delay + 38, 0]],
    })),
    layer('brackets', [group([line([[-150, -110], [-150, -150], [-110, -150]]), stroke(P.amber, 5)]), group([line([[150, 110], [150, 150], [110, 150]]), stroke(P.amber, 5)])], {o: [[0, 30], [10, 100], [30, 30], [40, 100], [59, 30]]}),
  ], true),

  'signal-bars': doc('Signal bars', 60, () => Array.from({length: 9}, (_, n) => {
    const tall = [60, 130, 90, 190, 240, 150, 210, 110, 70][n], low = tall * .35;
    return layer('bar ' + n, [group([rect([[0, [18, low]], [15 + n * 2, [18, tall]], [40, [18, low * 1.6]], [59, [18, low]]], [0, 0], 0), fill(n === 4 ? P.amber : P.cyan)])], {p: [72 + n * 32, 200, 0]});
  }), true),

  'access-granted': doc('Access granted', 60, () => [
    layer('check', [group([line([[-46, 4], [-14, 36], [50, -34]]), trim([[24, 0], [38, 100]]), stroke(P.cyan, 16)])]),
    layer('hex', [group([line([[0, -130], [113, -65], [113, 65], [0, 130], [-113, 65], [-113, -65]], true), trim([[0, 0], [24, 100]]), stroke(P.cyan, 6)])]),
    layer('flash', [group([line([[0, -130], [113, -65], [113, 65], [0, 130], [-113, 65], [-113, -65]], true), fill(P.cyan)])], {o: [[0, 0], [24, 0], [27, 45], [40, 0]]}),
    layer('ticks', [group([line([[-170, 0], [-140, 0]]), stroke(P.amber, 5)]), group([line([[140, 0], [170, 0]]), stroke(P.amber, 5)])], {o: [[0, 0], [30, 0], [34, 100]]}),
  ]),

  // ---- Status ----------------------------------------------------------------------------------------------
  'loader-orbit': doc('Loader orbit', 90, () => [
    layer('core', [ink(hexagon(26), P.amber, 5), group([ellipse([12, 12]), fill(P.amber)])], {s: [[0, [100, 100, 100]], [45, [135, 135, 100]], [90, [100, 100, 100]]], r: [[0, 0, 'lin'], [90, 60]]}),
    nul('spin', {r: [[0, 0, 'lin'], [90, 360]]}),
    layer('satellite', [group([ellipse([18, 18], [0, -168]), fill(P.white)]), ink(ellipse([336, 336]), P.cyan, 5, {trim: trim(100, 84), o: 70})], {p: [0, 0, 0]}, {parent: 'spin'}),
    layer('satellite 2', [group([rect([14, 14], [0, 168]), fill(P.amber)])], {p: [0, 0, 0]}, {parent: 'spin'}),
    layer('inner', [ink(ellipse([150, 150]), P.cyan, 7, {trim: trim(68, 4)})], {r: [[0, 0, 'lin'], [90, 720]]}),
    layer('outer', [ink(ellipse([232, 232]), P.magenta, 4, {trim: trim(30, 0)}), ink(ellipse([232, 232]), P.magenta, 4, {trim: trim(62, 50)})], {r: [[0, 0, 'lin'], [90, -360]]}),
    layer('ticks', [ink(ellipse([280, 280]), P.dim, 10, {dash: [2, 12.661], cap: 1})], {r: [[0, 0, 'lin'], [90, 30]], o: 70}),
    layer('track', [ink(ellipse([232, 232]), P.dim, 2), ink(ellipse([336, 336]), P.dim, 1)], {o: 35}),
  ], true),

  'loader-segments': doc('Loader segments', 60, () => [
    layer('dots', [-22, 0, 22].map((x, i) => group([rect([10, 10], [x, 0]), fill(P.amber)], {o: loop(60, i * 8, [[0, 100], [10, 20], [50, 20], [60, 100]])}))),
    layer('segments', Array.from({length: 12}, (_, i) => group([rect([16, 46], [0, -128], 0), fill(i % 4 === 0 ? P.white : P.cyan)], {r: i * 30, o: loop(60, i * 5, [[0, 100], [22, 16], [55, 16], [60, 100]]), s: loop(60, i * 5, [[0, [118, 118]], [18, [100, 100]], [60, [118, 118]]])}))),
    layer('arc', [ink(ellipse([172, 172]), P.magenta, 3, {trim: trim(22, 0)}), ink(ellipse([172, 172]), P.magenta, 3, {trim: trim(72, 50)})], {r: [[0, 0, 'lin'], [60, -180]]}),
    layer('ring', [ink(ellipse([172, 172]), P.dim, 1)], {o: 40}),
  ], true),

  'radar-sweep': doc('Radar sweep', 90, () => [
    ...[[60, 80, 30], [205, 118, 12], [300, 54, 54]].map(([deg, r, seen], n) => layer('blip ' + n, [group([rect([13, 13]), fill(n === 1 ? P.magenta : P.amber)], {r: 45}),
      group([rect([13, 13]), stroke(P.amber, 2)], {r: 45, s: loop(90, deg / 4, [[0, [100, 100]], [34, [330, 330]], [90, [330, 330]]]), o: loop(90, deg / 4, [[0, 90], [34, 0], [90, 0]])})],
      {p: [200 + polar(r, deg)[0], 200 + polar(r, deg)[1], 0], o: loop(90, deg / 4, [[0, 100], [50, 12], [88, 12], [90, 100]])})),
    layer('sweep', [ink(line([[0, 0], [0, -152]]), P.white, 4),
      ...Array.from({length: 9}, (_, k) => group([line([[0, 0], polar(152, -k * 7), polar(152, -k * 7 - 7.4)], true), fill(P.cyan, 46 * Math.pow(1 - k / 9, 1.6))]))], {r: [[0, 0, 'lin'], [90, 360]]}),
    layer('cross', [ink(line([[-166, 0], [166, 0]]), P.dim, 1.5), ink(line([[0, -166], [0, 166]]), P.dim, 1.5)], {o: 60}),
    layer('rings', [ink(ellipse([304, 304]), P.cyan, 3), ink(ellipse([204, 204]), P.teal, 2, {o: 70}), ink(ellipse([104, 104]), P.teal, 2, {o: 70}), ink(ellipse([336, 336]), P.dim, 8, {dash: [2, 15.593], cap: 1})]),
    layer('corner marks', corners(372, 372, 26).map(c => ink(c, P.amber, 4)), {o: [[0, 100], [45, 35], [90, 100]]}),
  ], true),

  'countdown-ring': doc('Countdown ring', 110, () => [
    ...[3, 2, 1, 0].map((n, i) => layer('digit ' + n, digit(n, n ? P.white : P.amber, 11), {
      o: [[0, 0, 'hold'], [i * 30, 100, 'hold'], [i < 3 ? i * 30 + 30 : 9999, 0, 'hold'], [9999, 0]], s: [[i * 30, [150, 150, 100], 'back'], [i * 30 + 10, [100, 100, 100]], [i * 30 + 11, [100, 100, 100]]]})),
    layer('flash', [group([ellipse([236, 236]), fill(P.amber)])], {o: [[0, 0], [89, 0], [92, 55], [108, 0]]}),
    layer('burst', [group([line([[0, -138], [0, -176]]), trim([[90, 0], [100, 100]], [[94, 0], [106, 100]]), stroke(P.amber, 6), repeat(12, {r: 30})])]),
    layer('time left', [ink(ellipse([236, 236]), P.cyan, 12, {trim: trim([[0, 100, 'lin'], [90, 0]]), cap: 1})], {s: [0, 30, 60].flatMap(t => [[t, [107, 107, 100]], [t + 9, [100, 100, 100]], [t + 29, [100, 100, 100], 'hold']]).concat([[90, [100, 100, 100]]])}),
    layer('done ring', [ink(ellipse([236, 236]), P.amber, 8)], {o: [[0, 0], [89, 0], [91, 100]], s: [[89, [118, 118, 100], 'back'], [101, [100, 100, 100]]]}),
    layer('track', [ink(ellipse([236, 236]), P.dim, 3, {o: 45}), group([line([[0, -138], [0, -150]]), stroke(P.dim, 3), repeat(12, {r: 30})]), ink(ellipse([296, 296]), P.magenta, 3, {trim: trim(12, 0)}), ink(ellipse([296, 296]), P.magenta, 3, {trim: trim(62, 50)})], {r: [[0, 0, 'lin'], [110, -110]]}),
  ]),

  'progress-bar': doc('Progress bar', 84, () => {
    const W = 280, stops = [[10, 0], [26, .36], [34, .36], [48, .74], [54, .74], [66, 1]], grow = stops.map(([t, f]) => [t, [W * f, 34]]), slide = stops.map(([t, f]) => [t, [-W / 2 + W * f / 2, 0]]);
    return [
      layer('done tick', [draws(line([[-16, 2], [-4, 14], [18, -12]]), P.bg, 7, 68, 76)], {p: [200 + W / 2 - 30, 200, 0]}),
      layer('flash', [group([rect([W, 34]), fill(P.white)])], {o: [[0, 0], [65, 0], [68, 90], [80, 0]]}),
      layer('dividers', [group([line([[-W / 2 + 28, -20], [-W / 2 + 28, 20]]), stroke(P.bg, 5, {cap: 1}), repeat(9, {p: [28, 0]})])]),
      layer('fill', [group([rect(grow, slide), fill(P.cyan)])]),
      layer('marker', [group([line([[-9, -14], [9, -14], [0, 0]], true), fill(P.amber)])], {p: stops.map(([t, f]) => [t, [200 - W / 2 + W * f, 170, 0]]), o: [[0, 0], [8, 0], [12, 100]]}),
      layer('frame', [draws(chamferBox(W + 28, 62, 14), P.cyan, 4, 0, 18), ...corners(W + 64, 100, 22).map(c => ink(c, P.amber, 4, {o: [[0, 0], [14, 0, 'hold'], [16, 100, 'hold'], [18, 20, 'hold'], [20, 100]]}))], {s: [[64, [100, 100, 100]], [69, [106, 106, 100], 'back'], [80, [100, 100, 100]]]}),
      layer('steps', [0, 1, 2, 3].map(i => group([rect([20, 8], [-W / 2 + 10 + i * 30, 62]), fill(i === 3 ? P.amber : P.teal)], {o: [[0, 15], [22 + i * 14, 15, 'hold'], [24 + i * 14, 100]]}))),
      layer('rail', [ink(line([[-W / 2, 0], [W / 2, 0]]), P.dim, 2, {dash: [4, 10], offset: [[0, 0, 'lin'], [84, -84]]})], {o: 60}),
    ];
  }),

  'power-up': doc('Power up', 70, () => [
    layer('stem', [ink(line([[0, -100], [0, -18]]), P.white, 16)], {p: [[4, [200, 150, 0], 'back'], [20, [200, 200, 0]]], o: [[0, 0], [4, 0], [9, 100]]}),
    layer('arc', [ink(ellipse([170, 170]), P.cyan, 16, {trim: trim([[6, 50], [28, 91]], [[6, 50], [28, 9]])})], {s: [[40, [100, 100, 100]], [52, [106, 106, 100]], [70, [100, 100, 100]]]}),
    layer('glow', [group([ellipse([170, 170]), fill(P.cyan)])], {o: [[0, 0], [26, 0], [30, 50], [50, 8], [70, 14]]}),
    layer('rays', [group([line([[0, -122], [0, -176]]), trim([[28, 0], [40, 100]], [[33, 0], [48, 100]]), stroke(P.amber, 7), repeat(12, {r: 30})])], {r: 15}),
    layer('ring', [ink(ellipse([200, 200]), P.amber, [[28, 10], [50, 0]])], {s: [[28, [90, 90, 100]], [52, [185, 185, 100]]], o: [[0, 0], [27, 0, 'hold'], [28, 100], [52, 0]]}),
    layer('brackets', corners(350, 350, 30).map(c => ink(c, P.dim, 3)), {s: [[0, [118, 118, 100]], [26, [118, 118, 100], 'back'], [38, [100, 100, 100]]], o: [[0, 0], [24, 0], [30, 100]]}),
  ]),

  'toggle-on': doc('Toggle on', 56, () => [
    layer('knob lit', [group([ellipse([[14, [72, 72]], [21, [96, 60]], [30, [72, 72]]]), fill(P.white)])], {p: [[14, [140, 200, 0], 'back'], [30, [260, 200, 0]]], o: [[0, 0], [20, 0], [24, 100]]}),
    layer('knob', [group([ellipse([[14, [72, 72]], [21, [96, 60]], [30, [72, 72]]]), fill(P.dim)])], {p: [[14, [140, 200, 0], 'back'], [30, [260, 200, 0]]], s: [[0, [0, 0, 100], 'back'], [12, [100, 100, 100]]], o: [[0, 100], [20, 100], [24, 0]]}),
    layer('sparks', [-32, 0, 32].map((deg, i) => group([line([[66, 0], [104, 0]]), trim([[26, 0], [36, 100]], [[30, 0], [42, 100]]), stroke(P.amber, 6)], {r: deg, p: [118, 0]}))),
    layer('track lit', [ink(rect([224, 104], [0, 0], 52), P.cyan, 6), group([rect([224, 104], [0, 0], 52), fill(P.cyan, 22)])], {o: [[0, 0], [20, 0], [27, 100]], s: [[24, [100, 100, 100]], [30, [105, 105, 100], 'back'], [40, [100, 100, 100]]]}),
    layer('track', [draws(rect([224, 104], [0, 0], 52), P.dim, 4, 0, 14)]),
    layer('state marks', [ink(line([[-150, -18], [-150, 18]]), P.dim, 4, {o: [[0, 100], [22, 100], [26, 30]]}), ink(ellipse([30, 30], [158, 0]), P.cyan, 4, {o: [[0, 25], [22, 25], [27, 100]]})]),
  ]),

  'lock-secure': doc('Lock secure', 70, () => {
    const shackle = curve([[-46, -22], [-46, -72], [0, -118], [46, -72], [46, -22]], [[0, 0], [0, 0], [-25.4, 0], [0, -25.4], [0, 0]], [[0, 0], [0, -25.4], [25.4, 0], [0, 0], [0, 0]], false);
    const drop = {p: [[0, [200, 162, 0]], [20, [200, 162, 0], 'back'], [32, [200, 200, 0]]]}, thud = [[0, [200, 200, 0]], [30, [200, 200, 0]], [33, [200, 207, 0], 'back'], [42, [200, 200, 0]]];
    return [
      layer('keyhole', [group([ellipse([26, 26], [0, 28]), fill(P.bg)]), ink(line([[0, 34], [0, 62]]), P.bg, 10)], {p: thud, s: [[32, [0, 0, 100], 'back'], [44, [100, 100, 100]]]}),
      layer('body lit', [group([rect([164, 124], [0, 42], 12), fill(P.cyan)])], {p: thud, o: [[0, 0], [31, 0], [34, 100]]}),
      layer('body', [draws(rect([164, 124], [0, 42], 12), P.cyan, 6, 0, 16), group([rect([164, 124], [0, 42], 12), fill(P.cyan, 14)])], {p: thud}),
      layer('shackle locked', [ink(shackle, P.cyan, 14, {cap: 1})], {...drop, o: [[0, 0], [31, 0, 'hold'], [32, 100]]}),
      layer('shackle open', [ink(shackle, P.magenta, 14, {cap: 1})], {...drop, o: [[0, 0], [6, 0], [12, 100], [31, 100, 'hold'], [32, 0]]}),
      layer('seal', [draws(hexagon(172), P.amber, 5, 36, 54)], {r: [[36, -30], [56, 0]]}),
      layer('flash', [group([hexagon(172), fill(P.cyan)])], {o: [[0, 0], [31, 0], [34, 28], [48, 0]]}),
      layer('ticks', [group([line([[0, -184], [0, -196]]), stroke(P.dim, 3), repeat(6, {r: 60})])], {o: [[0, 0], [50, 0], [56, 100]], r: 30}),
    ];
  }),

  'signal-wave': doc('Signal wave', 60, () => {
    const wave = (amp, cycles, phase) => { const n = 16, dx = 320 / n, f = x => { const e = Math.pow(Math.cos(x / 320 * Math.PI), 2), a = cycles * 2 * Math.PI * x / 320 - phase; return [amp * e * Math.sin(a), amp * (e * Math.cos(a) * cycles * 2 * Math.PI / 320 - Math.sin(a) * Math.sin(2 * x / 320 * Math.PI) * Math.PI / 320)]; };
      const v = [], i = [], o = []; for (let k = 0; k <= n; k++) { const x = -160 + k * dx, [y, slope] = f(x); v.push([x, y]); i.push([-dx / 3, -slope * dx / 3]); o.push([dx / 3, slope * dx / 3]); } return bezier(v, i, o); };
    const frames = Array.from({length: 13}, (_, k) => k * 5), run = (amp, cycles, turns, lead = 0) => morph(frames.map(t => [t, wave(amp, cycles, lead + turns * 2 * Math.PI * t / 60)]));
    return [
      layer('rider', [group([rect([14, 14]), fill(P.amber)], {r: 45})], {p: frames.map(t => [t, [200, 200 + 92 * Math.sin(-2 * Math.PI * t / 60), 0], 'lin'])}),
      layer('main', [ink(run(92, 2.5, 1), P.cyan, 6)]),
      layer('echo', [ink(run(60, 4, -1, 1), P.magenta, 3)]),
      layer('ghost', [ink(run(120, 1.5, 1, 2), P.teal, 2, {o: 55})]),
      layer('axis', [ink(line([[-176, 0], [176, 0]]), P.dim, 2, {dash: [3, 9], offset: [[0, 0, 'lin'], [60, 24]]}), ink(line([[-176, -40], [-176, 40]]), P.dim, 4), ink(line([[176, -40], [176, 40]]), P.dim, 4)]),
      layer('brackets', corners(376, 300, 24).map(c => ink(c, P.amber, 4)), {o: [[0, 100], [30, 40], [60, 100]]}),
    ];
  }, true),

  'scan-brackets': doc('Scan brackets', 80, () => [
    layer('beam', [ink(line([[-128, 0], [128, 0]]), P.white, 3), group([rect([256, 44]), gradient([[0, P.cyan, 0], [.5, P.cyan, .5], [1, P.cyan, 0]], [0, -22], [0, 22])])], {p: [[0, [200, 84, 0]], [40, [200, 316, 0]], [80, [200, 84, 0]]]}),
    layer('cross', [ink(line([[-16, 0], [16, 0]]), P.amber, 3), ink(line([[0, -16], [0, 16]]), P.amber, 3), ink(ellipse([54, 54]), P.amber, 2, {dash: [10, 11.206]})], {r: [[0, 0, 'lin'], [80, 90]]}),
    layer('brackets', corners(290, 290, 54).map(c => ink(c, P.cyan, 8, {cap: 3})), {s: [[0, [100, 100, 100], 'back'], [14, [88, 88, 100]], [40, [88, 88, 100], 'back'], [54, [100, 100, 100]], [80, [100, 100, 100]]]}),
    layer('readout', Array.from({length: 6}, (_, i) => group([rect([10 + rnd(i) * 26, 6], [-176, -50 + i * 20]), fill(P.teal)], {o: loop(80, i * 13, [[0, 100, 'hold'], [30, 20, 'hold'], [50, 100, 'hold'], [58, 20, 'hold'], [80, 100]])}))),
    layer('frame', [ink(rect([330, 330]), P.dim, 1.5, {dash: [2, 8]})], {o: 60}),
  ], true),

  // ---- Reactions -------------------------------------------------------------------------------------------
  'check-glitch': doc('Check glitch', 64, () => {
    const mark = line([[-52, 4], [-16, 40], [56, -38]]), pop = {s: [[14, [70, 70, 100], 'back'], [30, [100, 100, 100]]]};
    return [
      layer('slices', [group([rect([210, 10], [0, -30]), fill(P.white)], {o: [[0, 0, 'hold'], [24, 100, 'hold'], [26, 0, 'hold'], [35, 100, 'hold'], [36, 0]], p: [[24, [-30, 0], 'hold'], [35, [26, 44]]]})]),
      layer('check', [draws(mark, P.cyan, 18, 14, 26)], pop),
      layer('check red', [ink(mark, P.magenta, 18)], {...pop, p: [[22, [188, 204, 0], 'hold'], [24, [212, 196, 0], 'hold'], [34, [192, 200, 0], 'hold'], [36, [200, 200, 0]]], o: [[0, 0, 'hold'], [22, 80, 'hold'], [26, 0, 'hold'], [34, 80, 'hold'], [36, 0]]}),
      layer('check white', [ink(mark, P.white, 18)], {...pop, p: [[22, [210, 198, 0], 'hold'], [24, [190, 203, 0], 'hold'], [36, [200, 200, 0]]], o: [[0, 0, 'hold'], [22, 70, 'hold'], [26, 0]]}),
      layer('rays', [group([line([[0, -138], [0, -172]]), trim([[26, 0], [36, 100]], [[30, 0], [42, 100]]), stroke(P.amber, 6), repeat(8, {r: 45})])], {r: 22.5}),
      layer('ring', [draws(ellipse([238, 238]), P.cyan, 7, 0, 18)], {r: [[0, -120], [20, 0]], s: [[26, [100, 100, 100]], [31, [107, 107, 100], 'back'], [44, [100, 100, 100]]]}),
      layer('flash', [group([ellipse([238, 238]), fill(P.cyan)])], {o: [[0, 0], [25, 0], [28, 42], [44, 8]]}),
      layer('orbit', [ink(ellipse([286, 286]), P.dim, 2, {trim: trim(18, 0)}), ink(ellipse([286, 286]), P.dim, 2, {trim: trim(68, 50)})], {r: [[0, 0, 'lin'], [64, 96]], o: [[0, 0], [20, 0], [30, 100]]}),
    ];
  }),

  'cross-denied': doc('Cross denied', 64, () => {
    const shake = [[0, [200, 200, 0]], [26, [200, 200, 0], 'hold'], [28, [184, 200, 0], 'hold'], [30, [214, 200, 0], 'hold'], [32, [190, 200, 0], 'hold'], [34, [207, 200, 0], 'hold'], [36, [197, 200, 0], 'hold'], [38, [200, 200, 0]]];
    const a = line([[-48, -48], [48, 48]]), b = line([[48, -48], [-48, 48]]);
    return [
      layer('cross', [draws(a, P.red, 18, 10, 20), draws(b, P.red, 18, 17, 27)], {p: shake}),
      layer('cross ghost', [ink(a, P.cyan, 18), ink(b, P.cyan, 18)], {p: shake.map(([t, [x, y, z], e]) => [t, [400 - x + (t > 26 && t < 38 ? 6 : 0), y, z], e]), o: [[0, 0, 'hold'], [27, 75, 'hold'], [37, 0]]}),
      layer('bars', [group([rect([250, 8], [0, 62]), fill(P.white)], {o: [[0, 0, 'hold'], [28, 100, 'hold'], [30, 0, 'hold'], [33, 100, 'hold'], [34, 0]]}), group([rect([180, 14], [30, -70]), fill(P.magenta)], {o: [[0, 0, 'hold'], [30, 100, 'hold'], [32, 0]]})]),
      layer('octagon', [draws(line(ngon(8, 128, 22.5), true), P.magenta, 7, 0, 18)], {p: shake, s: [[27, [100, 100, 100]], [30, [108, 108, 100], 'back'], [44, [100, 100, 100]]]}),
      layer('flash', [group([line(ngon(8, 128, 22.5), true), fill(P.magenta)])], {p: shake, o: [[0, 0], [26, 0], [28, 50], [46, 10]]}),
      layer('warnings', [group([line([[-12, -168], [0, -150], [12, -168]], true), fill(P.amber), repeat(4, {r: 90})])], {o: [[0, 0, 'hold'], [28, 100, 'hold'], [33, 25, 'hold'], [38, 100, 'hold'], [43, 25, 'hold'], [48, 100]], r: 45}),
      layer('ticks', [ink(ellipse([316, 316]), P.dim, 8, {dash: [2, 14.544], cap: 1})], {o: [[0, 0], [14, 0], [24, 70]]}),
    ];
  }),

  'warning-flash': doc('Warning flash', 60, () => {
    const tri = r => line(ngon(3, r), true), up = [200, 216, 0];
    return [
      layer('mark', [ink(line([[0, -42], [0, 14]]), P.amber, 16), group([ellipse([18, 18], [0, 44]), fill(P.amber)])], {p: up, o: [[0, 100, 'hold'], [26, 20, 'hold'], [29, 100, 'hold'], [32, 20, 'hold'], [35, 100, 'hold'], [60, 100]]}),
      layer('triangle', [ink(tri(118), P.amber, 11), group([tri(118), fill(P.amber, [[0, 10], [30, 34], [60, 10]])])], {p: up, s: [[0, [100, 100, 100]], [30, [104, 104, 100]], [60, [100, 100, 100]]]}),
      ...[0, 30].map((shift, n) => layer('echo ' + n, [ink(tri(118), P.amber, 4)], {p: up, s: loop(60, shift, [[0, [100, 100, 100]], [60, [168, 168, 100]]]), o: loop(60, shift, [[0, 70], [60, 0]])})),
      layer('hazard', [ink(line([[-150, 0], [150, 0]]), P.amber, 14, {dash: [18, 14], offset: [[0, 0, 'lin'], [60, -64]], cap: 1})], {p: [200, 352, 0], o: 80}),
      layer('hazard rails', [ink(line([[-150, -14], [150, -14]]), P.dim, 2), ink(line([[-150, 14], [150, 14]]), P.dim, 2)], {p: [200, 352, 0]}),
      layer('corners', corners(360, 300, 28).map((c, i) => ink(c, P.magenta, 4, {o: loop(60, i % 2 * 15, [[0, 100, 'hold'], [15, 25, 'hold'], [30, 100, 'hold'], [45, 25, 'hold'], [60, 100]])})), {p: [200, 180, 0]}),
    ];
  }, true),

  ...Object.fromEntries([['upload', -1, 'Upload'], ['download', 1, 'Download']].map(([id, dir, name]) => [id, doc(name, 60, () => [
    layer('arrow', [ink(line([[0, -62 * dir], [0, 62 * dir]]), P.white, 14), ink(chevron(54, [0, 66 * dir], dir > 0 ? 180 : 0), P.white, 14)], {p: [[0, [200, 176 - 16 * dir, 0]], [30, [200, 176 + 16 * dir, 0]], [60, [200, 176 - 16 * dir, 0]]]}),
    ...[0, 1, 2].map(i => layer('stream ' + i, [ink(chevron(40, [0, 0], dir > 0 ? 180 : 0), i === 1 ? P.magenta : P.cyan, 8)], {p: loop(60, i * 20, [[0, [200, 165 - 125 * dir, 0], 'lin'], [60, [200, 165 + 125 * dir, 0]]]), o: loop(60, i * 20, [[0, 0], [14, 85], [34, 85], [52, 0], [60, 0]]), s: [62, 62, 100]})),
    layer('tray', [ink(line([[-104, 88], [-104, 124], [104, 124], [104, 88]]), P.cyan, 8, {cap: 3}), ...[0, 1, 2, 3, 4].map(i => group([rect([24, 9], [-64 + i * 32, 104]), fill(P.amber)], {o: loop(60, (dir > 0 ? i : 4 - i) * 8 + 20, [[0, 100], [18, 18], [52, 18], [60, 100]])}))], {p: [[0, [200, 200, 0]], [30, [200, 200 + 5 * dir, 0]], [60, [200, 200, 0]]]}),
    layer('rails', [-150, 150].map(x => ink(line([[x, -150], [x, 110]]), P.dim, 3, {dash: [6, 14], offset: [[0, 0, 'lin'], [60, -60 * dir]]}))),
  ], true)])),

  'level-up': doc('Level up', 66, () => [
    layer('star', [group([star(5, 88, 40), fill(P.amber, 22)]), ink(star(5, 88, 40), P.amber, 8)], {s: [[6, [0, 0, 100], 'back'], [24, [100, 100, 100]], [40, [100, 100, 100]], [52, [107, 107, 100]], [66, [100, 100, 100]]], r: [[6, -70], [26, 8], [36, -4], [46, 0]]}),
    layer('sparks', [group([rect([[14, [12, 12]], [44, [3, 3]]], [[14, [0, -70]], [44, [0, -176]]]), fill(P.cyan), repeat(8, {r: 45})])], {o: [[0, 0, 'hold'], [14, 100], [36, 100], [46, 0]]}),
    layer('sparks 2', [group([ellipse([[20, [10, 10]], [50, [2, 2]]], [[20, [0, -60]], [50, [0, -150]]]), fill(P.magenta), repeat(8, {r: 45})])], {r: 22.5, o: [[0, 0, 'hold'], [20, 100], [42, 100], [52, 0]]}),
    layer('ring', [ink(ellipse([200, 200]), P.cyan, [[14, 12], [42, 0]])], {s: [[14, [50, 50, 100]], [42, [178, 178, 100]]], o: [[0, 0, 'hold'], [14, 100], [42, 0]]}),
    ...[0, 1, 2].map(i => layer('rise ' + i, [ink(chevron(34, [0, 0]), P.white, 7)], {p: [[22 + i * 6, [200, 370 - i * 4, 0]], [50 + i * 6, [200, 318 - i * 30, 0]]], o: [[0, 0], [22 + i * 6, 0], [30 + i * 6, 90 - i * 25], [66, 50 - i * 14]]})),
    layer('halo', [ink(ellipse([300, 300]), P.dim, 2, {dash: [14, 12.18]})], {r: [[0, 0, 'lin'], [66, 40]], o: [[0, 0], [28, 0], [40, 70]]}),
  ]),

  // ---- Data ------------------------------------------------------------------------------------------------
  'data-transfer': doc('Data transfer', 60, () => [
    ...[0, 1, 2, 3].map(i => layer('packet ' + i, [group([rect([15, 15]), fill(P.cyan)], {r: 45})], {p: loop(60, i * 15, [[0, [92, 184, 0], 'lin'], [60, [308, 184, 0]]]), o: loop(60, i * 15, [[0, 0], [6, 100], [54, 100], [60, 0]])})),
    ...[0, 1].map(i => layer('reply ' + i, [group([rect([13, 13]), fill(P.amber)])], {p: loop(60, i * 30 + 8, [[0, [308, 218, 0], 'lin'], [60, [92, 218, 0]]]), o: loop(60, i * 30 + 8, [[0, 0], [6, 100], [54, 100], [60, 0]])})),
    ...[[70, P.cyan, 0], [330, P.magenta, 30]].map(([x, color, shift], n) => layer('node ' + n, [ink(hexagon(44), color, 6), group([hexagon(44), fill(color, loop(60, shift, [[0, 45], [18, 10], [60, 45]]))]), group([hexagon(15), fill(color)])],
      {p: [x, 200, 0], s: loop(60, shift, [[0, [112, 112, 100]], [16, [100, 100, 100]], [52, [100, 100, 100]], [60, [112, 112, 100]]])})),
    ...[[70, P.cyan, 0], [330, P.magenta, 30]].map(([x, color, shift], n) => layer('node ring ' + n, [ink(hexagon(44), color, 3)], {p: [x, 200, 0], s: loop(60, shift, [[0, [100, 100, 100]], [40, [190, 190, 100]], [60, [190, 190, 100]]]), o: loop(60, shift, [[0, 80], [40, 0], [60, 0]])})),
    layer('link', [ink(line([[-84, -16], [84, -16]]), P.dim, 2, {dash: [5, 9], offset: [[0, 0, 'lin'], [60, -56]]}), ink(line([[-84, 18], [84, 18]]), P.dim, 2, {dash: [5, 9], offset: [[0, 0, 'lin'], [60, 56]]})]),
    layer('ends', [ink(line([[-170, -84], [-170, -100], [170, -100], [170, -84]]), P.dim, 2), ink(line([[-170, 84], [-170, 100], [170, 100], [170, 84]]), P.dim, 2)], {o: 60}),
  ], true),

  'hex-assemble': doc('Hex assemble', 80, () => [
    layer('core', [ink(hexagon(46), P.amber, 6), group([hexagon(46), fill(P.amber, [[30, 80], [46, 20], [64, 20], [70, 60], [80, 22]])])], {s: [[26, [0, 0, 100], 'back'], [40, [100, 100, 100]]], r: [[26, -60], [42, 0]]}),
    ...Array.from({length: 6}, (_, i) => { const [x, y] = polar(86, i * 60 + 30), t = 2 + i * 4;
      return layer('cell ' + i, [draws(hexagon(46), P.cyan, 5, t, t + 12), group([hexagon(46), fill(P.cyan, [[t + 10, 0], [t + 16, 70], [t + 30, 10], [60 + i * 2, 10], [64 + i * 2, 55], [74 + i * 2, 12]])])],
        {p: [[t, [200 + x * 2.6, 200 + y * 2.6, 0], 'back'], [t + 18, [200 + x, 200 + y, 0]]], r: [[t, -120], [t + 18, 0]], s: [[t, [40, 40, 100], 'back'], [t + 18, [100, 100, 100]]], o: [[0, 0], [t, 0], [t + 5, 100]]}); }),
    layer('shell', [draws(hexagon(168), P.magenta, 4, 44, 62)], {r: [[44, 30], [66, 0]]}),
    layer('pins', [group([rect([10, 10], [0, -168]), fill(P.white), repeat(6, {r: 60})])], {o: [[0, 0, 'hold'], [60, 100, 'hold'], [63, 30, 'hold'], [66, 100]]}),
    layer('ticks', [ink(ellipse([372, 372]), P.dim, 8, {dash: [2, 17.477], cap: 1})], {o: [[0, 0], [50, 0], [62, 60]], r: [[0, 0, 'lin'], [80, 12]]}),
  ]),

  'gauge-dial': doc('Gauge dial', 80, () => {
    const value = .78, sweep = 270, to = -135 + sweep * value;
    return [
      layer('hub', [group([ellipse([34, 34]), fill(P.bg)]), ink(ellipse([34, 34]), P.amber, 5)]),
      layer('needle', [ink(line([[0, 14], [0, -104]]), P.amber, 7), group([line([[-9, -100], [9, -100], [0, -126]], true), fill(P.amber)])], {r: [[8, -135, 'back'], [42, to], [52, to - 5], [62, to + 2], [72, to]]}),
      layer('value', [ink(ellipse([264, 264]), P.cyan, 16, {trim: trim([[8, 12.5, 'back'], [42, 12.5 + 75 * value], [52, 12.5 + 75 * value - 1.4], [62, 12.5 + 75 * value + .5], [72, 12.5 + 75 * value]], 12.5), cap: 1})], {r: 180}),
      layer('track', [ink(ellipse([264, 264]), P.dim, 16, {trim: trim([[0, 12.5], [14, 87.5]], 12.5), cap: 1, o: 35})], {r: 180}),
      layer('ticks', [group([line([[0, -158], [0, -170]]), stroke(P.white, 3), repeat(11, {r: 27})], {r: -135}), group([line([[0, -158], [0, -164]]), stroke(P.dim, 2), repeat(10, {r: 27})], {r: -121.5})], {o: [[0, 0], [6, 0], [16, 100]]}),
      layer('red zone', [ink(ellipse([308, 308]), P.magenta, 5, {trim: trim(87.5, 72), cap: 1})], {r: 180, o: [[0, 0], [10, 0], [18, 100], [44, 100, 'hold'], [47, 30, 'hold'], [50, 100]]}),
      layer('readout', [0, 1, 2].map(i => group([rect([[34 + i * 8, [0, 12]], [44 + i * 8, [38 - i * 6, 12]]], [(i - 1) * 46, 0]), fill(i === 2 ? P.amber : P.teal)])), {p: [200, 300, 0]}),
      layer('base', [ink(line([[-96, 0], [96, 0]]), P.dim, 2)], {p: [200, 322, 0]}),
    ];
  }),

  'orbit-atoms': doc('Orbit atoms', 90, () => {
    const frames = Array.from({length: 31}, (_, k) => k * 3), tilt = [0, 60, 120];
    const spot = (k, t, lead) => { const a = (t / 90 + lead) * 2 * Math.PI, x = 150 * Math.cos(a), y = 52 * Math.sin(a), r = tilt[k] * Math.PI / 180; return [200 + x * Math.cos(r) - y * Math.sin(r), 200 + x * Math.sin(r) + y * Math.cos(r), 0]; };
    return [
      layer('nucleus', [group([ellipse([34, 34]), fill(P.amber)]), ink(ellipse([58, 58]), P.amber, 3)], {s: [[0, [100, 100, 100]], [22, [122, 122, 100]], [45, [100, 100, 100]], [67, [122, 122, 100]], [90, [100, 100, 100]]]}),
      ...tilt.flatMap((_, k) => [
        layer('electron ' + k, [group([ellipse([18, 18]), fill(P.white)]), ink(ellipse([34, 34]), [P.cyan, P.magenta, P.cyan][k], 3, {o: 70})], {p: frames.map(t => [t, spot(k, t, k / 3), 'lin'])}),
        layer('trail ' + k, [group([ellipse([10, 10]), fill([P.cyan, P.magenta, P.cyan][k])])], {p: frames.map(t => [t, spot(k, t, k / 3 - .035), 'lin']), o: 60}),
        layer('trail b ' + k, [group([ellipse([6, 6]), fill([P.cyan, P.magenta, P.cyan][k])])], {p: frames.map(t => [t, spot(k, t, k / 3 - .065), 'lin']), o: 35}),
      ]),
      ...tilt.map((deg, k) => layer('orbit ' + k, [ink(ellipse([300, 104]), [P.cyan, P.magenta, P.teal][k], 2.5, {o: 65})], {r: deg})),
      layer('frame', [ink(ellipse([352, 352]), P.dim, 2, {dash: [3, 10.823]})], {r: [[0, 0, 'lin'], [90, -15]], o: 60}),
    ];
  }, true),

  'pulse-line': doc('Pulse line', 60, () => {
    const beat = line([[-180, 0], [-70, 0], [-52, -22], [-36, 16], [-16, -92], [8, 74], [26, -28], [40, 0], [180, 0]]);
    return [
      layer('head', [group([ellipse([16, 16]), fill(P.white)])], {p: [[0, [20, 200, 0], 'lin'], [60, [380, 200, 0]]], o: [[0, 0], [6, 100], [18, 100, 'hold'], [34, 100], [54, 100], [60, 0]], s: [[18, [100, 100, 100]], [26, [0, 0, 100]], [33, [0, 0, 100]], [36, [100, 100, 100]]]}),
      layer('trace', [ink(beat, P.cyan, 6, {trim: trim([[0, 0, 'lin'], [60, 100]], [[0, 0], [14, 0, 'lin'], [60, 70]])})]),
      layer('ghost', [ink(beat, P.teal, 2, {o: 40})]),
      layer('grid', [group([line([[-180, -100], [-180, 100]]), stroke(P.grid, 1.5), repeat(10, {p: [40, 0]})]), group([line([[-180, -100], [180, -100]]), stroke(P.grid, 1.5), repeat(6, {p: [0, 40]})])]),
      layer('beat mark', [group([rect([12, 12]), fill(P.magenta)], {r: 45})], {p: [184, 76, 0], o: [[0, 20], [22, 20], [26, 100], [44, 20], [60, 20]], s: [[22, [100, 100, 100]], [26, [170, 170, 100]], [40, [100, 100, 100]]]}),
    ];
  }, true),

  // ---- Pointers --------------------------------------------------------------------------------------------
  'pointer-chevrons': doc('Pointer chevrons', 48, () => [
    ...[0, 1, 2].map(i => layer('chevron ' + i, [ink(chevron(58, [0, 0], 90), [P.cyan, P.cyan, P.white][i], 15 - (2 - i) * 2, {cap: 3})], {
      p: loop(48, i * 6, [[0, [92 + i * 74, 200, 0]], [8, [106 + i * 74, 200, 0]], [22, [92 + i * 74, 200, 0]], [48, [92 + i * 74, 200, 0]]]), o: loop(48, i * 6, [[0, 22], [8, 100], [24, 22], [48, 22]])})),
    layer('target', [group([rect([20, 20]), fill(P.amber)], {r: 45}), group([rect([20, 20]), stroke(P.amber, 3)], {r: 45, s: loop(48, 20, [[0, [100, 100]], [26, [300, 300]], [48, [300, 300]]]), o: loop(48, 20, [[0, 100], [26, 0], [48, 0]])})], {p: [338, 200, 0]}),
    layer('rails', [-74, 74].map(y => ink(line([[-170, y], [110, y]]), P.dim, 2, {dash: [10, 14], offset: [[0, 0, 'lin'], [48, -48]]}))),
  ], true),

  'callout-line': doc('Callout line', 66, () => [
    layer('origin', [group([ellipse([20, 20]), fill(P.amber)]), ink(ellipse([20, 20]), P.amber, 3, {tr: {s: [[4, [100, 100]], [26, [330, 330]]], o: [[4, 100], [26, 0]]}})], {p: [70, 318, 0], s: [[0, [0, 0, 100], 'back'], [10, [100, 100, 100]]]}),
    layer('leader', [draws(line([[-130, 118], [-56, 8], [-20, 8]]), P.white, 4, 6, 24), group([rect([10, 10], [-56, 8]), fill(P.white)], {o: [[0, 0, 'hold'], [16, 100, 'hold'], [19, 20, 'hold'], [22, 100]]})]),
    layer('lines', [0, 1, 2].map(i => group([rect([[32 + i * 5, [0, 9]], [46 + i * 5, [[150, 110, 70][i], 9]]], [[32 + i * 5, [0, -22 + i * 22]], [46 + i * 5, [[75, 55, 35][i], -22 + i * 22]]]), fill(i ? P.dim : P.white)])), {p: [200, 148, 0]}),
    layer('plate', [draws(chamferBox(204, 96, 16), P.cyan, 4, 20, 40), group([chamferBox(204, 96, 16), fill(P.cyan, [[0, 0], [36, 0], [40, 40], [54, 10]])])], {p: [284, 150, 0], s: [[20, [92, 92, 100], 'back'], [42, [100, 100, 100]]]}),
    layer('tab', [group([rect([[36, [0, 6]], [48, [58, 6]]], [[36, [0, 0]], [48, [29, 0]]]), fill(P.amber)])], {p: [182, 90, 0]}),
    layer('corner', [ink(line([[0, 26], [0, 0], [26, 0]]), P.amber, 4)], {p: [[40, [372, 222, 0], 'back'], [52, [392, 204, 0]]], r: 180, o: [[0, 0], [40, 0], [44, 100]]}),
  ]),

  'target-lock': doc('Target lock', 70, () => [
    layer('centre', [group([rect([16, 16]), fill(P.amber)], {r: 45})], {s: [[26, [0, 0, 100], 'back'], [36, [100, 100, 100]]]}),
    layer('lock ring', [ink(ellipse([150, 150]), P.amber, 7)], {s: [[26, [150, 150, 100], 'back'], [38, [100, 100, 100]]], o: [[0, 0, 'hold'], [26, 100]]}),
    ...[0, 1, 2, 3].map(i => layer('wedge ' + i, [group([line([[-20, -34], [20, -34], [0, 0]], true), fill(P.cyan)], {p: [[i * 2, [0, -196], 'back'], [18 + i * 2, [0, -92]], [26, [0, -92], 'back'], [32, [0, -80]], [70, [0, -80]]]})], {r: i * 90 + 45, o: [[0, 0], [i * 2, 0], [i * 2 + 4, 100]]})),
    layer('cross', [0, 90, 180, 270].map(deg => draws(line([[0, -98], [0, -186]]), P.white, 3, 10, 22, {tr: {r: deg}}))),
    layer('scan ring', [ink(ellipse([230, 230]), P.cyan, 5, {dash: [22, 14.128], cap: 1})], {r: [[0, -120], [28, 0, 'lin'], [70, 30]], o: [[0, 0], [8, 100]], s: [[26, [100, 100, 100]], [30, [93, 93, 100], 'back'], [42, [100, 100, 100]]]}),
    layer('flash', [group([ellipse([230, 230]), fill(P.amber)])], {o: [[0, 0], [25, 0], [28, 40], [42, 0]]}),
    layer('brackets', corners(340, 340, 40).map(c => ink(c, P.amber, 6, {cap: 3})), {s: [[0, [124, 124, 100]], [14, [124, 124, 100], 'back'], [30, [100, 100, 100]]], o: [[0, 0], [12, 0], [18, 100], [44, 100, 'hold'], [47, 30, 'hold'], [50, 100]]}),
  ]),

  'ring-emphasis': doc('Ring emphasis', 60, () => [
    layer('ring', [draws(ellipse([262, 262]), P.amber, 9, 0, 22)], {r: [[0, -200], [26, -60]], s: [[20, [100, 100, 100]], [26, [106, 106, 100], 'back'], [40, [100, 100, 100]]]}),
    layer('ring 2', [ink(ellipse([296, 296]), P.cyan, 4, {trim: trim([[8, 0], [32, 82]], [[14, 0], [40, 14]])})], {r: [[8, 40], [44, 250]]}),
    layer('ticks', [group([line([[0, -164], [0, -184]]), trim([[24, 0], [34, 100]]), stroke(P.white, 4), repeat(4, {r: 90})])], {r: [[24, 20], [44, 45]]}),
    layer('pulse', [ink(ellipse([262, 262]), P.amber, [[26, 8], [50, 0]])], {s: [[26, [100, 100, 100]], [50, [142, 142, 100]]], o: [[0, 0, 'hold'], [26, 70], [50, 0]]}),
    layer('underline', [draws(line([[-110, 0], [110, 0]]), P.cyan, 5, 30, 44), group([rect([12, 12], [[30, [-110, 0]], [44, [110, 0]]]), fill(P.white)], {o: [[0, 0, 'hold'], [30, 100]]})], {p: [200, 372, 0]}),
  ]),

  // ---- Reveals ---------------------------------------------------------------------------------------------
  'wipe-bars': doc('Wipe bars', 48, () => Array.from({length: 7}, (_, i) => { const y = -171.5 + i * 57.2, a = i * 2, color = [P.cyan, P.teal, P.cyan, P.magenta, P.cyan, P.teal, P.cyan][i];
    const size = [[a, [0, 58]], [a + 14, [400, 58]], [a + 20, [400, 58]], [a + 34, [0, 58]]], at = [[a, [-200, y]], [a + 14, [0, y]], [a + 20, [0, y]], [a + 34, [200, y]]];
    return layer('bar ' + i, [group([rect([[a, [6, 58]], [a + 34, [6, 58]]], [[a, [-200, y]], [a + 14, [200, y]], [a + 34, [200, y]]]), fill(P.white)], {o: [[a, 100], [a + 14, 100], [a + 16, 0]]}), group([rect(size, at), fill(color)])]);
  })),

  'iris-hex': doc('Iris hex', 54, () => [
    ...[0, 1, 2].map(i => layer('ring ' + i, [ink(hexagon(100), [P.white, P.magenta, P.amber][i], 5)], {s: [[16 + i * 5, [0, 0, 100]], [40 + i * 5, [300, 300, 100]]], r: [[16 + i * 5, 0], [40 + i * 5, 60]], o: [[16 + i * 5, 100], [32 + i * 5, 100], [40 + i * 5, 0]]})),
    layer('hole', [group([hexagon(100), fill(P.bg)])], {s: [[12, [0, 0, 100]], [34, [330, 330, 100]]], r: [[12, 0], [34, 60]]}),
    layer('cover', [group([hexagon(100), fill(P.cyan)])], {s: [[0, [0, 0, 100]], [18, [330, 330, 100]]], r: [[0, -60], [18, 0]]}),
  ]),

  'frame-reveal': doc('Frame reveal', 66, () => {
    const box = bezier([[-132, -100], [150, -100], [150, 82], [132, 100], [-150, 100], [-150, -82]], null, null, true);
    return [
      layer('title', [group([rect([[26, [0, 10]], [40, [120, 10]]], [[26, [-150, -124]], [40, [-90, -124]]]), fill(P.amber)])]),
      layer('frame', [draws(chamferBox(300, 200, 18), P.cyan, 5, 0, 22)]),
      layer('corner marks', corners(340, 240, 26).map((c, i) => ink(c, P.white, 4, {o: [[0, 0, 'hold'], [16 + i * 2, 100, 'hold'], [19 + i * 2, 25, 'hold'], [22 + i * 2, 100]]})), {s: [[14, [108, 108, 100], 'back'], [30, [100, 100, 100]]]}),
      layer('scan', [group([group([rect([4, 220], [40, 0]), fill(P.white)]), group([rect([120, 220], [-20, 0]), gradient([[0, P.cyan, 0], [1, P.cyan, .65]], [-80, 0], [40, 0])])], {p: [[14, [-220, 0], 'lin'], [50, [240, 0]]]})], {}, {mask: box}),   // the mask stays put; only the band inside it moves
      layer('contents', [group([line([[-150, -60], [150, -60]]), stroke(P.grid, 2), repeat(4, {p: [0, 40]})]), group([line([[-100, -100], [-100, 100]]), stroke(P.grid, 2), repeat(5, {p: [50, 0]})]), group([rect([300, 200]), fill(P.cyan, 7)])], {}, {mask: [[14, bezier([[-150, -100], [-150, -100], [-150, 100], [-150, 100]], null, null, true)], [50, bezier([[-150, -100], [150, -100], [150, 100], [-150, 100]], null, null, true)]]}),
      layer('side ticks', [group([line([[166, -90], [176, -90]]), stroke(P.dim, 3), repeat(10, {p: [0, 20]})])], {o: [[0, 0], [40, 0], [50, 100]]}),
    ];
  }),

  // ---- Backgrounds -----------------------------------------------------------------------------------------
  'grid-pulse': doc('Grid pulse', 90, () => [
    ...[[150, 100], [300, 250], [100, 300], [250, 50], [50, 200], [350, 150]].map(([x, y], i) => layer('cell ' + i, [group([rect([50, 50], [25, 25]), fill(i % 3 ? P.cyan : P.magenta)])], {p: [x, y, 0], o: loop(90, i * 15, [[0, 0], [8, 34], [30, 0], [90, 0]])})),
    ...[0, 45].map((shift, n) => layer('pulse ' + n, [ink(rect([50, 50]), n ? P.magenta : P.cyan, 1.2)], {s: loop(90, shift, [[0, [0, 0, 100], 'lin'], [90, [1200, 1200, 100]]]), o: loop(90, shift, [[0, 100], [70, 30], [90, 0]])})),
    layer('marks', [[100, 100], [300, 100], [100, 300], [300, 300]].map(([x, y], i) => group([line([[-9, 0], [9, 0]]), line([[0, -9], [0, 9]]), stroke(P.amber, 2.5)], {p: [x - 200, y - 200], o: loop(90, i * 22, [[0, 100], [20, 25], [70, 25], [90, 100]])}))),
    layer('grid', [group([line([[-200, -250], [-200, 250]]), stroke(P.grid, 1.5), repeat(9, {p: [50, 0]})]), group([line([[-250, -200], [250, -200]]), stroke(P.grid, 1.5), repeat(9, {p: [0, 50]})])], {o: [[0, 70], [45, 100], [90, 70]]}),
  ], true),

  'scan-lines': doc('Scan lines', 60, () => [
    layer('glitch', [group([rect([400, 5]), fill(P.white)])], {p: [[0, [200, 120, 0], 'hold'], [44, [200, 290, 0]]], o: [[0, 0, 'hold'], [18, 80, 'hold'], [20, 0, 'hold'], [44, 80, 'hold'], [45, 0]]}),
    layer('band', [group([rect([400, 90]), gradient([[0, P.cyan, 0], [.75, P.cyan, .5], [1, P.white, .85]], [0, -45], [0, 45])])], {p: [[0, [200, -50, 0], 'lin'], [60, [200, 450, 0]]]}),
    layer('band 2', [group([rect([400, 40]), gradient([[0, P.magenta, .5], [1, P.magenta, 0]], [0, -20], [0, 20])])], {p: loop(60, 22, [[0, [200, 430, 0], 'lin'], [60, [200, -30, 0]]])}),
    layer('lines', [group([line([[-200, -190], [200, -190]]), stroke(P.teal, 1.5), repeat(20, {p: [0, 20]})])], {o: 45}),
    layer('rulers', [-188, 188].map(x => ink(line([[x, -200], [x, 200]]), P.dim, 10, {dash: [2, 18], cap: 1, offset: [[0, 0, 'lin'], [60, -40]]}))),
  ], true),

  'particle-drift': doc('Particle drift', 120, () => Array.from({length: 30}, (_, i) => {
    const x = 20 + rnd(i + 1) * 360, size = 5 + Math.pow(rnd(i + 40), 2) * 13, shift = Math.floor(rnd(i + 80) * 120), sway = 8 + rnd(i + 120) * 22, color = rnd(i + 160) > .82 ? P.magenta : rnd(i + 200) > .85 ? P.amber : P.cyan;
    const shape = i % 3 === 0 ? [group([rect([size, size]), stroke(color, 1.5)], {r: 45})] : i % 3 === 1 ? [group([ellipse([size, size]), fill(color)])] : [group([rect([size, size]), fill(color)], {r: 45})];
    return layer('mote ' + i, [group(shape, {p: loop(120, shift * 2, [[0, [0, 0]], [30, [sway, 0]], [90, [-sway, 0]], [120, [0, 0]]])})], {p: loop(120, shift, [[0, [x, 430, 0], 'lin'], [120, [x, -30, 0]]]), o: loop(120, shift * 3, [[0, 25 + size * 5], [40, 90], [80, 30], [120, 25 + size * 5]])});
  }), true),
};

for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`animations/${id}.json`, import.meta.url), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations.`);
