#!/usr/bin/env node
// Writes the Grunge theme's original Lottie animations in animations/*.json.
// Authored as code so they stay small, editable and licence-clean. Lottie has no texture filters,
// so the look comes from geometry and timing: wobbly marker strokes, torn-paper polygons with a
// white fibre edge, tape with pinked ends, splats, speckle holes punched in fills, and stop-motion:
//   boil   every drawn path exists in 3 wobble variants, swapped by HOLD keyframes ~8 times a second
//   steps  draw-ons, slides and slams move on held keys (twos/threes), never glide
// All randomness comes from the seeded hash below.
// Run: node library/themes/grunge/lottie/generate.mjs
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {soot: '#0b0a09', char: '#1b1a18', bone: '#ece6d8', white: '#fbf8f0', red: '#f2440f', lime: '#b9f227', tape: '#d8c592', dust: '#8e887d'};
const BOIL = 4;                       // frames per boil step at 30 fps (7.5 redraws a second)
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
const wob = (i, seed, amp) => (hash(i, seed) - .5) * 2 * amp;
const noise = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
/** Held keyframes from [[frame, value], ...]: the value jumps, it never glides. */
const steps = frames => ({a: 1, k: frames.map(([t, s]) => ({t, s: arr(s), h: 1}))});
const prop = v => v && v.a !== undefined ? v : Array.isArray(v) && Array.isArray(v[0]) ? steps(v) : still(v);
/** [[frame, value]...] moving from a to b between f0 and f1 in held steps of `every` frames, with an optional ease. */
const stepped = (f0, f1, a, b, every = 2, ease = x => 1 - (1 - x) ** 2) => { const out = [[0, a]]; for (let f = f0; f < f1; f += every) { const q = ease((f - f0 + every) / (f1 - f0)); out.push([f, Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * Math.min(1, q)) : a + (b - a) * Math.min(1, q)]); } out.push([f1, b]); return out.filter((k, i, all) => !i || k[0] > all[i - 1][0]); };

const fill = (color, opacity = 100) => ({ty: 'fl', c: still(rgb(color)), o: still(opacity), r: 2});      // even-odd: inner shapes punch holes
const stroke = (color, width, cap = 2) => ({ty: 'st', c: still(rgb(color)), o: still(100), w: still(width), lc: cap, lj: 2});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const trim = (end, start = 0) => ({ty: 'tm', s: prop(start), e: prop(end), o: still(0), m: 1});
const bez = (pts, closed) => ({v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]), c: closed});
const line = (points, closed = false) => ({ty: 'sh', ks: still(bez(points, closed))});
/** Catmull-Rom style smoothing so marker strokes bend instead of kinking. */
const smooth = (pts, closed = false, k = .22) => { const n = pts.length, at = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; return {v: pts, c: closed, i: pts.map((p, i) => [-(at(i + 1)[0] - at(i - 1)[0]) * k, -(at(i + 1)[1] - at(i - 1)[1]) * k]), o: pts.map((p, i) => [(at(i + 1)[0] - at(i - 1)[0]) * k, (at(i + 1)[1] - at(i - 1)[1]) * k])}; };
/**
 * A path that boils: make(seed) returns its points; three variants are swapped on hold keys for
 * `frames` frames. `round` smooths it like a marker; otherwise it is a hard polygon.
 */
