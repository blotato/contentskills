#!/usr/bin/env node
// Writes the glass theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and license-clean.
// Run: node library/themes/glass/lottie/generate.mjs
// The look: white hairlines (4 px on a 512 canvas, square ends) on a see-through ground, shown on
// the theme's near-black in the dashboard; no fills except the one poppy dot. Everything draws on
// or fades up fast and settles for a long time; nothing bounces.
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {bg: '#070B16', white: '#FFFFFF', ash: '#B8C0D0', poppy: '#3D7BFF'};
const S = 512, M = S / 2, W = 4;                                  // canvas, its middle, the hairline weight
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).concat(1);
const still = k => ({a: 0, k});
const arr = v => Array.isArray(v) ? v : [v];
// Easing between one key and the next: glide (default: arrive fast, settle long), soft (slow in and out), lin (constant, for loops).
const EASE = {glide: {i: {x: [.12], y: [1]}, o: {x: [.25], y: [.35]}}, soft: {i: {x: [.3], y: [1]}, o: {x: [.6], y: [0]}}, lin: {i: {x: [1], y: [1]}, o: {x: [0], y: [0]}}};
/** Animated property from [[frame, value, ease?], ...]. ease 'hold' jumps to the next value with no in-between. */
const keys = frames => ({a: 1, k: frames.map(([t, s, e], i) => i < frames.length - 1 ? (e === 'hold' ? {t, s: arr(s), h: 1} : {t, s: arr(s), ...EASE[e || 'glide']}) : {t, s: arr(s)})});
const prop = v => Array.isArray(v) && Array.isArray(v[0]) ? keys(v) : still(v);

const fill = (color, o) => ({ty: 'fl', c: still(rgb(color)), o: prop(o ?? 100), r: 1});
/** opts: o (opacity), dash [dash, gap], offset, cap (1 butt, 2 round, 3 square) */
const stroke = (color, width, {o, dash, offset, cap = 1} = {}) => ({ty: 'st', c: still(rgb(color)), o: prop(o ?? 100), w: prop(width), lc: cap, lj: 1, ml: 10,
  ...(dash ? {d: [{n: 'd', nm: 'dash', v: still(dash[0])}, {n: 'g', nm: 'gap', v: still(dash[1])}, {n: 'o', nm: 'offset', v: prop(offset ?? 0)}]} : {})});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const rect = (size, at = [0, 0]) => ({ty: 'rc', p: prop(at), s: prop(size), r: still(0)});
