#!/usr/bin/env node
// Writes the Lines of Light theme's original Lottie animations in animations/*.json.
// Authored as code so they stay small, editable and licence-clean. Every stroke is a line of light
// drawn four times, as in the theme's kit: a soft lilac glow, a red echo offset up-left that trails the
// draw, a blue echo offset down-right that leads it, and a white core, all screen-blended on
// near-black. Red marks the cause (a red dot that fires the first line), blue the result arriving
// (a blue flash). Draw-ons are slow quartic ease-outs with a hard lock: no bounce, no overshoot.
// Run: node library/themes/lines-of-light/lottie/generate.mjs
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {bg: '#040506', core: '#f5f3ff', lilac: '#f0d6f2', red: '#ff2e40', blue: '#286eff', dim: '#56625f'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
/** Animated property from [[frame, value], ...]; quartic-ish ease-out between keys (fast start, long settle). */
const keys = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [.2], y: [1]}, o: {x: [.25], y: [.9]}} : {t, s: arr(s)})});
const linear = frames => ({a: 1, k: frames.map(([t, s], i) => i < frames.length - 1 ? {t, s: arr(s), i: {x: [1], y: [1]}, o: {x: [0], y: [0]}} : {t, s: arr(s)})});
const isKeys = v => Array.isArray(v) && Array.isArray(v[0]) && typeof v[0][0] === 'number' && v[0].length === 2 && (Array.isArray(v[0][1]) || typeof v[0][1] === 'number') && v.length > 1 && v.every(k => Array.isArray(k) && k.length === 2);
const prop = v => v && v.a !== undefined ? v : isKeys(v) ? keys(v) : still(v);
/** Shift a key list in time (the echoes' lag and lead). */
const shift = (v, d) => isKeys(v) ? v.map(([t, s]) => [Math.max(0, t + d), s]) : v?.a ? {...v, k: v.k.map(k => ({...k, t: Math.max(0, k.t + d)}))} : v;
const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };

