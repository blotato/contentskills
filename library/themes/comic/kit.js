// Comic Book theme drawing kit. Every piece in this theme draws with these colours, fonts, textures
// and helpers; nothing else decides what the theme looks like.
//
// THE STYLE (written down from the user's reference before anything was built)
//   Page      A printed comic page: flat-colour panels separated by pale paper gutters, each panel
//             boxed by a black ink line that is never quite square. The panel in focus is one flat
//             primary (yellow, red, blue) or a secondary (teal, purple, orange, sage, cream paper).
//   Print     Cheap four-colour printing: Ben-Day dots on a 45 degree screen that grow toward one
//             corner, specks of dirt in the paper, a slight darkening toward the panel edges.
//             No gradients, no glow, no blur. Shading is dots or a second flat colour.
//   Ink       Everything is outlined in thick black ink with round joins, and sits on a hard black
//             drop shadow pushed down and to the right (an "extrude"), never a soft shadow.
//   Shapes    Plates are lopsided slabs (one slanted end, a tilted bottom edge), caption boxes are
//             plain yellow rectangles, balloons are rounded with a tail, bursts are jagged stars
//             (often two, one inside the other), puffs are scalloped clouds, sparks are 4-point stars.
//   Lettering Bangers for shouted words (yellow or white, inked, extruded, letters tilted and
//             bouncing off the baseline as if drawn by hand); Bebas Neue for words on plates;
//             Comic Neue bold caps for balloons and caption boxes.
//   Motion    Things POP: they grow from a point, overshoot and settle (plates, bursts, balloons).
//             A second plate drops out from under the first. Letters letter themselves on one at a
//             time, each starting small. Ink outlines "boil" (redrawn a few times a second). Big
//             moves are whips: fast, skewed, trailed by speed lines; impacts flash a burst and zoom
//             lines. Things leave the way they came, quicker.
//
// The file has three parts: THEME (colours, fonts, looks), DRAWING (shapes and textures), and
// ENGINE (stages, text measuring/splitting, motion). All of it is pure: pieces set every animated
// value from t.
import {clamp, span, mix, easeOut, easeInOut, easeBack} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut, easeBack};

// =====================================================================================
// THEME
// =====================================================================================
export const C = {
  ink: '#16121c', paper: '#f7edd0', white: '#fffbf0', gutter: '#f3ead4',
  red: '#e2242c', yellow: '#ffd61e', blue: '#2767d9', sky: '#49b8ea', green: '#33a35b', orange: '#f5811f',
  purple: '#6b3fb8', teal: '#168f8c', pink: '#ef5d94', tan: '#dcb982', sage: '#a8c2a0', night: '#1d2338', dim: '#7a7280',
};
/** Colours for data series, in order. */
export const series = [C.red, C.blue, C.yellow, C.green, C.orange, C.purple, C.sky, C.pink];
export const F = {head: 'Bangers', slab: '"Bebas Neue"', hand: '"Comic Neue"'};
/** Type roles: head = shouted words, slab = words on plates, hand = balloon and caption lettering. */
export const TYPE = {
  head: {font: F.head, weight: 400, spacing: .035},
  slab: {font: F.slab, weight: 400, spacing: .05},
  hand: {font: F.hand, weight: 700, spacing: .01},
};
export const FRAME = {width: 1080, height: 1920};
/**
 * A look is led by one accent. `accent` is the plate colour when the piece sits on footage;
 * on a full-frame card `bg` is the panel colour, `dots` its halftone, `head` the fill of shouted
 * words, `pop` the fill of an emphasised word, `plate` the main plate, `alt` the second colour
 * and `third` the colour of small marks.
 */
