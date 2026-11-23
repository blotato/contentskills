#!/usr/bin/env node
// Writes the comic theme's original Lottie animations in animations/*.json.
// They are authored here as code so they stay small, editable and license-clean.
// Every shape is a flat fill with a thick ink outline and a hard ink shadow; things pop in with an
// overshoot, and outlines "boil" (held rotations a few times a second). No soft fades, no glyphs.
// Run: node library/themes/comic/lottie/generate.mjs
import {writeFileSync} from 'node:fs';

const P = {ink: '#16121c', paper: '#f7edd0', white: '#fffbf0', red: '#e2242c', yellow: '#ffd61e', blue: '#2767d9', sky: '#49b8ea', green: '#33a35b', orange: '#f5811f', purple: '#6b3fb8', teal: '#168f8c', night: '#1d2338', pink: '#ef5d94'};
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
const doc = (name, frames, background, layers, loop = false) => {
  index = 0; const list = layers();
  for (const l of list) if (l.parentName) { l.parent = list.find(other => other.nm === l.parentName).ind; delete l.parentName; }
  return {v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [], layers: list, meta: {g: 'library/themes/comic/lottie/generate.mjs', background, loop}};
};

// ---- the comic drawing vocabulary shared by the animations below ----------------------------------------------
const rnd = s => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const polar = (r, deg) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];          // 0 degrees is up, clockwise
const INK = 7;
/**
 * The theme's one way of drawing a solid: flat fill on top, the same outline in thick ink under it
 * (so several shapes read as one inked silhouette), and a hard ink shadow pushed down-right.
 */
const inked = (shapes, color, {w = INK, shadow = 8, tr} = {}) => group([
  group([...arr(shapes), fill(color)]),
  group([...arr(shapes), stroke(P.ink, w * 2), fill(P.ink)]),
  ...(shadow ? [group([...arr(shapes), stroke(P.ink, w * 2), fill(P.ink)], {p: [shadow, shadow]})] : []),
], tr);
/** A thick coloured line with an ink edge and shadow (for ticks, crosses, question marks). opts.trim draws it on. */
const tube = (shape, color, width, {shadow = 6, trim: tm, tr} = {}) => group([
  group([shape, ...(tm ? [tm] : []), stroke(color, width)]),
  group([shape, ...(tm ? [tm] : []), stroke(P.ink, width + INK * 2)]),
  ...(shadow ? [group([shape, ...(tm ? [tm] : []), stroke(P.ink, width + INK * 2)], {p: [shadow, shadow]})] : []),
], tr);
/** A jagged burst: n spikes of radius r, valleys at `depth` of r, every spike a little different. */
const burst = (r, n = 12, depth = .64, seed = 1) => line(Array.from({length: n * 2}, (_, i) => polar((i % 2 ? r * depth : r) * (1 + (rnd(i + seed * 57 + 9) - .5) * (i % 2 ? .2 : .4)), (i + (rnd(i + seed * 31) - .5) * .5) * 180 / n)), true);
const spark = r => star(4, r, r * .32);
const wedge = (deg, half, r0, r1) => line([polar(r0, deg), polar(r1, deg - half), polar(r1, deg + half)], true);
/** Zoom lines: n ragged wedges pointing at the centre, as one flat-coloured group. */
const rays = (n, r0, r1, color, seed = 1) => group([...Array.from({length: n}, (_, i) => wedge((i + rnd(i + seed * 13)) * 360 / n, 1.2 + rnd(i + seed * 29) * 3.4, r0 * (1 + rnd(i + seed * 41) * .5), r1)), fill(color)]);
/** Held values a few times a second: the boil of a hand-inked line. Give frames/every a multiple of values.length for a loop. */
const boil = (frames, values, every = 4) => Array.from({length: Math.ceil(frames / every) + 1}, (_, i) => [i * every, values[i % values.length], 'hold']);
/** Scale keys for a pop: nothing until `at`, then up past full size and back. */
const pop = (at, to = 100, len = 10) => [...(at > 0 ? [[0, [0, 0, 100], 'hold']] : []), [at, [0, 0, 100], 'back'], [at + len, [to, to, 100]]];
/** On from frame `at` (and off again at `off`), with no fade. */
const on = (at, off) => [[0, at > 0 ? 0 : 100, 'hold'], ...(at > 0 ? [[at, 100, 'hold']] : []), ...(off ? [[off, 0, 'hold']] : []), [9998, off ? 0 : 100]];
const heart = curve([[0, 92], [-98, -18], [-52, -88], [0, -46], [52, -88], [98, -18]], [[26, -24], [0, 38], [-30, 0], [-8, -20], [-30, 0], [0, -40]], [[-26, -24], [0, -40], [30, 0], [8, -20], [30, 0], [0, 38]]);
const bolt = line([[26, -150], [-62, 12], [-6, 12], [-40, 150], [72, -34], [12, -34], [56, -150]], true);
const arrow = line([[-115, -27], [28, -27], [28, -72], [122, 0], [28, 72], [28, 27], [-115, 27]], true);
const sparkLayer = (name, at, [x, y], r, color, frames, turn = 12) => layer(name, [inked(spark(r), color, {w: 4, shadow: 4})], {p: [x, y, 0], s: pop(at), r: boil(frames, [0, turn, -turn])});

