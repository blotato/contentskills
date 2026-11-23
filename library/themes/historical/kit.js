// Historical theme drawing kit. Every piece in this theme draws with this file.
//
// THE STYLE (studied from the user's history-documentary reference; nothing of it is reused)
//   Palette   A near-black navy field (#0b1017 -> #1a2636) lit by slow cold steel-blue pulses. Photographs are
//             silver black-and-white with a cool cast. Paper is bone/putty (#cbc3ae), aged and mottled. One
//             colour only: a dry crimson (#a81e2d) for brush strokes and label bars. Type is off-white (#efe9dc).
//   Texture   Sheets of paper with torn, ragged edges stacked at small angles (1-3 degrees); dry-brush crimson
//             strokes along an edge; fine grain, dust specks, thin vertical scratches, a heavy vignette;
//             faint blocks of unreadable small print at the margins. Nothing is clean, nothing glows.
//   Type      Condensed gothic capitals (Oswald). The signature device is a stack of offset labels: a year in
//             big numerals on a charcoal box, a name on a crimson bar, a description on a translucent dark
//             strip, each nudged sideways from the one above. Old book serif (Old Standard TT) for quotations and
//             documents, typewriter (Special Elite) for archive references, copperplate (Pinyon) for letters.
//   Framing   The picture is a print lying on a dark table: archival photo frames, maps with dashed routes,
//             timelines with tick rules, documents, stamps, tape and photo corners.
//   Motion    Slow and weighty. Everything is always drifting: a constant push-in (about 5% over a shot) with a
//             slight rotation, layers sliding at different rates (documentary pan). Bars wipe on from the left,
//             then their text fades in behind the wipe; small text types on. Light flickers like a projector
//             (brightness dips at 12 fps), the gate weaves a pixel or two, and a blue light leak passes. Things
//             leave by fading and sinking, never by flying off. No bounce, no overshoot, no spin.
//
// Everything here is a pure function of its inputs; pieces set every animated value from t in seek(t).
// Importing this file touches no DOM, so Node scripts (lottie/generate.mjs) can read C and F from it.
import {clamp, mix, span, easeOut, easeInOut} from '../../_shared/kit.js';
export {clamp, mix, span, easeOut, easeInOut};

// ---------------------------------------------------------------- palette and fonts
export const C = {
  ink: '#05070b', night: '#0b1017', navy: '#14202f', deep: '#1a2636', slate: '#2a3542', char: '#161b23',
  steel: '#6f8fb3', mist: '#9fb2c6', silver: '#c9d0d6', bone: '#efe9dc', paper: '#cbc3ae', putty: '#8d8872',
  crimson: '#a81e2d', red: '#c22d3c', blood: '#6d0f1b', sepia: '#8a6a43', tan: '#cdb48a', glass: 'rgba(7,10,15,.74)',
};
/** Dark ink for drawing and type on paper. */
export const INK = '#15181d';
export const F = {head: 'Oswald', serif: '"Old Standard TT"', italic: '"Old Standard TT Italic"', bold: '"Old Standard TT Bold"', type: '"Special Elite"', script: '"Pinyon Script"'};
/** Colours for data series, in order: bone, crimson, steel, putty, silver, sepia. */
export const series = [C.bone, C.crimson, C.steel, C.putty, C.silver, C.sepia];

/** A backdrop and the inks that sit on it. */
export const fields = {
  night: {bg: ['#1b2838', '#0b1017'], text: C.bone, sub: C.silver, dim: C.mist, accent: C.crimson, bar: 'crimson', box: 'char', sheet: '#222c39', smear: C.crimson, leak: C.steel},
  steel: {bg: ['#2d4566', '#0c1420'], text: C.bone, sub: C.silver, dim: C.mist, accent: C.crimson, bar: 'crimson', box: 'char', sheet: '#22344d', smear: C.crimson, leak: '#8fb4e6'},
  crimson: {bg: ['#5e111d', '#13070a'], text: C.bone, sub: '#e6cfcb', dim: '#c79a98', accent: C.bone, bar: 'bone', box: 'char', sheet: '#4a0d17', smear: C.ink, leak: '#d0505c'},
  paper: {bg: ['#e4decd', '#b5ad95'], text: '#15181d', sub: '#3a3e45', dim: '#3f3f38', accent: C.crimson, bar: 'crimson', box: 'char', sheet: '#d8d1bd', smear: C.crimson, leak: '#ffffff', light: true},
  sepia: {bg: ['#4d3821', '#120c07'], text: '#f1e3c6', sub: C.tan, dim: '#a58c63', accent: C.crimson, bar: 'crimson', box: 'char', sheet: '#3c2b19', smear: C.blood, leak: '#e0b678'},
};
/** Field and colour names other themes use, so a storyboard can switch themes without editing props. */
const fieldAlias = {blue: 'steel', black: 'night', red: 'crimson', white: 'paper', lime: 'paper', magenta: 'crimson', violet: 'steel', sky: 'steel', cyan: 'steel', amber: 'sepia',
  sunset: 'crimson', dusk: 'night', candy: 'crimson', sea: 'steel', gold: 'sepia', dark: 'night', light: 'paper'};
const toneAlias = {red: 'crimson', pink: 'crimson', magenta: 'crimson', hot: 'crimson', candy: 'crimson', coral: 'crimson', orange: 'crimson', yellow: 'bone', lime: 'bone', gold: 'bone', amber: 'bone', white: 'bone', paper: 'bone',
  cyan: 'steel', blue: 'steel', teal: 'steel', aqua: 'steel', sea: 'steel', sky: 'steel', violet: 'steel', cool: 'steel', night: 'char', black: 'char', dusk: 'char', dark: 'char', plum: 'char'};
export const fieldOf = name => fields[name] ?? fields[fieldAlias[name]] ?? fields.night;
/** A bar fill of this theme ('crimson', 'char', 'bone', 'steel', 'glass') for a colour name from any theme. */
export const tone = c => ['crimson', 'char', 'bone', 'steel', 'glass', 'paper'].includes(c) ? (c === 'paper' ? 'bone' : c) : toneAlias[c] ?? 'crimson';
const FILLS = {crimson: C.crimson, char: C.char, bone: C.bone, steel: C.steel, glass: C.glass};
/** CSS colour of a fill name; real CSS colours pass through. */
export const fillOf = name => FILLS[name] ?? C[name] ?? name;
/** Readable text colour on a fill. */
export const inkOn = fill => fill === 'bone' || fill === 'steel' ? '#12151a' : C.bone;
export const up = s => String(s ?? '').toUpperCase();
export const oneLine = s => String(s ?? '').replace(/\s*\n\s*/g, ' ');

// ---------------------------------------------------------------- seeded randomness and motion
export const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/** Smooth 1D value noise, 0..1. */
export const noise = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return mix(hash(i), hash(i + 1), u); };
export const easeIn = x => { x = clamp(x); return x * x * x; };
/** A long, soft settle: the theme's standard ease (no overshoot). */
export const settle = x => 1 - Math.pow(1 - clamp(x), 4);
/** 0 while an overlay is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .5) => life ? easeInOut(span(t, life - len, len)) : 0;
/** Opacity of an overlay through its life: a quick fade up, and a fade down when `life` is given. */
export const presence = (t, life, len = .5) => span(t, 0, .2) * (1 - leave(t, life, len));
/** The frame number film effects step on: old film runs slow, so dust and flicker change 12 times a second. */
export const tick = (t, fps = 12) => Math.floor(t * fps + 1e-6);
/** Gate weave: the whole picture wandering a pixel or two, [dx, dy]. */
export const weave = (t, amp = 1.6) => [(noise(t * 5.1) - .5) * 2 * amp + (hash(tick(t)) - .5) * amp * .5, (noise(t * 4.3 + 40) - .5) * 2 * amp];
/** Projector flicker, 0..1 darkness for a black wash: mostly tiny, now and then a visible dip. */
export const flicker = (t, amount = 1) => { const f = tick(t), base = hash(f * 1.31) * .05, dip = hash(f * .77 + 9) > .93 ? .1 + .1 * hash(f) : 0; return (base + dip) * amount; };
/**
 * The constant slow camera move every card and print carries, as an SVG transform about (cx, cy):
 * a linear push-in with a slight turn and slide. `dur` is how long the move takes to travel its full amount.
 */
