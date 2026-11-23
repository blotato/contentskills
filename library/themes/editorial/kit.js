// Editorial theme drawing kit. Every piece in this theme draws with this file; if two pieces disagree
// about what the theme looks like, the fix belongs here.
//
// THE STYLE (original work in the genre of magazine / editorial motion design)
//   Colour   Taken from footage, not chosen: the palette below was MEASURED on the clip this theme was built for
//            (talking-head-2, a bright white house, a wine-red plaid jacket, dark brown hair), so every graphic
//            looks like it was printed for that picture. One paper, one ink, one accent per surface.
//   Type     A condensed high-contrast serif (Instrument Serif) for everything that is read as a headline, its
//            italic for the ONE word that matters (written *like this* in any text prop), a Didone (Bodoni Moda)
//            for mastheads and big numerals, a clean grotesque (Inter Tight) for small widely tracked capitals,
//            and a mono (DM Mono) for folios, timecodes and figures in tables. Sentence case; never all-caps serif
//            except mastheads. Generous margins (72 px), a 12-column grid, hairline rules, folios, issue numbers.
//   Motion   Smooth and precise: text RISES from behind a hairline (masked), rules DRAW, cards GLIDE in on a
//            quart-out curve and settle, letters fade up one after another, pictures push in slowly.
//            Arrivals take 0.3-0.5 s; exits are quicker (0.25 s) and go the way they came. Nothing bounces,
//            flashes, glows or shakes.
//   Avoid    Neon, glow, gradients on type, heavy drop shadows, outlines on type, emoji, script fonts, overshoot.
//
// MEASURED ON THE FOOTAGE (projects/talking-head-2/edit/clean.mp4, 29.8 s, 13 segments, 6 frames each, k-means in
// CIELAB, .tools/venv-effects; share of all pixels in brackets):
//   whole clip, k = 8:  #C1C3BC (19.6%) wall in shade · #30171F (19.3%) jacket shadow · #DFE6E2 (14.2%) wall in light ·
//                       #4E3E3D (11.3%) hair · #9D9D98 (11.1%) grey furniture · #896B65 (9.9%) hair/skin shadow ·
//                       #CB927C (7.4%) skin · #6D1A31 (7.3%) jacket red
//   light neutrals (26.4%): #E8EFEB / #D5DBD5 / #C3C8C1 — cool daylight white, a touch green; top 5% luma #E9EEEA
//   darks (13.5%):          #2C0F1C / #2E2326 / #1A0F17 — aubergine black (the plaid's dark squares)
//   reds (12.2%, hue 330-15): #511827 (60%) · #7A2137 (30%) · #B5545B (9%); the bright knit top: #A70A3E (0.9%)
//   skin (9.0%):            #C98F77 median, highlight #DFA78C, shade #9A6E5E;  hair (4.4%): #4B3933 / #644D44
//   Saturated pixels: 28.9% of the picture, 97.7% of them within hue 330-30 (red to warm skin). No blue, no green.
//   The clip moves through seven spots of one white house; every segment has the same four families (white wall,
//   aubergine shadow, wine red, warm skin), so one palette serves the whole clip.
//
// DERIVED PALETTE (WCAG contrast ratios for text)
//   paper  #EDF0EB  the lit wall, lifted a hair          ink on paper 15.6 · wine on paper 8.7 · crimson on paper 7.0
//   stone  #D5DBD5  the wall, mid                        ink on stone 12.7 · wine on stone 7.1
//   fog    #C3C8C1  the wall in shade                    (rules and tints on paper; fog on ink 10.5)
//   ink    #26101A  the jacket's dark squares            paper on ink 15.6 · blush on ink 8.6 · clay on ink 6.6
//   umber  #4B3933  the hair                             umber on paper 9.5  (secondary text on paper)
//   mute   #6E625E  hair/skin shadow, greyed             mute on paper 5.1   (small labels on paper)
//   wine   #7A2137  the jacket's red                     paper on wine 8.7 · blush on wine 4.8 (large type only)
//   crimson #A70A3E the bright knit top                  paper on crimson 7.0 (the one hot accent; use once per frame)
//   blush  #DFA78C  skin in light                        the accent on dark surfaces
//   clay   #C98F77  skin, median                         second accent on dark, chart series
//   rule   #9D9D98  grey furniture                       hairlines only (2.4 on paper: never text)
//
// EXPORTS (every animated value is set from t inside seek(t): no timers, Math.random or Date.now)
//   C, F, FRAME, SAFE, M            colours, fonts {head, italic, serif (Didone), sans, mono}, frame, app safe zone, margin (72).
//   clamp, span, mix                from the shared kit. span(t, start, length) -> 0..1.
//   glide(x), smooth(x), easeIn(x), ease(x)   quart-out (the theme's arrival), cubic in-out, cubic in, cubic out.
//   hash(n, seed)                   seeded 0..1.
//   tone(name), fieldOf(name)       a colour / a ground {bg, fg, accent, sub, rule} of this theme for any name
//                                   (other themes' names map onto these). Grounds: paper, stone, ink, wine, maroon, blush.
//   up, pad, comma, typed(str, q), count(value, q, decimals), runs(str)   string helpers; runs splits "*italic*" marks.
//   stage(el, {mode, field, clear})  mode 'overlay' = transparent 1080x1920; 'tall' = title card 1080 wide and
//                                   1080..1920 tall; 'card' = 1000x1000. Returns st = {svg, defs, root, W, H, k, sq,
//                                   fg, accent, sub, ruleC, field, url(name), uid(prefix), bare}.
//   g(parent)                       a new <g>.
//   measure(str, size, o), capH(size, o), fit(lines, width, max, o), wrap(str, size, width, o)   text metrics;
//                                   o = {font, weight, track}; strings may carry *italic* marks.
//   text(parent, x, y, str, o)      plain text; o = {font, size, weight, track, anchor, color, opacity}.
//   label(parent, x, y, str, o)     small tracked capitals in the grotesque ('\n' = new line).
//   folio(parent, x, y, str, o)     mono figures.
//   line(st, parent, str, x, y, size, o)   THE HEADLINE LINE: one line of serif (with *italic accent* runs) that
//                                   rises from behind its baseline; .set(a, b) a = in 0..1, b = out 0..1; .w, .x0.
//   lines(st, parent, arr, x, y, size, o)  several lines, top-aligned at y; .seek(t, at, out, gap), .bottom, .pitch.
//   letters(parent, str, x, y, size, o)    letter-by-letter fade-up; .seek(t, {at, step, dur, out}), .w.
//   rule(parent, x0, y0, x1, y1, o) a hairline that draws: .draw(q) / .range(a, b).
//   card(st, parent, {x, y, w, h, field, radius, shadow, border})   a paper card with a hairline edge; returns
//                                   {g, body, f (its ground), set({a, b, dy})}: glides up into place (a), leaves down (b).
//   picture(st, parent, {x, y, w, h, image, tone, radius})   a framed picture (image URL, or a tint of the footage).
//   soft(node, q)                   opacity and a small blur from q (a focus pull).
//   presence(t, life, fade), leave(t, life, len), faceAt(props, t), loadImages(urls, w, h).
//   veil(st, parent, {top, bottom, color, strength})   a soft paper (or ink) gradient at the top and/or bottom of footage.
//   furniture(st, parent, {left, right, y, color})     a rule with a tracked label each end (running head / foot).
import {clamp, span, mix} from '/library/_shared/kit.js';
export {clamp, span, mix};