const fill = (color, o = 100) => ({ty: 'fl', c: still(rgb(color)), o: prop(o), r: 1});
const stroke = (color, width, o = 100) => ({ty: 'st', c: still(rgb(color)), o: prop(o), w: prop(width), lc: 2, lj: 2});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const trim = (s, e, o = 0) => ({ty: 'tm', s: prop(s), e: prop(e), o: prop(o), m: 1});
const line = (points, closed = false) => ({ty: 'sh', ks: still({v: points, i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), c: closed})});
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: still([0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
/** A circle as a path starting at angle a0 (deg, 0 = right, 90 = down) going clockwise; dir -1 goes the other way. */
const circle = (r, a0 = -90, dir = 1, n = 48) => line(Array.from({length: n + 1}, (_, i) => { const a = (a0 + dir * 360 * i / n) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; }));
const arc = (r, a0, a1, n = 32) => line(Array.from({length: n + 1}, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; }));

/** Gaussian blur effect (lottie-web renders it as an SVG filter): the soft halo round every line. */
const blur = r => ({ty: 29, nm: 'Gaussian Blur', np: 5, ix: 1, en: 1, ef: [{ty: 0, nm: 'Blurriness', ix: 1, v: still(r)}, {ty: 7, nm: 'Blur Dimensions', ix: 2, v: still(1)}, {ty: 7, nm: 'Repeat Edge Pixels', ix: 3, v: still(0)}]});
let index = 0;
const layer = (name, shapes, ks = {}, bm = 2) => ({ddd: 0, ind: ++index, ty: 4, nm: name, sr: 1, ao: 0, bm, ip: 0, op: 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: still([0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
/**
 * A line of light: `paths` drawn as glow + red echo + blue echo + white core (top first in the returned
 * list). draw: {s, e, o} trim tracks (values or [[frame, value], ...]); the red echo trails by `lag`
 * frames, the blue leads by `lag / 2`. color: 'core' (default) or a theme colour; echo: false for red cause-lines.
 */
const lit = (name, paths, {w = 5, draw = null, color = 'core', echo = true, ks = {}, o = 100} = {}) => {
  const tr = (d) => draw ? [trim(shift(draw.s ?? 0, d), shift(draw.e ?? 100, d), draw.o ?? 0)] : [];
  const p = ks.p ?? [200, 200, 0], at = (dx, dy) => isKeys(p) ? p.map(([t, v]) => [t, [v[0] + dx, v[1] + dy, 0]]) : [p[0] + dx, p[1] + dy, 0];
  const col = P[color] ?? color, lag = 3;
  const out = [layer(name + ' core', [group([...paths, ...tr(0), stroke(col, w, o)])], ks)];
  if (echo) out.push(layer(name + ' blue', [group([...paths, ...tr(-lag / 2), stroke(P.blue, w * .85, o * .85)])], {...ks, p: at(3, 3)}), layer(name + ' red', [group([...paths, ...tr(lag), stroke(P.red, w * .85, o * .85)])], {...ks, p: at(-3, -3)}));
  const glow = layer(name + ' glow', [group([...paths, ...tr(0), stroke(color === 'core' ? P.lilac : col, w * 2.4, o * .7)])], ks);
  glow.ef = [blur(w * 2.6)]; out.push(glow);
  return out;
};
/** A solid red dot (the cause) with a ring blooming off it. */
const redDot = (at, from = 0, r = 22) => [
  layer('dot', [group([ellipse([r, r]), fill(P.red)]), group([ellipse([r * 2.2, r * 2.2]), fill(P.red, 25)])], {p: at, o: [[from, 0], [from + 3, 100]]}, 0),
  layer('bloom', [group([ellipse([r, r]), stroke(P.red, 3)])], {p: at, s: [[from, [100, 100, 100]], [from + 20, [380, 380, 100]]], o: [[from, 0], [from + 2, 100], [from + 20, 0]]}),
];
/** A soft blue flash (the result arriving): stacked translucent discs that swell and fade. */
const flash = (at, from, r = 150, color = P.blue, end = 0) => layer('flash', [group([ellipse([r * .35, r * .35]), fill(color, 60)]), group([ellipse([r * .7, r * .7]), fill(color, 22)]), group([ellipse([r, r]), fill(color, 10)])],
  {p: at, s: [[from, [50, 50, 100]], [from + 24, [130, 130, 100]]], o: [[0, 0], [from, 0], [from + 2, 100], [from + 30, end]]});
const doc = (name, frames, layers, loop = false) => { index = 0; return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: layers(), meta: {g: 'library/themes/lines-of-light/lottie/generate.mjs', background: P.bg, loop}}; };

const spark = [[-150, 60], [-100, 30], [-55, 45], [-10, -5], [35, 10], [80, -50], [130, -85]];
const star = (s) => line([[0, -s], [s * .18, -s * .18], [s, 0], [s * .18, s * .18], [0, s], [-s * .18, s * .18], [-s, 0], [-s * .18, -s * .18]], true);

const animations = {
  'red-dot-fire': doc('Red dot fire', 120, () => [
    ...lit('target', [circle(46, 200, 1)], {w: 4, draw: {s: 0, e: [[38, 0], [70, 50]]}, ks: {p: [290, 140, 0]}}),
    ...lit('target b', [circle(46, 200, -1)], {w: 4, draw: {s: 0, e: [[38, 0], [70, 50]]}, ks: {p: [290, 140, 0]}}),
    flash([290, 140, 0], 66, 210),
    ...lit('shot', [line([[90, 300], [90, 190], [247, 157]])], {w: 4, color: 'red', echo: false, draw: {s: [[0, 0], [64, 0], [96, 100]], e: [[6, 0], [38, 100]]}, ks: {p: [0, 0, 0]}}),
    ...redDot([90, 300, 0], 2),
  ]),
  'check-draw': doc('Check draw', 90, () => [
    flash([200, 200, 0], 58, 260),
    ...lit('check', [line([[-52, 2], [-16, 40], [58, -44]])], {w: 7, draw: {e: [[34, 0], [60, 100]]}}),
    ...lit('ring', [circle(100, -90, 1)], {w: 4, draw: {e: [[6, 0], [40, 50]]}}),
    ...lit('ring b', [circle(100, -90, -1)], {w: 4, draw: {e: [[6, 0], [40, 50]]}}),
    layer('pin', [group([ellipse([14, 14]), fill(P.red)])], {p: [200, 100, 0], o: [[0, 100], [8, 100], [14, 0]]}, 0),
  ]),
  'pulse-ring': doc('Pulse ring', 60, () => [
    ...[0, 1, 2].flatMap(k => lit('wave ' + k, [circle(40)], {w: 3, ks: {s: linear([[0, [100 + k * 140, 100 + k * 140, 100]], [60, [240 + k * 140, 240 + k * 140, 100]]]), o: linear([[0, 100 - k * 33], [60, 67 - k * 33]])}})),
    layer('dot', [group([ellipse([26, 26]), fill(P.red)]), group([ellipse([52, 52]), fill(P.red, 22)])], {s: [[0, [100, 100, 100]], [8, [118, 118, 100]], [30, [100, 100, 100]]]}, 0),
  ], true),
  'burst': doc('Burst', 75, () => [
    flash([200, 200, 0], 18, 240),
    ...lit('rays', Array.from({length: 12}, (_, i) => { const a = i * 30 * Math.PI / 180, r0 = 40, r1 = i % 2 ? 120 : 165; return line([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]); }), {w: 4, draw: {s: [[20, 0], [60, 100]], e: [[4, 0], [30, 100]]}}),
    ...lit('ring', [circle(30)], {w: 3, ks: {s: [[0, [0, 0, 100]], [16, [100, 100, 100]]], o: [[0, 100], [50, 100], [70, 0]]}}),
    layer('core', [group([ellipse([18, 18]), fill(P.red)])], {o: [[0, 100], [14, 100], [20, 0]]}, 0),
  ]),
  'arrow': doc('Arrow', 75, () => [
    flash([330, 200, 0], 42, 170),
    ...lit('head', [line([[300, 168], [332, 200], [300, 232]])], {w: 5, draw: {e: [[36, 0], [52, 100]]}, ks: {p: [0, 0, 0]}}),
    ...lit('shaft', [line([[78, 200], [330, 200]])], {w: 5, draw: {e: [[6, 0], [40, 100]]}, ks: {p: [0, 0, 0]}}),
    ...redDot([70, 200, 0], 0, 20),
  ]),
  'spinner-ring': doc('Spinner ring', 60, () => [
    ...lit('arc', [circle(90)], {w: 5, draw: {s: 0, e: 28, o: linear([[0, 0], [60, 360]])}}),
    layer('head', [group([ellipse([16, 16], [90, 0]), fill(P.red)])], {r: linear([[0, 10.8], [60, 370.8]])}, 0),
    layer('track', [group([circle(90), stroke(P.dim, 2, 70)])]),
  ], true),
  'wave': doc('Wave', 90, () => [
    ...lit('wave', [line(Array.from({length: 121}, (_, i) => { const x = -170 + i * 340 / 120, f = i / 120; return [x, Math.sin(f * Math.PI * 6) * 46 * Math.sin(f * Math.PI)]; }))], {w: 4, draw: {s: linear([[0, 0], [30, 0], [89, 100]]), e: linear([[0, 0], [60, 100], [89, 100]])}}),
    layer('base', [group([line([[-170, 0], [170, 0]]), stroke(P.dim, 2, 50)])]),
  ], true),
  'typing-dots': doc('Typing dots', 45, () => [0, 1, 2].flatMap(k => lit('dot ' + k, [circle(20)], {w: 4, ks: {p: [130 + k * 70, 200, 0], s: linear([[0, [100, 100, 100]], [k * 8, [100, 100, 100]], [k * 8 + 8, [140, 140, 100]], [k * 8 + 18, [100, 100, 100]], [44, [100, 100, 100]]]), o: linear([[0, 45], [k * 8, 45], [k * 8 + 8, 100], [k * 8 + 18, 45], [44, 45]])}})), true),
  'sparkline': doc('Sparkline', 90, () => [
    flash([330, 115, 0], 54, 170),
    ...lit('end', [circle(14, 180, 1)], {w: 3, draw: {e: [[52, 0], [70, 100]]}, ks: {p: [330, 115, 0]}}),
    layer('head', [group([ellipse([16, 16]), fill(P.red)])], {p: linear(spark.map(([x, y], i) => [6 + i * 8, [x + 200, y + 200, 0]])), o: [[0, 0], [6, 100], [54, 100], [56, 0]]}, 0),
    ...lit('line', [line(spark)], {w: 4, draw: {e: linear([[6, 0], [54, 100]])}}),
    layer('base', [group([line([[-160, 110], [160, 110]]), stroke(P.dim, 2, 60)])]),
  ]),
  'stars': doc('Stars', 90, () => [[0, -40, 60, 0], [-110, 60, 30, 20], [110, 50, 36, 40], [-70, -110, 22, 55], [90, -100, 18, 70]].flatMap(([x, y, s, d], k) =>
    lit('star ' + k, [star(s)], {w: 2.5, ks: {p: [200 + x, 200 + y, 0], s: [[0, [60, 60, 100]], [d / 2 + 10, [115, 115, 100]], [d / 2 + 35, [60, 60, 100]], [89, [60, 60, 100]]], o: [[0, 40], [d / 2 + 10, 100], [d / 2 + 35, 40], [89, 40]], r: linear([[0, 0], [89, 45]])}})), true),
  'underline': doc('Underline', 75, () => [
    flash([350, 230, 0], 40, 120),
    ...lit('rule', [line([[60, 230], [350, 230]])], {w: 4, draw: {e: [[6, 0], [42, 100]]}, ks: {p: [0, 0, 0]}}),
    ...lit('tick', [line([[350, 214], [350, 246]])], {w: 3, draw: {e: [[40, 0], [52, 100]]}, ks: {p: [0, 0, 0]}}),
    ...redDot([52, 230, 0], 0, 16),
  ]),
  'ring-open': doc('Ring open', 90, () => [
    flash([200, 200, 0], 48, 300, P.blue, 30),
    ...lit('outer', [circle(130, 180, 1)], {w: 4, draw: {e: [[10, 0], [50, 50]]}}),
    ...lit('outer b', [circle(130, 180, -1)], {w: 4, draw: {e: [[10, 0], [50, 50]]}}),
    ...lit('inner', [circle(100, 0, 1)], {w: 2, o: 60, draw: {e: [[24, 0], [62, 50]]}}),
    ...lit('inner b', [circle(100, 0, -1)], {w: 2, o: 60, draw: {e: [[24, 0], [62, 50]]}}),
    ...lit('ticks', Array.from({length: 24}, (_, i) => { const a = i * 15 * Math.PI / 180; return line([[Math.cos(a) * 142, Math.sin(a) * 142], [Math.cos(a) * (i % 6 ? 152 : 166), Math.sin(a) * (i % 6 ? 152 : 166)]]); }), {w: 2, draw: {e: [[44, 0], [70, 100]]}}),
    ...redDot([70, 200, 0], 0, 16),
  ]),
};
// Tidy: drop the null placeholder layers some builders leave.
for (const a of Object.values(animations)) a.layers = a.layers.filter(Boolean).map((l, i) => ({...l, ind: i + 1}));

const dir = new URL('./animations/', import.meta.url);
mkdirSync(dir, {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`${id}.json`, dir), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations`);
