#!/usr/bin/env node
// Writes the editorial theme's original Lottie accents in animations/*.json.
// Authored as code so they stay small, editable and licence-clean. The look follows the theme kit (kit.js): ink
// strokes with butt ends and mitred corners on paper, one wine accent per mark, hairlines beside heavy rules, and the
// kit's motion: rules draw, shapes glide in on a quart-out curve and settle, exits are quicker and go the way they
// came. Nothing bounces, flashes or glows. The colours below are the kit's (C in kit.js); they are repeated here
// because the kit is a browser module and this file runs in Node.
// Run: node library/themes/editorial/lottie/generate.mjs
import {writeFileSync, mkdirSync} from 'node:fs';

const P = {paper: '#EDF0EB', stone: '#D5DBD5', fog: '#C3C8C1', ink: '#26101A', umber: '#4B3933', wine: '#7A2137', crimson: '#A70A3E', blush: '#DFA78C'};
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const rgba = h => rgb(h).concat(1);
const arr = v => Array.isArray(v) ? v : [v];

// Keyframes: [[frame, value, ease?], ...]. ease (for the move out of that key): 'glide' quart-out (default, the
// theme's arrival), 'io' cubic in-out, 'in' cubic in (exits), 'lin' linear, 'hold' a hard cut.
const EASE = {glide: [[.25, 1], [.5, 1]], io: [[.65, 0], [.35, 1]], in: [[.55, 0], [.85, .3]], lin: [[0, 0], [1, 1]]};
const keys = frames => ({a: 1, k: frames.map(([t, s, e = 'glide'], i) => {
  if (i === frames.length - 1) return {t, s: arr(s)};
  if (e === 'hold') return {t, s: arr(s), h: 1};
  const [o, ii] = EASE[e]; return {t, s: arr(s), o: {x: [o[0]], y: [o[1]]}, i: {x: [ii[0]], y: [ii[1]]}};
})});
const isKeys = v => Array.isArray(v) && v.length > 1 && v.every(k => Array.isArray(k) && typeof k[0] === 'number' && k.length >= 2 && k.length <= 3 && (typeof k[1] === 'number' || Array.isArray(k[1])));
const prop = v => v && v.a !== undefined ? v : isKeys(v) ? keys(v) : {a: 0, k: v};

const fill = (color, o = 100) => ({ty: 'fl', c: prop(rgba(color)), o: prop(o), r: 1});
const stroke = (color, width, o = 100) => ({ty: 'st', c: prop(rgba(color)), o: prop(o), w: prop(width), lc: 1, lj: 1, ml: 4});
const rect = (size, at = [0, 0]) => ({ty: 'rc', p: prop(at), s: prop(size), r: prop(0)});
const ellipse = (size, at = [0, 0]) => ({ty: 'el', p: prop(at), s: prop(size)});
const trim = (s, e, o = 0) => ({ty: 'tm', s: prop(s), e: prop(e), o: prop(o), m: 1});
const path = (points, closed = false) => ({ty: 'sh', ks: prop({v: points, i: points.map(() => [0, 0]), o: points.map(() => [0, 0]), c: closed})});
const circle = (r, a0 = -90, n = 64) => path(Array.from({length: n + 1}, (_, i) => { const a = (a0 + 360 * i / n) * Math.PI / 180; return [Math.cos(a) * r, Math.sin(a) * r]; }));
const group = (items, tr = {}) => ({ty: 'gr', it: [...items, {ty: 'tr', p: prop(tr.p ?? [0, 0]), a: prop(tr.a ?? [0, 0]), s: prop(tr.s ?? [100, 100]), r: prop(tr.r ?? 0), o: prop(tr.o ?? 100)}]});
/** A shape layer; ks: {p, a, s, r, o} (values or key lists), centred at 200,200 by default. */
const layer = (name, shapes, ks = {}) => ({ddd: 0, ind: 0, ty: 4, nm: name, sr: 1, ao: 0, bm: 0, ip: ks.ip ?? 0, op: ks.op ?? 9999, st: 0,
  ks: {o: prop(ks.o ?? 100), r: prop(ks.r ?? 0), p: prop(ks.p ?? [200, 200, 0]), a: prop(ks.a ?? [0, 0, 0]), s: prop(ks.s ?? [100, 100, 100])}, shapes});