const animations = {
  // ---- Impacts ---------------------------------------------------------------------------------------------
  'pow-burst': doc('Pow burst', 75, P.blue, () => [
    ...[[70, 70], [335, 95], [325, 320], [60, 300]].map((at, i) => sparkLayer('spark ' + i, 22 + i * 4, at, 20 + (i % 2) * 8, i % 2 ? P.white : P.yellow, 75)),
    layer('star', [inked(star(5, 58, 26), P.white)], {s: pop(15), r: boil(75, [0, -8, 6])}),
    layer('inner', [inked(burst(108, 11, .7, 2), P.yellow, {shadow: 0})], {s: pop(8), r: boil(75, [4, -3, 0])}),
    layer('outer', [inked(burst(168, 13, .66, 1), P.red, {shadow: 10})], {s: pop(2), r: boil(75, [0, 5, -4])}),
    layer('rays', [rays(26, 120, 330, P.sky, 2)], {s: [[0, [300, 300, 100]], [8, [100, 100, 100]]], r: boil(75, [0, 3, -2], 5)}),
  ]),

  'star-pop': doc('Star pop', 75, P.purple, () => [
    ...Array.from({length: 6}, (_, i) => { const [x, y] = polar(138, i * 60 + 20); return layer('star ' + i, [inked(star(5, 24 + (i % 2) * 8, (24 + (i % 2) * 8) * .46), [P.white, P.sky, P.orange][i % 3], {w: 5, shadow: 5})], {p: [[0, [200, 200, 0], 'hold'], [8 + i, [200, 200, 0], 'back'], [22 + i, [200 + x, 200 + y, 0]]], s: pop(8 + i), r: [[8 + i, -160], [24 + i, i % 2 ? 14 : -10]]}); }),
    layer('big star', [inked(star(5, 96, 44), P.yellow, {shadow: 10})], {s: pop(2, 100, 12), r: boil(75, [0, 5, -5])}),
    layer('ring', [inked(burst(150, 16, .8, 4), P.white, {shadow: 0})], {s: pop(5), r: boil(75, [3, 0, -3], 5)}),
  ]),

  'lightning-bolt': doc('Lightning bolt', 60, P.night, () => [
    layer('flash', [inked(burst(74, 10, .55, 3), P.white, {shadow: 0})], {p: [176, 340, 0], s: [[0, [0, 0, 100], 'hold'], [8, [0, 0, 100], 'back'], [15, [120, 70, 100]], [28, [90, 52, 100]]], r: boil(60, [0, 8, -6])}),
    layer('bolt', [inked(bolt, P.yellow, {shadow: 10})], {r: boil(60, [0, 2, -2]), s: [[8, [100, 100, 100]], [11, [108, 96, 100]], [16, [100, 100, 100]]]},
      {mask: [[1, bezier([[-200, -200], [200, -200], [200, -199], [-200, -199]], null, null, true)], [8, bezier([[-200, -200], [200, -200], [200, 200], [-200, 200]], null, null, true)]]}),
    layer('small bolt', [inked(bolt, P.orange, {w: 5, shadow: 5, tr: {s: [38, 38], r: 18}})], {p: [318, 112, 0], s: pop(14), r: boil(60, [0, -6, 5])}),
    sparkLayer('spark', 18, [86, 96], 24, P.white, 60),
    layer('rays', [rays(22, 150, 330, '#2c3552', 5)], {r: boil(60, [0, 4, -3], 5)}),
  ]),

  'smoke-puff': doc('Smoke puff', 60, P.teal, () => [
    layer('star', [inked(star(5, 70, 32), P.yellow)], {s: pop(16, 100, 12), r: boil(60, [0, 6, -6])}),
    ...Array.from({length: 7}, (_, i) => { const [x, y] = polar(120 + rnd(i + 3) * 40, i * 360 / 7 + 15), r = 44 + rnd(i + 8) * 30; return layer('puff ' + i, [inked(ellipse([r * 2, r * 2]), P.white, {w: 6, shadow: 6})], {p: [[2, [200, 200, 0]], [20, [200 + x, 200 + y, 0]]], s: [[0, [0, 0, 100], 'hold'], [2, [40, 40, 100], 'back'], [10, [110, 110, 100]], [20, [80, 80, 100], 'in'], [36, [0, 0, 100]]]}); }),
    layer('cloud', [inked([ellipse([150, 130], [-50, 10]), ellipse([150, 140], [50, 0]), ellipse([130, 120], [0, -50]), ellipse([120, 100], [10, 50])], P.white)], {s: [[0, [0, 0, 100], 'back'], [8, [110, 110, 100], 'in'], [22, [0, 0, 100]]], r: boil(60, [0, 5, -5])}),
  ]),

  // ---- Balloons --------------------------------------------------------------------------------------------
  'speech-pop': doc('Speech pop', 75, P.yellow, () => [
    ...[0, 1, 2].map(i => layer('dot ' + i, [group([ellipse([30, 30]), fill(P.ink)])], {o: on(14 + i * 4), p: [[14 + i * 4, [140 + i * 60, 178, 0]], [20 + i * 4, [140 + i * 60, 152, 0]], [26 + i * 4, [140 + i * 60, 178, 0]], [44 + i * 4, [140 + i * 60, 178, 0]], [50 + i * 4, [140 + i * 60, 152, 0]], [56 + i * 4, [140 + i * 60, 178, 0]]]})),
    sparkLayer('spark', 22, [338, 66], 24, P.white, 75),
    layer('balloon', [inked([rect([290, 190], [0, -22], 70), line([[-70, 60], [-118, 158], [-8, 66]], true)], P.white, {shadow: 10})], {a: [-118, 158, 0], p: [82, 358, 0], s: pop(3, 100, 12), r: [[3, -18, 'back'], [16, 0]]}),
    layer('dots', [group([...Array.from({length: 30}, (_, i) => ellipse([10 + (i % 6) * 3, 10 + (i % 6) * 3], [-190 + (i % 6) * 46 + (Math.floor(i / 6) % 2) * 23, 60 + Math.floor(i / 6) * 30])), fill(P.orange)])]),
  ]),

  'thought-bubbles': doc('Thought bubbles', 90, P.sky, () => [
    layer('idea', [inked(star(5, 44, 20), P.yellow, {w: 5, shadow: 5})], {p: [222, 150, 0], s: pop(40), r: boil(90, [0, 10, -8])}),
    layer('cloud', [inked([ellipse([150, 120], [-62, 8]), ellipse([170, 140], [50, 4]), ellipse([150, 120], [-6, -50]), ellipse([140, 100], [10, 52]), ellipse([110, 90], [-70, -40])], P.white, {shadow: 10})], {p: [222, 150, 0], s: pop(24, 100, 12), r: boil(90, [0, 2, -2])}),
    layer('bubble 2', [inked(ellipse([52, 52]), P.white, {w: 6, shadow: 6})], {p: [112, 290, 0], s: pop(13)}),
    layer('bubble 1', [inked(ellipse([30, 30]), P.white, {w: 5, shadow: 5})], {p: [66, 346, 0], s: pop(4)}),
    layer('dots', [group([...Array.from({length: 30}, (_, i) => ellipse([8 + (i % 6) * 3, 8 + (i % 6) * 3], [-30 + (i % 6) * 46 + (Math.floor(i / 6) % 2) * 23, 70 + Math.floor(i / 6) * 30])), fill(P.blue)])]),
  ]),

  'exclaim': doc('Exclaim', 75, P.red, () => [
    layer('bang', [inked([line([[-30, -118], [30, -118], [15, 26], [-15, 26]], true), ellipse([50, 50], [0, 78])], P.yellow, {shadow: 10})], {p: [[2, [128, 460, 0], 'back'], [14, [128, 205, 0]]], r: boil(75, [-10, -6, -13])}),
    layer('query dot', [inked(ellipse([46, 46]), P.white, {shadow: 9})], {p: [278, 292, 0], s: pop(20)}),
    layer('query', [tube(curve([[-48, -52], [0, -100], [48, -52], [0, 4], [0, 40]], [[0, 0], [-34, 0], [0, -34], [14, -14], [0, -14]], [[0, -34], [34, 0], [0, 30], [-10, 10], [0, 0]], false), P.white, 34, {shadow: 9})], {p: [[10, [278, -90, 0], 'back'], [22, [278, 196, 0]]], r: boil(75, [8, 12, 5])}),
    layer('rays', [rays(24, 150, 330, '#f0434a', 7)], {r: boil(75, [0, 4, -3], 5)}),
  ]),

  // ---- Stamps and marks ------------------------------------------------------------------------------------
  'check-stamp': doc('Check stamp', 60, P.paper, () => [
    layer('tick', [tube(line([[-62, 6], [-18, 50], [70, -50]]), P.white, 28, {trim: trim([[12, 0], [22, 100]])})], {r: -8, o: on(12)}),
    layer('seal', [inked(star(18, 150, 134), P.green, {shadow: 10})], {o: on(1), s: [[0, [320, 320, 100], 'in'], [8, [90, 90, 100], 'back'], [16, [100, 100, 100]]], r: [[0, -30, 'in'], [8, -8]]}),
    layer('impact', [rays(18, 172, 215, P.ink, 3)], {o: on(8, 15), s: [[8, [90, 90, 100]], [15, [118, 118, 100]]]}),
    layer('dots', [group([...Array.from({length: 36}, (_, i) => ellipse([6 + (i % 6) * 3, 6 + (i % 6) * 3], [-10 + (i % 6) * 40 + (Math.floor(i / 6) % 2) * 20, 40 + Math.floor(i / 6) * 26])), fill(P.yellow)])]),
  ]),

  'cross-stamp': doc('Cross stamp', 60, P.paper, () => [
    layer('cross', [tube(line([[58, -58], [-58, 58]]), P.white, 28, {trim: trim([[17, 0], [23, 100]]), shadow: 0}), tube(line([[-58, -58], [58, 58]]), P.white, 28, {trim: trim([[11, 0], [17, 100]])})], {o: on(11), p: [[8, [200, 200, 0], 'hold'], [24, [206, 198, 0], 'hold'], [27, [195, 203, 0], 'hold'], [30, [204, 201, 0], 'hold'], [33, [200, 200, 0]]]}),
    layer('seal', [inked(burst(152, 14, .78, 6), P.red, {shadow: 10})], {o: on(1), s: [[0, [320, 320, 100], 'in'], [8, [90, 90, 100], 'back'], [16, [100, 100, 100]]], r: [[0, 28, 'in'], [8, 6, 'hold'], [24, 9, 'hold'], [27, 3, 'hold'], [30, 8, 'hold'], [33, 6]]}),
    layer('impact', [rays(18, 176, 220, P.ink, 5)], {o: on(8, 15), s: [[8, [90, 90, 100]], [15, [118, 118, 100]]]}),
    layer('dots', [group([...Array.from({length: 36}, (_, i) => ellipse([6 + (i % 6) * 3, 6 + (i % 6) * 3], [-210 + (i % 6) * 40 + (Math.floor(i / 6) % 2) * 20, -200 + Math.floor(i / 6) * 26])), fill(P.sky)])]),
  ]),

  'arrow-zip': doc('Arrow zip', 60, P.sky, () => [
    layer('arrow', [inked(arrow, P.red, {shadow: 10})], {p: [[0, [-160, 200, 0], 'back'], [13, [222, 200, 0]]], s: [[0, [150, 62, 100]], [10, [150, 62, 100]], [15, [92, 110, 100], 'back'], [22, [100, 100, 100]]], r: boil(60, [0, 0, 0, 0, 0, 0, 2, -2, 0])}),
    ...Array.from({length: 7}, (_, i) => { const y = 96 + i * 35 + rnd(i) * 10, len = 130 + rnd(i + 5) * 150; return layer('streak ' + i, [group([line([[0, 0], [len, -5 - rnd(i + 9) * 5], [len, 5 + rnd(i + 9) * 5]], true), fill(i % 3 ? P.white : P.ink)])], {p: [[1, [-len, y, 0]], [9 + (i % 3), [10 + rnd(i + 2) * 50, y, 0]], [34 + i * 2, [10 + rnd(i + 2) * 50, y, 0]]], s: [[14 + i, [100, 100, 100]], [26 + i * 2, [0, 100, 100]]], o: on(1)}); }),
    layer('puff', [inked([ellipse([60, 54], [-22, 0]), ellipse([56, 60], [20, -6]), ellipse([50, 44], [0, 22])], P.white, {w: 5, shadow: 5})], {p: [70, 208, 0], s: [[0, [0, 0, 100], 'hold'], [13, [0, 0, 100], 'back'], [21, [100, 100, 100], 'in'], [40, [0, 0, 100]]], r: boil(60, [0, 8, -8])}),
  ]),

  'heart-thump': doc('Heart thump', 60, P.paper, () => [
    layer('shine', [group([ellipse([34, 22], [-48, -44]), fill(P.white)], {r: -30})], {parent: 'heart'}),
    layer('heart', [inked(heart, P.red, {shadow: 10})], {a: [0, 10, 0], p: [200, 208, 0], s: [[0, [100, 100, 100], 'back'], [7, [124, 124, 100]], [17, [100, 100, 100]], [30, [100, 100, 100], 'back'], [36, [114, 114, 100]], [46, [100, 100, 100]], [60, [100, 100, 100]]]}),
    layer('beat marks', [group([...[-1, 1].flatMap(sx => [[-40, 14], [0, 10], [40, 14]].map(([deg, len]) => line([polar(150, sx * 90 + deg), polar(150 + len * 2.4, sx * 90 + deg)]))), stroke(P.ink, 9)])], {o: [[0, 0, 'hold'], [5, 100, 'hold'], [14, 0, 'hold'], [35, 100, 'hold'], [42, 0, 'hold'], [60, 0]], p: [200, 200, 0]}),
    layer('dots', [group([...Array.from({length: 49}, (_, i) => ellipse([20, 20], [-180 + (i % 7) * 60 + (Math.floor(i / 7) % 2) * 30, -180 + Math.floor(i / 7) * 60])), fill(P.pink)])], {s: [[0, [100, 100, 100], 'hold'], [5, [106, 106, 100], 'hold'], [14, [100, 100, 100], 'hold'], [35, [104, 104, 100], 'hold'], [42, [100, 100, 100], 'hold'], [60, [100, 100, 100]]]}),
  ], true),

  // ---- Backdrops -------------------------------------------------------------------------------------------
  'zoom-lines': doc('Zoom lines', 60, P.yellow, () => [
    layer('core', [inked(burst(58, 10, .6, 3), P.red, {shadow: 6})], {s: [[0, [100, 100, 100]], [30, [122, 122, 100]], [60, [100, 100, 100]]], r: boil(60, [0, 9, -7])}),
    layer('lines', [rays(30, 96, 340, P.white, 1)], {r: boil(60, [0, 5, -4])}),
    layer('lines 2', [rays(22, 150, 340, P.orange, 4)], {r: boil(60, [3, -3, 0]), s: [[0, [100, 100, 100]], [30, [112, 112, 100]], [60, [100, 100, 100]]]}),
  ], true),

  'halftone-pulse': doc('Halftone pulse', 90, P.paper, () => {
    const pitch = 66, list = [];
    for (let i = 0; i <= 13; i++) for (let j = 0; j <= 6; j++) {
      const x = (j + (i % 2) * .5) * pitch, y = i * pitch / 2 - 10; if (x > 420) continue;
      const far = Math.hypot(x - 400, y - 400) / 566, big = 108 - far * 60, small = 34 - far * 20;
      list.push(layer(`dot ${i}-${j}`, [group([ellipse([pitch * .62, pitch * .62]), fill((i + j) % 5 ? P.red : P.blue)])], {p: [x, y, 0], s: loop(90, Math.round((x + y) / 800 * 90), [[0, [small, small, 100]], [45, [big, big, 100]], [90, [small, small, 100]]])}));
    }
    return list;
  }, true),
};

for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`animations/${id}.json`, import.meta.url), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations.`);
