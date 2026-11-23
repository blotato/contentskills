// Text-effects kit: bold kinetic typography (slams, smears, per-letter reveals, marquee strips,
// splits, countdowns) drawn in this theme's style. The file has two parts:
//
//   1. THEME  - everything that belongs to the theme: colours, fonts, the shape of plates and
//               frames, decorative marks, the background field, how things switch on.
//   2. ENGINE - stage, text measuring/fitting/splitting, motion and layout helpers. It never
//               names a colour or a font; it only asks the theme.
//
// To port the category to another theme, replace the THEME section and leave the rest alone.
// Everything here is a pure function of its inputs: pieces set every animated value from t.
import {C, F, chamfer, brackets, flicker, clamp, span, mix, easeOut, easeInOut, easeBack, spring, hash, noise} from '../hud.js';
export {clamp, span, mix, easeOut, easeInOut, easeBack, spring, hash, noise};

// =====================================================================================
// THEME: the futuristic theme. Near-black field with a dark grid, cyan primary with magenta
// and amber accents, glowing line-work, notched plates, corner brackets, mono readouts.
// =====================================================================================
export const theme = {
  colors: {bg: C.bg, panel: C.panel, grid: C.grid, text: C.white, dim: C.dim, dark: C.bg},
  /** A card or overlay is led by one accent; the next one in this list is its second colour. */
  accents: {cyan: C.cyan, magenta: C.magenta, amber: C.amber},
  /** The two colours a slamming letter splits into before it snaps together. */
  echo: [C.magenta, C.cyan],
  /** Type roles: head = huge kinetic words, text = sublines and labels, mono = micro readouts. */
  type: {
    head: {font: 'Tektur', weight: 900, spacing: .01},
    text: {font: F.text, weight: 700, spacing: .08},
    mono: {font: F.mono, weight: 400, spacing: .08},
  },
  /**
   * The glow on line-work and hero words: wider, fainter copies of the stroke drawn underneath,
   * as [extra width, opacity] pairs ([] = no glow). It is drawn as plain strokes rather than a
   * blur filter on purpose: blurring moving type on every frame made a 20 s video take five to
   * seven minutes to render instead of 40 seconds.
   */
  glow: [[9, .24], [22, .1]],
  /** What separates the repeats in a marquee strip. */
  sep: '//',
  /** Outline of a plate (slab, chip, bar, button): a rectangle with two notched corners. */
  plate: (x, y, w, h, cut = 18) => chamfer(x, y, w, h, Math.max(0, Math.min(cut, w / 2, h / 2))),
  /** Outline of a frame around a box: four corner brackets. */
  frame: (x, y, w, h, len = 44) => brackets(x, y, w, h, len),
  /** One corner of that frame at (0, 0), opening toward (sx, sy) = (+-1, +-1). */
  corner: (sx, sy, len = 44) => `M0 ${sy * len}V0H${sx * len}`,
  /** How small things switch on: opacity at time t for something that starts at `start`. */
  appear: (t, start, length = .28) => flicker(t, start, length),
  /** The background of a full-frame card. `g` sits under the glow. */
  field(g, {W, H, id, defs}, ink, frame) {
    g.append('rect').attr('width', W).attr('height', H).attr('fill', ink.bg);
    const p = defs.append('pattern').attr('id', id + '-grid').attr('width', 54).attr('height', 54).attr('patternUnits', 'userSpaceOnUse');
    p.append('path').attr('d', 'M54 0H0V54').attr('fill', 'none').attr('stroke', theme.colors.grid).attr('stroke-width', 1.5);
    g.append('rect').attr('width', W).attr('height', H).attr('fill', `url(#${id}-grid)`).attr('opacity', .6);
    if (frame) { const d = brackets(26, 26, W - 52, H - 52, 64); aura(g, d, ink.accent, 4); g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 4).attr('stroke-linecap', 'square').attr('opacity', .9); }
  },
  /** A tick ruler from (x, y) going right, drawn under a row of readouts. */
  rule(g, x, y, width, color) {
    let d = `M${x} ${y}H${x + width}`; const n = Math.round(width / 22);
    for (let i = 0; i <= n; i++) d += `M${x + i / n * width} ${y}v${i % 5 ? 7 : 16}`;
    return g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2);
  },
  /** The small decorative mark scattered on cards: a reticle cross with a diamond at its centre. Drawn around (0, 0). */
  mark(g, r, color) {
    const a = r * .34, d = `M${-r} 0H${-a}M${a} 0H${r}M0 ${-r}V${-a}M0 ${a}V${r}`;
    aura(g, d, color, Math.max(3, r * .18));
    g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', Math.max(3, r * .18)).attr('stroke-linecap', 'square');
    g.append('rect').attr('x', -r * .16).attr('y', -r * .16).attr('width', r * .32).attr('height', r * .32).attr('fill', color).attr('transform', 'rotate(45)');
  },
  /** The outline of a badge of radius r around (0, 0): a hex cell. */
  cell: r => 'M' + [0, 1, 2, 3, 4, 5].map(i => `${Math.cos(i * Math.PI / 3 - Math.PI / 2) * r} ${Math.sin(i * Math.PI / 3 - Math.PI / 2) * r}`).join('L') + 'Z',
  /** The outline of a sticker of radius r around (0, 0): a notched ring of teeth. */
  seal(r, teeth = 24) { return 'M' + Array.from({length: teeth * 2}, (_, i) => { const a = (i + .5) * Math.PI / teeth, rr = Math.floor(i / 2) % 2 ? r : r * .93; return `${Math.cos(a) * rr} ${Math.sin(a) * rr}`; }).join('L') + 'Z'; },
  /**
   * The large soft shape that drifts behind headlines: here a glowing targeting ring. Returns
   * the parts; the engine moves them (`ghosts` trail behind the last ring when it moves fast,
   * `glow` circles sit under it, `inner` is scaled by innerScale and can spin).
   */
  halo(g, color, ghosts) {
    const glow = theme.glow.map(([extra, opacity]) => g.append('circle').attr('fill', 'none').attr('stroke', color).attr('stroke-width', 4 + extra).attr('stroke-opacity', opacity));
    const rings = Array.from({length: ghosts + 1}, (_, i) => g.append('circle').attr('fill', i === ghosts ? color : 'none').attr('fill-opacity', .08).attr('stroke', color).attr('stroke-width', i === ghosts ? 4 : 2));
    const inner = g.append('circle').attr('fill', 'none').attr('stroke', color).attr('stroke-width', 3).attr('stroke-dasharray', '34 16').attr('opacity', .8);
    return {rings, inner, innerScale: .78, glow};
  },
  /** The head of a light streak, drawn around (0, 0) pointing right; r is its half-thickness. */
  streakHead: (g, color) => g.append('path').attr('fill', theme.colors.text).attr('stroke', color).attr('stroke-width', 2),
  streakShape: r => `M${-r * 1.6} ${-r * .5}H${r * 1.2}L${r * 1.8} 0L${r * 1.2} ${r * .5}H${-r * 1.6}Z`,
  streakTail: .5,   // tail thickness as a share of r
  /** The stand-in picture inside an inset when the storyboard supplies none. Box is centred on (0, 0). */
  scene(g, w, h, color) {
    g.append('rect').attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('fill', theme.colors.panel);
    let d = ''; for (let i = 1; i < 8; i++) d += `M${-w / 2} ${h * (.08 + i * i * .0068)}H${w / 2}`;
    for (let i = -4; i <= 4; i++) d += `M${i * w * .05} ${h * .087}L${i * w * .2} ${h / 2}`;
    g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', 2).attr('opacity', .7);
    g.append('circle').attr('cy', -h * .1).attr('r', Math.min(w, h) * .24).attr('fill', color).attr('fill-opacity', .18).attr('stroke', color).attr('stroke-width', 3);
  },
};