// ---------------------------------------------------------------- theme
export const C = {
  paper: '#EDF0EB', stone: '#D5DBD5', fog: '#C3C8C1', ink: '#26101A', umber: '#4B3933', mute: '#6E625E',
  wine: '#7A2137', crimson: '#A70A3E', blush: '#DFA78C', clay: '#C98F77', rule: '#9D9D98',
  maroon: '#4A1222',      // the jacket's red in shadow: the deep ground (paper on maroon 13.9 · blush on maroon 7.6)
};
export const F = {head: '"Instrument Serif"', italic: '"Instrument Serif Italic"', serif: '"Bodoni Moda"', sans: '"Inter Tight"', mono: '"DM Mono"'};
export const FRAME = {width: 1080, height: 1920};
export const SAFE = {left: 70, top: 250, right: 1010, bottom: 1440};
export const M = 72;

const toneAlias = {white: 'paper', cream: 'paper', bone: 'paper', frost: 'paper', black: 'ink', dark: 'ink', noir: 'ink', coal: 'ink', red: 'crimson', poppy: 'crimson', signal: 'crimson', hot: 'crimson', magenta: 'wine', accent: 'wine',
  pink: 'blush', peach: 'blush', amber: 'blush', yellow: 'blush', sun: 'blush', gold: 'blush', orange: 'clay', cyan: 'stone', cobalt: 'wine', blue: 'wine', grey: 'rule', gray: 'rule', dim: 'mute', brown: 'umber'};
