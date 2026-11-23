#!/usr/bin/env node
// Writes the Horror theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and licence-clean: thin bone-white
// line-work on near-black with one rose accent, and motion that stutters, flickers or creeps
// (stepped "hold" keyframes for the flicker, slow eases for the creep) rather than bouncing.
// Run: node library/themes/horror/lottie/generate.mjs
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {void: '#030405', slate: '#0d1115', steel: '#2b343b', fog: '#8d979f', bone: '#e9e6df', rose: '#e0556b', blood: '#9c1c30', cold: '#b9c8ee', warm: '#ffd98a'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
/** Animated property from [[frame, value], ...] with a slow ease between keys. */
const keys = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [.3], y: [1]}, o: {x: [.5], y: [0]}} : {t, s: arr(s)})});
/** Constant speed, for loops. */
const linear = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [1], y: [1]}, o: {x: [0], y: [0]}} : {t, s: arr(s)})});
/** Stepped: each value holds until the next key. This is the theme's flicker. */
const hold = frames => ({a: 1, k: frames.map(([t, s]) => ({t, s: arr(s), h: 1}))});
const prop = v => v && v.a !== undefined ? v : Array.isArray(v) && Array.isArray(v[0]) ? keys(v) : still(v);
/** Seeded 0..1, so every run writes the same files. */
const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A failing-lamp opacity track: mostly `on`, with short seeded dips. Ends as it starts, so it loops. */
const flicker = (frames, seed = 1, on = 100, off = 12, rate = .16) => { const k = [[0, on]]; for (let f = 2; f < frames - 3; f += 2) if (hash(f, seed) < rate) { k.push([f, hash(f, seed + 1) < .6 ? off : on * .45]); k.push([f + 1 + Math.floor(hash(f, seed + 2) * 2), on]); f += 3; } k.push([frames - 1, on]); return hold(k); };
/** Switching on: a few stuttering frames starting at `at`, then steady. */
const stutter = (at, on = 100) => hold([[0, 0], [at, on], [at + 2, 10], [at + 3, on], [at + 5, 25], [at + 6, on]]);