// =====================================================================================
// ENGINE: nothing below names a colour or a font.
// =====================================================================================
const accentNames = () => Object.keys(theme.accents);
/** A theme colour by name (an accent, or 'text', 'dark', 'dim'...), or any CSS colour passed through. */
export const tone = c => theme.accents[c] ?? theme.colors[c] ?? c ?? theme.accents[accentNames()[0]];
/** Readable ink for text on a plate filled with this colour. */
export const inkOn = c => [theme.colors.bg, theme.colors.dark, theme.colors.panel].includes(tone(c)) ? theme.colors.text : theme.colors.dark;
/**
 * The inks of a card led by one accent: head (hero words), text (sublines), accent, alt (the
 * second accent, for marks and halos), on (ink on an accent-filled plate), dim, bg.
 */
export function look(name) {
  const names = accentNames(), i = Math.max(0, names.indexOf(name)), accent = tone(name ?? names[0]);
  return {bg: theme.colors.bg, head: accent, text: theme.colors.text, accent, alt: theme.accents[names[(i + 1) % names.length]], third: theme.accents[names[(i + 2) % names.length]], on: inkOn(accent), dim: theme.colors.dim};
}
export const up = s => String(s ?? '').toUpperCase();
export const appear = (t, start, length) => theme.appear(t, start, length);