export function drift(t, cx, cy, {dur = 6, zoom = .05, dx = 0, dy = 0, rot = 0, from = 1} = {}) {
  const q = t / dur;
  return `translate(${cx + dx * q} ${cy + dy * q}) rotate(${rot * q}) scale(${from + zoom * q}) translate(${-cx} ${-cy})`;
}
export const place = (sel, x, y, scale = 1, rot = 0) => sel.attr('transform', `translate(${x} ${y}) rotate(${rot}) scale(${Math.max(.0001, scale)})`);

// ---------------------------------------------------------------- textures (made once, in canvas)
let ids = 0;
export const uid = (p = 'h') => `${p}${++ids}`;
const tiles = {};
function tile(name) {
  if (tiles[name]) return tiles[name];
  const n = 256, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const ctx = cv.getContext('2d'), im = ctx.createImageData(n, n), d = im.data;
  let s = name === 'grain' ? 1234567 : 7654321; const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let r = Math.imul(s ^ s >>> 15, 1 | s); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; };
  if (name === 'grain') for (let i = 0; i < n * n; i++) { const v = rnd(); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v > .5 ? 255 : 0; d[i * 4 + 3] = Math.abs(v - .5) * 2 * 120; }
  else {                                              // paper: soft mottling plus fibres and specks, as dark/light alpha
    const g = 17, grid = Array.from({length: g * g}, rnd), at = (x, y) => grid[(y % (g - 1)) * g + x % (g - 1)];
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const fx = x / n * (g - 1), fy = y / n * (g - 1), ix = Math.floor(fx), iy = Math.floor(fy), ux = fx - ix, uy = fy - iy;
      const m = mix(mix(at(ix, iy), at(ix + 1, iy), ux), mix(at(ix, iy + 1), at(ix + 1, iy + 1), ux), uy), sp = rnd(), v = (m - .5) * 1.5 + (sp - .5) * .5 + (sp > .992 ? -1.4 : 0);
      const i = (y * n + x) * 4; d[i] = d[i + 1] = d[i + 2] = v > 0 ? 255 : 0; d[i + 3] = Math.min(255, Math.abs(v) * (v > 0 ? 70 : 150));
    }
  }
  ctx.putImageData(im, 0, 0);
  return tiles[name] = cv.toDataURL('image/png');
}
/** A pattern fill of one of the kit textures ('grain' or 'paper'). Returns {url, shift(dx, dy)}. */
export function texture(defs, name, scale = 2) {
  const id = uid('tx'), p = defs.append('pattern').attr('id', id).attr('patternUnits', 'userSpaceOnUse').attr('width', 256 * scale).attr('height', 256 * scale);
  p.append('image').attr('href', tile(name)).attr('width', 256 * scale).attr('height', 256 * scale).attr('preserveAspectRatio', 'none');
  return {url: `url(#${id})`, shift: (dx, dy) => p.attr('patternTransform', `translate(${dx} ${dy})`)};
}

// ---------------------------------------------------------------- stage
/**
 * An SVG stage.
 *   overlay: true -> transparent 1080x1920, to sit on footage (no backdrop, no film layer).
 *   size: 1000    -> a square 1000x1000 diagram card; `clear: true` leaves out the backdrop.
 *   otherwise     -> a full-frame card: 1080 wide and as tall as the element it is mounted in
 *                    (1080 square up to 1920 portrait), so lay out from W and H.
 * Layers back < root < front. Draw into `root`. Cards get the field's backdrop in `back` and film
 * wear in `front`; call stage.live(t) from seek to run them (drift of the backdrop, grain, dust, flicker).
 */
export function stage(el, {overlay = false, size = 0, clear = false, field = 'night', wear = 1, seed = 1} = {}) {
  const d3 = window.d3, W = size || 1080, cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const H = size || (overlay ? 1920 : Math.round(clamp(W * ch / cw, 1080, 1920))), ink = fieldOf(field);
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), back = svg.append('g'), root = svg.append('g'), front = svg.append('g').style('pointer-events', 'none');
  const st = {svg, defs, back, root, front, W, H, ink, field, k: H / 1920, sq: H < 1500, seed, live: () => {}};
  const bare = overlay || clear;
  el.style.background = bare ? 'transparent' : C.night;
  if (!bare) {
    const bd = backdrop(st), fx = film(st, {amount: wear});
    st.live = t => { bd(t); fx(t); };
  }
  return st;
}
/**
 * A field's backdrop: a dark table lit from above, two or three big torn sheets lying on it at small
 * angles, faint small print, and a dry brush smear along one edge. Returns seek(t) for its slow parallax.
 */