const boil = (make, frames, {closed = false, round = true, seed = 1, from = 0} = {}) => {
  const variants = [0, 1, 2].map(i => { const pts = make(seed + i * 5.3); return round ? smooth(pts, closed) : bez(pts, closed); });
  const k = []; for (let f = from, i = 0; f < frames; f += BOIL, i++) k.push({t: f, s: [variants[i % 3]], h: 1});
  return {ty: 'sh', ks: {a: 1, k}};
};
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: still([0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
let index = 0;
const layer = (name, shapes, ks = {}) => ({ddd: 0, ind: ++index, ty: 4, nm: name, sr: 1, ao: 0, bm: 0, ip: 0, op: 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: still([0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
/** loop: true means the last frame flows into the first, so players should not pause on the end. */
const doc = (name, frames, layers, loop = false, background = P.soot) => { index = 0; N = frames; return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: layers(), meta: {g: 'library/themes/grunge/lottie/generate.mjs', background, loop}}; };
let N = 60;                           // length of the animation being built, so boil() can default to it

// ---- motion ----
/** A stamp slam: oversized, down in 3 frames, a squash, then settled. Layer scale keys. */
const slamS = (at, from = 260) => [[0, [0, 0, 100]], [at, [from, from, 100]], [at + 1, [from * .62, from * .62, 100]], [at + 2, [112, 112, 100]], [at + 3, [94, 94, 100]], [at + 5, [100, 100, 100]]];
/** The shake after a hit, and a small boil of the position afterwards. Layer position keys around (x, y). */
const shakeP = (at, x = 200, y = 200, seed = 1, until = N) => { const k = [[0, [x, y, 0]], [at + 3, [x + 9, y - 6, 0]], [at + 5, [x - 7, y + 5, 0]], [at + 7, [x, y, 0]]]; for (let f = at + 11, i = 0; f < until; f += BOIL, i++) k.push([f, [x + wob(i % 3, seed, 1.6), y + wob(i % 3, seed + 1, 1.6), 0]]); return k; };
/** A held wobble of rotation, for things that should feel hand-placed. */
const wobR = (base, seed = 1, amp = 1.2, from = 0, until = N) => { const k = []; for (let f = from, i = 0; f < until; f += BOIL, i++) k.push([f, base + wob(i % 3, seed, amp)]); return k; };
/** Pop on in three held frames. */
const popS = (at, big = 122) => [[0, [0, 0, 100]], [at, [70, 70, 100]], [at + 2, [big, big, 100]], [at + 4, [100, 100, 100]]];
/** Stepped draw-on for a trim path: 0 -> 100 between two frames, on twos. */
const drawOn = (f0, f1, every = 2) => stepped(f0, f1, 0, 100, every, x => x);

// ---- shapes (all return point lists for a given seed) ----
const circlePts = (rx, ry = rx, turns = 1.42, amp = .04) => seed => { const n = 26, a0 = -2.2 + wob(0, seed, .25), out = []; for (let i = 0; i <= n * turns; i++) { const a = a0 + i / n * Math.PI * 2, g = 1 + i / n * .06; out.push([Math.cos(a) * rx * g * (1 + wob(i, seed, amp)), Math.sin(a) * ry * g * (1 + wob(i, seed + 1, amp))]); } return out; };
const zigPts = (x0, x1, y, h, teeth, amp = 6) => seed => { const out = [[x0, y + wob(0, seed, amp)]]; for (let i = 1; i <= teeth * 2; i++) { const q = i / (teeth * 2); out.push([x0 + (x1 - x0) * (q + (i % 2 ? .05 : -.03)) + wob(i, seed, amp), y + (i % 2 ? -h : h * .4) * (.65 + .5 * hash(i, 3)) + wob(i, seed + 2, amp * .7)]); } return out; };
const strokePts = (pts, amp = 5) => seed => pts.map((p, i) => [p[0] + wob(i, seed, amp), p[1] + wob(i, seed + 1, amp)]);
const burstPts = (r, points = 9, squash = .82) => seed => Array.from({length: points * 2}, (_, i) => { const a = i / (points * 2) * Math.PI * 2 + wob(i, seed, .08), rr = i % 2 ? r * (.52 + wob(i, 7, .08)) + wob(i, seed + 1, 4) : r * (1 + wob(i, 8, .2)) + wob(i, seed + 2, 6); return [Math.cos(a) * rr, Math.sin(a) * rr * squash]; });
/** A torn rectangle: ragged on the sides named in `sides`, cut (slightly crooked) on the others. */
const tornPts = (x, y, w, h, {amp = 7, step = 12, sides = 'trbl', tear = 1} = {}) => seed => {
  const c = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map((p, i) => [p[0] + wob(i, tear + 50, 3), p[1] + wob(i, tear + 51, 3)]), out = [];
  c.forEach((a, s) => { const b = c[(s + 1) % 4], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / step)), nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len, rag = 'trbl'[s] && sides.includes('trbl'[s]);
    for (let i = 0; i < n; i++) { const q = i / n, o = rag ? ((noise(q * len / 40, tear + s * 17) - .5) * 1.5 + (hash(i, tear + s * 17 + 3) - .5) * .9) * amp + wob(i + s * 40, seed, .8) : wob(i + s * 40, seed, .5); out.push([a[0] + (b[0] - a[0]) * q + nx * o, a[1] + (b[1] - a[1]) * q + ny * o]); } });
  return out;
};
/** Paper: a white fibre edge behind a sheet, both boiling very slightly. Returns shape groups (sheet first = on top). */
const paper = (x, y, w, h, color, {sides = 'trbl', tear = 1, amp = 7, holes = 0, rim = true} = {}) => [
  group([boil(tornPts(x, y, w, h, {sides, tear, amp}), N, {closed: true, round: false, seed: tear}), ...specks(x, y, w, h, holes, tear), fill(color)]),
  ...(rim ? [group([boil(tornPts(x - 4, y - 4, w + 8, h + 8, {sides, tear: tear + 31, amp: amp * 1.3, step: 9}), N, {closed: true, round: false, seed: tear + 2}), fill(P.white)])] : []),
  group([line(tornPts(x + 7, y + 9, w, h, {sides, tear, amp})(tear), true), fill('#000000', 45)]),
];
/** Small ragged holes inside a box: add to a filled group to wear the ink away. */
function specks(x, y, w, h, n, seed = 1) {
  return Array.from({length: n}, (_, i) => { const px = x + w * (.06 + .88 * hash(i, seed + 60)), py = y + h * (.08 + .84 * hash(i, seed + 61)), s = 1.2 + 3.2 * hash(i, seed + 62) ** 2; return line([[px, py], [px + s * (.8 + .6 * hash(i, seed + 63)), py + s * wob(i, seed + 64, .5)], [px + s * .4, py + s * (.6 + .6 * hash(i, seed + 65))]], true); });
}
/** Soot specks laid over a mark, clustered: toner dropout for strokes, which cannot be punched. */
const wear = (r, n, seed = 1, color = P.soot) => group([...Array.from({length: n}, (_, i) => { const a = hash(i, seed) * 6.283, d = r * Math.sqrt(hash(i, seed + 1)), px = Math.cos(a) * d, py = Math.sin(a) * d, s = 1.5 + 5 * hash(i, seed + 2) ** 2; return line([[px, py], [px + s * 1.5, py + wob(i, seed + 3, s)], [px + s * .5, py + s * 1.2]], true); }), {ty: 'fl', c: still(rgb(color)), o: still(100), r: 1}]);
/** Masking tape centred on (0, 0): pinked ends, a pale sheen line. */
const tape = (w, h, seed = 1) => { const teeth = 5, zig = (x, dir) => Array.from({length: teeth * 2 + 1}, (_, i) => [x + (i % 2 ? dir * 7 : 0) + wob(i, seed, 1.5), -h / 2 + i * h / (teeth * 2)]);
  return [group([line([[-w / 2 + 8, -h * .2], [w / 2 - 8, -h * .2]]), stroke(P.white, h * .12, 1)], {o: 30}), group([line([...zig(-w / 2, -1).reverse(), ...zig(w / 2, 1)], true), fill(P.tape, 92)])]; };
/** An ink blob: lumpy outline points. */
const blobPts = (r, lumps = 20, tear = 1) => seed => Array.from({length: lumps}, (_, i) => { const a = i / lumps * Math.PI * 2, rr = r * (.66 + .46 * noise(i * .9, tear) + (hash(i, tear + 1) > .76 ? .42 * hash(i, tear + 2) : 0)) + wob(i, seed, r * .025); return [Math.cos(a) * rr, Math.sin(a) * rr]; });

const marker = (shape, color, width, extra = []) => group([shape, ...extra, stroke(color, width)]);

const animations = {
  // ---------------- Marks ----------------
  'scribble-circle': doc('Scribble circle', 60, () => [
    layer('ring', [marker(boil(circlePts(128, 104), 60), P.bone, 12, [trim(drawOn(4, 22))])], {r: wobR(-6, 2, .8)}),
    layer('second pass', [marker(boil(circlePts(136, 112, 1.1, .05), 60, {seed: 9}), P.bone, 5, [trim(drawOn(18, 30))])], {r: wobR(8, 3, .8), o: 70}),
  ]),

  'scribble-underline': doc('Scribble underline', 54, () => [
    layer('underline', [marker(boil(strokePts([[-150, 4], [-40, -12], [70, -4], [158, -10], [60, 14], [-60, 20], [-128, 32], [-10, 30], [120, 24]], 5), 54), P.red, 13, [trim(drawOn(4, 20))])], {p: [200, 236, 0]}),
    layer('words', [0, 1].map(i => group([line([[-120 + i * 50, -60 + i * 34], [120 - i * 70, -60 + i * 34]]), stroke(P.dust, 16, 1)])), {o: 55}),
  ]),

  'arrow-scrawl': doc('Arrow scrawl', 60, () => [
    layer('head', [marker(boil(strokePts([[40, 96], [112, 104], [96, 30]], 5), 60, {round: false, seed: 4}), P.bone, 13, [trim(drawOn(20, 28))])]),
    layer('shaft', [marker(boil(strokePts([[-124, -108], [-70, -30], [-92, 10], [-20, -6], [30, 50], [108, 100]], 6), 60), P.bone, 13, [trim(drawOn(4, 20))])]),
    layer('dot', [group([boil(blobPts(16, 10, 5), 60, {closed: true, seed: 3}), fill(P.red)])], {p: [324, 318, 0], s: popS(28)}),
  ]),

  'cross-out': doc('Cross out', 50, () => [
    layer('wear', [wear(120, 26, 4)], {o: [[0, 0], [8, 100]]}),
    layer('slash b', [marker(boil(strokePts([[112, -104], [20, -8], [-108, 112]], 7), 50, {seed: 6}), P.red, 26, [trim(drawOn(11, 17))])], {p: shakeP(14, 200, 200, 3)}),
    layer('slash a', [marker(boil(strokePts([[-110, -110], [-6, 8], [114, 106]], 7), 50), P.red, 26, [trim(drawOn(3, 9))])], {p: shakeP(6, 200, 200, 2)}),
  ]),

  'check-scrawl': doc('Check scrawl', 60, () => [
    layer('tick', [marker(boil(strokePts([[-78, -6], [-28, 62], [8, 20], [128, -128]], 6), 60), P.lime, 24, [trim(drawOn(18, 28))])]),
    layer('box', [marker(boil(strokePts([[-112, -92], [92, -100], [100, 96], [-98, 104], [-104, -112]], 6), 60, {round: false, seed: 5}), P.bone, 11, [trim(drawOn(3, 17))])], {r: wobR(-2, 4, .7)}),
  ]),

  'burst-star': doc('Burst star', 60, () => [
    layer('core', [group([boil(blobPts(26, 12, 3), 60, {closed: true, seed: 2}), fill(P.red)])], {s: popS(12, 140)}),
    layer('burst', [marker(boil(burstPts(150), 60, {closed: true, round: false}), P.bone, 10)], {s: popS(3, 118), r: steps([[0, -14], [5, 4], [7, 0], ...wobR(0, 5, 1.5, 11)])}),
    layer('ticks', Array.from({length: 7}, (_, k) => group([line([[0, -168 - (k % 2) * 8], [wob(k, 2, 6), -190 - (k % 3) * 6]]), stroke(P.bone, 7)], {r: k * 51 + 12})), {o: [[0, 0], [9, 100], [34, 100], [36, 0], [38, 100], [40, 0]]}),
  ]),

  'question-scrawl': doc('Question scrawl', 60, () => [
    layer('dot', [group([boil(blobPts(17, 10, 8), 60, {closed: true, seed: 6}), fill(P.red)])], {p: [204, 330, 0], s: slamS(22, 300)}),
    layer('hook', [marker(boil(strokePts([[-62, -70], [-40, -122], [16, -138], [64, -104], [58, -50], [14, -10], [2, 36], [4, 72]], 5), 60), P.bone, 26, [trim(drawOn(3, 19))])], {r: wobR(4, 3, 1.2)}),
    layer('echo', [marker(boil(circlePts(150, 164, 1.1, .03), 60, {seed: 12}), P.dust, 5, [trim(drawOn(26, 40))])], {o: 70}),
  ]),

  'asterisk-boil': doc('Asterisk boil', 48, () => [
    layer('asterisk', [0, 1, 2, 3].map(k => marker(boil(strokePts([[0, -132 + (k % 2) * 14], [wob(k, 3, 8), 0], [0, 128 - (k % 3) * 10]], 5), 48, {seed: k * 3 + 1}), P.red, 34, []) ).map((g, k) => group([g], {r: k * 45})), {r: steps(Array.from({length: 6}, (_, i) => [i * 8, i * 15]))}),
    layer('wear', [wear(126, 30, 9)]),
  ], true),

  // ---------------- Paper and ink ----------------
  'stamp-hit': doc('Stamp hit', 54, () => [
    layer('wear', [wear(150, 54, 5)], {o: [[0, 0], [7, 100]], p: shakeP(4, 200, 200, 4)}),
    layer('stamp', [
      group([line(burstPts(54, 5, 1)(3), true), fill(P.red)], {r: -18}),
      group([ellipse([236, 236]), stroke(P.red, 7)]),
      group([ellipse([292, 292]), stroke(P.red, 18)]),
      ...Array.from({length: 16}, (_, k) => group([line([[0, -124], [0, -134]]), stroke(P.red, 8, 1)], {r: k * 22.5})),
    ], {s: slamS(4), r: steps([[0, -24], [6, -9]]), p: shakeP(4, 200, 200, 4)}),
    layer('ghost', [group([ellipse([292, 292]), stroke(P.red, 18)])], {o: [[0, 0], [7, 22], [11, 0]], s: [[0, [108, 108, 100]]], p: [208, 204, 0]}),
  ]),

  'tape-slap': doc('Tape slap', 60, () => [
    layer('tape', tape(170, 46, 2), {p: [[0, [200, 96, 0]], [14, [200, 108, 0]], [16, [200, 104, 0]]], r: steps([[0, -40], [14, -9], [16, -6], ...wobR(-6, 2, .6, 20)]), s: [[0, [0, 0, 100]], [14, [150, 150, 100]], [16, [96, 96, 100]], [18, [100, 100, 100]]]}),
    layer('scrap', [
      ...[0, 1, 2].map(i => group([line([[-84, -22 + i * 36], [84 - i * 44, -22 + i * 36]]), stroke(i ? P.dust : P.red, i ? 12 : 20, 1)])),
      ...paper(-120, -74, 240, 176, P.bone, {sides: 'rb', tear: 4, holes: 14}),
    ], {p: [[0, [200, 480, 0]], [3, [200, 300, 0]], [5, [200, 222, 0]], [7, [200, 214, 0]]], r: steps([[0, 9], [5, 5], [7, 3], [14, 3], [16, 4], ...wobR(4, 6, .5, 20)])}),
  ]),

  'ink-splat': doc('Ink splat', 54, () => [
    layer('blob', [group([boil(blobPts(92, 22, 2), 54, {closed: true, seed: 1}), ...specks(-50, -50, 100, 100, 9, 3), fill(P.red)])], {s: [[0, [0, 0, 100]], [3, [44, 44, 100]], [5, [124, 124, 100]], [7, [96, 96, 100]], [9, [100, 100, 100]]]}),
    layer('drops', Array.from({length: 16}, (_, i) => { const a = hash(i, 9) * 6.283, d = 112 + 78 * hash(i, 10) ** 1.6, r = 4 + 15 * hash(i, 11) ** 2, at = 5 + Math.floor(hash(i, 12) * 3) * 2;
      return group([ellipse([r * 2, r * (1.5 + hash(i, 13))]), fill(P.red)], {p: [[0, [Math.cos(a) * 60, Math.sin(a) * 60]], [at, [Math.cos(a) * d * .8, Math.sin(a) * d * .8]], [at + 2, [Math.cos(a) * d, Math.sin(a) * d]]], r: a * 180 / Math.PI + 90, o: [[0, 0], [at, 100]]}); })),
    layer('drips', [0, 1, 2].map(i => group([line([[-40 + i * 38, 40], [-40 + i * 38 + wob(i, 4, 4), 150 - i * 26]]), trim(drawOn(12 + i * 5, 40 + i * 4, 3)), stroke(P.red, 9 - i * 2)]))),
  ]),

  'highlight-stroke': doc('Highlight stroke', 54, () => [
    layer('inked word', [group([line([[-150, 12], [96, 12]]), trim(drawOn(8, 20)), stroke(P.soot, 22, 1)])]),
    layer('stroke', [group([boil(strokePts([[-170, 10], [-64, 17], [36, 7], [150, 13]], 3), 54), trim(drawOn(8, 20)), stroke(P.lime, 46, 1)])]),
    layer('words', [[-150, 150, -30], [-150, 96, 12], [-150, 20, 54]].map(([a, b, y]) => group([line([[a, y], [b, y]]), stroke(P.bone, 22, 1)]))),
  ]),

  'torn-strip-wipe': doc('Torn strip wipe', 60, () => [
    layer('red strip', paper(-190, -40, 380, 80, P.red, {sides: 'tb', tear: 9, rim: false, holes: 8, amp: 5}), {p: steps(stepped(10, 24, [-260, 268, 0], [214, 268, 0], 2)), r: wobR(-5, 3, .5)}),
    layer('label', [0, 1].map(i => group([line([[-150, -12 + i * 30], [60 - i * 80, -12 + i * 30]]), stroke(P.soot, i ? 10 : 18, 1)])), {p: steps(stepped(2, 16, [640, 172, 0], [190, 172, 0], 2)), r: 4}),
    layer('bone strip', paper(-230, -62, 460, 124, P.bone, {sides: 'tb', tear: 5, holes: 18, amp: 9}), {p: steps(stepped(2, 16, [640, 170, 0], [190, 170, 0], 2)), r: wobR(4, 2, .5)}),
  ]),

  // ---------------- Status ----------------
  'pen-test': doc('Pen test', 64, () => [
    layer('zigzag', [marker(boil(zigPts(-150, 150, 14, 62, 5), 64), P.bone, 12, [trim(steps([...drawOn(0, 24), [48, 100]]), steps([[0, 0], ...drawOn(40, 62).slice(1)]))])]),
    layer('nib', [group([boil(blobPts(13, 9, 4), 64, {closed: true, seed: 2}), fill(P.red)])], {p: steps(stepped(0, 24, [50, 214, 0], [350, 190, 0], 2, x => x)), o: [[0, 100], [26, 0]]}),
  ], true),

  'tally-count': doc('Tally count', 66, () => [
    layer('slash', [marker(boil(strokePts([[-150, 70], [-20, 6], [152, -76]], 6), 66, {seed: 8}), P.red, 20, [trim(drawOn(42, 48))])], {p: shakeP(45, 200, 200, 5)}),
    layer('marks', [0, 1, 2, 3].map(k => marker(boil(strokePts([[-108 + k * 72 + wob(k, 2, 8), -104], [-104 + k * 72, 0], [-110 + k * 72 + wob(k, 3, 8), 108]], 5), 66, {seed: k * 2 + 1}), P.bone, 18, [trim(drawOn(4 + k * 9, 9 + k * 9))]))),
  ]),

  'target-scribble': doc('Target scribble', 60, () => [
    layer('cross', [marker(boil(strokePts([[-22, -20], [22, 22]], 3), 60), P.red, 14, [trim(drawOn(30, 34))]), marker(boil(strokePts([[22, -22], [-20, 22]], 3), 60, {seed: 4}), P.red, 14, [trim(drawOn(34, 38))])], {p: shakeP(34, 200, 200, 6)}),
    layer('spiral', [marker(boil(seed => Array.from({length: 46}, (_, i) => { const a = i * .5, r = 150 - i * 2.7; return [Math.cos(a) * r * (1 + wob(i, seed, .04)), Math.sin(a) * r * .9 * (1 + wob(i, seed + 1, .04))]; }), 60), P.bone, 9, [trim(drawOn(3, 30))])]),
  ]),
};

mkdirSync(new URL('animations/', import.meta.url), {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`animations/${id}.json`, import.meta.url), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations.`);