/** A colour of this theme for a colour name from any theme; CSS colours pass through. */
export const tone = c => C[c] ?? C[toneAlias[c]] ?? (/^(#|rgb|hsl)/.test(c ?? '') ? c : C.ink);
/** Grounds: background, type colour, accent, secondary text and hairline on it. */
export const fields = {
  paper: {name: 'paper', bg: C.paper, fg: C.ink, accent: C.wine, sub: C.mute, rule: C.ink, dark: false},
  stone: {name: 'stone', bg: C.stone, fg: C.ink, accent: C.wine, sub: C.umber, rule: C.ink, dark: false},
  blush: {name: 'blush', bg: C.blush, fg: C.ink, accent: C.wine, sub: C.umber, rule: C.ink, dark: false},
  ink: {name: 'ink', bg: C.ink, fg: C.paper, accent: C.blush, sub: C.fog, rule: C.paper, dark: true},
  wine: {name: 'wine', bg: C.wine, fg: C.paper, accent: C.blush, sub: C.stone, rule: C.paper, dark: true},
  maroon: {name: 'maroon', bg: C.maroon, fg: C.paper, accent: C.blush, sub: C.stone, rule: C.paper, dark: true},
};
const fieldAlias = {white: 'paper', bone: 'paper', cream: 'paper', mist: 'paper', light: 'paper', frost: 'paper', grey: 'stone', gray: 'stone', graphite: 'ink', charcoal: 'ink', black: 'ink', noir: 'ink', dark: 'ink', void: 'ink', deep: 'ink', teal: 'ink', slate: 'ink',
  red: 'wine', poppy: 'wine', cobalt: 'wine', crimson: 'wine', dusk: 'wine', sun: 'blush', peach: 'blush', clay: 'blush'};
export const fieldOf = name => fields[name] ?? fields[fieldAlias[name]] ?? fields.paper;

export const up = s => String(s ?? '').toUpperCase();
export const pad = (n, width = 2) => String(Math.floor(n)).padStart(width, '0');
export const comma = n => Math.round(n).toLocaleString('en-US');
export const typed = (value, q) => String(value ?? '').slice(0, Math.round(String(value ?? '').length * clamp(q)));
export function count(value, q, decimals = null) {
  const s = String(value ?? ''), m = s.match(/-?[\d,]*\.?\d+/); if (!m) return s;
  const n = parseFloat(m[0].replace(/,/g, '')), d = decimals ?? (m[0].split('.')[1]?.length ?? 0), v = n * clamp(q);
  const txt = m[0].includes(',') ? v.toLocaleString('en-US', {minimumFractionDigits: d, maximumFractionDigits: d}) : v.toFixed(d);
  return s.slice(0, m.index) + txt + s.slice(m.index + m[0].length);
}
/** "Claude edited *this*" -> [{text: 'Claude edited ', italic: false}, {text: 'this', italic: true}] */
export const runs = str => String(str ?? '').split('*').map((text, i) => ({text, italic: i % 2 === 1})).filter(r => r.text);
const plain = str => String(str ?? '').replace(/\*/g, '');

// ---------------------------------------------------------------- easing
export const glide = x => 1 - Math.pow(1 - clamp(x), 4);
export const ease = x => 1 - Math.pow(1 - clamp(x), 3);
export const smooth = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeIn = x => Math.pow(clamp(x), 3);
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- stage
let stages = 0;
export function stage(el, {mode = 'tall', field = 'paper', clear = false} = {}) {
  const d3 = window.d3, id = `ed${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const [W, H] = overlay ? [1080, 1920] : mode === 'card' ? [1000, 1000] : [1080, Math.round(clamp(1080 * ch / cw, 1080, 1920))];
  const f = fieldOf(field), bare = overlay || clear;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  el.style.background = bare ? 'transparent' : f.bg;
  const defs = svg.append('defs'), url = name => `url(#${id}-${name})`;
  let uids = 0; const uid = (p = 'u') => `${id}-${p}${++uids}`;
  // lift: the soft shadow under a card. Tinted with the ink (aubergine), never black.
  const lift = defs.append('filter').attr('id', `${id}-lift`).attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '150%');
  lift.append('feDropShadow').attr('dx', 0).attr('dy', 14).attr('stdDeviation', 22).attr('flood-color', C.ink).attr('flood-opacity', .24);
  // halo: a paper glow that keeps ink type readable straight on footage; shade does the same for paper type.
  for (const [name, col, op] of [['halo', C.paper, .9], ['shade', C.ink, .6]]) {
    const h = defs.append('filter').attr('id', `${id}-${name}`).attr('x', '-20%').attr('y', '-40%').attr('width', '140%').attr('height', '180%');
    h.append('feDropShadow').attr('dx', 0).attr('dy', 0).attr('stdDeviation', 14).attr('flood-color', col).attr('flood-opacity', op);
  }
  const root = svg.append('g');
  if (!bare) root.append('rect').attr('width', W).attr('height', H).attr('fill', f.bg);
  return {svg, defs, root, id, W, H, k: H / 1920, sq: H < 1500, mode, field: f, bare, fg: f.fg, accent: f.accent, sub: f.sub, ruleC: f.rule, url, uid};
}
export const g = parent => (parent.root ?? parent).append('g');

// ---------------------------------------------------------------- text metrics
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const css = (size, {font = F.head, weight = 400} = {}) => `${weight} ${size}px ${font}`;
const bareW = (str, o) => { ctx.font = css(100, o); return ctx.measureText(str).width; };
const runW = (r, size, o) => (bareW(r.text, r.italic ? {...o, font: o.italicFont ?? F.italic} : o) + (o.track ?? 0) * 100 * [...r.text].length) * size / 100;
export function measure(str, size, o = {}) { return runs(str).reduce((w, r) => w + runW(r, size, o), 0); }
export function capH(size, o = {}) { const key = css(100, o); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 68; } return caps[key] * size / 100; }
export const fit = (lns, width, max, o = {}) => Math.min(max, ...[].concat(lns).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
/** Wrap to width; *italic* marks may span several words and survive the wrap. */
export function wrap(str, size, width, o = {}) {
  const out = []; let cur = [], it = false;
  const words = String(str ?? '').split(/\s+/).filter(Boolean).map(w => { const starts = w.startsWith('*'), ends = w.endsWith('*') && w.length > 1, on = it || starts; if (starts && !ends) it = true; else if (ends && !starts) it = false; else if (starts && ends) it = false; const bare = w.replace(/\*/g, ''); return on ? `*${bare}*` : bare; });
  const join = ws => ws.join(' ').replace(/\* \*/g, ' ');
  for (const w of words) { const next = [...cur, w]; if (cur.length && measure(join(next), size, o) > width) { out.push(join(cur)); cur = [w]; } else cur = next; }
  if (cur.length) out.push(join(cur)); return out;
}

// ---------------------------------------------------------------- text
export function text(parent, x, y, str, {font = F.head, size = 60, weight = 400, track = 0, anchor = 'start', color = C.ink, opacity = 1} = {}) {
  const nudge = anchor === 'end' ? track * size : anchor === 'middle' ? track * size / 2 : 0;
  return (parent.root ?? parent).append('text').attr('x', x + nudge).attr('y', y).attr('fill', tone(color)).attr('text-anchor', anchor).attr('opacity', opacity)
    .style('font', css(size, {font, weight})).style('letter-spacing', track ? `${track}em` : null).text(str ?? '');
}
export function label(parent, x, y, str, {size = 28, anchor = 'start', weight = 600, track = .2, color = C.ink, opacity = 1, font = F.sans, leading = 1.4, caps = true} = {}) {
  const node = text(parent, x, y, '', {font, size, weight, track, anchor, color, opacity}), nx = +node.attr('x');
  String(str ?? '').split('\n').forEach((ln, i) => node.append('tspan').attr('x', nx).attr('dy', i ? `${leading}em` : 0).text(caps ? up(ln) : ln));
  return node;
}
export const folio = (parent, x, y, str, o = {}) => label(parent, x, y, str, {font: F.mono, weight: 500, track: .06, size: 28, ...o});

/** One serif line that rises from behind its baseline (a mask), with *italic accent* runs. */
export function line(st, parent, str, x, y, size, {font = F.head, italicFont = F.italic, weight = 400, track = 0, anchor = 'start', color = null, accent = null, shadow = null} = {}) {
  const o = {font, weight, track, italicFont}, rs = runs(str), w = measure(str, size, o), x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const cid = st.uid('rise'), asc = size * .98, desc = size * .3;
  st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', x0 - size * .1).attr('y', y - asc).attr('width', w + size * .3).attr('height', asc + desc);
  const outer = (parent.root ?? parent).append('g'); if (shadow) outer.attr('filter', st.url(shadow));
  const inner = outer.append('g').attr('clip-path', `url(#${cid})`).append('g');
  let cx = x0;
  for (const r of rs) {
    text(inner, cx, y, r.text, {font: r.italic ? italicFont : font, size, weight, track, color: r.italic ? (accent ?? st.accent) : (color ?? st.fg)}).attr('xml:space', 'preserve').style('white-space', 'pre');
    cx += runW(r, size, o);
  }
  const self = {g: outer, w, x0, size, set(a = 1, b = 0) { const dy = (1 - glide(a)) * (asc + desc) - easeIn(b) * (asc + desc); inner.attr('transform', `translate(0 ${dy.toFixed(1)})`); outer.attr('opacity', a <= 0 || b >= 1 ? 0 : 1); return self; }};
  return self.set(0);
}
/** Several rising lines, the first baseline at y + cap. seek(t, at, out, gap): staggered in, together out. */
export function lines(st, parent, arr, x, y, size, o = {}) {
  const cap = capH(size, o), pitch = size * (o.leading ?? 1.02), rows = [].concat(arr).map((s, i) => line(st, parent, s, x, y + cap + i * pitch, size, o));
  return {rows, cap, pitch, top: y, bottom: y + cap + (rows.length - 1) * pitch + size * .22, w: Math.max(0, ...rows.map(r => r.w)),
    seek(t, at = 0, out = null, gap = .09, dur = .5) { rows.forEach((r, i) => r.set(span(t, at + i * gap, dur), out == null ? 0 : span(t, out + i * .03, .25))); }};
}
/** Letter-by-letter fade-up (each letter rises a little and clears). */
export function letters(parent, str, x, y, size, {font = F.head, weight = 400, track = 0, anchor = 'middle', color = C.ink, rise = .16} = {}) {
  const chars = [...String(str ?? '')], o = {font, weight}, pre = chars.map((_, i) => bareW(chars.slice(0, i).join(''), o) * size / 100 + track * size * i);
  const w = bareW(chars.join(''), o) * size / 100 + track * size * Math.max(0, chars.length - 1), x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const root = (parent.root ?? parent).append('g');
  const nodes = chars.map((ch, i) => text(root, x0 + pre[i], y, ch, {font, size, weight, color}).attr('opacity', 0));
  const self = {root, nodes, w, x0, seek(t, {at = 0, step = .04, dur = .28, out = null, outStep = .015} = {}) {
    nodes.forEach((n, i) => { const a = ease(span(t, at + i * step, dur)), b = out == null ? 0 : ease(span(t, out + i * outStep, .18)); n.attr('opacity', (a * (1 - b)).toFixed(3)).attr('transform', `translate(0 ${((1 - a) * size * rise - b * size * rise * .6).toFixed(1)})`); });
    return self; }, inLen: (step = .04, dur = .28) => (chars.length - 1) * step + dur};
  return self;
}
export function rule(parent, x0, y0, x1, y1, {width = 2, color = C.ink, opacity = 1} = {}) {
  const ln = (parent.root ?? parent).append('line').attr('stroke', tone(color)).attr('stroke-width', width).attr('stroke-opacity', opacity);
  const self = {node: ln, range(a, b) { a = clamp(a); b = clamp(b); ln.attr('x1', mix(x0, x1, a)).attr('y1', mix(y0, y1, a)).attr('x2', mix(x0, x1, b)).attr('y2', mix(y0, y1, b)).attr('opacity', b - a > .001 ? 1 : 0); return self; }, draw(q) { return self.range(0, q); }};
  return self.draw(0);
}

// ---------------------------------------------------------------- surfaces
/** A paper card with a hairline edge and a soft aubergine shadow. set({a, b, dy}): glide up into place, leave downwards. */
export function card(st, parent, {x, y, w, h, field = 'paper', radius = 6, shadow = true, border = true, opacity = 1} = {}) {
  const f = fieldOf(field), outer = (parent.root ?? parent).append('g'), body = outer.append('g');
  const bg = body.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', radius).attr('fill', f.bg).attr('fill-opacity', opacity);
  if (shadow) bg.attr('filter', st.url('lift'));
  if (border) body.append('rect').attr('x', x + .75).attr('y', y + .75).attr('width', w - 1.5).attr('height', h - 1.5).attr('rx', radius).attr('fill', 'none').attr('stroke', f.dark ? C.paper : C.ink).attr('stroke-opacity', f.dark ? .22 : .16).attr('stroke-width', 1.5);
  const self = {g: outer, body, f, x, y, w, h, set({a = 1, b = 0, dy = 46} = {}) { const p = glide(a), q = easeIn(b); body.attr('transform', `translate(0 ${((1 - p) * dy + q * dy * .6).toFixed(1)})`); outer.attr('opacity', (ease(clamp(a * 1.6)) * (1 - q)).toFixed(3)); return self; }};
  return self;
}
/** Tints of the footage for pictures with no image: [from, to] of a soft diagonal light. */
export const TINTS = {wall: ['#EDF0EB', '#C3C8C1'], shade: ['#C3C8C1', '#9D9D98'], wine: ['#A70A3E', '#511827'], plaid: ['#7A2137', '#2C0F1C'], skin: ['#DFA78C', '#C98F77'], hair: ['#644D44', '#372621'], ink: ['#4B3933', '#26101A']};
const tintNames = Object.keys(TINTS);
export const tintOf = n => TINTS[n] ? n : typeof n === 'number' ? tintNames[n % tintNames.length] : 'wall';
/** A framed picture: an image (cover-cropped) or a tint of the footage, clipped to a box with a hairline. set({x, y, w, h, opacity}). */
export function picture(st, parent, {x = 0, y = 0, w = 300, h = 400, image = null, tint = 'wall', radius = 0, border = true} = {}) {
  const cid = st.uid('pic'), cr = st.defs.append('clipPath').attr('id', cid).append('rect').attr('rx', radius), outer = (parent.root ?? parent).append('g'), inner = outer.append('g').attr('clip-path', `url(#${cid})`);
  let pic;
  if (image) pic = inner.append('image').attr('href', image).attr('preserveAspectRatio', 'xMidYMid slice');
  else { const gid = st.uid('tint'), T = TINTS[tintOf(tint)], gr = st.defs.append('linearGradient').attr('id', gid).attr('x1', 0).attr('y1', 0).attr('x2', 1).attr('y2', 1); gr.append('stop').attr('offset', 0).attr('stop-color', T[0]); gr.append('stop').attr('offset', 1).attr('stop-color', T[1]); pic = inner.append('rect').attr('fill', `url(#${gid})`); }
  const edge = border ? outer.append('rect').attr('fill', 'none').attr('stroke', C.ink).attr('stroke-opacity', .22).attr('stroke-width', 1.5).attr('rx', radius) : null;
  const box = {x, y, w, h, opacity: 1, zoom: 1};
  const self = {g: outer, box, set(o = {}) { Object.assign(box, o); const {x, y, w, h, zoom} = box, W = Math.max(0, w), H = Math.max(0, h);
    cr.attr('x', x).attr('y', y).attr('width', W).attr('height', H); pic.attr('x', x - W * (zoom - 1) / 2).attr('y', y - H * (zoom - 1) / 2).attr('width', W * zoom).attr('height', H * zoom);
    edge?.attr('x', x + .75).attr('y', y + .75).attr('width', Math.max(0, W - 1.5)).attr('height', Math.max(0, H - 1.5)); outer.attr('opacity', box.opacity); return self; }};
  return self.set();
}
/** A focus pull: opacity and a small blur from q. */
export const soft = (node, q, blur = 14) => { q = clamp(q); node.attr('opacity', q.toFixed(3)).style('filter', q < .995 ? `blur(${((1 - q) * blur).toFixed(1)}px)` : null); return node; };

// ---------------------------------------------------------------- footage helpers
export const presence = (t, life, fade = .22) => ease(clamp(t / fade)) * (life ? 1 - ease(span(t, life - fade, fade)) : 1);
export const leave = (t, life, len = .3) => life ? span(t, life - len, len) : 0;
export function faceAt(props, t) {
  if (props.locate) return props.locate(t + (props.at ?? 0));
  const track = props.track; if (!track?.length) return props.box ?? {x: .3, y: .3, w: .4, h: .22};
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0])) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}
/** Decode pictures before a piece mounts, so seek(t) stays pure: resolves to data URLs (null where one fails). */
export const loadImages = (urls = [], w = 360, h = 640) => Promise.all(urls.map(url => !url ? null : new Promise(done => {
  const img = new Image(); img.onerror = () => done(null);
  img.onload = () => { const c = document.createElement('canvas'); c.width = w; c.height = h; const k = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
    c.getContext('2d').drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh); done(c.toDataURL('image/jpeg', .9)); };
  img.src = url;
})));
/** Subtle grid squares over a ground (graph paper on the field): thin lines every `cell` px, a touch lighter than the ground. */
export function gridLines(parent, {cell = 72, color = C.paper, opacity = .07, width = 1.5, w = 1080, h = 1920} = {}) {
  const g = (parent.root ?? parent).append('g').attr('stroke', tone(color)).attr('stroke-opacity', opacity).attr('stroke-width', width).attr('shape-rendering', 'crispEdges');
  const x0 = (w / 2) % cell, y0 = (h / 2) % cell;
  for (let x = x0; x <= w; x += cell) g.append('line').attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', h);
  for (let y = y0; y <= h; y += cell) g.append('line').attr('y1', y).attr('y2', y).attr('x1', 0).attr('x2', w);
  return g;
}
/** A soft gradient of paper (or ink) at the top and/or bottom of footage, so type has a quiet ground. top/bottom: share of the frame. */
export function veil(st, parent, {top = .3, bottom = 0, color = 'paper', strength = .85} = {}) {
  const col = tone(color), grp = (parent.root ?? parent).append('g');
  for (const [share, dir] of [[top, 0], [bottom, 1]]) {
    if (!share) continue; const id = st.uid('veil'), gr = st.defs.append('linearGradient').attr('id', id).attr('x1', 0).attr('x2', 0).attr('y1', dir ? 1 : 0).attr('y2', dir ? 0 : 1);
    [[0, strength], [.55, strength * .55], [1, 0]].forEach(([o, a]) => gr.append('stop').attr('offset', o).attr('stop-color', col).attr('stop-opacity', a));
    grp.append('rect').attr('x', 0).attr('y', dir ? st.H * (1 - share) : 0).attr('width', st.W).attr('height', st.H * share).attr('fill', `url(#${id})`);
  }
  return grp;
}
/** Page furniture: a hairline with a tracked label at each end (a running head or foot). Returns seek(q in, q out). */
export function furniture(st, parent, {left = '', right = '', y = 150, color = null, size = 26, x0 = M, x1 = null, above = true} = {}) {
  const col = color ?? st.fg, X1 = x1 ?? st.W - M, grp = (parent.root ?? parent).append('g'), ty = above ? y - size * .75 : y + size * 1.5;
  const rl = rule(grp, x0, y, X1, y, {width: 2, color: col});
  const a = left ? label(grp, x0, ty, left, {size, color: col}) : null, b = right ? folio(grp, X1, ty, up(right), {size, color: col, anchor: 'end'}) : null;
  return (qi = 1, qo = 0) => { rl.range(ease(qo), glide(qi)); const o = ease(clamp(qi * 2 - .6)) * (1 - ease(qo)); a?.attr('opacity', o); b?.attr('opacity', o); };
}