export function backdrop(st) {
  const {back: g, defs, W, H, ink, seed} = st, id = uid('bg');
  const rg = defs.append('radialGradient').attr('id', id).attr('cx', '50%').attr('cy', '38%').attr('r', '75%');
  rg.append('stop').attr('offset', 0).attr('stop-color', ink.bg[0]); rg.append('stop').attr('offset', 1).attr('stop-color', ink.bg[1]);
  g.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id})`);
  const paper = texture(defs, 'paper', 3), layers = [];
  const lay = (x, y, w, h, rot, fill, o, rate, sd) => { const outer = g.append('g'), s = outer.append('g').attr('transform', `rotate(${rot} ${x + w / 2} ${y + h / 2})`), d = torn(x, y, w, h, {seed: sd, rough: 16, step: 34});
    s.append('path').attr('d', d).attr('fill', '#000').attr('opacity', .45).attr('transform', 'translate(10 16)'); s.append('path').attr('d', d).attr('fill', fill).attr('opacity', o); s.append('path').attr('d', d).attr('fill', paper.url).attr('opacity', ink.light ? .5 : .28);
    layers.push({outer, rate}); return s; };
  lay(-W * .12, H * .1, W * 1.02, H * .62, -3.2, ink.sheet, .9, 1, seed + 1);
  lay(W * .16, H * .46, W * 1.0, H * .5, 2.4, ink.sheet, .75, -1.4, seed + 2);
  const top = lay(-W * .06, -H * .05, W * .7, H * .2, 1.6, ink.light ? '#c9c1aa' : mixHex(ink.sheet, '#8d8872', .28), .85, 2, seed + 3);
  greek(top, W * .05, H * .035, W * .4, 5, {seed: seed + 4, color: ink.text, opacity: ink.light ? .28 : .14});
  greek(g, W * .62, H * .88, W * .32, 6, {seed: seed + 5, color: ink.text, opacity: ink.light ? .3 : .13});
  const smear = brush(g, -W * .05, H * .955, W * .62, H * .03, {color: ink.smear, seed: seed + 6, opacity: ink.light ? .7 : .55});
  const smear2 = brush(g, W * .9, H * .06, W * .16, H * .016, {color: ink.smear, seed: seed + 7, opacity: .5});
  return t => { layers.forEach(({outer, rate}) => outer.attr('transform', `translate(${rate * t * 3.2} ${-rate * t * 1.6})`)); smear.reveal(1); smear2.reveal(1); };
}
/**
 * Film wear over a whole card: moving grain, dust, hairline scratches, vignette, projector flicker and
 * a slow cold light leak. Returns seek(t). `amount` scales all of it (0 = none).
 */
export function film(st, {amount = 1, vignette = 1, leak = 1} = {}) {
  const {front: g, defs, W, H, ink} = st; if (!amount) return () => {};
  const vid = uid('vg'), lid = uid('lk'), grain = texture(defs, 'grain', 2);
  const v = defs.append('radialGradient').attr('id', vid).attr('cx', '50%').attr('cy', '46%').attr('r', '72%');
  v.append('stop').attr('offset', .45).attr('stop-color', '#000').attr('stop-opacity', 0); v.append('stop').attr('offset', 1).attr('stop-color', '#000').attr('stop-opacity', (ink.light ? .5 : .8) * vignette);
  const l = defs.append('radialGradient').attr('id', lid); l.append('stop').attr('offset', 0).attr('stop-color', ink.leak).attr('stop-opacity', .5); l.append('stop').attr('offset', 1).attr('stop-color', ink.leak).attr('stop-opacity', 0);
  const leakE = g.append('ellipse').attr('rx', W * .55).attr('ry', H * .42).attr('fill', `url(#${lid})`).style('mix-blend-mode', 'screen');
  g.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${vid})`);
  const grainR = g.append('rect').attr('x', -600).attr('y', -600).attr('width', W + 1200).attr('height', H + 1200).attr('fill', grain.url).attr('opacity', .16 * amount);
  const scratches = [0, 1, 2].map(() => g.append('rect').attr('y', 0).attr('height', H).attr('width', 1.6).attr('fill', '#fff'));
  const dust = Array.from({length: 9}, (_, i) => i % 3 === 2 ? g.append('path').attr('fill', 'none').attr('stroke', i % 2 ? '#000' : '#fff').attr('stroke-width', 1.6).attr('stroke-linecap', 'round') : g.append('circle').attr('fill', i % 2 ? '#000' : '#fff'));
  const dark = g.append('rect').attr('width', W).attr('height', H).attr('fill', '#000');
  return t => {
    const f = tick(t);
    grainR.attr('transform', `translate(${hash(f * 3.1) * 500} ${hash(f * 5.7) * 500})`);
    scratches.forEach((s, i) => { const on = hash(f * .13 + i * 7 | 0) > .55 && hash(f + i * 13) > .3; s.attr('x', W * (.08 + .84 * noise(t * .35 + i * 19)) + hash(f + i) * 3).attr('opacity', on ? (.1 + .12 * hash(f * 1.7 + i)) * amount : 0); });
    dust.forEach((dn, i) => { const on = hash(f * 1.9 + i * 3.3) > .72, x = hash(f * 2.3 + i * 11) * W, y = hash(f * 4.1 + i * 17) * H, r = 1.5 + hash(f + i * 5) * 4;
      dn.attr('opacity', on ? .5 * amount : 0); if (i % 3 === 2) dn.attr('d', `M${x} ${y}q${(hash(f + i) - .5) * 60} ${20 + r * 5} ${(hash(f * 2 + i) - .5) * 30} ${50 + r * 8}`); else dn.attr('cx', x).attr('cy', y).attr('r', r); });
    dark.attr('opacity', flicker(t, amount));
    leakE.attr('cx', W * (-.2 + 1.4 * ((t * .11 + .15) % 1))).attr('cy', H * (.3 + .25 * noise(t * .2))).attr('opacity', leak * amount * (.25 + .55 * noise(t * .9 + 3)) * (.75 + .25 * hash(f)));
  };
}
export function mixHex(a, b, q) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(mix(v, y[i], q)).toString(16).padStart(2, '0')).join(''); }

// ---------------------------------------------------------------- paper, brush, small print
const pt = p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
export const poly = pts => 'M' + pts.map(pt).join('L') + 'Z';
/** A rectangle with torn, ragged edges, as a path. `sides` names the edges that are torn (t, r, b, l); the rest stay straight. */
export function torn(x, y, w, h, {seed = 1, rough = 7, step = 26, sides = 'trbl'} = {}) {
  const pts = [], edge = (x0, y0, x1, y1, nx, ny, on, s) => {
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let i = 0; i < n; i++) {
      const q = i / n, d = on ? ((noise(i * .31 + s * 17.3 + seed * 5.1) - .5) * 2 * rough + (hash(i * 1.7 + s * 31 + seed * 7) - .5) * rough * .9) * (i ? 1 : .3) : 0;
      pts.push([x0 + (x1 - x0) * q + nx * d, y0 + (y1 - y0) * q + ny * d]);
    }
  };
  edge(x, y, x + w, y, 0, 1, sides.includes('t'), 1); edge(x + w, y, x + w, y + h, 1, 0, sides.includes('r'), 2);
  edge(x + w, y + h, x, y + h, 0, 1, sides.includes('b'), 3); edge(x, y + h, x, y, 1, 0, sides.includes('l'), 4);
  return poly(pts);
}
let papers = new WeakMap();
const paperOf = g => { const svg = window.d3.select(g.node().ownerSVGElement ?? g.node()), node = svg.node(); if (!papers.has(node)) { let defs = svg.select('defs'); if (defs.empty()) defs = svg.insert('defs', ':first-child'); papers.set(node, texture(defs, 'paper', 2.5).url); } return papers.get(node); };
/**
 * A sheet of paper with torn edges, a soft shadow and mottled texture. `fill` is a CSS colour
 * (C.paper for a print, C.bone for a clean card, a dark tone for backing sheets).
 * Returns {g, d, clip}: draw onto it in `g`; `clip` is a clip-path url of its outline.
 */
export function sheet(g, x, y, w, h, {fill = C.paper, seed = 1, rough = 7, step = 26, sides = 'trbl', shadow = .5, wear = .3} = {}) {
  const s = g.append('g'), d = torn(x, y, w, h, {seed, rough, step, sides}), id = uid('sh');
  if (shadow) { s.append('path').attr('d', d).attr('fill', '#000').attr('opacity', shadow * .5).attr('transform', 'translate(16 22)'); s.append('path').attr('d', d).attr('fill', '#000').attr('opacity', shadow * .7).attr('transform', 'translate(6 9)'); }
  s.append('path').attr('d', d).attr('fill', fill);
  if (wear) s.append('path').attr('d', d).attr('fill', paperOf(g)).attr('opacity', wear);
  s.append('clipPath').attr('id', id).append('path').attr('d', d);
  return {g: s, d, clip: `url(#${id})`};
}
/**
 * A dry-brush stroke in a box: overlapping bristle bands with ragged ends. Returns {g, reveal(q)}:
 * reveal wipes it on from the left (or the right with `from: 'right'`); call it from seek.
 */