const doc = (name, frames, layers, loop = false) => ({v: '5.12.2', fr: 30, ip: 0, op: frames, w: 400, h: 400, nm: name, ddd: 0, assets: [],
  layers: layers().filter(Boolean).map((l, i) => ({...l, ind: i + 1})), meta: {g: 'library/themes/editorial/lottie/generate.mjs', background: P.paper, loop}});
const S = v => [v, v, 100];
/** Opacity keys: fade up over `len` frames from frame f. */
const fadeIn = (f, len = 8) => f > 0 ? [[0, 0, 'hold'], [f, 0, 'lin'], [f + len, 100]] : [[0, 0, 'lin'], [len, 100]];
/** A quotation mark (a "6" shape): a filled dot with a tail rising to the right. */
const quote = () => [ellipse([58, 58], [0, 22]), path([[-29, 22], [-29, 6], [-20, -22], [8, -52], [18, -42], [-2, -18], [-4, 4]], true)];

const animations = {
  'rule-draw': doc('Rule draw', 60, () => [
    // A heavy rule draws from the left with a hairline under it a moment later, the way a section opens.
    layer('heavy', [group([path([[-150, 0], [150, 0]]), trim(0, [[2, 0], [20, 100]]), stroke(P.ink, 10)])], {p: [200, 192, 0]}),
    layer('hair', [group([path([[-150, 0], [150, 0]]), trim(0, [[8, 0], [28, 100]]), stroke(P.ink, 3)])], {p: [200, 210, 0]}),
    layer('mark', [group([rect([22, 22]), fill(P.wine)])], {p: [[14, [61, 156, 0]], [26, [61, 166, 0]]], o: fadeIn(14, 8)}),
  ]),
  'underline-swipe': doc('Underline swipe', 60, () => [
    // A wine underline draws from the left, holds, and leaves to the right the way it came.
    layer('bar', [group([path([[-150, 0], [150, 0]]), trim([[0, 0, 'hold'], [40, 0, 'in'], [50, 100]], [[2, 0], [18, 100]]), stroke(P.wine, 16)])], {p: [200, 236, 0]}),
    layer('hair', [group([path([[-150, 0], [150, 0]]), trim([[0, 0, 'hold'], [43, 0, 'in'], [53, 100]], [[7, 0], [24, 100]]), stroke(P.ink, 3)])], {p: [200, 256, 0]}),
  ]),
  'folio-flip': doc('Folio flip', 60, () => {
    // A page turns over about its spine twice: paper, then stone, then the accent, with a short folio rule under it.
    const page = (color, from, to, name) => layer(name, [group([rect([150, 204]), fill(color), stroke(P.ink, 5)])], {ip: from, op: to, s: [[from, [from ? 0 : 100, 100, 100], from ? 'glide' : 'hold'], [from + 9, [100, 100, 100], 'hold'], ...(to < 60 ? [[to - 8, [100, 100, 100], 'in'], [to, [0, 100, 100]]] : [[60, [100, 100, 100]]])], p: [200, 186, 0]});
    return [
      layer('folio', [group([path([[-34, 0], [34, 0]]), trim(0, [[4, 0], [18, 100]]), stroke(P.ink, 6)])], {p: [200, 322, 0]}),
      layer('lines', [group([path([[-46, -60], [46, -60]]), path([[-46, -36], [20, -36]]), stroke(P.paper, 8)])], {ip: 36, p: [200, 186, 0], o: fadeIn(40, 8)}),
      page(P.paper, 0, 18, 'page 1'), page(P.stone, 18, 36, 'page 2'), page(P.wine, 36, 60, 'page 3'),
    ];
  }),
  'quote-marks': doc('Quote marks', 60, () => [0, 1].map(i =>
    // Two opening quotation marks rise into place one after the other.
    layer('quote ' + i, [group([...quote(), fill(P.wine)])], {s: S(150), p: [[0, [150 + i * 104, 236, 0], 'hold'], [2 + i * 5, [150 + i * 104, 236, 0]], [18 + i * 5, [150 + i * 104, 200, 0]]], o: fadeIn(2 + i * 5, 9)})
  ).concat([layer('rule', [group([path([[-110, 0], [110, 0]]), trim(0, [[12, 0], [30, 100]]), stroke(P.ink, 4)])], {p: [200, 300, 0]})])),
  'asterisk-spin': doc('Asterisk spin', 72, () => [
    // A six-armed asterisk opens from its centre and keeps turning slowly.
    layer('asterisk', [group([0, 60, 120].map(a => { const r = a * Math.PI / 180, x = Math.sin(r) * 96, y = Math.cos(r) * 96; return path([[-x, -y], [x, y]]); }).concat([stroke(P.wine, 22)]))],
      {s: [[0, S(0)], [18, S(100)]], r: [[0, -60, 'glide'], [22, 0, 'lin'], [72, 30]]}),
  ]),
  'check': doc('Check', 54, () => [
    // An ink ring draws round, then a wine tick draws inside it.
    layer('ring', [group([circle(112), trim(0, [[2, 0], [22, 100]]), stroke(P.ink, 8)])]),
    layer('check', [group([path([[-58, 6], [-18, 46], [62, -44]]), trim(0, [[14, 0], [32, 100]]), stroke(P.wine, 22)])]),
  ]),
  'arrow': doc('Arrow', 60, () => [
    // An arrow: the shaft draws, the head opens from its point, and the whole arrow glides a little forward.
    layer('arrow', [
      group([path([[-130, 0], [112, 0]]), trim(0, [[2, 0], [18, 100]]), stroke(P.ink, 12)]),
      group([path([[56, -58], [116, 0], [56, 58]]), trim([[0, 50, 'hold'], [14, 50], [26, 0]], [[0, 50, 'hold'], [14, 50], [26, 100]]), stroke(P.ink, 12)]),
    ], {p: [[0, [188, 200, 0], 'hold'], [22, [188, 200, 0], 'io'], [44, [206, 200, 0]]]}),
    layer('rule', [group([path([[-130, 0], [-20, 0]]), trim(0, [[20, 0], [36, 100]]), stroke(P.wine, 6)])], {p: [200, 236, 0]}),
  ]),
  'bracket-pair': doc('Bracket pair', 60, () => [-1, 1].map(sx =>
    // Square brackets open outwards from the middle around a wine mark.
    layer(sx < 0 ? 'left' : 'right', [group([path([[sx * -34, -104], [0, -104], [0, 104], [sx * -34, 104]]), stroke(P.ink, 12)])], {p: [[0, [200 + sx * 30, 200, 0]], [2, [200 + sx * 30, 200, 0]], [22, [200 + sx * 138, 200, 0]]], o: fadeIn(0, 6)})
  ).concat([layer('mark', [group([rect([150, 14]), fill(P.wine)])], {s: [[8, [0, 100, 100]], [26, [100, 100, 100]]], o: [[0, 0, 'hold'], [8, 100]]}),
    layer('mark 2', [group([rect([96, 14]), fill(P.ink)])], {p: [200, 232, 0], s: [[12, [0, 100, 100]], [30, [100, 100, 100]]], o: [[0, 0, 'hold'], [12, 100]]})])),
  'column-grid': doc('Column grid', 60, () => {
    // The columns of a page grid drop from a head rule one after another; one column is the accent.
    const n = 6, w = 38, gap = 14, x0 = 200 - (n * w + (n - 1) * gap) / 2 + w / 2, out = [layer('head', [group([path([[-152, 0], [152, 0]]), trim(0, [[0, 0], [16, 100]]), stroke(P.ink, 8)])], {p: [200, 92, 0]})];
    for (let i = 0; i < n; i++) { const h = [200, 200, 120, 200, 160, 200][i], at = 5 + i * 3;
      out.push(layer('col ' + i, [group([{ty: 'rc', p: prop([[at, [0, 0]], [at + 16, [0, h / 2]]]), s: prop([[at, [w, 0]], [at + 16, [w, h]]]), r: prop(0)}, fill(i === 3 ? P.wine : i % 2 ? P.fog : P.umber)])], {p: [x0 + i * (w + gap), 108, 0], o: [[0, 0, 'hold'], [at, 100]]})); }
    return out;
  }),
  'seal-ring': doc('Seal ring', 72, () => {
    // A seal: a ring draws, a circle of short ticks appears round it one by one, and a small asterisk sits in the middle; the ticks turn slowly.
    const n = 24, ticks = Array.from({length: n}, (_, i) => { const a = i / n * Math.PI * 2, c = Math.sin(a), s = -Math.cos(a); return group([path([[c * 118, s * 118], [c * 140, s * 140]]), stroke(P.ink, 6)], {o: [[0, 0, 'hold'], [6 + i, 100]]}); });
    return [
      layer('ticks', ticks, {r: [[0, 0, 'lin'], [72, 30]]}),
      layer('ring', [group([circle(98), trim(0, [[2, 0], [24, 100]]), stroke(P.wine, 10)])]),
      layer('star', [group([0, 60, 120].map(a => { const r = a * Math.PI / 180, x = Math.sin(r) * 38, y = Math.cos(r) * 38; return path([[-x, -y], [x, y]]); }).concat([stroke(P.wine, 12)]))], {s: [[14, S(0)], [30, S(100)]], r: [[14, -60], [32, 0]]}),
    ];
  }),
  'plus': doc('Plus', 45, () => [
    // A plus: the horizontal stroke draws from the centre, then the vertical, in the accent.
    layer('h', [group([path([[-78, 0], [78, 0]]), trim([[2, 50], [16, 0]], [[2, 50], [16, 100]]), stroke(P.ink, 20)])]),
    layer('v', [group([path([[0, -78], [0, 78]]), trim([[0, 50, 'hold'], [8, 50], [22, 0]], [[0, 50, 'hold'], [8, 50], [22, 100]]), stroke(P.wine, 20)])], {o: [[0, 0, 'hold'], [8, 100]]}),
  ]),
  'bookmark': doc('Bookmark', 60, () => [
    // A ribbon bookmark with a swallow-tail slides down from the top edge of a page and settles.
    layer('ribbon', [group([path([[-44, -330], [44, -330], [44, 110], [0, 68], [-44, 110]], true), fill(P.wine)])], {p: [[0, [236, -130, 0]], [2, [236, -130, 0]], [26, [236, 200, 0]]]}),
    layer('lines', [group([path([[-86, -104], [10, -104]]), path([[-86, -78], [-24, -78]]), trim(0, [[8, 0], [24, 100]]), stroke(P.ink, 8)])], {p: [200, 214, 0]}),
    layer('page', [group([rect([236, 300]), fill(P.stone), stroke(P.ink, 5)])], {p: [200, 214, 0], o: fadeIn(0, 8)}),
  ]),
  'drop-cap': doc('Drop cap', 60, () => [
    // A drop cap block (the accent square) lands at the head of a paragraph whose lines draw beside and under it.
    layer('cap', [group([rect([112, 112]), fill(P.wine)])], {p: [[0, [106, 150, 0]], [16, [106, 136, 0]]], o: fadeIn(0, 8)}),
    ...[0, 1, 2, 3, 4, 5].map(i => { const beside = i < 3, x0 = beside ? 186 : 50, y = 92 + i * 44 + (beside ? 0 : 12), len = (i === 5 ? 190 : 350) - x0 + 50 - (beside ? 0 : 0);
      return layer('line ' + i, [group([path([[0, 0], [len, 0]]), trim(0, [[6 + i * 3, 0], [22 + i * 3, 100]]), stroke(i === 0 ? P.ink : P.umber, i === 0 ? 12 : 8, i === 0 ? 100 : 70)])], {p: [x0, y, 0]}); }),
  ]),
};

const dir = new URL('./animations/', import.meta.url);
mkdirSync(dir, {recursive: true});
for (const [id, data] of Object.entries(animations)) writeFileSync(new URL(`${id}.json`, dir), JSON.stringify(data));
console.log(`Wrote ${Object.keys(animations).length} animations`);