const trim = (end, start = 0, offset = 0) => ({ty: 'tm', s: prop(start), e: prop(end), o: prop(offset), m: 1});
const bezier = (v, c = false) => ({v, i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), c});
const line = (points, closed = false) => ({ty: 'sh', ks: still(bezier(points, closed))});
/** A path that changes shape: [[frame, points], ...]. */
const morph = frames => ({ty: 'sh', ks: {a: 1, k: frames.map(([t, pts], i) => i < frames.length - 1 ? {t, s: [bezier(pts)], ...EASE.soft} : {t, s: [bezier(pts)]})}});
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: prop(tr.a ?? [0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
let index = 0;
const layer = (name, shapes, ks = {}) => ({ddd: 0, ind: ++index, ty: 4, nm: name, sr: 1, ao: 0, bm: 0, ip: 0, op: 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [M, M, 0]), a: prop(ks.a ?? [0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
/** loop: true means the last frame flows into the first, so players should not pause on the end. */
const doc = (name, frames, layers, loop = false) => { index = 0; return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: S, h: S, nm: name, ddd: 0, assets: [], layers: layers(), meta: {g: 'library/themes/glass/lottie/generate.mjs', background: P.bg, loop}}; };

// ---- the small drawing vocabulary shared by the animations below ------------------------------------------------
/** A hairline. opts: trim, tr (group transform), and the stroke options. */
const ink = (shape, color = P.white, width = W, opts = {}) => group([...arr(shape), ...(opts.trim ? [opts.trim] : []), stroke(color, width, opts)], opts.tr);
/** A hairline that draws itself between two frames. */
const draws = (shape, from, to, color = P.white, width = W, opts = {}) => ink(shape, color, width, {...opts, trim: trim([[from, 0], [to, 100]])});
/** A hairline that draws from its middle outwards between two frames. */
const opens = (shape, from, to, color = P.white, width = W, opts = {}) => ink(shape, color, width, {...opts, trim: trim([[from, 50], [to, 100]], [[from, 50], [to, 0]])});
/** The one accent: a small solid poppy dot that fades up in place between two frames. */
const dot = (at, from, to = from + 8, r = 9, o = 100) => group([ellipse([r * 2, r * 2], at), fill(P.poppy, [[from, 0, 'soft'], [to, o]])]);
const fadeIn = (from, to = from + 10, o = 100) => [[from, 0, 'soft'], [to, o]];
/** Corner ticks of a w x h box centred on (0, 0), each arm l long: four separate L shapes. */
const corners = (w, h, l) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => line([[sx * w / 2, sy * (h / 2 - l)], [sx * w / 2, sy * h / 2], [sx * (w / 2 - l), sy * h / 2]]));

const animations = {
  // ---- marks ---------------------------------------------------------------------------------------------------
  'hairline-underline': doc('Hairline underline', 60, () => [
    layer('dot', [dot([196, 0], 16, 26)]),
    layer('rule', [opens(line([[-170, 0], [170, 0]]), 2, 34)]),
    layer('print', [ink(line([[-170, 34], [-60, 34]]), P.white, 2, {o: fadeIn(18, 34, 55)})]),
  ]),

  'ring-draw': doc('Ring draw', 70, () => [
    layer('dot', [dot([0, -150], 0, 8)]),
    layer('ring', [draws(ellipse([300, 300]), 2, 44)]),
    layer('inner', [draws(ellipse([236, 236]), 14, 56, P.white, 1.5, {o: 55})], {r: 180}),
  ]),

  'registration-mark': doc('Registration mark', 70, () => [
    layer('dot', [dot([0, 0], 30, 40, 7)]),
    layer('ring', [draws(ellipse([150, 150]), 6, 40)], {r: [[0, -90], [50, 0]]}),
    layer('cross', [opens(line([[-150, 0], [150, 0]]), 0, 30), opens(line([[0, -150], [0, 150]]), 6, 36)]),
    layer('ticks', [ink(corners(380, 380, 26), P.white, 2, {o: fadeIn(22, 40, 60)})]),
  ]),

  'corner-ticks': doc('Corner ticks', 70, () => [
    layer('dot', [dot([0, 0], 20, 32, 7)]),
    layer('cross', [ink([line([[-14, 0], [14, 0]]), line([[0, -14], [0, 14]])], P.white, 2, {o: fadeIn(10, 24, 70)})]),
    layer('ticks', [ink(corners(360, 360, 54), P.white, W)], {s: [[0, [38, 38, 100]], [40, [100, 100, 100]]], o: fadeIn(0, 9)}),
  ]),

  'arrow-draw': doc('Arrow draw', 60, () => [
    layer('dot', [dot([-176, 0], 0, 8)]),
    layer('head', [opens(line([[120, -42], [164, 0], [120, 42]]), 22, 40)]),
    layer('shaft', [draws(line([[-150, 0], [162, 0]]), 2, 32)]),
  ]),

  'plus-to-check': doc('Plus to check', 80, () => [
    layer('dot', [dot([122, -122], 46, 56)]),
    layer('upright', [ink(line([[0, -64], [0, 64]]), P.white, W, {trim: trim([[0, 50], [16, 100], [30, 100], [44, 50]], [[0, 50], [16, 0], [30, 0], [44, 50]]), o: [[0, 100, 'hold'], [44, 0]]})]),
    layer('bar', [ink(morph([[0, [[-64, 0], [-10, 0], [64, 0]]], [30, [[-64, 0], [-10, 0], [64, 0]]], [50, [[-66, 4], [-18, 50], [70, -48]]]]), P.white, W, {trim: trim([[0, 100], [16, 100]], [[0, 100], [16, 0]])})]),
    layer('ring', [draws(ellipse([300, 300]), 4, 46, P.white, 2, {o: 60})], {r: -90}),
  ]),

  // ---- frames --------------------------------------------------------------------------------------------------
  'panels-open': doc('Panels open', 80, () => {
    const panels = [[-118, 84, 0], [-6, 116, 8], [116, 104, 4]];                       // x of the middle, width, first frame
    return [
      layer('dot', [dot([-6, 196], 40, 50, 7)]),
      ...panels.map(([x, w, f], i) => layer('panel ' + i, [draws(rect([w, 300]), f, f + 36)], {p: [[f, [M + x, M + (i % 2 ? -46 : 46), 0]], [f + 46, [M + x, M, 0]]], o: fadeIn(f, f + 8)})),
    ];
  }),

  'scan-line': doc('Scan line', 90, () => [
    layer('dot', [group([ellipse([14, 14], [206, 0]), fill(P.poppy)])], {p: [[0, [M, M - 150, 0], 'soft'], [90, [M, M + 150, 0]]], o: [[0, 0, 'soft'], [12, 100, 'lin'], [76, 100, 'soft'], [90, 0]]}),
    layer('line', [ink(line([[-180, 0], [180, 0]]), P.white, W)], {p: [[0, [M, M - 150, 0], 'soft'], [90, [M, M + 150, 0]]], o: [[0, 0, 'soft'], [12, 100, 'lin'], [76, 100, 'soft'], [90, 0]]}),
    layer('ticks', [ink(corners(400, 400, 40), P.white, 2, {o: 60})]),
  ], true),

  // ---- counts and cues -----------------------------------------------------------------------------------------
  'count-dots': doc('Count dots', 90, () => [
    layer('dot', [group([ellipse([22, 22]), fill(P.poppy)])], {p: [[6, [M - 120, M, 0], 'hold'], [28, [M - 120, M, 0], 'soft'], [40, [M, M, 0], 'hold'], [54, [M, M, 0], 'soft'], [66, [M + 120, M, 0]]], o: fadeIn(6, 14)}),
    ...[-120, 0, 120].map((x, i) => layer('ring ' + i, [draws(ellipse([64, 64], [x, 0]), 2 + i * 26, 22 + i * 26)], {})),
    layer('rule', [opens(line([[-152, 70], [152, 70]]), 0, 40, P.white, 2, {o: 55})]),
  ]),

  'dot-pulse': doc('Dot pulse', 75, () => [
    layer('dot', [group([ellipse([30, 30]), fill(P.poppy)])], {s: [[0, [100, 100, 100], 'soft'], [8, [118, 118, 100], 'soft'], [30, [100, 100, 100], 'hold'], [75, [100, 100, 100]]]}),
    layer('pulse', [ink(ellipse([[0, [36, 36]], [60, [330, 330]], [75, [330, 330]]]), P.white, [[0, 4], [60, 1.5], [75, 1.5]], {o: [[0, 0, 'soft'], [6, 80], [60, 0, 'hold'], [75, 0]]})]),
    layer('ring', [ink(ellipse([110, 110]), P.white, 1.5, {o: 35})]),
  ], true),

  'dashed-ring': doc('Dashed ring', 240, () => [
    layer('dot', [group([ellipse([18, 18], [0, -150]), fill(P.poppy)])], {r: [[0, 0, 'lin'], [240, -360]]}),
    layer('inner', [ink(ellipse([300, 300]), P.white, 2, {o: 50})]),
    layer('dashes', [ink(ellipse([372, 372]), P.white, W, {dash: [2, 2 * Math.PI * 186 / 72 - 2]})], {r: [[0, 0, 'lin'], [240, 360 / 72 * 12]]}),
  ], true),

  'swipe-up': doc('Swipe up', 60, () => [
    ...[0, 1, 2].map(i => layer('chevron ' + i, [ink(line([[-54, 30], [0, -24], [54, 30]]), P.white, W)], {p: [M, M - 76 + i * 70, 0],
      o: [[0, 14, 'hold'], [(2 - i) * 7, 14, 'soft'], [(2 - i) * 7 + 9, 100, 'soft'], [(2 - i) * 7 + 26, 14, 'hold'], [60, 14]]})),
    layer('dot', [group([ellipse([14, 14], [0, 176]), fill(P.poppy)])]),
  ], true),
};

mkdirSync(new URL('animations/', import.meta.url), {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`animations/${id}.json`, import.meta.url), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations.`);