export const LOOKS = {
  yellow: {accent: C.yellow, bg: C.yellow, dots: C.orange, head: C.white, plate: C.red, alt: C.blue, pop: C.red, third: C.white},
  red: {accent: C.red, bg: C.red, dots: '#a8121b', head: C.yellow, plate: C.yellow, alt: C.blue, pop: C.white, third: C.white},
  blue: {accent: C.blue, bg: C.blue, dots: '#1946a3', head: C.yellow, plate: C.red, alt: C.yellow, pop: C.white, third: C.white},
  green: {accent: C.green, bg: C.sage, dots: '#7fa87b', head: C.yellow, plate: C.red, alt: C.blue, pop: C.red, third: C.white},
  purple: {accent: C.purple, bg: C.purple, dots: '#4c2892', head: C.yellow, plate: C.orange, alt: C.sky, pop: C.sky, third: C.white},
  teal: {accent: C.teal, bg: C.teal, dots: '#0d6a68', head: C.yellow, plate: C.red, alt: C.yellow, pop: C.white, third: C.white},
  orange: {accent: C.orange, bg: C.orange, dots: '#d25f0d', head: C.white, plate: C.blue, alt: C.yellow, pop: C.yellow, third: C.white},
  paper: {accent: C.paper, bg: C.paper, dots: '#8fcdea', head: C.red, plate: C.blue, alt: C.yellow, pop: C.blue, third: C.red},
};
const lum = c => { const n = parseInt(c.slice(1), 16); return (.299 * (n >> 16 & 255) + .587 * (n >> 8 & 255) + .114 * (n & 255)) / 255; };
/** A theme colour by name ('red', 'ink', ...), or any CSS colour passed through. */
export const tone = c => C[c] ?? c ?? C.red;
/** Readable flat ink for text on a plate filled with this colour. */
export const inkOn = c => { c = tone(c); return /^#[0-9a-f]{6}$/i.test(c) && lum(c) < .5 ? C.white : C.ink; };
export function look(name) {
  const l = LOOKS[name] ?? LOOKS.yellow;
  return {...l, name: LOOKS[name] ? name : 'yellow', on: inkOn(l.accent), text: inkOn(l.bg), plateOn: inkOn(l.plate), altOn: inkOn(l.alt)};
}
export const up = s => String(s ?? '').toUpperCase();
export const comma = n => Math.round(n).toLocaleString('en-US');

// ---- Maths ----
/** Seeded pseudo-random number 0..1. Pieces may not use Math.random. */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A smoothly wandering value 0..1 over time. */
export const noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
/** The theme's ease: overshoots 1 and rings briefly before settling. This is the "pop". */
export const spring = x => { x = clamp(x); return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
export const pop = spring;
export const easeIn = x => { x = clamp(x); return x * x * x; };
/** Speed of an ease-out move at progress q (0 when resting): use it to skew things that move fast. */
export const vel = q => q <= 0 || q >= 1 ? 0 : 3 * (1 - q) * (1 - q);
/** 0 while an overlay is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .3) => life ? easeIn(span(t, life - len, len)) : 0;
/** Which redrawing of a boiling ink line shows at time t (of n). */
export const boil = (t, n = 3, fps = 7) => ((Math.floor(t * fps) % n) + n) % n;
/** Scale of something that pops in at `start` and shrinks away as x (leave) goes to 1. */
export const presence = (t, start = 0, x = 0, length = .45) => Math.max(0, spring(span(t, start, length)) * (1 - x));
const r1 = n => Math.round(n * 10) / 10;

// =====================================================================================
// DRAWING: shapes (all return path data) and textures
// =====================================================================================
/** A lopsided slab: square left end, slanted right end, tilted bottom edge. */
export const slabPath = (x, y, w, h, cut = 22) => { cut = Math.max(0, Math.min(cut, w / 3, h / 2)); return `M${r1(x)} ${r1(y)}L${r1(x + w)} ${r1(y + cut * .22)}L${r1(x + w - cut)} ${r1(y + h - cut * .3)}L${r1(x + cut * .12)} ${r1(y + h)}Z`; };
/** The same slab leaning the other way (slanted left end). */
export const slabPathL = (x, y, w, h, cut = 22) => { cut = Math.max(0, Math.min(cut, w / 3, h / 2)); return `M${r1(x + cut)} ${r1(y + cut * .22)}L${r1(x + w)} ${r1(y)}L${r1(x + w - cut * .12)} ${r1(y + h)}L${r1(x)} ${r1(y + h - cut * .3)}Z`; };
/** A panel box whose corners are each nudged a little: `s` is how far, `seed` picks the nudges. */
export const boxPath = (x, y, w, h, s = 8, seed = 1) => {
  const j = k => (hash(k, seed) - .5) * 2 * s;
  return `M${r1(x + j(1))} ${r1(y + j(2))}L${r1(x + w + j(3))} ${r1(y + j(4))}L${r1(x + w + j(5))} ${r1(y + h + j(6))}L${r1(x + j(7))} ${r1(y + h + j(8))}Z`;
};
export const rectPath = (x, y, w, h) => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
/** A jagged burst around (0, 0): `points` spikes, valleys at `depth` of r, every spike a little different. */
export function burstPath(r, {points = 12, depth = .64, seed = 1, jitter = .2, squash = 1} = {}) {
  let d = '';
  for (let i = 0; i < points * 2; i++) {
    const a = (i + (hash(i, seed) - .5) * .5) * Math.PI / points - Math.PI / 2, rr = (i % 2 ? r * depth : r) * (1 + (hash(i, seed + 9) - .5) * jitter * (i % 2 ? 1 : 2));
    d += `${i ? 'L' : 'M'}${r1(Math.cos(a) * rr)} ${r1(Math.sin(a) * rr * squash)}`;
  }
  return d + 'Z';
}
/** A scalloped puff of smoke around (0, 0). */
export function cloudPath(rx, ry = rx, {lobes = 9, seed = 1, puff = 1} = {}) {
  const pts = Array.from({length: lobes}, (_, i) => { const a = (i + (hash(i, seed) - .5) * .35) / lobes * Math.PI * 2, k = 1 + (hash(i, seed + 5) - .5) * .16; return [Math.cos(a) * rx * k, Math.sin(a) * ry * k]; });
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  pts.forEach((p, i) => { const q = pts[(i + 1) % lobes], rr = Math.hypot(q[0] - p[0], q[1] - p[1]) * .56 * puff; d += `A${r1(rr)} ${r1(rr)} 0 0 1 ${r1(q[0])} ${r1(q[1])}`; });
  return d + 'Z';
}
/**
 * A speech balloon: a w x h rounded body centred on (0, 0) with a tail to (tx, ty), which should
 * lie below (or above) the body.
 */
export function balloonPath(w, h, tx = -w * .2, ty = h * .95, tail = 46) {
  const x = -w / 2, y = -h / 2, r = Math.min(w, h) * .42, below = ty > 0, bx = clamp(tx * .6, x + r + 4, -x - r - tail - 4), edge = below ? y + h : y;
  const body = [`M${r1(x + r)} ${r1(y)}`, `H${r1(x + w - r)}Q${r1(x + w)} ${r1(y)} ${r1(x + w)} ${r1(y + r)}V${r1(y + h - r)}Q${r1(x + w)} ${r1(y + h)} ${r1(x + w - r)} ${r1(y + h)}`, `H${r1(x + r)}Q${r1(x)} ${r1(y + h)} ${r1(x)} ${r1(y + h - r)}V${r1(y + r)}Q${r1(x)} ${r1(y)} ${r1(x + r)} ${r1(y)}Z`];
  return below ? `${body[0]}${body[1]}H${r1(bx + tail)}L${r1(tx)} ${r1(ty)}L${r1(bx)} ${r1(edge)}${body[2]}` : `${body[0]}H${r1(bx)}L${r1(tx)} ${r1(ty)}L${r1(bx + tail)} ${r1(edge)}${body[1]}${body[2]}`;
}
/** A four-point spark of radius r around (0, 0). */
export const sparkPath = r => `M0 ${-r}Q${r * .14} ${-r * .14} ${r} 0Q${r * .14} ${r * .14} 0 ${r}Q${-r * .14} ${r * .14} ${-r} 0Q${-r * .14} ${-r * .14} 0 ${-r}Z`;
/** A five-point star of radius r around (0, 0). */
export const starPath = (r, inner = .46) => 'M' + Array.from({length: 10}, (_, i) => { const a = i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * inner : r; return `${r1(Math.cos(a) * rr)} ${r1(Math.sin(a) * rr)}`; }).join('L') + 'Z';
/** Zoom lines: thin ink wedges pointing at (cx, cy), from radius r1o (tips, ragged) out to r2. */
export function zoomLinesPath(cx, cy, inner, outer, {n = 46, seed = 1, thick = 1, from = 0, sweep = Math.PI * 2} = {}) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = from + (i + hash(i, seed)) / n * sweep, w = (.006 + hash(i, seed + 3) * .02) * thick, tip = inner * (1 + hash(i, seed + 7) * .55);
    d += `M${r1(cx + Math.cos(a) * tip)} ${r1(cy + Math.sin(a) * tip)}L${r1(cx + Math.cos(a - w) * outer)} ${r1(cy + Math.sin(a - w) * outer)}L${r1(cx + Math.cos(a + w) * outer)} ${r1(cy + Math.sin(a + w) * outer)}Z`;
  }
  return d;
}
/** Speed streaks: tapered horizontal ink strokes filling a box, pointed at their left end. */
export function streaksPath(x, y, w, h, {n = 14, seed = 1, thick = 1} = {}) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const yy = y + (i + .2 + hash(i, seed) * .6) / n * h, len = w * (.35 + hash(i, seed + 2) * .65), x0 = x + hash(i, seed + 4) * (w - len), th = (2 + hash(i, seed + 6) * 7) * thick;
    d += `M${r1(x0)} ${r1(yy)}L${r1(x0 + len)} ${r1(yy - th / 2)}L${r1(x0 + len)} ${r1(yy + th / 2)}Z`;
  }
  return d;
}
/**
 * Ben-Day dots on a 45 degree screen filling a box. The dots are largest at `from` ([0..1, 0..1]
 * of the box) and shrink to nothing `reach` (share of the box diagonal) away; `flat` > 0 gives
 * every dot that radius instead (share of the pitch). `axis` ('x' or 'y') measures the distance
 * along one axis only, for a band that fades evenly away from an edge (reach is then a share of
 * the box's width or height).
 */