let stages = 0;
/**
 * An SVG stage.
 *   overlay: true -> transparent 1080x1920, to sit on footage.
 *   otherwise     -> a full-frame card on the theme's field. It is 1080 wide and as tall as the
 *                    element it is mounted in (1080 square up to 1920 portrait), so lay out from W and H.
 */
export function textStage(el, {overlay = false, accent, frame = true} = {}) {
  const d3 = window.d3, id = `tx${++stages}`, W = 1080, cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const H = overlay ? 1920 : Math.round(clamp(W * ch / cw, 1080, 1920)), ink = look(accent);
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), under = svg.append('g'), root = svg.append('g'), stage = {svg, defs, under, root, id, W, H, ink, k: H / 1920, sq: H < 1500, n: 0};
  el.style.background = overlay ? 'transparent' : ink.bg;
  if (!overlay) theme.field(under, stage, ink, frame);
  return stage;
}
/** The theme's glow for a stroked outline `d`: draw this first, then the outline itself on top. */
export const aura = (g, d, color, width) => theme.glow.map(([extra, opacity]) => g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width + extra).attr('stroke-opacity', opacity).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round'));
const uid = stage => `${stage.id}-${++stage.n}`;
/** A clip rectangle; returns the value for a clip-path attribute. */
export function clipBox(stage, x, y, w, h) {
  const id = uid(stage); stage.defs.append('clipPath').attr('id', id).append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h);
  return `url(#${id})`;
}
/** A clip rectangle whose size is animated; returns {url, rect}. */
export function clipLive(stage) { const id = uid(stage); return {url: `url(#${id})`, rect: stage.defs.append('clipPath').attr('id', id).append('rect')}; }