export function brush(g, x, y, w, h, {color = C.crimson, seed = 1, bands = 7, opacity = 1, from = 'left'} = {}) {
  const id = uid('br'), grp = g.append('g').attr('opacity', opacity), clip = grp.append('clipPath').attr('id', id).append('rect').attr('x', x - 40).attr('y', y - h).attr('height', h * 3).attr('width', w + 80);
  const inner = grp.append('g').attr('clip-path', `url(#${id})`);
  for (let i = 0; i < bands; i++) {
    const by = y + h * i / bands, bh = h / bands * (1.2 + hash(seed * 3 + i) * .7), x0 = x + w * .06 * hash(seed + i * 1.7), x1 = x + w - w * .2 * hash(seed * 2 + i * 2.3) ** 2;
    const top = [], bot = [], n = Math.max(4, Math.round((x1 - x0) / 46));
    for (let k = 0; k <= n; k++) { const px = x0 + (x1 - x0) * k / n; top.push([px, by + (noise(k * .7 + i * 9 + seed) - .5) * bh * .6]); bot.push([px, by + bh + (noise(k * .6 + i * 13 + seed * 3) - .5) * bh * .6]); }
    inner.append('path').attr('d', poly([...top, ...bot.reverse()])).attr('fill', color).attr('opacity', .5 + .5 * hash(seed + i * 5.3));
  }
  for (let i = 0; i < 10; i++) inner.append('circle').attr('cx', x + w * (.8 + .22 * hash(seed + i * 3.9))).attr('cy', y + h * (hash(seed * 5 + i) * 1.6 - .3)).attr('r', 1 + hash(seed + i) * Math.max(2, h * .05)).attr('fill', color).attr('opacity', .7);
  return {g: grp, reveal(q) { q = clamp(q); const cw = (w + 80) * q; clip.attr('width', cw).attr('x', from === 'right' ? x + w + 40 - cw : x - 40); }};
}
/** Unreadable small print: rows of tiny word-length dashes, like body copy seen from far away. */
export function greek(g, x, y, w, rows, {seed = 1, size = 9, color = C.bone, opacity = .16, gap = 2.1} = {}) {
  const grp = g.append('g').attr('opacity', opacity); let d = '';
  for (let r = 0; r < rows; r++) { let cx = x; const end = x + w * (r === rows - 1 ? .35 + .4 * hash(seed + r) : .86 + .14 * hash(seed * 3 + r));
    for (let k = 0; cx < end; k++) { const len = size * (1.2 + hash(seed + r * 13 + k * 1.3) * 4.5); d += `M${cx.toFixed(0)} ${(y + r * size * gap).toFixed(0)}h${Math.min(len, end - cx).toFixed(0)}`; cx += len + size * .7; } }
  grp.append('path').attr('d', d).attr('stroke', color).attr('stroke-width', size * .42).attr('fill', 'none');
  return grp;
}
/** A strip of masking tape centred on the origin of the returned group. */
export function tape(g, w = 150, h = 46, {seed = 1, color = '#d9d2bd', opacity = .82} = {}) {
  const s = g.append('g'); s.append('path').attr('d', torn(-w / 2, -h / 2, w, h, {seed, rough: 5, step: 7, sides: 'rl'})).attr('fill', color).attr('opacity', opacity);
  s.append('path').attr('d', `M${-w / 2 + 8} ${-h / 2 + 5}H${w / 2 - 8}`).attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', .25); return s;
}
/** A rule with end ticks (and optional minor ticks every `every` px), the theme's measuring line. */
export function rule(g, x0, y, x1, {color = C.bone, width = 2, tickH = 12, every = 0, opacity = 1} = {}) {
  let d = `M${x0} ${y}H${x1}M${x0} ${y - tickH}v${tickH * 2}M${x1} ${y - tickH}v${tickH * 2}`;
  if (every) for (let x = x0 + every; x < x1 - 1; x += every) d += `M${x} ${y - tickH * .5}v${tickH}`;
  return g.append('path').attr('d', d).attr('stroke', color).attr('stroke-width', width).attr('fill', 'none').attr('opacity', opacity);
}
/**
 * A round archive rubber stamp centred on the returned group's origin: two rough rings, text set
 * around the ring and a word across the middle, printed unevenly.
 */
export function stamp(g, r, {ring = 'ARCHIVE COPY', word = 'FILED', color = C.crimson, seed = 1} = {}) {
  const s = g.append('g'), id = uid('st'), rr = r * .78;
  s.append('circle').attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', r * .06).attr('stroke-dasharray', `${r * (1.3 + hash(seed))} ${r * .05} ${r * .7} ${r * .03}`);
  s.append('circle').attr('r', r * .58).attr('fill', 'none').attr('stroke', color).attr('stroke-width', r * .03).attr('stroke-dasharray', `${r * .9} ${r * .04}`);
  s.append('path').attr('id', id).attr('d', `M${-rr} 0A${rr} ${rr} 0 1 1 ${rr} 0A${rr} ${rr} 0 1 1 ${-rr} 0`).attr('fill', 'none');
  const o = {font: F.head, weight: 500, spacing: .16}, str = up(oneLine(ring)) + '  ·  ', size = Math.min(r * .2, 100 * (2 * Math.PI * rr) / Math.max(1, measure(str, 100, o)));
  s.append('text').attr('fill', color).style('font', css(size, o)).style('letter-spacing', '.16em').attr('dy', size * .36).append('textPath').attr('href', `#${id}`).text(str);
  const ws = fit(up(word), r * 1.0, r * .36, {font: F.head, weight: 700, spacing: .04});
  s.append('text').attr('fill', color).attr('text-anchor', 'middle').attr('y', capH(ws, {weight: 700}) / 2).style('font', css(ws, {weight: 700})).style('letter-spacing', '.04em').text(up(word));
  s.attr('opacity', .88); return s;
}