export function halftonePath(x, y, w, h, {pitch = 30, max = .46, from = [1, 1], reach = .8, flat = 0, axis = null} = {}) {
  let d = ''; const fx = x + from[0] * w, fy = y + from[1] * h, R = (axis === 'x' ? w : axis === 'y' ? h : Math.hypot(w, h)) * reach, rows = Math.ceil(h / (pitch / 2)) + 1, cols = Math.ceil(w / pitch) + 1;
  for (let i = 0; i <= rows; i++) for (let j = 0; j <= cols; j++) {
    const px = x + (j + (i % 2) * .5) * pitch, py = y + i * pitch / 2, r = flat ? pitch * flat : pitch * max * (1 - (axis === 'x' ? Math.abs(px - fx) : axis === 'y' ? Math.abs(py - fy) : Math.hypot(px - fx, py - fy)) / R);
    if (r < 1.3) continue;
    const a = r1(r); d += `M${r1(px - r)} ${r1(py)}a${a} ${a} 0 1 0 ${r1(a * 2)} 0a${a} ${a} 0 1 0 ${r1(-a * 2)} 0`;
  }
  return d;
}
/** Specks of dirt in the paper. */
export function specklePath(x, y, w, h, {n = 70, seed = 1} = {}) {
  let d = '';
  for (let i = 0; i < n; i++) { const r = r1(.8 + Math.pow(hash(i, seed), 4) * 4.5), px = x + hash(i, seed + 1) * w, py = y + hash(i, seed + 2) * h; d += `M${r1(px - r)} ${r1(py)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`; }
  return d;
}