// ---- Text: measuring, fitting, splitting. `role` is 'head', 'text' or 'mono'. ----
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const face = (o = {}) => ({...theme.type[o.role ?? 'head'], ...Object.fromEntries(Object.entries(o).filter(([, v]) => v != null))});
const css = (size, f) => `${f.weight} ${size}px ${f.font}`;
/** Width of a string in px. */
export function measure(str, size, o) { const f = face(o); ctx.font = css(100, f); return (ctx.measureText(str).width + f.spacing * 100 * [...str].length) * size / 100; }
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
/** Plain text; '\n' starts a new line. `shade` outlines it in the dark ink so it reads over footage. */
export function txt(g, x, y, str, {size = 26, color = theme.colors.text, role = 'text', anchor = 'start', leading = 1.2, shade = false, ...rest} = {}) {
  const f = face({role, ...rest}), node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`);
  if (shade) node.attr('stroke', theme.colors.dark).attr('stroke-width', size * .2).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}
/**
 * A line of text split into separately animated units: by 'letter', 'word' or 'all' (one unit).
 * Returns [{g, text, cx, y, w, cap, size, i, n, str}]; move a unit with pose() or slam().
 * `echo` adds the theme's two colour-split ghosts behind each unit (pose() spreads them `apart`);
 * `glow` (on by default with echo) puts the theme's glow under each unit, for hero words. Do not
 * recolour a glowing unit afterwards: its glow keeps the colour it was made with.
 */
export function glyphs(g, str, x, y, size, {by = 'letter', anchor = 'start', color = theme.colors.text, echo = false, glow = echo, ...rest} = {}) {
  const o = {role: 'head', ...rest}, f = face(o), pad = f.spacing * size, total = measure(str, size, o) - pad, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const parts = by === 'letter' ? [...str].map((c, i) => [c, i]) : by === 'word' ? [...str.matchAll(/\S+/g)].map(m => [m[0], m.index]) : [[str, 0]];
  return parts.filter(([c]) => c.trim()).map(([c, at], i, all) => {
    const w = measure(c, size, o) - pad, cx = x0 + measure(str.slice(0, at), size, o) + w / 2, inner = g.append('g').attr('transform', `translate(${cx} ${y})`).append('g');
    const layer = fill => inner.append('text').attr('text-anchor', 'middle').attr('fill', fill).style('font', css(size, f)).style('letter-spacing', by === 'letter' ? null : `${f.spacing}em`).text(c);
    const soften = Math.min(1, size / 170);
    if (glow) theme.glow.forEach(([extra, opacity]) => layer('none').attr('stroke', color).attr('stroke-width', extra * soften).attr('stroke-opacity', opacity).attr('stroke-linejoin', 'round'));
    const ghosts = echo ? theme.echo.map(tint => layer(tint).attr('opacity', 0)) : [];
    return {g: inner, ghosts, text: layer(color), cx, y, w, cap, size, i, n: all.length, str: c};
  });
}
/** Move, scale (about the middle of the cap height), rotate, skew and fade one unit from glyphs(). */
export function pose(u, {x = 0, y = 0, sx = 1, sy = sx, rot = 0, skew = 0, o = 1, apart = 0} = {}) {
  u.g.attr('transform', `translate(${x} ${y - u.cap / 2}) rotate(${rot}) skewX(${skew}) scale(${sx} ${sy}) translate(0 ${u.cap / 2})`).attr('opacity', o);
  u.ghosts.forEach((ghost, i) => ghost.attr('x', (i ? 1 : -1) * apart).attr('opacity', apart > .5 ? .85 : 0));
}

// ---- Motion ----
/** Speed of an ease-out move at progress q (0 when resting): use it to stretch things that move fast. */
export const vel = q => q <= 0 || q >= 1 ? 0 : 3 * (1 - q) * (1 - q);
export const easeIn = x => { x = clamp(x); return x * x * x; };
/** 0 while an overlay is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .35) => life ? easeIn(span(t, life - len, len)) : 0;
/**
 * The standard slam: a unit drops in oversized, overshoots and settles, its colour ghosts
 * snapping together as it lands; `x` is the leave amount (0..1), `live` a small resting stretch.
 */
export function slam(u, q, x = 0, {from = 2.4, drop = 0, live = 0} = {}) {
  const s = spring(q), sc = 1 + (from - 1) * (1 - s);
  pose(u, {y: -drop * (1 - s) + x * u.cap * 1.6 - live * u.cap * .5, sx: sc * (1 - x * .3), sy: sc * (1 + vel(q) * .12 + live) * (1 - x * .3), o: q <= 0 ? 0 : 1 - x, apart: q > 0 && q < 1 ? (1 - easeOut(q)) * u.size * .16 : 0});
}

// ---- Shapes and marks (all drawn with the theme's shapes) ----
/** A plate in the theme's shape whose box can be animated: set(x, y, w, h). */
export function plate(g, {fill = 'none', stroke = null, width = 3, cut = 18, opacity = 1} = {}) {
  const node = g.append('path').attr('fill', fill).attr('fill-opacity', opacity).attr('stroke', stroke).attr('stroke-width', stroke ? width : null);
  return {node, set(x, y, w, h) { node.attr('d', w > 1 && h > 1 ? theme.plate(x, y, w, h, cut) : ''); return this; }};
}
/** A see-through dark backing plate so text stays readable over footage. */
export const shade = (g, opacity = .66, cut = 18) => plate(g, {fill: theme.colors.bg, opacity, cut});
/** The theme's frame around a box. */
export function bracketFrame(g, x, y, w, h, {len = 44, color = theme.colors.text, width = 6} = {}) {
  const group = g.append('g'), d = theme.frame(x, y, w, h, len); aura(group, d, color, width);
  group.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'square');
  return group;
}
/** The theme's decorative mark centred on its own origin; rotate or scale the returned group. */
export function mark(g, x, y, r, color = theme.colors.text) { const inner = g.append('g').attr('transform', `translate(${x} ${y})`).append('g'); theme.mark(inner, r, color); return inner; }
/** A badge: the theme's cell outline (or filled) with a short mark inside. */
export function badge(g, x, y, r, label = 'R', {color = theme.colors.text, filled = false} = {}) {
  const inner = g.append('g').attr('transform', `translate(${x} ${y})`).append('g'), o = {role: 'mono'};
  if (!filled) aura(inner, theme.cell(r), color, Math.max(3, r * .1));
  inner.append('path').attr('d', theme.cell(r)).attr('fill', filled ? color : 'none').attr('stroke', color).attr('stroke-width', Math.max(3, r * .1));
  const size = fit(label, r * 1.1, r * 1.05, o); txt(inner, 0, capH(size, o) / 2, label, {size, color: filled ? inkOn(color) : color, role: 'mono', anchor: 'middle', spacing: 0});
  return inner;
}
/**
 * A row of micro-readouts spread between x0 and x1 (first flush left, last flush right) with the
 * theme's ruler above it. Returns the nodes, ruler first, for staggered switching on.
 */
export function readouts(g, labels, y, {x0 = 64, x1 = 1016, size = 24, color = theme.colors.text, rule = theme.colors.dim} = {}) {
  const n = labels.length, ruler = theme.rule(g, x0, y - size - 26, x1 - x0, rule);
  return [ruler, ...labels.map((label, i) => {
    const end = n > 1 && i === n - 1, x = end ? x1 : mix(x0, x1, n > 1 ? i / n * 1.08 : 0);
    return txt(g, x, y, up(label), {size, color, role: 'mono', anchor: end ? 'end' : 'start', leading: 1.15});
  })];
}
/** A linear gradient; returns the value for a fill attribute. Angle 0 runs left to right. */
export function gradient(stage, stops, angle = 45) {
  const id = uid(stage), a = angle * Math.PI / 180, dx = Math.cos(a) / 2, dy = Math.sin(a) / 2;
  const g = stage.defs.append('linearGradient').attr('id', id).attr('x1', .5 - dx).attr('y1', .5 + dy).attr('x2', .5 + dx).attr('y2', .5 - dy);
  stops.forEach((s, i) => { const [color, opacity = 1] = [].concat(s); g.append('stop').attr('offset', i / (stops.length - 1)).attr('stop-color', color).attr('stop-opacity', opacity); });
  return `url(#${id})`;
}
/**
 * The theme's halo: a large shape that leaves a smear of fading copies behind it when it moves.
 * set(x, y, r, dx, dy, opacity, turn): (dx, dy) is how far back the smear reaches, turn spins its inner part.
 */
export function halo(g, stage, {color = theme.colors.text, ghosts = 4} = {}) {
  const group = g.append('g'), {rings, inner, innerScale, glow = []} = theme.halo(group, color, ghosts);
  return {g: group, set(x, y, r, dx = 0, dy = 0, opacity = 1, turn = 0) {
    group.attr('opacity', opacity); r = Math.max(0, r);
    rings.forEach((c, i) => { const back = (ghosts - i) / ghosts; c.attr('cx', x - dx * back).attr('cy', y - dy * back).attr('r', r).attr('opacity', i === ghosts ? 1 : Math.hypot(dx, dy) < 2 ? 0 : .12 + .5 * (1 - back)); });
    glow.forEach(c => c.attr('cx', x).attr('cy', y).attr('r', r));
    inner.attr('cx', x).attr('cy', y).attr('r', r * innerScale).attr('transform', `rotate(${turn} ${x} ${y})`);
  }};
}
/** A light streak: a bright head with a tail that fades out behind it. set(x, y, r, length, angleDegrees, opacity). */
export function streak(g, stage, color = theme.colors.text) {
  const group = g.append('g'), tail = group.append('rect').attr('fill', gradient(stage, [[color, 0], [color, .9]], 0)), head = theme.streakHead(group, color);
  return {g: group, set(x, y, r, length = 0, angle = 0, opacity = 1) {
    group.attr('transform', `translate(${x} ${y}) rotate(${angle})`).attr('opacity', opacity);
    tail.attr('x', -length).attr('y', -r * theme.streakTail / 2).attr('width', length).attr('height', r * theme.streakTail); head.attr('d', theme.streakShape(r));
  }};
}
/**
 * A small picture inset: `image` (a URL) if the storyboard supplies one, otherwise the theme's
 * stand-in scene. Drawn centred on its own origin so it can be scaled; returns the group.
 */
export function inset(g, stage, x, y, w, h, {image, color = theme.colors.text} = {}) {
  const inner = g.append('g').attr('transform', `translate(${x + w / 2} ${y + h / 2})`).append('g'), pic = inner.append('g').attr('clip-path', clipBox(stage, -w / 2, -h / 2, w, h));
  theme.scene(pic, w, h, color);
  if (image) pic.append('image').attr('href', image).attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h).attr('preserveAspectRatio', 'xMidYMid slice');
  return inner;
}
/**
 * A marquee strip: the text repeated end to end with the theme's separator, every other copy
 * mirrored. set(offset, skew) scrolls it (px, either sign) and can lean it. Draw the band behind
 * it yourself. `y` is the baseline; `ghost` dims the mirrored copies.
 */
