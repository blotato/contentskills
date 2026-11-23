#!/usr/bin/env node
// Writes the Historical theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and license-clean: flat ink drawings
// in bone on the navy field with crimson as the only colour. Lines draw on, things settle; nothing bounces.
// Run: node library/themes/historical/lottie/generate.mjs
import {writeFileSync, mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {C} from '../kit.js';

const P = {bone: C.bone, paper: C.paper, silver: C.silver, steel: C.steel, slate: C.slate, navy: C.navy, night: C.night, char: C.char, crimson: C.crimson, blood: C.blood, ink: '#15181d'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
/** Animated property from [[frame, value], ...] with a long soft ease between keys. */
const keys = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [.15], y: [1]}, o: {x: [.3], y: [0]}} : {t, s: arr(s)})});
/** The same at constant speed: for turns that must loop without a hitch. */
const linear = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [1], y: [1]}, o: {x: [0], y: [0]}} : {t, s: arr(s)})});
const prop = v => v && v.a !== undefined ? v : Array.isArray(v) && Array.isArray(v[0]) ? keys(v) : still(v);

const fill = (color, o = 100) => ({ty: 'fl', c: still(rgb(color)), o: prop(o), r: 1});
const stroke = (color, width, dash) => ({ty: 'st', c: still(rgb(color)), o: still(100), w: still(width), lc: 2, lj: 2, ...(dash ? {d: [{n: 'd', nm: 'dash', v: still(dash[0])}, {n: 'g', nm: 'gap', v: still(dash[1])}]} : {})});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const rect = (size, at = [0, 0], radius = 0) => ({ty: 'rc', p: prop(at), s: prop(size), r: still(radius)});
const trim = (end, start = 0) => ({ty: 'tm', s: prop(start), e: prop(end), o: still(0), m: 1});
const line = (points, closed = false) => ({ty: 'sh', ks: still({v: points, i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), c: closed})});
const curve = (v, i, o, closed = true) => ({ty: 'sh', ks: still({v, i, o, c: closed})});
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: still([0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
let index = 0;
const layer = (name, shapes, ks = {}) => ({ddd: 0, ind: ++index, ty: 4, nm: name, sr: 1, ao: 0, bm: 0, ip: 0, op: 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: still([0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
/** loop: true means the last frame flows into the first, so players should not pause on the end. */
const doc = (name, frames, layers, loop = false, background = P.navy) => { index = 0; return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: layers(), meta: {g: 'library/themes/historical/lottie/generate.mjs', background, loop}}; };
/** A stroke that draws itself between two frames. */
const drawn = (shape, color, width, from, to, dash) => group([shape, trim([[0, 0], [from, 0], [to, 100]]), stroke(color, width, dash)]);
const fade = (from, to = from + 10) => [[0, 0], [from, 0], [to, 100]];
/** Pressed on: slightly large and invisible to exact, no overshoot. */
const pressS = (at, big = 130) => [[0, [big, big, 100]], [at, [big, big, 100]], [at + 8, [100, 100, 100]]];
const ring = (r, n = 24) => Array.from({length: n}, (_, i) => [Math.cos(i / n * 6.2832) * r, Math.sin(i / n * 6.2832) * r]);
const wobble = (r, n, amp, seed = 1) => { const v = ring(r, n).map(([x, y], i) => { const k = 1 + amp * Math.sin(i * 2.4 + seed) * Math.cos(i * 1.3 + seed * 2); return [x * k, y * k]; }), t = v.map(([x, y]) => [-y * .13, x * .13]); return curve(v, t.map(([x, y]) => [-x, -y]), t); };
const leaf = (len, wid) => curve([[0, 0], [len / 2, -wid], [len, 0], [len / 2, wid]], [[0, 0], [-len * .25, 0], [0, 0], [len * .25, 0]], [[0, 0], [len * .25, 0], [0, 0], [-len * .25, 0]]);

const animations = {
  'hourglass': doc('Hourglass', 120, () => [
    layer('glass', [
      group([rect([150, 12], [0, -96], 3), fill(P.bone)]), group([rect([150, 12], [0, 96], 3), fill(P.bone)]),
      group([line([[-58, -90], [58, -90], [5, 0], [58, 90], [-58, 90], [-5, 0]], true), stroke(P.bone, 6)]),
      group([line([[0, 4], [0, 84]]), stroke(P.crimson, 4)], {o: [[0, 0], [6, 100], [80, 100], [90, 0]]}),
      group([line([[-50, -82], [50, -82], [0, 0]], true), fill(P.crimson)], {p: [0, -2], s: linear([[0, [100, 100]], [90, [4, 4]], [119, [4, 4]]])}),
      group([line([[-50, 0], [50, 0], [0, -82]], true), fill(P.crimson)], {p: [0, 84], s: linear([[0, [4, 4]], [90, [100, 100]], [119, [100, 100]]])}),
    ], {r: [[0, 0], [92, 0], [119, 180]]}),
  ], true),

  'quill-line': doc('Quill line', 90, () => [
    layer('quill', [
      group([line([[0, 0], [70, -150]]), stroke(P.ink, 4)]),
      group([curve([[8, -18], [40, -60], [86, -168], [44, -128]], [[0, 0], [-30, 20], [10, 30], [30, -20]], [[-16, -20], [-6, -50], [-10, 20], [-10, 40]]), fill(P.bone)]),
      group([line([[0, 0], [8, -18], [-2, -16]], true), fill(P.silver)]),
    ], {s: [135, 135, 100], p: [[0, [70, 250, 0]], [10, [70, 250, 0]], [30, [150, 236, 0]], [50, [230, 262, 0]], [70, [330, 244, 0]], [89, [350, 200, 0]]], r: [[0, 8], [40, -4], [70, 6], [89, 14]]}),
    layer('ink', [drawn(curve([[-130, 50], [-50, 36], [30, 62], [130, 44]], [[0, 0], [-30, -24], [-30, 24], [-40, -10]], [[30, 24], [30, 24], [30, -24], [0, 0]], false), P.crimson, 7, 10, 70)]),
    layer('rule', [group([line([[-140, 96], [140, 96]]), stroke(P.steel, 2, [3, 9])])]),
  ]),

  'compass-settle': doc('Compass settle', 90, () => [
    layer('needle', [group([line([[0, -92], [16, 0], [-16, 0]], true), fill(P.crimson)]), group([line([[0, 92], [16, 0], [-16, 0]], true), fill(P.bone)]), group([ellipse([14, 14]), fill(P.navy)])], {r: [[0, -110], [28, 34], [48, -14], [64, 7], [78, -2], [89, 0]]}),
    layer('card', [
      ...Array.from({length: 16}, (_, i) => group([line([[0, -150], [0, i % 4 === 0 ? -122 : i % 2 === 0 ? -132 : -140]]), stroke(i === 0 ? P.crimson : P.bone, i % 4 === 0 ? 6 : 3)], {r: i * 22.5})),
      group([ellipse([316, 316]), stroke(P.bone, 5)]), group([ellipse([230, 230]), stroke(P.steel, 2, [3, 8])]),
    ], {r: [[0, -8], [89, 0]]}),
  ]),

  'stamp-press': doc('Stamp press', 75, () => [
    layer('handle', [group([rect([44, 90], [0, -100], 16), fill(P.bone)]), group([rect([150, 30], [0, -42], 5), fill(P.silver)]), group([rect([164, 14], [0, -22], 2), fill(P.ink)])],
      {p: [[0, [200, 60, 0]], [14, [200, 60, 0]], [24, [200, 236, 0]], [34, [200, 236, 0]], [52, [240, 40, 0]]], r: [[34, 0], [52, 10]], o: [[0, 100], [44, 100], [58, 0]]}),
    layer('mark', [group([rect([150, 64], [0, 0], 4), stroke(P.crimson, 6)]), group([line([[-52, -10], [52, -10]]), stroke(P.crimson, 9)]), group([line([[-52, 12], [22, 12]]), stroke(P.crimson, 9)]),
      group([ellipse([8, 8], [70, 44]), fill(P.crimson)]), group([ellipse([5, 5], [-84, -40]), fill(P.crimson)])], {p: [200, 246, 0], r: -5, o: [[0, 0], [25, 0], [27, 92]]}),
    layer('sheet', [group([rect([280, 170], [0, 0], 2), fill(P.paper)]), group([line([[-110, -52], [60, -52]]), stroke(C.putty, 5)])], {p: [200, 250, 0], r: 2}),
  ]),

  'date-flip': doc('Date flip', 90, () => [
    layer('rings', [-50, 50].map(x => group([rect([12, 40], [x, -92], 6), fill(P.silver)]))),
    ...[0, 1, 2].map(k => layer('leaf ' + k, [
      group([rect([190, 46], [0, -64]), fill(k === 2 ? P.crimson : P.char)]),
      ...(k === 2 ? [group([line([[-40, 12], [40, 12]]), stroke(P.ink, 12)]), group([line([[-40, 44], [10, 44]]), stroke(P.ink, 12)])] : [group([line([[-40, 28], [40, 28]]), stroke(P.silver, 12)])]),
      group([rect([190, 174], [0, 0], 3), fill(k === 2 ? P.bone : P.paper)]),
    ], k === 2 ? {p: [200, 210, 0]} : {p: [200, 210, 0], s: [[0, [100, 100, 100]], [12 + k * 26, [100, 100, 100]], [30 + k * 26, [100, 0, 100]]], o: [[0, 100], [28 + k * 26, 100], [30 + k * 26, 0]]})),
  ]),

  'film-reel': doc('Film reel', 90, () => [
    layer('reel', [
      group([ellipse([44, 44]), fill(P.navy)]), ...Array.from({length: 5}, (_, i) => group([ellipse([78, 78], [0, -92]), fill(P.navy)], {r: i * 72})),
      group([ellipse([300, 300]), fill(P.bone)]), group([ellipse([324, 324]), stroke(P.silver, 6)]),
    ], {p: [180, 190, 0], r: linear([[0, 0], [89, 72]])}),
    layer('strip', [group([line([[-10, 0], [200, 0]]), stroke(P.navy, 5, [8, 14])]), group([line([[-20, 0], [220, 0]]), stroke(P.crimson, 26)])], {p: [200, 352, 0]}),
  ], true),

  'candle': doc('Candle', 60, () => [
    layer('flame', [group([curve([[0, -34], [14, 0], [0, 14], [-14, 0]], [[0, 0], [0, -14], [8, 0], [0, 8]], [[4, 12], [0, 8], [-8, 0], [0, -14]]), fill(P.crimson)], {p: [0, 6], s: [50, 50]}),
      group([curve([[0, -34], [14, 0], [0, 14], [-14, 0]], [[0, 0], [0, -14], [8, 0], [0, 8]], [[4, 12], [0, 8], [-8, 0], [0, -14]]), fill(P.bone)])],
      {p: [200, 132, 0], s: [[0, [200, 200, 100]], [14, [186, 226, 100]], [30, [206, 192, 100]], [44, [190, 218, 100]], [59, [200, 200, 100]]], r: [[0, -3], [20, 4], [40, -5], [59, -3]]}),
    layer('glow', [group([ellipse([230, 230]), fill(P.steel, 16)])], {p: [200, 120, 0], s: [[0, [100, 100, 100]], [30, [112, 112, 100]], [59, [100, 100, 100]]]}),
    layer('candle', [group([line([[0, -74], [0, -92]]), stroke(P.ink, 4)]), group([rect([58, 190], [0, 22], 6), fill(P.bone)]), group([rect([150, 16], [0, 126], 4), fill(P.silver)]), group([line([[14, -70], [14, -20]]), stroke(P.paper, 8)])], {p: [200, 236, 0]}),
  ], true),

  'route-pin': doc('Route pin', 90, () => [
    layer('pin', [group([ellipse([22, 22], [0, -52]), fill(P.navy)]), group([curve([[0, 0], [-30, -52], [0, -84], [30, -52]], [[0, 0], [0, 22], [-18, 0], [0, -18]], [[-10, -18], [0, -18], [18, 0], [0, 22]]), fill(P.crimson)])],
      {p: [[0, [304, 96, 0]], [58, [304, 96, 0]], [70, [304, 136, 0]]], o: fade(58, 66)}),
    layer('start', [group([ellipse([22, 22]), fill(P.bone)]), group([ellipse([40, 40]), stroke(P.bone, 3)])], {p: [84, 300, 0], o: fade(2, 10)}),
    layer('route', [drawn(curve([[-116, 100], [-40, 20], [40, 40], [104, -64]], [[0, 0], [-40, 10], [-30, 10], [-20, 40]], [[30, -50], [30, -10], [30, -10], [0, 0]], false), P.crimson, 6, 8, 60, [14, 12])]),
    layer('land', [group([wobble(150, 18, .16, 3), stroke(P.steel, 3)]), group([wobble(150, 18, .16, 3), fill(P.slate)])], {p: [196, 204, 0]}),
  ]),

  'scroll-open': doc('Scroll open', 90, () => [
    ...[-1, 1].map(s => layer('roll ' + s, [group([rect([30, 214], [0, 0], 13), fill(P.bone)]), group([rect([30, 214], [0, 0], 13), stroke(C.putty, 3)]), group([ellipse([18, 18], [0, -112]), fill(P.crimson)]), group([ellipse([18, 18], [0, 112]), fill(P.crimson)])],
      {p: [[0, [200 + s * 16, 200, 0]], [8, [200 + s * 16, 200, 0]], [50, [200 + s * 150, 200, 0]]]})),
    layer('lines', [-56, -24, 8, 40].map((y, k) => drawn(line([[-104, y], [k === 3 ? 10 : 104, y]]), P.ink, 6, 44 + k * 9, 60 + k * 9)).concat([group([ellipse([34, 34], [78, 58]), fill(P.crimson)], {o: fade(80, 86)})])),
    layer('paper', [group([rect([[0, [10, 190]], [8, [10, 190]], [50, [290, 190]]]), fill(P.paper)])]),
  ]),

  'clock-sweep': doc('Clock sweep', 90, () => [
    layer('hub', [group([ellipse([18, 18]), fill(P.crimson)])]),
    layer('long hand', [group([line([[0, 14], [0, -112]]), stroke(P.bone, 6)])], {r: [[0, 60], [8, 60], [80, 1140]]}),
    layer('short hand', [group([line([[0, 10], [0, -72]]), stroke(P.bone, 10)])], {r: [[0, 305], [8, 305], [80, 395]]}),
    layer('face', [...Array.from({length: 12}, (_, i) => group([line([[0, -142], [0, i % 3 === 0 ? -118 : -130]]), stroke(i === 0 ? P.crimson : P.bone, i % 3 === 0 ? 7 : 3)], {r: i * 30})),
      group([ellipse([316, 316]), stroke(P.bone, 6)]), group([ellipse([316, 316]), fill(P.char)]), group([rect([26, 30], [0, -172], 6), fill(P.silver)])]),
  ]),

  'laurel': doc('Laurel', 90, () => [
    layer('mark', [group([ellipse([30, 30]), fill(P.crimson)])], {s: pressS(62), o: fade(62, 68), p: [200, 196, 0]}),
    ...[-1, 1].flatMap(s => [
      layer('leaves ' + s, Array.from({length: 7}, (_, i) => { const deg = 112 + i * 23, a = deg * Math.PI / 180, r = deg + 60;
        return group([leaf(54, 13), fill(P.bone)], {p: [-s * Math.cos(a) * 118, Math.sin(a) * 118], r: s < 0 ? r : 180 - r, o: fade(14 + i * 6, 22 + i * 6)}); }), {p: [200, 196, 0]}),
      layer('stem ' + s, [drawn(curve([[s * 14, 136], [s * 128, 40], [s * 96, -96]], [[0, 0], [s * -10, 60], [s * 30, 50]], [[s * 60, -10], [s * 10, -60], [0, 0]], false), P.silver, 5, 4, 56)], {p: [200, 196, 0]}),
    ]),
  ]),

  'wax-seal': doc('Wax seal', 75, () => [
    layer('emboss', [drawn(curve(ring(52, 4), [[0, -29], [29, 0], [0, 29], [-29, 0]], [[0, 29], [-29, 0], [0, -29], [29, 0]]), P.blood, 7, 24, 50), group([line([[0, -30], [9, -9], [30, -9], [13, 6], [19, 28], [0, 15], [-19, 28], [-13, 6], [-30, -9], [-9, -9]], true), fill(P.blood)], {o: fade(44, 54)})], {p: [200, 180, 0]}),
    layer('wax', [group([wobble(92, 14, .1, 2), fill(P.crimson)])], {p: [200, 180, 0], s: pressS(10, 135), o: fade(10, 14)}),
    layer('ribbons', [group([line([[-40, 0], [-76, 150], [-44, 132], [-16, 156], [0, 0]], true), fill(P.bone)]), group([line([[40, 0], [80, 144], [48, 130], [22, 156], [0, 0]], true), fill(P.silver)])], {p: [200, 200, 0], o: fade(0, 8)}),
  ]),
};

const dir = fileURLToPath(new URL('./animations/', import.meta.url)); mkdirSync(dir, {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(dir + id + '.json', JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations: ${Object.keys(animations).join(', ')}`);