/**
 * The theme's one way of drawing a solid shape: flat fill, thick ink outline, hard drop shadow.
 * Returns {g, node, shadow, set(d)}; `drop` 0 leaves the shadow off.
 */
export function inked(g, d = '', {fill = C.red, stroke = C.ink, width = 7, drop = 10, opacity = 1} = {}) {
  const group = g.append('g'), shadow = drop ? group.append('path').attr('fill', C.ink).attr('stroke', C.ink).attr('stroke-width', width).attr('stroke-linejoin', 'round').attr('transform', `translate(${drop} ${drop})`) : null;
  const node = group.append('path').attr('fill', fill).attr('fill-opacity', opacity).attr('stroke', stroke).attr('stroke-width', width).attr('stroke-linejoin', 'round');
  const api = {g: group, node, shadow, set(next) { node.attr('d', next); shadow?.attr('d', next); return api; }};
  return api.set(d);
}
/** A plate (slab by default) whose box can be animated: set(x, y, w, h). */
export function plate(g, {shape = slabPath, cut = 22, ...style} = {}) {
  const p = inked(g, '', style);
  return {...p, box(x, y, w, h) { p.set(w > 2 && h > 2 ? shape(x, y, w, h, cut) : ''); return this; }};
}
/** Halftone dots in a colour, clipped to nothing: clip the group you add them to. */
export const dots = (g, x, y, w, h, color, o = {}) => g.append('path').attr('d', halftonePath(x, y, w, h, o)).attr('fill', color).attr('opacity', o.opacity ?? 1);
/**
 * A burst drawn around its own origin: jagged star, optionally a second smaller one inside
 * (`inner` colour). Its outline boils: call boil(t). Scale or turn the returned g.
 */
export function burst(g, r, {fill = C.yellow, inner = null, points = 12, depth = .64, seed = 1, width = 7, drop = 10, squash = 1} = {}) {
  const group = g.append('g'), shapes = [0, 1, 2].map(k => burstPath(r, {points, depth, seed: seed + k * 13, squash})), outer = inked(group, shapes[0], {fill, width, drop});
  const inside = inner ? [0, 1, 2].map(k => burstPath(r * .72, {points, depth: depth + .08, seed: seed + 40 + k * 13, squash})) : null, core = inner ? inked(group, inside[0], {fill: inner, width: width * .7, drop: 0}) : null;
  return {g: group, boil(t) { const k = boil(t); outer.set(shapes[k]); core?.set(inside[(k + 1) % 3]); }};
}
/** A puff of smoke drawn around its own origin; boils like a burst. */
export function puff(g, rx, ry = rx, {fill = C.white, seed = 1, width = 6, drop = 8, lobes = 9} = {}) {
  const group = g.append('g'), shapes = [0, 1, 2].map(k => cloudPath(rx, ry, {lobes, seed: seed + k * 7})), p = inked(group, shapes[0], {fill, width, drop});
  return {g: group, boil(t) { p.set(shapes[boil(t)]); }};
}
/** A spark (four-point star) at (x, y); scale or turn the returned group. */
export function spark(g, x, y, r, color = C.white, width = 5) {
  const inner = g.append('g').attr('transform', `translate(${x} ${y})`).append('g');
  inner.append('path').attr('d', sparkPath(r)).attr('fill', color).attr('stroke', C.ink).attr('stroke-width', width).attr('stroke-linejoin', 'round');
  return inner;
}