export function strip(g, stage, str, y, size, {color = theme.colors.text, mirror = true, sep = theme.sep, sepColor = color, ghost = 1, ...rest} = {}) {
  const unit = up(str), o = {role: 'head', ...rest}, f = face(o), gap = measure(sep, size, o) + size * .7, w = measure(unit, size, o) + gap, n = Math.ceil(stage.W / w) + 3, period = mirror ? w * 2 : w, group = g.append('g');
  for (let i = -1; i < n + (n % 2); i++) {
    const mirrored = mirror && ((i % 2) + 2) % 2 === 1;
    group.append('text').attr('y', y).attr('fill', color).attr('opacity', mirrored ? ghost : 1).style('font', css(size, f)).style('letter-spacing', `${f.spacing}em`).text(unit)
      .attr('transform', mirrored ? `translate(${(i + 1) * w - gap / 2} 0) scale(-1 1)` : `translate(${i * w + gap / 2} 0)`);
    group.append('text').attr('x', i * w).attr('y', y).attr('fill', sepColor).attr('text-anchor', 'middle').style('font', css(size, f)).text(sep);
  }
  return {g: group, width: w, set(offset, skew = 0) { group.attr('transform', `translate(${-((offset % period) + period) % period} 0) skewX(${skew})`); }};
}