// ---------------------------------------------------------------- text: measuring, fitting, splitting
let ctx = null; const caps = {};
const css = (size, {font = F.head, weight = 500} = {}) => `${weight} ${size}px ${font}`;
export function measure(str, size, o = {}) { ctx ??= document.createElement('canvas').getContext('2d'); ctx.font = css(100, o); return (ctx.measureText(str).width + (o.spacing ?? .02) * 100 * [...str].length) * size / 100; }
export function capH(size, o = {}) { ctx ??= document.createElement('canvas').getContext('2d'); const key = css(100, o); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 72; } return caps[key] * size / 100; }
/** The largest size (up to max) at which every line fits the width. */
export const fit = (lines, width, max, o = {}) => Math.min(max, ...[].concat(lines).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
export function wrap(str, size, width, o = {}) {
  const lines = []; let line = '';
  for (const word of String(str).split(/\s+/).filter(Boolean)) { const next = line ? line + ' ' + word : word; if (line && measure(next, size, o) > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
/** The largest size (max down to min) at which the sentence wraps inside a width x height box. Returns {size, lines, pitch}. */
export function flow(str, width, height, max, min = 26, o = {}, leading = 1.25) {
  for (let size = max; ; size -= 3) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading * 1.3; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/** Plain text; '\n' starts a new line. Defaults to medium Oswald in bone. */
export function txt(g, x, y, str, {size = 30, color = C.bone, font = F.head, weight = 500, anchor = 'start', spacing = .04, leading = 1.25, opacity = 1} = {}) {
  const node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).attr('opacity', opacity).style('font', css(size, {font, weight})).style('letter-spacing', `${spacing}em`);
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}
/**
 * Text that types on, for typewriter and handwriting lines: set(q) shows the first q of its characters
 * (single line, start- or end-anchored text keeps its place because the full width is reserved).
 */
export function typed(g, x, y, str, {size = 28, color = C.bone, font = F.type, weight = 400, anchor = 'start', spacing = .02, opacity = 1} = {}) {
  str = String(str ?? ''); const o = {font, weight, spacing}, w = measure(str, size, o), x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const node = g.append('text').attr('x', x0).attr('y', y).attr('fill', color).attr('opacity', opacity).style('font', css(size, o)).style('letter-spacing', `${spacing}em`).style('white-space', 'pre');
  let shown = -1; const chars = [...str];
  return {node, w, set(q) { const n = Math.round(clamp(q) * chars.length); if (n !== shown) { node.text(chars.slice(0, n).join('')); shown = n; } }};
}
/**
 * A line split into separately animated units: by 'letter', 'word' or 'all'.
 * Returns [{node, cx, y, w, cap, i, n, str}]; move a unit with pose() or one of the moves below.
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = C.bone, font = F.head, weight = 700, spacing = .02} = {}) {
  const o = {font, weight, spacing}, total = measure(str, size, o) - spacing * size, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - spacing * size, cx = x0 + measure(str.slice(0, at), size, o) + w / 2;
    const node = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    node.append('text').attr('text-anchor', 'middle').attr('fill', color).style('font', css(size, o)).style('letter-spacing', by === 'letter' ? null : `${spacing}em`).text(c);
    return {node, cx, y, w, cap, size, i, n: all.length, str: c};
  });
}
/** Move, scale (about the middle of the cap height), rotate and fade one unit from glyphs(). */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, rot = 0, o = 1} = {}) {
  u.node.attr('transform', `translate(${x} ${y - u.cap / 2}) rotate(${rot}) scale(${sx || .0001} ${sy || .0001}) translate(0 ${u.cap / 2})`).attr('opacity', o);
}
/** The standard arrival: a unit fades up while settling down from slightly large and slightly low. `x` is the leave amount. */
export function arrive(u, q, x = 0, {from = 1.18, rise = 26} = {}) { const e = settle(q); pose(u, {y: rise * (1 - e) + x * 24, sx: from + (1 - from) * e, o: clamp(q * 2.2) * (1 - x)}); }
/** Pressed on like a stamp or a struck key: large and faint to exact, fast, with no bounce. */
export function press(u, q, x = 0, from = 1.5) { const e = easeOut(q); pose(u, {sx: from + (1 - from) * e, o: clamp(q * 3) * (1 - x), y: x * 24}); }

// ---------------------------------------------------------------- bars and plates (the signature labels)
/**
 * A label bar: text on a rough-edged block. Origin at its left-middle. fill: 'crimson', 'char', 'bone',
 * 'steel' or 'glass'. Returns {g, w, h, reveal(q, x)}: the block wipes on from the left and the text fades
 * in behind the wipe; x (0..1) fades it out again. Call reveal from seek.
 */
export function bar(g, str, {size = 44, fill = 'crimson', color = null, font = F.head, weight = 500, spacing = .04, padX = null, padY = null, seed = 1, caps: uc = true, from = 'left'} = {}) {
  str = uc ? up(oneLine(str)) : oneLine(str); const o = {font, weight, spacing}, cap = capH(size, o), px = padX ?? size * .42, py = padY ?? size * .3;
  const tw = measure(str, size, o) - spacing * size, w = tw + px * 2, h = cap + py * 2, id = uid('bc'), s = g.append('g'), inner = s.append('g');
  const clip = inner.append('clipPath').attr('id', id).append('rect').attr('y', -h).attr('height', h * 2).attr('x', -10).attr('width', w + 20);
  const body = inner.append('g').attr('clip-path', `url(#${id})`), d = torn(0, -h / 2, w, h, {seed: seed + str.length, rough: Math.min(4, size * .06), step: 9, sides: 'rl'});
  body.append('path').attr('d', d).attr('fill', fillOf(fill));
  if (fill === 'crimson') for (let i = 0; i < 3; i++) body.append('path').attr('d', `M${w * hash(seed + i) * .3} ${-h / 2 + h * (.2 + .3 * i)}h${w * (.4 + .5 * hash(seed + i * 3))}`).attr('stroke', C.blood).attr('stroke-width', 1.5 + hash(seed + i * 7) * 2).attr('opacity', .45);
  const label = body.append('text').attr('x', px).attr('y', cap / 2).attr('fill', color ?? inkOn(fill)).style('font', css(size, o)).style('letter-spacing', `${spacing}em`).text(str);
  return {g: s, w, h, cap, reveal(q, x = 0) {
    const e = settle(span(q, 0, .7)), cw = (w + 20) * e; clip.attr('width', cw).attr('x', from === 'right' ? w + 10 - cw : -10);
    label.attr('opacity', span(q, .35, .5)).attr('transform', `translate(${(from === 'right' ? 16 : -16) * (1 - settle(span(q, .3, .7)))} 0)`);
    s.attr('opacity', q <= 0 ? 0 : 1 - x);
  }};
}
/**
 * The theme's stacked caption: a year or number on a charcoal box, a name on a crimson bar and a
 * description on a dark strip, each nudged sideways from the last. Any of the three may be empty.
 * Origin: left edge, top of the stack ('right' aligns the stack to x = 0 on its right edge).
 * Returns {g, w, h, reveal(t, start = 0, x = 0)}: rows wipe on one after another from time `start` (seconds).
 */
export function plate(g, {date = '', name = '', sub = '', align = 'left', scale = 1, fill = 'crimson', gap = .22, seed = 1} = {}) {
  const s = g.append('g'), rows = [], S = scale;
  if (date) rows.push({b: bar(s, date, {size: 92 * S, fill: 'char', weight: 700, spacing: .02, padY: 20 * S, seed}), dx: 34 * S});
  if (name) rows.push({b: bar(s, name, {size: 50 * S, fill, weight: 500, seed: seed + 1, caps: false}), dx: 0});
  if (sub) rows.push({b: bar(s, sub, {size: 36 * S, fill: 'glass', weight: 400, seed: seed + 2, caps: false, spacing: .05}), dx: 58 * S});
  let y = 0, w = 0; rows.forEach((r, i) => { r.y = y + r.b.h / 2; y += r.b.h - (i < rows.length - 1 ? 4 * S : 0); w = Math.max(w, r.dx + r.b.w); });
  rows.forEach(r => r.b.g.attr('transform', `translate(${align === 'right' ? -r.dx - r.b.w : r.dx} ${r.y})`));
  return {g: s, w, h: y, rows, reveal(t, start = 0, x = 0) { rows.forEach((r, i) => r.b.reveal(span(t, start + i * gap, .7), x)); }};
}

// ---------------------------------------------------------------- photographs (placeholders drawn in code)
const TONES = {silver: ['#0c1117', '#e7ebee'], blue: ['#07101e', '#d3e1f2'], sepia: ['#1b120a', '#ecdcc0']};
/** Grey value 0..1 -> colour in a photographic tone ('silver', 'blue' or 'sepia'). */
export const gray = (v, toneName = 'silver') => { const [a, b] = TONES[toneName] ?? TONES.silver; return mixHex(a, b, clamp(v)); };
const SCENES = {
  city(L, w, h, G, r) {
    for (let i = 0; i < 16; i++) { const bw = w * (.06 + .05 * r(i)), bx = -w * .1 + i * w * .08, bh = h * (.2 + .24 * r(i + 20)); L.far.append('rect').attr('x', bx).attr('y', h * .72 - bh).attr('width', bw).attr('height', bh).attr('fill', G(.6 + .1 * r(i + 40)));
      if (r(i + 60) > .7) L.far.append('path').attr('d', `M${bx + bw * .3} ${h * .72 - bh}l${bw * .2} ${-h * .12}l${bw * .2} ${h * .12}Z`).attr('fill', G(.58)); }
    for (let i = 0; i < 8; i++) { const bw = w * (.13 + .06 * r(i + 80)), bx = -w * .12 + i * w * .16, bh = h * (.3 + .26 * r(i + 90)), y = h * .8 - bh; L.mid.append('rect').attr('x', bx).attr('y', y).attr('width', bw).attr('height', bh).attr('fill', G(.36 + .12 * r(i + 100)));
      let d = ''; const cols = 4, rowsN = Math.floor(bh / (h * .06)); for (let c = 0; c < cols; c++) for (let k = 0; k < rowsN; k++) if (r(i * 31 + c * 7 + k) > .25) d += `M${bx + bw * (.14 + c * .2)} ${y + h * .03 + k * h * .06}v${h * .028}`;
      L.mid.append('path').attr('d', d).attr('stroke', G(.72)).attr('stroke-width', bw * .08).attr('opacity', .55); L.mid.append('rect').attr('x', bx - 3).attr('y', y - 5).attr('width', bw + 6).attr('height', 7).attr('fill', G(.28)); }
    L.near.append('rect').attr('x', -w * .2).attr('y', h * .8).attr('width', w * 1.4).attr('height', h * .3).attr('fill', G(.42)); L.near.append('rect').attr('x', -w * .2).attr('y', h * .88).attr('width', w * 1.4).attr('height', h * .2).attr('fill', G(.24));
    for (let i = 0; i < 5; i++) { const x = w * (-.05 + i * .27 + .05 * r(i + 130)); L.near.append('path').attr('d', `M${x} ${h * .93}v${-h * .3}`).attr('stroke', G(.08)).attr('stroke-width', w * .008); L.near.append('circle').attr('cx', x).attr('cy', h * .62).attr('r', w * .014).attr('fill', G(.85)).attr('stroke', G(.08)).attr('stroke-width', 2); }
    for (let i = 0; i < 9; i++) { const x = w * (r(i + 150) * 1.1 - .05), s = h * (.05 + .03 * r(i + 160)), y = h * (.9 + .06 * r(i + 170)); L.near.append('ellipse').attr('cx', x).attr('cy', y - s * 1.05).attr('rx', s * .16).attr('ry', s * .18).attr('fill', G(.1)); L.near.append('path').attr('d', `M${x - s * .2} ${y}l${s * .05} ${-s * .85}h${s * .3}l${s * .05} ${s * .85}Z`).attr('fill', G(.07)); }
  },
  portrait(L, w, h, G, r, defs) {
    const id = uid('pg'), rg = defs.append('radialGradient').attr('id', id).attr('cx', '50%').attr('cy', '40%').attr('r', '70%'); rg.append('stop').attr('offset', 0).attr('stop-color', G(.62)); rg.append('stop').attr('offset', 1).attr('stop-color', G(.2));
    L.far.append('rect').attr('x', -w * .15).attr('y', -h * .1).attr('width', w * 1.3).attr('height', h * 1.2).attr('fill', `url(#${id})`);
    const cx = w * .5, hy = h * .4, hr = Math.min(w, h) * .19;
    L.mid.append('path').attr('d', `M${cx - hr * 3.1} ${h * 1.1}C${cx - hr * 3} ${h * .78} ${cx - hr * 1.6} ${hy + hr * 1.9} ${cx - hr * .6} ${hy + hr * 1.65}L${cx + hr * .6} ${hy + hr * 1.65}C${cx + hr * 1.6} ${hy + hr * 1.9} ${cx + hr * 3} ${h * .78} ${cx + hr * 3.1} ${h * 1.1}Z`).attr('fill', G(.13));
    L.mid.append('path').attr('d', `M${cx - hr * .5} ${hy + hr * .7}h${hr}l${hr * .16} ${hr * 1.05}l${-hr * .66} ${hr * .7}l${-hr * .66} ${-hr * .7}Z`).attr('fill', G(.56));
    L.mid.append('path').attr('d', `M${cx - hr * .7} ${hy + hr * 1.62}l${hr * .7} ${hr * .8}l${hr * .7} ${-hr * .8}l${hr * .2} ${hr * .5}l${-hr * .9} ${hr * 1.1}l${-hr * .9} ${-hr * 1.1}Z`).attr('fill', G(.86));
    L.mid.append('ellipse').attr('cx', cx).attr('cy', hy).attr('rx', hr * .86).attr('ry', hr * 1.12).attr('fill', G(.7));
    L.mid.append('path').attr('d', `M${cx} ${hy - hr * 1.12}A${hr * .86} ${hr * 1.12} 0 0 1 ${cx} ${hy + hr * 1.12}A${hr * .5} ${hr * 1.12} 0 0 0 ${cx} ${hy - hr * 1.12}Z`).attr('fill', G(.3)).attr('opacity', .5);
    L.mid.append('path').attr('d', `M${cx - hr * .9} ${hy - hr * .2}C${cx - hr * 1.05} ${hy - hr * 1.5} ${cx + hr * 1.05} ${hy - hr * 1.5} ${cx + hr * .9} ${hy - hr * .2}C${cx + hr * .7} ${hy - hr * .85} ${cx - hr * .5} ${hy - hr * .95} ${cx - hr * .9} ${hy - hr * .2}Z`).attr('fill', G(.1));
  },
  landscape(L, w, h, G, r) {
    L.far.append('circle').attr('cx', w * .72).attr('cy', h * .3).attr('r', h * .09).attr('fill', G(1)).attr('opacity', .9);
    const hills = (layer, base, amp, tone, s, f) => { const p = [[-w * .2, h * 1.1]]; for (let i = 0; i <= 28; i++) p.push([-w * .2 + i * w * .05, base - amp * (noise(i * f + s) + .5 * noise(i * f * 2.3 + s * 3))]); p.push([w * 1.2, h * 1.1]); layer.append('path').attr('d', poly(p)).attr('fill', tone); };
    hills(L.far, h * .62, h * .2, G(.66), 3, .22); hills(L.mid, h * .76, h * .16, G(.44), 11, .3);
    for (let i = 0; i < 12; i++) { const x = w * (r(i + 5) * 1.2 - .1), y = h * (.68 + .08 * r(i + 30)), s = h * (.05 + .05 * r(i + 50)); L.mid.append('path').attr('d', `M${x} ${y - s * 2}l${s * .5} ${s * 2}h${-s}Z`).attr('fill', G(.2)); }
    hills(L.near, h * .93, h * .08, G(.2), 23, .4);
    for (let i = 0; i < 9; i++) { const x = w * (-.1 + i * .15); L.near.append('path').attr('d', `M${x} ${h * .98}v${-h * .1}`).attr('stroke', G(.08)).attr('stroke-width', w * .008); } L.near.append('path').attr('d', `M${-w * .2} ${h * .91}H${w * 1.2}M${-w * .2} ${h * .945}H${w * 1.2}`).attr('stroke', G(.08)).attr('stroke-width', 2.5);
  },
  ship(L, w, h, G, r) {
    for (let i = 0; i < 5; i++) L.far.append('ellipse').attr('cx', w * (r(i + 3) * 1.2 - .1)).attr('cy', h * (.14 + .22 * r(i + 9))).attr('rx', w * (.12 + .1 * r(i))).attr('ry', h * .035).attr('fill', G(.95)).attr('opacity', .5);
    L.far.append('rect').attr('x', -w * .2).attr('y', h * .66).attr('width', w * 1.4).attr('height', h * .5).attr('fill', G(.5));
    for (let i = 0; i < 6; i++) L.mid.append('ellipse').attr('cx', w * (.3 - i * .07)).attr('cy', h * (.3 - i * .035)).attr('rx', w * (.05 + i * .018)).attr('ry', h * (.04 + i * .012)).attr('fill', G(.3)).attr('opacity', .55 - i * .07);
    L.mid.append('path').attr('d', `M${w * .14} ${h * .6}H${w * .86}L${w * .8} ${h * .72}H${w * .2}Z`).attr('fill', G(.1)); L.mid.append('rect').attr('x', w * .26).attr('y', h * .53).attr('width', w * .46).attr('height', h * .075).attr('fill', G(.8));
    [.36, .48, .6].forEach(x => { L.mid.append('rect').attr('x', w * x).attr('y', h * .36).attr('width', w * .055).attr('height', h * .18).attr('fill', G(.22)); L.mid.append('rect').attr('x', w * x).attr('y', h * .36).attr('width', w * .055).attr('height', h * .03).attr('fill', G(.06)); });
    L.mid.append('path').attr('d', `M${w * .2} ${h * .6}V${h * .28}M${w * .8} ${h * .6}V${h * .3}`).attr('stroke', G(.1)).attr('stroke-width', w * .006);
    for (let i = 0; i < 16; i++) L.near.append('path').attr('d', `M${w * (r(i + 70) * 1.3 - .15)} ${h * (.75 + .24 * r(i + 80))}h${w * (.06 + .1 * r(i + 90))}`).attr('stroke', G(i % 2 ? .75 : .3)).attr('stroke-width', 2.5).attr('opacity', .6);
  },
  group(L, w, h, G, r) {
    L.far.append('rect').attr('x', -w * .2).attr('y', -h * .1).attr('width', w * 1.4).attr('height', h * 1.2).attr('fill', G(.5)); L.far.append('rect').attr('x', -w * .2).attr('y', h * .8).attr('width', w * 1.4).attr('height', h * .3).attr('fill', G(.3));
    for (let i = 0; i < 7; i++) L.far.append('path').attr('d', `M${w * (-.1 + i * .2)} ${-h * .1}V${h * .8}`).attr('stroke', G(.42)).attr('stroke-width', 4);
    const n = 5; for (let i = 0; i < n; i++) { const x = w * (.14 + i * .18), s = h * (.2 + .03 * r(i + 4)), top = h * (.3 + .05 * r(i + 14)), body = i % 2 ? G(.3) : G(.1), layer = i % 2 ? L.mid : L.near;
      layer.append('path').attr('d', `M${x - s * .52} ${h * 1.05}C${x - s * .6} ${top + s * .95} ${x - s * .45} ${top + s * .7} ${x - s * .18} ${top + s * .62}H${x + s * .18}C${x + s * .45} ${top + s * .7} ${x + s * .6} ${top + s * .95} ${x + s * .52} ${h * 1.05}Z`).attr('fill', body);
      layer.append('ellipse').attr('cx', x).attr('cy', top + s * .3).attr('rx', s * .2).attr('ry', s * .27).attr('fill', G(.68));
      if (r(i + 24) > .4) layer.append('path').attr('d', `M${x - s * .32} ${top + s * .14}h${s * .64}l${-s * .1} ${-s * .06}V${top - s * .06}h${-s * .44}V${top + s * .08}Z`).attr('fill', G(.07)); else layer.append('path').attr('d', `M${x - s * .2} ${top + s * .2}C${x - s * .2} ${top - s * .05} ${x + s * .2} ${top - s * .05} ${x + s * .2} ${top + s * .2}Z`).attr('fill', G(.1)); }
  },
  ruins(L, w, h, G, r) {
    const p = [[-w * .2, h * 1.1]]; for (let i = 0; i <= 20; i++) p.push([-w * .2 + i * w * .07, h * (.62 - .2 * noise(i * .4 + 5))]); p.push([w * 1.2, h * 1.1]); L.far.append('path').attr('d', poly(p)).attr('fill', G(.7));
    L.mid.append('rect').attr('x', -w * .2).attr('y', h * .8).attr('width', w * 1.4).attr('height', h * .3).attr('fill', G(.4));
    for (let i = 0; i < 6; i++) { const x = w * (.1 + i * .15), ch = h * (i === 2 || i === 4 ? .22 + .1 * r(i) : .48), cw = w * .055; L.mid.append('rect').attr('x', x).attr('y', h * .8 - ch).attr('width', cw).attr('height', ch).attr('fill', G(.82));
      L.mid.append('path').attr('d', `M${x + cw * .3} ${h * .8 - ch}V${h * .8}M${x + cw * .65} ${h * .8 - ch}V${h * .8}`).attr('stroke', G(.5)).attr('stroke-width', 2); if (ch > h * .4) L.mid.append('rect').attr('x', x - cw * .2).attr('y', h * .8 - ch - h * .025).attr('width', cw * 1.4).attr('height', h * .03).attr('fill', G(.9)); }
    L.mid.append('rect').attr('x', w * .08).attr('y', h * .27).attr('width', w * .26).attr('height', h * .04).attr('fill', G(.78));
    L.near.append('rect').attr('x', -w * .2).attr('y', h * .88).attr('width', w * 1.4).attr('height', h * .2).attr('fill', G(.22)); for (let i = 0; i < 6; i++) L.near.append('rect').attr('x', w * (r(i + 40) * 1.1 - .05)).attr('y', h * (.84 + .05 * r(i + 50))).attr('width', w * (.05 + .06 * r(i + 60))).attr('height', h * .05).attr('fill', G(.3 + .3 * r(i + 70)));
  },
};
export const scenes = Object.keys(SCENES);
/**
 * A stand-in archival photograph, w x h with its top-left at the group's origin, drawn in code in
 * layers so it can do the documentary pan. scene: 'city', 'portrait', 'landscape', 'ship', 'group' or
 * 'ruins'; tone: 'silver', 'blue' or 'sepia'. Pass `image` (a URL) to show a real picture instead,
 * turned monochrome. Returns {g, pan(q, {dx, dy, zoom})}: q 0..1 slides the layers at different rates
 * and pushes in. Always call pan from seek, with q = t / duration, so the print is never still.
 */
export function photo(g, w, h, {scene = 'city', tone: tn = 'silver', seed = 1, image = null, grain = .22, vignette = .5} = {}) {
  const s = g.append('g'), id = uid('ph'), G = v => gray(v, tn), r = n => hash(seed * 13.7 + n), defs = s.append('defs');
  defs.append('clipPath').attr('id', id).append('rect').attr('width', w).attr('height', h);
  const lg = defs.append('linearGradient').attr('id', id + 's').attr('x2', 0).attr('y2', 1); lg.append('stop').attr('offset', 0).attr('stop-color', G(.8)); lg.append('stop').attr('offset', .7).attr('stop-color', G(.98));
  const vg = defs.append('radialGradient').attr('id', id + 'v').attr('r', '75%'); vg.append('stop').attr('offset', .4).attr('stop-color', G(0)).attr('stop-opacity', 0); vg.append('stop').attr('offset', 1).attr('stop-color', G(0)).attr('stop-opacity', vignette);
  const box = s.append('g').attr('clip-path', `url(#${id})`), cam = box.append('g');
  cam.append('rect').attr('x', -w * .2).attr('y', -h * .2).attr('width', w * 1.4).attr('height', h * 1.4).attr('fill', `url(#${id}s)`);
  const L = {far: cam.append('g'), mid: cam.append('g'), near: cam.append('g')};
  if (image) {
    const f = defs.append('filter').attr('id', id + 'f'); f.append('feColorMatrix').attr('type', 'saturate').attr('values', 0);
    L.mid.append('image').attr('href', image).attr('x', -w * .06).attr('y', -h * .06).attr('width', w * 1.12).attr('height', h * 1.12).attr('preserveAspectRatio', 'xMidYMid slice').attr('filter', `url(#${id}f)`);
    L.near.append('rect').attr('x', -w * .2).attr('y', -h * .2).attr('width', w * 1.4).attr('height', h * 1.4).attr('fill', tn === 'sepia' ? '#a07a45' : tn === 'blue' ? '#3f6aa8' : '#5b7089').attr('opacity', .22).style('mix-blend-mode', 'color');
  } else (SCENES[scene] ?? SCENES.city)(L, w, h, G, r, defs);
  box.append('rect').attr('width', w).attr('height', h).attr('fill', `url(#${id}v)`);
  if (grain) box.append('rect').attr('width', w).attr('height', h).attr('fill', texture(defs, 'grain', 1.5).url).attr('opacity', grain);
  let d = ''; for (let i = 0; i < 14; i++) d += `M${(r(i + 200) * w).toFixed(0)} ${(r(i + 210) * h).toFixed(0)}l${((r(i + 220) - .5) * 14).toFixed(0)} ${(r(i + 230) * 40).toFixed(0)}`;
  box.append('path').attr('d', d).attr('stroke', G(1)).attr('stroke-width', 1.4).attr('opacity', .35).attr('fill', 'none');
  const pan = (q, {dx = 46, dy = 0, zoom = .07} = {}) => {
    cam.attr('transform', `translate(${w / 2} ${h / 2}) scale(${1.02 + zoom * q}) translate(${-w / 2} ${-h / 2})`);
    [[L.far, .25], [L.mid, .6], [L.near, 1]].forEach(([l, k]) => l.attr('transform', `translate(${dx * k * (.5 - q)} ${dy * k * (.5 - q)})`));
  };
  pan(0);
  return {g: s, cam, layers: L, pan};
}
/**
 * A photographic print: a photo on a torn paper sheet with a border, centred on the returned group's
 * origin. w x h is the picture; `border` the paper margin. Returns {g, photo, pan, w, h} (outer size).
 */
export function print(g, w, h, {border = 26, fill = C.paper, seed = 1, tapes = 0, ...photoOpts} = {}) {
  const s = g.append('g'), ow = w + border * 2, oh = h + border * 2;
  sheet(s, -ow / 2, -oh / 2, ow, oh, {fill, seed, rough: 6, step: 22});
  const ph = photo(s.append('g').attr('transform', `translate(${-w / 2} ${-h / 2})`), w, h, {seed, ...photoOpts});
  if (tapes > 0) tape(s, 150, 44, {seed}).attr('transform', `translate(${-ow * .28} ${-oh / 2 + 4}) rotate(-5)`);
  if (tapes > 1) tape(s, 150, 44, {seed: seed + 3}).attr('transform', `translate(${ow * .3} ${-oh / 2 + 6}) rotate(4)`);
  return {g: s, photo: ph, pan: ph.pan, w: ow, h: oh};
}

// ---------------------------------------------------------------- maps
/** A made-up coastline: a closed, wobbly outline around (cx, cy), as a path. Not a real place. */
export function land(cx, cy, rx, ry, {seed = 1, points = 46, rough = .28} = {}) {
  const pts = Array.from({length: points}, (_, i) => { const a = i / points * Math.PI * 2, k = 1 + (noise(i * .33 + seed * 9.1) - .5) * 2 * rough + (noise(i * 1.1 + seed * 3.7) - .5) * rough * .7 + (hash(i + seed * 17) - .5) * rough * .16; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
  return window.d3.line().curve(window.d3.curveCatmullRomClosed.alpha(.6))(pts);
}
/** A simple compass rose centred on the returned group's origin. */
export function compass(g, r, {color = C.bone} = {}) {
  const s = g.append('g'); s.append('circle').attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5).attr('opacity', .6); s.append('circle').attr('r', r * .72).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1).attr('stroke-dasharray', '2 6').attr('opacity', .6);
  for (let i = 0; i < 8; i++) s.append('path').attr('d', `M0 ${-r * (i % 2 ? .62 : 1.12)}L${r * .1} 0L0 ${r * .1}L${-r * .1} 0Z`).attr('fill', i === 0 ? C.crimson : color).attr('opacity', i % 2 ? .45 : .9).attr('transform', `rotate(${i * 45})`);
  txt(s, 0, -r * 1.28, 'N', {size: r * .34, anchor: 'middle', color, weight: 500, spacing: 0}); return s;
}
/**
 * A route drawn along points [[x, y], ...] as a dashed line that travels. Returns {path, set(q), at(q)}:
 * set(q) draws the first q of it; at(q) is the point reached, for a marker to ride on.
 */
export function route(g, pts, {color = C.crimson, width = 5, dash = '14 10', curve = true} = {}) {
  const d3 = window.d3, d = (curve ? d3.line().curve(d3.curveCatmullRom.alpha(.5)) : d3.line())(pts), id = uid('rt'), s = g.append('g');
  const mask = s.append('mask').attr('id', id).attr('maskUnits', 'userSpaceOnUse').attr('x', -4000).attr('y', -4000).attr('width', 8000).attr('height', 8000).append('path').attr('d', d).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', width * 3).attr('stroke-linecap', 'round');
  const path = s.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-dasharray', dash).attr('stroke-linecap', 'butt').attr('mask', `url(#${id})`);
  const len = mask.node().getTotalLength() || 1; mask.attr('stroke-dasharray', `${len} ${len}`);
  return {g: s, path, len, set(q) { mask.attr('stroke-dashoffset', len * (1 - clamp(q))); }, at(q) { const p = mask.node().getPointAtLength(len * clamp(q)); return [p.x, p.y]; }};
}

// ---------------------------------------------------------------- card furniture
/**
 * The small archive references most cards carry in their corners (the `labels` prop: top-left,
 * top-right, bottom-left, bottom-right), in typewriter with a short rule. Drawn in stage.front's
 * place in the stack but under the film wear. Returns seek(t, start) which types them on.
 */
export function cornerLabels(st, labels = [], {size = null, inset = 64} = {}) {
  const {W, H, root, ink} = st, s = size ?? 22 + 6 * st.k, g = root.append('g');
  const items = labels.slice(0, 4).map((l, i) => { if (!l) return null; const right = i % 2 === 1, bottom = i > 1, x = right ? W - inset : inset, y = bottom ? H - inset : inset + s;
    const ty = typed(g, x, y, up(oneLine(l)), {size: s, color: ink.dim, anchor: right ? 'end' : 'start', spacing: .08}), line = g.append('path').attr('stroke', ink.accent).attr('stroke-width', 3);
    return {ty, line, x, y: y + (bottom ? -s - 10 : 14), right}; });
  return (t, start = .6) => items.forEach((it, i) => { if (!it) return; const q = span(t, start + i * .15, .7); it.ty.set(q); const w = 56 * settle(q); it.line.attr('d', `M${it.x} ${it.y}h${it.right ? -w : w}`); });
}
/** The camera move for a whole card: slow push-in plus gate weave, as a transform for stage.root. */
export const cardMove = (st, t, {dur = 6, zoom = .035, rot = .2, dx = 0, dy = 0} = {}) => { const [wx, wy] = weave(t, 1.2); return `translate(${wx} ${wy}) ` + drift(t, st.W / 2, st.H / 2, {dur, zoom, rot, dx, dy}); };