// =====================================================================================
// ENGINE
// =====================================================================================
let stages = 0;
const uid = stage => `${stage.id}-${++stage.n}`;
/**
 * An SVG stage.
 *   overlay: true -> transparent 1080x1920, to sit on footage.
 *   card: true    -> a 1000x1000 diagram panel (clear: true floats it on footage as a paper sheet).
 *   otherwise     -> a full-frame title panel, 1080 wide and as tall as the element it is mounted
 *                    in (1080 square up to 1920 portrait): lay out from W and H.
 * Cards and title panels are a printed panel: gutter, inked box, flat colour, Ben-Day dots.
 * Returns {svg, defs, under, root, W, H, ink (the look), k, sq, box (the panel rectangle)}.
 */
export function comicStage(el, {overlay = false, card = false, clear = false, accent, margin = 26, dotsFrom = [1, 1]} = {}) {
  const d3 = window.d3, id = `cm${++stages}`, cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const W = card ? 1000 : 1080, H = overlay ? 1920 : card ? 1000 : Math.round(clamp(W * ch / cw, 1080, 1920)), ink = look(accent ?? (card ? 'paper' : 'yellow'));
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', overlay ? 'visible' : 'hidden');
  const defs = svg.append('defs'), under = svg.append('g'), root = svg.append('g'), m = margin, box = {x: m, y: m, w: W - m * 2, h: H - m * 2};
  const stage = {svg, defs, under, root, id, W, H, ink, k: H / 1920, sq: H < 1500, n: 0, box};
  el.style.background = overlay || clear ? 'transparent' : C.gutter;
  if (!overlay) stage.panel = panel(under, stage, box.x, box.y, box.w, box.h, {fill: ink.bg, dots: ink.dots, from: dotsFrom, gutter: !clear, opacity: clear ? .95 : 1, seed: 3});
  return stage;
}
/**
 * A printed panel: flat colour in an inked box that is not quite square, with Ben-Day dots from
 * one corner, paper specks and darkened edges. `gutter` paints the page around it.
 */