const fill = (color, o = 100) => ({ty: 'fl', c: still(rgb(color)), o: prop(o), r: 1});
const stroke = (color, width, o = 100) => ({ty: 'st', c: still(rgb(color)), o: prop(o), w: prop(width), lc: 2, lj: 2});
const dash = (color, width, d, g) => ({...stroke(color, width), lc: 1, d: [{n: 'd', nm: 'dash', v: still(d)}, {n: 'g', nm: 'gap', v: still(g)}]});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const rect = (size, at = [0, 0], radius = 0) => ({ty: 'rc', p: prop(at), s: prop(size), r: still(radius)});
const trim = (end, start = 0, offset = 0) => ({ty: 'tm', s: prop(start), e: prop(end), o: prop(offset), m: 1});
const line = (points, closed = false) => ({ty: 'sh', ks: still({v: points, i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), c: closed})});
const curve = (v, i, o, closed = true) => ({ty: 'sh', ks: still({v, i, o, c: closed})});
const morph = frames => ({ty: 'sh', ks: {a: 1, k: frames.map(([t, v, i, o], n) => { const s = [{v, i: i ?? v.map(() => [0, 0]), o: o ?? v.map(() => [0, 0]), c: true}]; return n < frames.length - 1 ? {t, s, i: {x: .3, y: 1}, o: {x: .5, y: 0}} : {t, s}; })}});
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: still([0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
let index = 0;
const layer = (name, shapes, ks = {}) => ({ddd: 0, ind: ++index, ty: 4, nm: name, sr: 1, ao: 0, bm: 0, ip: 0, op: 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: still([0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
/** loop: true means the last frame flows into the first, so players should not pause on the end. */
const doc = (name, frames, layers, loop = false, background = P.slate) => { index = 0; return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: layers(), meta: {g: 'library/themes/horror/lottie/generate.mjs', background, loop}}; };
const W = 6;   // the theme's line weight at this size
const ekg = (x0, w, amp) => [[0, 0], [.2, 0], [.26, -.14], [.32, 0], [.42, 0], [.46, .18], [.5, -1], [.55, .45], [.6, 0], [.74, 0], [.82, -.22], [.9, 0], [1, 0]].map(([x, y]) => [x0 + x * w, y * amp]);
const brackets = (s, len) => [[[-s, -s + len], [-s, -s], [-s + len, -s]], [[s - len, -s], [s, -s], [s, -s + len]], [[s, s - len], [s, s], [s - len, s]], [[-s + len, s], [-s, s], [-s, s - len]]].map(p => group([line(p), stroke(P.bone, W)]));

const animations = {
  'rec-blink': doc('Rec blink', 60, () => [
    layer('dot', [group([ellipse([64, 64]), fill(P.rose)])], {o: hold([[0, 100], [30, 0], [59, 0]])}),
    layer('ring', [group([ellipse([104, 104]), stroke(P.bone, 4, 60)])]),
    layer('frame', brackets(150, 46), {s: [[0, [100, 100, 100]], [30, [103, 103, 100]], [59, [100, 100, 100]]]}),
  ], true),
  'pulse-line': doc('Pulse line', 60, () => [
    layer('head', [group([ellipse([18, 18]), fill(P.bone)])], {p: linear([[0, [30, 200, 0]], [59, [370, 200, 0]]]), o: hold([[0, 100], [56, 0]])}),
    layer('trace', [group([line([...ekg(-170, 170, 96), ...ekg(0, 170, 96).slice(1)]), stroke(P.rose, W), trim(linear([[0, 0], [59, 100]]), linear([[0, 0], [20, 0], [59, 62]]))])]),
    layer('ghost', [group([line([...ekg(-170, 170, 96), ...ekg(0, 170, 96).slice(1)]), stroke(P.rose, 3, 22)])]),
    layer('grid', [group([line([[-170, 0], [170, 0]]), dash(P.fog, 2, 3, 14)])], {o: 50}),
  ], true),
  'bulb-flicker': doc('Bulb flicker', 90, () => [
    layer('glow', [group([ellipse([230, 230], [0, -8]), fill(P.warm, 14)]), group([ellipse([150, 150], [0, -8]), fill(P.warm, 22)])], {o: flicker(90, 3, 100, 0, .2)}),
    layer('filament', [group([line([[-18, 16], [-10, -14], [0, 10], [10, -14], [18, 16]]), stroke(P.warm, 4)])], {o: flicker(90, 3, 100, 15, .2)}),
    layer('bulb', [group([curve([[0, -76], [58, -18], [26, 46], [-26, 46], [-58, -18]], [[-32, 0], [0, -30], [12, -14], [0, 14], [0, 30]], [[32, 0], [0, 30], [0, 14], [-12, -14], [0, -30]]), stroke(P.bone, W)]), group([rect([52, 30], [0, 62], 4), stroke(P.bone, W)]), group([line([[-26, 62], [26, 62]]), stroke(P.bone, 3)])]),
    layer('wire', [group([line([[0, -76], [0, -200]]), stroke(P.fog, 3)])]),
  ], true),
  'eye-open': doc('Eye open', 90, () => [
    layer('pupil', [group([ellipse([34, 34]), fill(P.void)]), group([ellipse([78, 78]), fill(P.rose)])], {p: [[0, [200, 200, 0]], [30, [200, 200, 0]], [42, [236, 200, 0]], [58, [236, 200, 0]], [66, [164, 200, 0]], [80, [164, 200, 0]], [89, [200, 200, 0]]], s: hold([[0, [0, 0, 100]], [14, [100, 100, 100]], [84, [100, 100, 100]]])}),
    layer('lids', [group([morph([[0, [[-130, 0], [0, 4], [130, 0], [0, -4]], [[0, 0], [-60, 0], [0, 0], [60, 0]], [[0, 0], [60, 0], [0, 0], [-60, 0]]], [10, [[-130, 0], [0, 4], [130, 0], [0, -4]], [[0, 0], [-60, 0], [0, 0], [60, 0]], [[0, 0], [60, 0], [0, 0], [-60, 0]]], [22, [[-130, 0], [0, 74], [130, 0], [0, -74]], [[0, 0], [-70, 0], [0, 0], [70, 0]], [[0, 0], [70, 0], [0, 0], [-70, 0]]], [78, [[-130, 0], [0, 74], [130, 0], [0, -74]], [[0, 0], [-70, 0], [0, 0], [70, 0]], [[0, 0], [70, 0], [0, 0], [-70, 0]]], [89, [[-130, 0], [0, 4], [130, 0], [0, -4]], [[0, 0], [-60, 0], [0, 0], [60, 0]], [[0, 0], [60, 0], [0, 0], [-60, 0]]]]), stroke(P.bone, W)])]),
    layer('lashes', [-80, -40, 0, 40, 80].map(x => group([line([[x, -90 + Math.abs(x) * .35], [x * 1.15, -112 + Math.abs(x) * .4]]), stroke(P.fog, 3)])), {o: hold([[0, 0], [20, 100], [80, 0]])}),
  ], true),
  'clock-tick': doc('Clock tick', 120, () => [
    layer('second', [group([line([[0, 18], [0, -116]]), stroke(P.rose, 3)])], {r: hold(Array.from({length: 12}, (_, i) => [i * 10, i < 8 ? i * 6 : 42 + (i % 2 ? 4 : 0)]))}),
    layer('hands', [group([line([[0, 0], [0, -92]]), stroke(P.bone, W)], {r: 84}), group([line([[0, 0], [0, -62]]), stroke(P.bone, 9)], {r: 97}), group([ellipse([18, 18]), fill(P.rose)])]),
    layer('face', [group([ellipse([280, 280]), stroke(P.bone, 4)]), ...Array.from({length: 12}, (_, k) => group([line([[0, -124], [0, k % 3 ? -112 : -100]]), stroke(P.bone, k % 3 ? 3 : 5)], {r: k * 30}))]),
  ], true),
  'candle': doc('Candle', 60, () => [
    layer('glow', [group([ellipse([210, 210], [0, -70]), fill(P.warm, 12)])], {s: [[0, [100, 100, 100]], [14, [108, 108, 100]], [31, [96, 96, 100]], [47, [106, 106, 100]], [59, [100, 100, 100]]], o: flicker(60, 5, 100, 55, .12)}),
    layer('flame', [group([morph([[0, [[0, -150], [26, -84], [0, -52], [-26, -84]], [[0, 0], [0, -26], [16, 0], [0, 20]], [[0, 0], [0, 20], [-16, 0], [0, -26]]], [15, [[10, -158], [24, -86], [0, -52], [-24, -82]], [[0, 0], [4, -30], [16, 0], [0, 20]], [[4, 0], [0, 20], [-16, 0], [-4, -26]]], [32, [[-8, -146], [28, -82], [0, -52], [-22, -86]], [[0, 0], [-2, -22], [16, 0], [0, 20]], [[-4, 0], [0, 20], [-16, 0], [2, -30]]], [46, [[4, -162], [22, -86], [0, -52], [-26, -84]], [[0, 0], [2, -30], [16, 0], [0, 20]], [[2, 0], [0, 20], [-16, 0], [-2, -26]]], [59, [[0, -150], [26, -84], [0, -52], [-26, -84]], [[0, 0], [0, -26], [16, 0], [0, 20]], [[0, 0], [0, 20], [-16, 0], [0, -26]]]]), stroke(P.warm, W)]), group([ellipse([14, 26], [0, -74]), fill(P.warm)])]),
    layer('candle', [group([line([[0, -52], [0, -34]]), stroke(P.fog, 4)]), group([rect([64, 150], [0, 42], 4), stroke(P.bone, W)]), group([line([[-32, -8], [-32, 18]]), stroke(P.bone, 10)]), group([line([[-120, 120], [120, 120]]), stroke(P.fog, 3)])]),
  ], true),
  'moon-cloud': doc('Moon and cloud', 120, () => [
    ...[0, 1].map(i => layer('cloud ' + i, [group([rect([190, 26], [0, 0], 13), fill(P.slate)]), group([rect([120, 26], [40, -22], 13), fill(P.slate)]), group([line([[-95, 13], [95, 13]]), stroke(P.fog, 3)])], {p: linear([[0, [-120 + i * 260, 170 + i * 70, 0]], [119, [140 + i * 260, 170 + i * 70, 0]]]), o: i ? [[0, 100], [90, 100], [119, 0]] : [[0, 0], [30, 100]]})),
    layer('moon', [group([ellipse([34, 34], [-36, -30]), stroke(P.fog, 3)]), group([ellipse([22, 22], [40, 22]), stroke(P.fog, 3)]), group([ellipse([180, 180]), stroke(P.bone, W), fill(P.steel, 60)])]),
    layer('halo', [group([ellipse([260, 260]), stroke(P.cold, 2, 40)]), group([ellipse([330, 330]), stroke(P.cold, 2, 18)])], {o: [[0, 60], [60, 100], [119, 60]]}),
  ], true),
  'warning': doc('Warning', 60, () => [
    layer('mark', [group([line([[0, -42], [0, 28]]), stroke(P.rose, 14)]), group([ellipse([18, 18], [0, 62]), fill(P.rose)])], {o: hold([[0, 100], [8, 0], [12, 100], [20, 100], [24, 20], [26, 100], [59, 100]])}),
    layer('triangle', [group([line([[0, -120], [128, 96], [-128, 96]], true), stroke(P.bone, W)])], {s: [[0, [100, 100, 100]], [30, [104, 104, 100]], [59, [100, 100, 100]]]}),
    layer('echo', [group([line([[0, -120], [128, 96], [-128, 96]], true), stroke(P.rose, 3)])], {s: linear([[0, [100, 100, 100]], [59, [140, 140, 100]]]), o: linear([[0, 60], [59, 0]]), p: [200, 204, 0]}),
  ], true),
  'static-bars': doc('Static bars', 48, () => Array.from({length: 11}, (_, i) =>
    layer('bar ' + i, [group([rect(hold(Array.from({length: 12}, (_, k) => [k * 4, [40 + hash(i * 13 + k, 1) * 300, 10 + hash(i, 2) * 12]])), hold(Array.from({length: 12}, (_, k) => [k * 4, [(hash(i * 7 + k, 3) - .5) * 80, 0]]))), fill(i % 4 === 2 ? P.rose : P.bone, hold(Array.from({length: 12}, (_, k) => [k * 4, 20 + hash(i * 5 + k, 4) * 80])))])], {p: [200, 50 + i * 30, 0]})), true),
  'door-creak': doc('Door creak', 90, () => [
    layer('door', [group([rect([150, 250], [75, 0]), stroke(P.bone, W), fill(P.slate)]), group([ellipse([14, 14], [128, 10]), fill(P.bone)])], {p: [125, 200, 0], s: [[0, [100, 100, 100]], [15, [100, 100, 100]], [70, [58, 100, 100]], [89, [58, 100, 100]]]}),
    layer('light', [group([rect([150, 250]), fill(P.cold, 85)])], {o: flicker(90, 6, 100, 30, .1)}),
    layer('spill', [group([line([[75, 125], [150, 190], [-40, 190], [-75, 125]], true), fill(P.cold, 22)])], {o: [[0, 0], [15, 0], [70, 100]]}),
    layer('frame', [group([rect([166, 266]), stroke(P.fog, 4)]), group([line([[-150, 133], [150, 133]]), stroke(P.fog, 3)])]),
  ]),
  'key-turn': doc('Key turn', 75, () => [
    layer('key', [group([ellipse([74, 74], [0, -86]), stroke(P.bone, W)]), group([ellipse([22, 22], [0, -92]), stroke(P.bone, 4)]), group([line([[0, -49], [0, 96]]), stroke(P.bone, W)]), group([line([[0, 64], [30, 64]]), stroke(P.bone, W)]), group([line([[0, 92], [22, 92]]), stroke(P.bone, W)])], {r: [[0, 0], [18, 0], [30, 42], [34, 36], [38, 42], [74, 42]], p: [[0, [200, 150, 0]], [14, [200, 200, 0]]], o: stutter(2)}),
    layer('click', [0, 1, 2].map(k => group([line([[86, -20 + k * 20], [112, -26 + k * 26]]), stroke(P.rose, 4)])), {o: hold([[0, 0], [30, 100], [36, 0], [38, 100], [46, 0]])}),
    layer('plate', [group([rect([120, 190], [0, 20], 10), stroke(P.fog, 4)]), group([ellipse([30, 30], [0, 0]), fill(P.void)]), group([line([[0, 0], [0, 44]]), stroke(P.void, 14)])], {p: [200, 220, 0]}),
  ]),
  'magnifier': doc('Magnifier', 90, () => [
    layer('glass', [group([ellipse([120, 120]), stroke(P.bone, W), fill(P.cold, 8)]), group([line([[44, 44], [104, 104]]), stroke(P.bone, 12)])], {p: [[0, [110, 150, 0]], [30, [200, 230, 0]], [55, [280, 150, 0]], [70, [240, 190, 0]], [89, [240, 190, 0]]]}),
    layer('found', [group([ellipse([40, 40]), stroke(P.rose, 5)]), group([ellipse([10, 10]), fill(P.rose)])], {p: [240, 190, 0], o: stutter(68), s: [[68, [160, 160, 100]], [78, [100, 100, 100]]]}),
    layer('lines', [-90, -40, 10, 60].map((y, k) => group([line([[-140, y], [140 - k * 30, y]]), dash(P.fog, 4, 18, 10)])), {o: 55}),
  ]),
  'cross-out': doc('Cross out', 60, () => [
    layer('strike', [group([line([[-150, 8], [-60, -6], [40, 10], [150, -4]]), stroke(P.rose, 10), trim([[18, 0], [34, 100]])])]),
    layer('strike 2', [group([line([[-140, -12], [-20, 6], [80, -10], [146, 12]]), stroke(P.rose, 7), trim([[34, 0], [46, 100]])])]),
    layer('words', [[-120, 70], [-28, 96], [92, 76]].map(([x, w]) => group([rect([w, 30], [x + 0, 0], 3), fill(P.bone)])), {o: hold([[0, 0], [3, 100], [5, 20], [6, 100], [46, 100], [48, 45]])}),
    layer('rule', [group([line([[-160, 48], [160, 48]]), stroke(P.fog, 3)])]),
  ]),
  'signal-lost': doc('Signal lost', 90, () => [
    ...[0, 1, 2, 3].map(k => layer('bar ' + k, [group([rect([34, 40 + k * 34], [0, -(40 + k * 34) / 2], 3), fill(P.bone)])], {p: [110 + k * 52, 270, 0], o: hold([[0, 100], [18 + (3 - k) * 12, 25], [22 + (3 - k) * 12, 100], [26 + (3 - k) * 12, 14], [89, 14]])})),
    layer('cross', [group([line([[-26, -26], [26, 26]]), stroke(P.rose, 9)]), group([line([[26, -26], [-26, 26]]), stroke(P.rose, 9)])], {p: [316, 150, 0], o: hold([[0, 0], [66, 100], [69, 20], [71, 100], [78, 30], [80, 100]])}),
    layer('base', [group([line([[-120, 0], [120, 0]]), stroke(P.fog, 3)])], {p: [200, 286, 0]}),
  ]),
  'scan-frame': doc('Scan frame', 75, () => [
    layer('beam', [group([line([[-140, 0], [140, 0]]), stroke(P.rose, 4)]), group([rect([280, 34], [0, -17]), fill(P.rose, 14)])], {p: [[0, [200, 70, 0]], [37, [200, 330, 0]], [74, [200, 70, 0]]]}),
    layer('frame', brackets(150, 52), {o: flicker(75, 8, 100, 30, .08)}),
    layer('subject', [group([ellipse([70, 80], [0, -34]), stroke(P.fog, 4)]), group([curve([[-90, 110], [-56, 26], [56, 26], [90, 110]], [[0, 0], [-30, 0], [0, 0], [0, -40]], [[0, -40], [0, 0], [30, 0], [0, 0]], false), stroke(P.fog, 4)])]),
  ], true),
};

const dir = new URL('./animations/', import.meta.url);
mkdirSync(dir, {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`${id}.json`, dir), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations`);