export function panel(g, stage, x, y, w, h, {fill = C.yellow, dots: dotColor = C.orange, from = [1, 1], gutter = false, opacity = 1, seed = 1, width = 8, pitch = 34, reach = .62, drop = 0, wobble = 7} = {}) {
  const group = g.append('g'), d = boxPath(x, y, w, h, wobble, seed), clip = uid(stage), shade = uid(stage);
  if (gutter) group.append('rect').attr('x', -200).attr('y', -200).attr('width', stage.W + 400).attr('height', stage.H + 400).attr('fill', C.gutter);
  if (drop) group.append('path').attr('d', d).attr('fill', C.ink).attr('transform', `translate(${drop} ${drop})`);
  stage.defs.append('clipPath').attr('id', clip).append('path').attr('d', d);
  const v = stage.defs.append('radialGradient').attr('id', shade).attr('cx', .5).attr('cy', .5).attr('r', .75);
  v.append('stop').attr('offset', .55).attr('stop-color', C.ink).attr('stop-opacity', 0); v.append('stop').attr('offset', 1).attr('stop-color', C.ink).attr('stop-opacity', .3);
  group.append('path').attr('d', d).attr('fill', fill).attr('fill-opacity', opacity);
  const inside = group.append('g').attr('clip-path', `url(#${clip})`);
  if (dotColor) inside.append('path').attr('d', halftonePath(x, y, w, h, {pitch, from, reach})).attr('fill', dotColor).attr('opacity', .85);
  inside.append('path').attr('d', specklePath(x, y, w, h, {n: Math.round(w * h / 22000), seed})).attr('fill', C.ink).attr('opacity', .16);
  inside.append('rect').attr('x', x - 10).attr('y', y - 10).attr('width', w + 20).attr('height', h + 20).attr('fill', `url(#${shade})`);
  group.append('path').attr('d', d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', width).attr('stroke-linejoin', 'round');
  return {g: group, inside, d, clip: `url(#${clip})`};
}
/** A clip rectangle; returns the value for a clip-path attribute. */
export function clipBox(stage, x, y, w, h) {
  const id = uid(stage); stage.defs.append('clipPath').attr('id', id).append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
  return `url(#${id})`;
}
/** A clip path from path data; returns {url, path} (animate the path's d). */
export function clipShape(stage, d = '') { const id = uid(stage); return {url: `url(#${id})`, path: stage.defs.append('clipPath').attr('id', id).append('path').attr('d', d)}; }
/** A clip rectangle whose size is animated; returns {url, rect}. */
export function clipLive(stage) { const id = uid(stage); return {url: `url(#${id})`, rect: stage.defs.append('clipPath').attr('id', id).append('rect')}; }

// ---- Text: measuring, fitting, splitting. `role` is 'head', 'slab' or 'hand'. ----
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const face = (o = {}) => ({...TYPE[o.role ?? 'head'], ...Object.fromEntries(Object.entries(o).filter(([k, v]) => v != null && ['font', 'weight', 'spacing'].includes(k)))});
const css = (size, f) => `${f.weight} ${size}px ${f.font}`;
/** Width of a string in px. */
export function measure(str, size, o) { const f = face(o); ctx.font = css(100, f); return (ctx.measureText(str).width + f.spacing * 100 * [...String(str)].length) * size / 100; }
/** Height of a capital letter at this size. */
export function capH(size, o) { const key = css(100, face(o)); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 72; } return caps[key] * size / 100; }
/** The largest size (up to max) at which every line fits the width. */
export const fit = (lines, width, max, o) => Math.min(max, ...[].concat(lines).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
/** Break a sentence into lines no wider than `width` at this size. */
export function wrap(str, size, width, o) {
  const lines = []; let line = '';
  for (const word of String(str).split(/\s+/).filter(Boolean)) { const next = line ? line + ' ' + word : word; if (line && measure(next, size, o) > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
/** The largest size (max down to min) at which the sentence wraps inside a width x height box. */
export function flow(str, width, height, max, min = 30, o, leading = 1.42) {
  for (let size = max; ; size -= 4) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/**
 * Text; '\n' starts a new line. `outline` (px) inks round it and `drop` (px) adds the hard
 * shadow, which is how lettering stays readable on footage. Returns a group; say(str) changes
 * a one-line text.
 */
export function txt(g, x, y, str, {size = 30, color = C.ink, role = 'hand', anchor = 'start', leading = 1.18, outline = 0, drop = 0, outlineColor = C.ink, ...rest} = {}) {
  const f = face({role, ...rest}), group = g.append('g'), lines = String(str ?? '').split('\n');
  const make = (fill, dx, stroke) => {
    const node = group.append('text').attr('x', x + dx).attr('y', y + dx).attr('fill', fill).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`);
    if (stroke) node.attr('stroke', dx ? C.ink : outlineColor).attr('stroke-width', stroke).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
    lines.forEach((line, i) => node.append('tspan').attr('x', x + dx).attr('dy', i ? `${leading}em` : 0).text(line));
    return node;
  };
  if (drop) make(C.ink, drop, outline || 1);
  make(color, 0, outline);
  group.say = s => { group.selectAll('text').each(function () { window.d3.select(this).select('tspan').text(s); }); return group; };
  return group;
}
/**
 * A line of text split into separately animated units: by 'letter', 'word' or 'all' (one unit).
 * Returns [{g, cx, y, w, cap, size, i, n, str, tilt, hop}]; move a unit with pose(), slam() or
 * letterOn(). Head lettering is inked and extruded unless `flat`; each unit carries a small
 * hand-lettered tilt and hop off the baseline.
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = C.yellow, flat = false, outline = null, drop = null, wobble = null, seed = 1, ...rest} = {}) {
  const o = {role: 'head', ...rest}, f = face(o), pad = f.spacing * size, total = measure(str, size, o) - pad, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const ow = flat ? 0 : outline ?? Math.max(5, size * .085), dd = flat ? 0 : drop ?? Math.max(4, size * .06), wob = wobble ?? (o.role === 'head' && !flat ? 1 : 0);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - pad, cx = x0 + measure(str.slice(0, at), size, o) + w / 2, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    const layer = (fill, d, stroke) => { const node = inner.append('text').attr('x', d).attr('y', d).attr('text-anchor', 'middle').attr('fill', fill).style('font', css(size, f)).style('letter-spacing', by === 'letter' ? null : `${f.spacing}em`).text(c); if (stroke) node.attr('stroke', C.ink).attr('stroke-width', stroke).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke'); return node; };
    if (dd) layer(C.ink, dd, ow || 1);
    return {g: inner, text: layer(color, 0, ow), cx, y, w, cap, size, i, n: all.length, str: c, tilt: (hash(i, seed) - .5) * 7 * wob, hop: (hash(i, seed + 3) - .5) * cap * .1 * wob};
  });
}
/** Move, scale (about the middle of the cap height), rotate, skew and fade one unit from glyphs(). */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, rot = 0, skew = 0, o = 1} = {}) {
  u.g.attr('transform', `translate(${x} ${y + u.hop - u.cap / 2}) rotate(${rot + u.tilt}) skewX(${skew}) scale(${sx} ${sy}) translate(0 ${u.cap / 2})`).attr('opacity', o);
}
/**
 * The standard slam: a unit drops in oversized and tilted, overshoots and settles; `x` is the
 * leave amount (0..1), `live` a small resting bounce.
 */
export function slam(u, q, x = 0, {from = 2.6, drop = 0, live = 0, twist = 14} = {}) {
  const s = spring(q), sc = 1 + (from - 1) * (1 - s);
  pose(u, {y: -drop * (1 - s) - live * u.cap, sx: sc * (1 - x), sy: sc * (1 - x) * (1 + vel(q) * .1), rot: (1 - s) * twist * (u.i % 2 ? 1 : -1) + live * 40, o: q <= 0 || x >= 1 ? 0 : 1});
}
/** Lettering on: a unit grows from small to full size with a little overshoot, as if being inked in. */
export function letterOn(u, q, x = 0) { const s = easeBack(q); pose(u, {sx: Math.max(.001, (.35 + .65 * s) * (1 - x)), y: (1 - s) * u.cap * .18, o: q <= 0 || x >= 1 ? 0 : 1}); }

// ---- Furniture built from the shapes above ----
/**
 * A caption box: hand-lettered caps on a flat rectangle with an ink line and hard shadow.
 * (x, y) is its top-left corner (or top-right / top-centre with anchor 'end' / 'middle'). Returns
 * {g, w, h}: g is centred on the box so it can pop (scale) or tilt in place.
 */
export function captionBox(g, x, y, str, {size = 30, fill = C.yellow, color = null, role = 'hand', anchor = 'start', padX = 20, padY = 14, drop = 7, width = 5, tilt = 0, leading = 1.2, shape = rectPath, cut = 22} = {}) {
  const o = {role}, lines = up(str).split('\n'), cap = capH(size, o), w = Math.max(...lines.map(l => measure(l, size, o))) + padX * 2, h = cap + (lines.length - 1) * size * leading + padY * 2;
  const left = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x, inner = g.append('g').attr('transform', `translate(${left + w / 2} ${y + h / 2}) rotate(${tilt})`).append('g');
  inked(inner, shape(-w / 2, -h / 2, w, h, cut), {fill, width, drop});
  const label = txt(inner, 0, -h / 2 + padY + cap, lines.join('\n'), {size, role, color: color ?? inkOn(fill), anchor: 'middle', leading});
  return {g: inner, w, h, label};
}
/**
 * A speech balloon holding hand-lettered text, drawn around its own origin at (x, y) with its
 * tail reaching to (tx, ty) relative to the centre. Returns {g, w, h}.
 */
export function balloon(g, x, y, str, {size = 40, width = 520, tx = -120, ty = null, fill = C.white, color = C.ink, role = 'hand', pad = 34, drop = 9, tail = 50, lines: fixed = null} = {}) {
  const o = {role}, lines = fixed ?? wrap(up(str), size, width - pad * 2, o), cap = capH(size, o), pitch = size * 1.16, w = Math.max(...lines.map(l => measure(l, size, o)), 80) + pad * 2.2, h = cap + (lines.length - 1) * pitch + pad * 2;
  const inner = g.append('g').attr('transform', `translate(${x} ${y})`).append('g');
  inked(inner, balloonPath(w, h, tx, ty ?? h / 2 + 70, tail), {fill, width: 6, drop});
  const rows = lines.map((line, i) => txt(inner, 0, -h / 2 + pad + cap + i * pitch, line, {size, role, color, anchor: 'middle'}));
  return {g: inner, w, h, rows};
}
/**
 * A row of small caption boxes spread between x0 and x1 at height y (first flush left, last
 * flush right): the issue number, series name and so on that sit along a panel's edge.
 * Returns the boxes; pop their g.
 */
export function tags(g, labels, y, {x0 = 64, x1 = 1016, size = 28, fills = [C.yellow, C.white, C.white, C.yellow]} = {}) {
  const n = labels.length;
  return labels.map((label, i) => {
    const end = n > 1 && i === n - 1, mid = n > 2 && i > 0 && !end, x = end ? x1 : mid ? mix(x0, x1, i / (n - 1)) : x0;
    return captionBox(g, x, y, label, {size, fill: fills[i % fills.length], anchor: end ? 'end' : mid ? 'middle' : 'start', padX: 14, padY: 10, drop: 5, width: 4, tilt: (hash(i, 4) - .5) * 4});
  });
}
/**
 * A small picture inset: `image` (a URL) if the storyboard supplies one, otherwise a stand-in
 * panel (a sun over hills, drawn flat). A w x h panel centred on its own origin at (x, y).
 */
export function inset(g, stage, x, y, w, h, {image, fill = C.sky, color = C.yellow} = {}) {
  const inner = g.append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`).append('g'), d = boxPath(-w / 2, -h / 2, w, h, 5, 2), clip = clipShape(stage, d);
  inner.append('path').attr('d', d).attr('fill', C.ink).attr('transform', 'translate(10 10)');
  const pic = inner.append('g').attr('clip-path', clip.url);
  pic.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', fill);
  pic.append('path').attr('d', zoomLinesPath(0, h * .1, Math.min(w, h) * .3, Math.hypot(w, h), {n: 26, seed: 5, thick: 2.2})).attr('fill', C.white).attr('opacity', .55);
  pic.append('circle').attr('cy', h * .1).attr('r', Math.min(w, h) * .26).attr('fill', color).attr('stroke', C.ink).attr('stroke-width', 5);
  pic.append('path').attr('d', `M${-w / 2} ${h * .28}Q${-w * .2} ${h * .05} ${w * .05} ${h * .3}Q${w * .3} ${h * .12} ${w / 2} ${h * .3}V${h / 2}H${-w / 2}Z`).attr('fill', C.green).attr('stroke', C.ink).attr('stroke-width', 5);
  pic.append('path').attr('d', halftonePath(-w / 2, -h / 2, w, h, {pitch: 18, from: [0, 0], reach: .6})).attr('fill', C.blue).attr('opacity', .45);
  if (image) pic.append('image').attr('href', image).attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('preserveAspectRatio', 'xMidYMid slice');
  inner.append('path').attr('d', d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 7).attr('stroke-linejoin', 'round');
  return inner;
}
/**
 * A marquee strip: the text repeated end to end with a spark between repeats. set(offset, skew)
 * scrolls it (px, either sign) and can lean it. Draw the band behind it yourself. `y` is the baseline.
 */
export function strip(g, stage, str, y, size, {color = C.ink, sepColor = C.white, role = 'head', outline = 0, drop = 0} = {}) {
  const unit = up(str), o = {role}, gap = size * 1.3, w = measure(unit, size, o) + gap, n = Math.ceil(stage.W / w) + 3, group = g.append('g'), cap = capH(size, o);
  for (let i = -1; i < n; i++) {
    txt(group, i * w + gap / 2, y, unit, {size, color, role, outline, drop});
    group.append('path').attr('d', sparkPath(size * .3)).attr('transform', `translate(${i * w} ${y - cap / 2})`).attr('fill', sepColor).attr('stroke', C.ink).attr('stroke-width', Math.max(3, size * .05)).attr('stroke-linejoin', 'round');
  }
  return {g: group, width: w, set(offset, skew = 0) { group.attr('transform', `translate(${-((offset % w) + w) % w} 0) skewX(${skew})`); }};
}
/** Scale a centred group (from captionBox, balloon, burst, spark...) with an optional turn. */
export const scaleTo = (node, s, rot = 0) => node.attr('transform', `rotate(${rot}) scale(${Math.max(.0001, s)})`).attr('opacity', s <= .001 ? 0 : 1);
/** The box around the speaker's face at time t, from a track [[t, x, y, w, h], ...] (0..1 of the frame), or a fixed box. */
export function boxAt(props, t) {
  const track = props.track;
  if (!track?.length) return props.box;
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0])) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}
/** A label on a lopsided slab (Bebas Neue caps): captionBox with the plate shape. Same arguments and result. */
export const slabLabel = (g, x, y, str, o = {}) => captionBox(g, x, y, str, {role: 'slab', shape: slabPath, padX: 30, padY: 18, fill: C.red, drop: 9, width: 6, size: 44, ...o});
/** A group clipped to the stage's panel, for things that must not cross its ink box. ink() redraws the box on top. */
export function inPanel(stage, parent = stage.root) {
  const g = parent.append('g').attr('clip-path', stage.panel.clip);
  return {g, ink: () => parent.append('path').attr('d', stage.panel.d).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 8).attr('stroke-linejoin', 'round')};
}
/** A small burst badge holding a letter or number, drawn around its own origin at (x, y). Returns {g, boil}. */
export function badge(g, x, y, r, label, {fill = C.red, color = null, points = 10, seed = 1, role = 'head'} = {}) {
  const b = burst(g.append('g').attr('transform', `translate(${x} ${y})`), r, {fill, points, depth: .74, seed, width: 5, drop: 6});
  const size = fit(String(label), r * 1.05, r * 1.1, {role}); txt(b.g, 0, capH(size, {role}) / 2, String(label), {size, role, color: color ?? inkOn(fill), anchor: 'middle'});
  return b;
}
