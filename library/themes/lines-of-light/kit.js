// Lines of Light theme drawing kit. Every piece in this theme draws with this file; if two pieces
// disagree about what the theme looks like, the fix belongs here.
//
// THE STYLE (the "Lines of Light" reel look)
//   Frame    ~90% near-black (#040506) with a deep teal haze (#1d3436) pooled round the light
//            source, a soft vignette and a faint grain. Overlays have no background at all.
//   Light    Thin 1-3 px lines only, never solid fills. Every line is drawn four times: a white
//            core (#f5f3ff), a red echo offset up-left, a blue echo offset down-right, and a soft
//            lilac halo (#f0d6f2). Light is additive (screen blending). The red echo trails the draw
//            slightly and the blue one leads it, so a line splits into colour as it moves.
//   Meaning  Red is a cause or action: the red dot top-left that fires the first line of a scene,
//            a red pulse running along a path, red strikes. Blue is the result arriving: a blue flash
//            where a line lands, clips lit blue. Nothing appears until a line reaches it; shapes open
//            from the point the line touches them (both halves draw round and meet on the far side).
//   Motion   Slow eased draw-ons (1.5-3 s, quartic ease-out), a hard lock, no bounce, long holds.
//            Leaving: lines retract from their start (the tail chases the head) and text dims.
//   Type     Michroma, a wide extended sans, in widely tracked capitals. A title LANDS: it arrives
//            saturated orange, burns through red and cools to white while its tracking closes in.
//            Small UI text (prompts, readouts, notes) is IBM Plex Mono Light.
//   Geometry Radial: rays, arcs, rings, horizons; light has a source. Keep type 12-88% of the height.
//   Avoid    Filled neon, flat colour fills, chrome text, glitch overload, hot pink with cyan.
//
// EXPORTS (every animated value is set from t inside seek(t): no timers, Math.random or Date.now)
//   C, F, FRAME, SAFE      colours ({bg, haze, deep, core, lilac, red, blue, orange, pink, violet, cyan, dim, mute}),
//                          fonts ({head: Michroma, mono: IBM Plex Mono, wide: Syncopate}), frame size, app safe zone.
//   clamp, span, mix       from the shared kit. span(t, start, length) -> 0..1.
//   ease(x), io(x), easeIn(x)   quartic ease-out (the theme's draw-on), quartic in-out, cubic in.
//   hash(n, seed), noise(t, seed)   seeded 0..1 random / smooth wander (the only randomness allowed).
//   tone(name)             a colour of this theme for any colour name ('cyan' -> blue, 'magenta' -> red, 'amber' -> orange); CSS passes through.
//   up(s), oneLine(s), pad(n, w), comma(n), typed(str, q)   string helpers (typed: the first q of the string).
//   fieldOf(name)          title-card backdrop {bg, haze, a}: teal (default), black, deep, ember, violet; other themes' names map onto these.
//   stage(el, {mode, field, clear, source, grain})
//                          mode 'overlay' = transparent 1080x1920 for footage; 'tall' = full-frame title card 1080 wide,
//                          1080..1920 tall (follows the element's shape); 'card' = 1000x1000 diagram card.
//                          source: [fx, fy] where the haze pools, as shares of W and H (default [.5, .42]).
//                          shade: strength of the dark plate pool()/band() draw behind overlay text, 0..1 (default 1;
//                          overlays pass props.shade: 0 = no plate, e.g. under the night look). Returns
//                          st = {svg, defs, W, H, k (H/1920), sq (squarish card?), root, back, front, tick(t), fill(name), url(name), mode}.
//                          root is a LIGHT GROUP (below). Call st.tick(t) from seek on title cards (grain + haze breathing).
//   group(parent)          a new LIGHT GROUP inside parent (a light group, default st.root): one <g> in each render layer
//                          (shade, halo, red, blue, core, text, top) so a set of lines + text can move/fade together:
//                          lg.attr('transform', ...) / lg.attr('opacity', ...) apply to every layer. lg.group() nests.
//   light(lg, shape, {width, color, echo, halo, opacity})
//                          THE light line. shape = [[x, y], ...] points or an SVG path string. color 'core' (white, default)
//                          or any tone; echo false drops the red/blue echoes (used for red cause-lines). Returns
//                          {draw(q), range(a, b), set(shape), at(q) -> [x, y], len, opacity(o)}: draw(q) reveals 0..q of
//                          the line (echoes lag/lead); range(a, b) shows only a..b (retracting tails, travelling dashes).
//                          Point arrays may use dashes (opts.dash = '12 8'); path strings are revealed with stroke-dash.
//   poly(pts), bez(p0, p1, p2, p3, n), arcPts(cx, cy, r, a0, a1, n), along(pts, q), sub(pts, a, b), lengthOf(pts)
//                          geometry on point arrays (angles in degrees, 0 = right, 90 = down).
//   ring(lg, cx, cy, r, {from, width, ...})   a circle that OPENS from angle `from` (deg): both halves draw round and meet
//                          opposite. Returns {draw(q), range(a, b), halves}.
//   openBox(lg, x, y, w, h, {from, width, ...})   a rectangle opening from a touch point: from = 'left'|'right'|'top'|'bottom'
//                          (middle of that side) or [x, y] on its edge. Returns {draw(q), range(a, b)}.
//   rays(lg, cx, cy, r0, r1, n, a0, a1, {width, fade})   a sunburst: n lights radiating between angles a0..a1.
//                          Returns lights[] each with .k (0..1 position across the fan, 0.5 = middle).
//   dot(lg, x, y, {color, r})   a glowing dot (white pin in a coloured glow). Returns {at(x, y), set(opacity, scale)}.
//   flash(lg, x, y, {color, r})  a soft radial flash (blue = result arriving). Returns {at(x, y), set(a, scale)}.
//   pulse(lg, line, {color, r})  a dot that travels along a light. Returns seek(q): q in (0, 1) shows it at that point.
//   fire(lg, pts, {at, dur, hold, retract, r})   THE red-dot origin: a solid red dot at pts[0] with a ring blooming off it
//                          fires a red line along pts to the target (dur s), flashes red on arrival, holds, then retracts.
//                          Returns {seek(t), arrive (seconds when it lands), end ([x, y])}. Start the next shape at `arrive`.
//   strike(lg, x0, y0, x1, y1, {width})   a red strike line (no echoes). Returns a light.
//   check(lg, cx, cy, s), cross(lg, cx, cy, s)   tick and cross marks as lights (draw with .draw(q)).
//   landColor(k)           the text landing ramp: k 0 orange -> .4 red -> 1 white. Returns 'rgb(...)'.
//   measure(str, size, {font, track, weight}), capH(size, o), fit(lines, width, max, o), wrap(str, size, width, o),
//   flow(str, width, height, max, min, o, leading)   text measuring/fitting; track is in em (0.32 = the theme's title tracking).
//   title(lg, str, x, y, size, {track, anchor, font, weight, land, color, halo})
//                          a line of tracked capitals that LANDS: show(a) with a 0..1: orange -> red -> white, tracking closing
//                          in from wider, glow cooling. land: false keeps a fixed `color` (dim kickers). halo > 0 adds a dark
//                          edge for footage. Returns {node, w, cap, show(a, dim = 1), x0()}.
//   titles(lg, lines, x, cy, size, o, leading)   several centred title lines as one block: {rows, top, bottom, pitch, cap, show(t, at, gap, len)}.
//   mono(lg, x, y, str, {size, color, anchor, track, weight, opacity, halo, leading})   IBM Plex Mono text ('\n' = new line).
//   pool(lg, cx, cy, rx, ry, a)   a soft pool of darkness behind overlay text so it reads on bright footage (no hard box).
//   band(lg, y0, y1, a)          a full-width soft dark band (fades at top and bottom).
//   presence(t, life, fade)      overlay opacity: fades in over `fade` and, given `life` seconds, out before the end.
//   leave(t, life, len)          0 while up, rising to 1 over the last `len` s of `life` (use for retracting lines).
//   faceAt(props, t)             the face box {x, y, w, h} (0..1) at time t: props.locate (footage player), props.track, or props.box.
//   cornerLabels(st, labels)     small dim mono labels in the corners of a title card ([tl, tr, bl, br]); returns seek(t, start).
//   origin(st)                   where a title card's red dot sits ([x, y], top-left ~10% in): fire(st.root, [origin(st), ...]) starts a scene.
//   grainURL()                   the grain tile as a data URL (for 3D/canvas pieces).
// Overlay pattern: x = leave(t, props.life); line.range(ease(x), q) retracts lines from their start; title.show(a, 1 - x) dims text.
import {clamp, span, mix} from '/library/_shared/kit.js';
export {clamp, span, mix};

// ---------------------------------------------------------------- theme
export const C = {
  bg: '#040506', haze: '#1d3436', deep: '#0b1617', core: '#f5f3ff', lilac: '#f0d6f2',
  red: '#ff2e40', blue: '#286eff', orange: '#ff821e', pink: '#ff46aa', violet: '#9646ff', cyan: '#3cdcff',
  dim: '#8a9696', mute: '#56625f', white: '#f5f3ff',
};
export const F = {head: 'Michroma', mono: '"IBM Plex Mono"', wide: 'Syncopate'};
export const FRAME = {width: 1080, height: 1920};
export const SAFE = {left: 70, top: 250, right: 1010, bottom: 1440};
const RGB = {red: [255, 46, 64], blue: [40, 110, 255], orange: [255, 130, 30], core: [245, 243, 255]};
/** Echo offsets (frame px at 1080 wide) and how far each echo trails (+) or leads (-) a draw, as a share of it. */
const ECHO = {red: {dx: -5, dy: -4, lag: .07}, blue: {dx: 5, dy: 4, lag: -.04}};

const toneAlias = {white: 'core', cream: 'core', paper: 'core', bone: 'core', silver: 'core', yellow: 'orange', amber: 'orange', gold: 'orange', coral: 'red', rose: 'red', magenta: 'red', hot: 'red', crimson: 'red', cyan: 'blue', teal: 'blue', sky: 'blue', aqua: 'blue', sea: 'blue', lime: 'blue', green: 'blue', purple: 'violet', lilac: 'lilac', grey: 'dim', gray: 'dim', fog: 'dim'};
/** A colour of this theme for a colour name from any theme; CSS colours pass through. */
export const tone = c => C[c] ?? C[toneAlias[c]] ?? (/^(#|rgb|hsl)/.test(c ?? '') ? c : C.red);
export const up = s => String(s ?? '').toUpperCase();
export const oneLine = s => String(s ?? '').replace(/\s*\n\s*/g, ' ');
export const pad = (n, width = 2) => String(Math.floor(n)).padStart(width, '0');
export const comma = n => Math.round(n).toLocaleString('en-US');
export const typed = (value, q) => String(value ?? '').slice(0, Math.round(String(value ?? '').length * clamp(q)));

/** Title-card backdrops: bg, the haze colour pooled round the light source, and its strength. */
export const fields = {
  teal: {bg: '#040506', haze: '#1d3436', a: .6},
  black: {bg: '#030304', haze: '#14201f', a: .35},
  deep: {bg: '#03050a', haze: '#152440', a: .55},
  ember: {bg: '#060404', haze: '#3a1418', a: .45},
  violet: {bg: '#050409', haze: '#2a1a40', a: .5},
};
const fieldAlias = {slate: 'teal', dark: 'teal', lime: 'teal', sea: 'teal', void: 'black', white: 'teal', paper: 'teal', cold: 'deep', blue: 'deep', sky: 'deep', dusk: 'deep', blood: 'ember', red: 'ember', sunset: 'ember', magenta: 'violet', candy: 'violet', mist: 'teal', gold: 'ember'};
export const fieldOf = name => fields[name] ?? fields[fieldAlias[name]] ?? fields.teal;

// ---------------------------------------------------------------- numbers and easing
export const ease = x => 1 - Math.pow(1 - clamp(x), 4);
export const io = x => { x = clamp(x); return x < .5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2; };
export const easeIn = x => Math.pow(clamp(x), 3);
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
export const noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };

// ---------------------------------------------------------------- geometry on point arrays
export const poly = pts => pts.length ? 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') : '';
export function bez(p0, p1, p2, p3, n = 48) {
  const o = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]); } return o;
}
const R = Math.PI / 180;
export function arcPts(cx, cy, r, a0, a1, n = null) { n ??= Math.max(8, Math.ceil(Math.abs(a1 - a0) / 3)); const o = []; for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * R; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return o; }
export const lengthOf = pts => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
/** The point a share q of the way along a polyline. */
export function along(pts, q) {
  if (pts.length < 2) return pts[0] ?? [0, 0];
  let rem = lengthOf(pts) * clamp(q);
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (rem <= d) { const f = d ? rem / d : 0; return [mix(pts[i - 1][0], pts[i][0], f), mix(pts[i - 1][1], pts[i][1], f)]; } rem -= d; }
  return pts.at(-1);
}
/** The part of a polyline between shares a and b of its length. */
export function sub(pts, a, b) {
  a = clamp(a); b = clamp(b); if (b <= a || pts.length < 2) return [];
  const L = lengthOf(pts), A = a * L, B = b * L, out = []; let run = 0;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i], d = Math.hypot(q[0] - p[0], q[1] - p[1]), s0 = run, s1 = run + d; run = s1;
    if (s1 < A || d === 0) continue; if (s0 > B) break;
    const lerp = s => { const f = (s - s0) / d; return [mix(p[0], q[0], f), mix(p[1], q[1], f)]; };
    if (!out.length) out.push(s0 >= A ? p : lerp(A));
    out.push(s1 <= B ? q : lerp(B));
    if (s1 >= B) break;
  }
  return out;
}

// ---------------------------------------------------------------- textures
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
let grainCache = null;
export const grainURL = () => grainCache ??= (() => { const c = document.createElement('canvas'), s = 256; c.width = c.height = s; const x = c.getContext('2d'), r = mulberry(4242), d = x.createImageData(s, s); for (let i = 0; i < s * s; i++) { const v = r() < .5 ? 0 : 200; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = r() * r() * 70; } x.putImageData(d, 0, 0); return c.toDataURL('image/png'); })();

// ---------------------------------------------------------------- stage and render layers
const LAYERS = ['shade', 'halo', 'red', 'blue', 'core', 'text', 'top'];
let stages = 0;
export function stage(el, {mode = 'tall', field = 'teal', clear = false, source = null, grain = true, shade = null} = {}) {
  const d3 = window.d3, id = `ll${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const [W, H] = overlay ? [1080, 1920] : mode === 'card' ? [1000, 1000] : [1080, Math.round(clamp(1080 * ch / cw, 1080, 1920))], f = fieldOf(field), bare = overlay || clear;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden').style('isolation', 'isolate');
  el.style.background = bare ? 'transparent' : f.bg;
  const defs = svg.append('defs'), url = name => `url(#${id}-${name})`;
  const filter = (name, std, merge = true, pad = '-30%') => { const fl = defs.append('filter').attr('id', `${id}-${name}`).attr('x', pad).attr('y', pad).attr('width', '160%').attr('height', '160%').attr('filterUnits', 'objectBoundingBox'); fl.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', std).attr('result', 'b'); if (merge) { const m = fl.append('feMerge'); m.append('feMergeNode').attr('in', 'b'); m.append('feMergeNode').attr('in', 'SourceGraphic'); } };
  filter('halo', 9, false); filter('soft', 1.4); filter('core', 2.2); filter('glow', 7, false); filter('dot', 6);
  // Big layer filters need user-space regions (a bounding box of one hairline is too small to blur into).
  defs.selectAll('filter').filter(function () { return /-(halo|soft|core)$/.test(this.id); }).attr('filterUnits', 'userSpaceOnUse').attr('x', -200).attr('y', -200).attr('width', W + 400).attr('height', H + 400);
  const grad = (name, stops, attrs = {}) => { const g = defs.append('radialGradient').attr('id', `${id}-${name}`); for (const [k, v] of Object.entries(attrs)) g.attr(k, v); stops.forEach(([o, c, a]) => g.append('stop').attr('offset', o).attr('stop-color', c).attr('stop-opacity', a)); };
  grad('haze', [[0, f.haze, 1], [.5, f.haze, .45], [1, f.haze, 0]]);
  grad('vig', [[0, '#040506', 0], [.6, '#040506', .15], [1, '#040506', .85]], {r: '75%'});
  // The dark pool / band behind overlay text. A plateau of black reads as a grey smudge on bright footage, so the pool
  // falls off smoothly and is at 30% by default: props.shade 0 = none (footage under the night look already
  // reads), 1 = the full v1 strength (bright, ungraded footage).
  const sk = clamp(shade ?? 1, 0, 1.25);   // plate strength behind overlay text (see plate())
  grad('pool', [[0, '#020304', .8 * sk], [.3, '#020304', .62 * sk], [.6, '#020304', .3 * sk], [.85, '#020304', .08 * sk], [1, '#020304', 0]]);
  for (const c of ['red', 'blue', 'orange', 'core', 'violet']) grad('flash-' + c, [[0, C[c], .75], [.35, C[c], .3], [1, C[c], 0]]);
  const lin = defs.append('linearGradient').attr('id', `${id}-band`).attr('x1', 0).attr('y1', 0).attr('x2', 0).attr('y2', 1);
  [[0, 0], [.3, .7 * sk], [.7, .7 * sk], [1, 0]].forEach(([o, a]) => lin.append('stop').attr('offset', o).attr('stop-color', '#000').attr('stop-opacity', a));
  defs.append('pattern').attr('id', `${id}-grain`).attr('width', 256).attr('height', 256).attr('patternUnits', 'userSpaceOnUse').append('image').attr('href', grainURL()).attr('width', 256).attr('height', 256);

  const back = svg.append('g'), layerRoot = {}, k = H / 1920, sc = W / 1080;
  for (const name of LAYERS) {
    const g = svg.append('g').attr('class', 'll-' + name);
    if (name !== 'shade' && name !== 'text') g.style('mix-blend-mode', 'screen');
    if (name === 'halo') g.attr('filter', url('halo')).attr('opacity', .55);
    if (name === 'red' || name === 'blue') g.attr('filter', url('soft')).attr('opacity', .92).attr('transform', `translate(${ECHO[name].dx * sc} ${ECHO[name].dy * sc})`);
    if (name === 'core') g.attr('filter', url('core'));
    layerRoot[name] = g;
  }
  const front = svg.append('g');
  const st = {svg, defs, back, front, id, W, H, k, sc, sq: H < 1500, mode, field: f, n: 0, url, fill: url, shade: sk, tick: () => {}};
  st.root = makeGroup(st, layerRoot);
  if (bare) return st;
  const [sx, sy] = source ? [source[0] * W, source[1] * H] : [W / 2, H * .42];
  back.append('rect').attr('width', W).attr('height', H).attr('fill', f.bg);
  const haze = back.append('ellipse').attr('cx', sx).attr('cy', sy).attr('rx', W * 1.05).attr('ry', H * .55).attr('fill', url('haze')).attr('opacity', f.a);
  front.append('rect').attr('width', W).attr('height', H).attr('fill', url('vig'));
  const gr = grain ? front.append('rect').attr('x', -256).attr('y', -256).attr('width', W + 512).attr('height', H + 512).attr('fill', url('grain')).attr('opacity', .55) : null;
  st.tick = t => {
    haze.attr('opacity', f.a * (.88 + .12 * noise(t * .5, 3)));
    if (gr) { const s = Math.floor(t * 12); gr.attr('transform', `translate(${Math.round(hash(s, 1) * 256)} ${Math.round(hash(s, 2) * 256)})`); }
  };
  return st;
}
function makeGroup(st, parents) {
  const g = {}; for (const name of LAYERS) g[name] = parents[name].append('g');
  const lg = {st, ...g, attr(key, value) { for (const name of LAYERS) g[name].attr(key, value); return lg; }, group: () => makeGroup(st, g)};
  return lg;
}
/** A new light group (one <g> per render layer) inside `parent` (a light group or a stage). */
export const group = parent => (parent.root ?? parent).group();
const layersOf = lg => lg.root ?? lg;

// ---------------------------------------------------------------- the light line
export function light(lg, shape, {width = 3, color = 'core', echo = true, halo = true, opacity = 1, dash = null} = {}) {
  lg = layersOf(lg);
  const col = tone(color), plain = color !== 'core' && color !== 'white', parts = [];
  const add = (layer, stroke, w, lag) => { const p = lg[layer].append('path').attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', w).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round'); if (dash) p.attr('stroke-dasharray', dash); parts.push({p, lag}); return p; };
  if (halo) add('halo', plain ? col : C.lilac, width * 2.6, 0);
  if (echo) { add('red', C.red, width * .85, ECHO.red.lag); add('blue', C.blue, width * .85, ECHO.blue.lag); }
  add('core', col, width, 0);
  const isPts = Array.isArray(shape);
  let pts = isPts ? shape : null, d = isPts ? poly(shape) : shape, len = null, state = [0, 1], op = opacity;
  const total = () => len ??= isPts ? lengthOf(pts) : (parts.at(-1).p.node().getTotalLength?.() || 0);
  const lagged = (q, lag) => lag > 0 ? clamp(q * (1 + lag) - lag) : clamp(q * (1 - lag));
  const render = () => {
    const [a, b] = state;
    for (const {p, lag} of parts) {
      const qa = a <= 0 ? 0 : lagged(a, lag), qb = b >= 1 ? 1 : lagged(b, lag);
      if (qb - qa <= 1e-4) { p.attr('d', null).attr('opacity', 0); continue; }
      p.attr('opacity', op);
      if (isPts) { p.attr('d', qa <= 0 && qb >= 1 ? d : poly(sub(pts, qa, qb))); continue; }
      p.attr('d', d);
      if (qa <= 0 && qb >= 1) p.attr('stroke-dasharray', null).attr('stroke-dashoffset', null);
      else { const L = total() + 2; p.attr('stroke-dasharray', `0 ${qa * L} ${(qb - qa) * L} ${L * 2}`).attr('stroke-dashoffset', 0); }
    }
  };
  const self = {
    parts, get len() { return total(); },
    draw(q) { state = [0, q]; render(); return self; },
    range(a, b) { state = [a, b]; render(); return self; },
    set(next) { if (Array.isArray(next)) { pts = next; d = poly(next); } else d = next; len = null; render(); return self; },
    opacity(o) { op = o; render(); return self; },
    at(q) { if (isPts) return along(pts, q); const n = parts.at(-1).p.node(), L = total(), P = n.getPointAtLength(clamp(q) * L); return [P.x, P.y]; },
  };
  render();
  return self;
}
const both = list => ({halves: list, draw(q) { list.forEach(l => l.draw(q)); return this; }, range(a, b) { list.forEach(l => l.range(a, b)); return this; }, opacity(o) { list.forEach(l => l.opacity(o)); return this; }});
export function ring(lg, cx, cy, r, {from = -90, ...o} = {}) {
  return both([light(lg, arcPts(cx, cy, r, from, from + 180), o), light(lg, arcPts(cx, cy, r, from, from - 180), o)]);
}
export function openBox(lg, x, y, w, h, {from = 'left', ...o} = {}) {
  const corners = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  let p = from === 'left' ? [x, y + h / 2] : from === 'right' ? [x + w, y + h / 2] : from === 'top' ? [x + w / 2, y] : from === 'bottom' ? [x + w / 2, y + h] : from;
  // Walk the perimeter both ways from the touch point until the halves meet at the opposite point.
  const per = [...corners, corners[0]], P = 2 * (w + h), pos = pt => { let s = 0; for (let i = 0; i < 4; i++) { const a = per[i], b = per[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]), e = Math.hypot(pt[0] - a[0], pt[1] - a[1]) + Math.hypot(b[0] - pt[0], b[1] - pt[1]); if (Math.abs(e - d) < 1) return s + Math.hypot(pt[0] - a[0], pt[1] - a[1]); s += d; } return 0; };
  const at = s => { s = ((s % P) + P) % P; for (let i = 0; i < 4; i++) { const a = per[i], b = per[i + 1], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (s <= d) return [mix(a[0], b[0], s / d), mix(a[1], b[1], s / d)]; s -= d; } return per[0]; };
  const s0 = pos(p), path = dir => { const out = [p], cs = [0, w, w + h, 2 * w + h].map(c => ((c - s0) * dir % P + P) % P).filter(c => c > 0 && c < P / 2).sort((a, b) => a - b); cs.forEach(c => out.push(at(s0 + dir * c))); out.push(at(s0 + dir * P / 2)); return out; };
  return both([light(lg, path(1), o), light(lg, path(-1), o)]);
}
export function rays(lg, cx, cy, r0, r1, n, a0 = 0, a1 = 360, {width = 2, fade = .5, ...o} = {}) {
  const full = Math.abs(a1 - a0) >= 360;
  return Array.from({length: n}, (_, i) => {
    const kk = full ? i / n : (n === 1 ? .5 : i / (n - 1)), a = (a0 + (a1 - a0) * kk) * R, mid = 1 - Math.abs(kk - .5) * 2, len = r1 * (1 - fade * (1 - mid) * .5);
    const l = light(lg, [[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * len, cy + Math.sin(a) * len]], {width, ...o});
    l.k = kk; l.mid = mid; l.opacity(.45 + .55 * mid); return l;
  });
}
export function dot(lg, x, y, {color = 'red', r = 9} = {}) {
  lg = layersOf(lg); const g = lg.top.append('g'), col = tone(color);
  const glow = g.append('circle').attr('r', r * 1.1).attr('fill', col).attr('filter', lg.st.url('dot'));
  g.append('circle').attr('r', r * .42).attr('fill', '#fff').attr('opacity', .92);
  const self = {g, at(nx, ny) { x = nx; y = ny; return self; }, set(o = 1, s = 1) { g.attr('transform', `translate(${x} ${y}) scale(${s})`).attr('opacity', o); return self; }};
  return self.set(0);
}
export function flash(lg, x, y, {color = 'blue', r = 140} = {}) {
  lg = layersOf(lg); const name = ['red', 'blue', 'orange', 'violet'].includes(color) ? color : color === 'cyan' ? 'blue' : 'core';
  const c = lg.top.append('circle').attr('r', r).attr('fill', lg.st.url('flash-' + name)).attr('opacity', 0);
  const self = {c, at(nx, ny) { x = nx; y = ny; return self; }, set(a = 1, s = 1) { c.attr('cx', x).attr('cy', y).attr('r', r * s).attr('opacity', clamp(a)); return self; }};
  return self.set(0);
}
export function pulse(lg, line, {color = 'red', r = 8} = {}) {
  const d = dot(lg, 0, 0, {color, r});
  return q => { if (q <= 0 || q >= 1) return d.set(0); const [x, y] = line.at(q); d.at(x, y).set(1); };
}
export function strike(lg, x0, y0, x1, y1, {width = 5} = {}) { return light(lg, [[x0, y0], [x1, y1]], {width, color: 'red', echo: false}); }
export const check = (lg, cx, cy, s, o = {}) => light(lg, [[cx - s * .5, cy], [cx - s * .14, cy + s * .36], [cx + s * .55, cy - s * .42]], {width: 4, ...o});
export const cross = (lg, cx, cy, s, o = {}) => both([light(lg, [[cx - s * .42, cy - s * .42], [cx + s * .42, cy + s * .42]], {width: 4, ...o}), light(lg, [[cx + s * .42, cy - s * .42], [cx - s * .42, cy + s * .42]], {width: 4, ...o})]);

/** The red-dot origin: a red dot fires a red line along pts; flash on arrival; hold; the tail retracts. */
export function fire(lg, pts, {at = 0, dur = .9, hold = 1.2, retract = .8, r = 15, keep = true} = {}) {
  lg = layersOf(lg);
  const line = light(lg, pts, {width: 2.6, color: 'red', echo: false}), head = dot(lg, 0, 0, {color: 'red', r: 8}), end = pts.at(-1);
  const bloom = lg.top.append('circle').attr('cx', pts[0][0]).attr('cy', pts[0][1]).attr('fill', 'none').attr('stroke', C.red).attr('stroke-width', 2.4);
  const fl = flash(lg, end[0], end[1], {color: 'red', r: 110});
  const solid = lg.text.append('circle').attr('cx', pts[0][0]).attr('cy', pts[0][1]).attr('r', r).attr('fill', C.red);
  const halo = lg.top.append('circle').attr('cx', pts[0][0]).attr('cy', pts[0][1]).attr('r', r * 1.6).attr('fill', C.red).attr('filter', lg.st.url('dot')).attr('opacity', .5);
  const pin = lg.top.append('circle').attr('cx', end[0]).attr('cy', end[1]).attr('r', 5).attr('fill', C.red);
  return {
    arrive: at + dur, end, line,
    seek(t) {
      const u = t - at, hq = ease(u / dur), tail = ease((u - dur - hold) / retract);
      solid.attr('opacity', u < 0 ? 0 : keep ? 1 : 1 - tail); halo.attr('opacity', u < 0 ? 0 : .45 * (keep ? 1 : 1 - tail));
      const b = ease(u / .7); bloom.attr('r', (r * .4 + b * r * 1.5)).attr('opacity', u < 0 ? 0 : 1 - b);
      line.range(tail, hq);
      if (hq > 0 && hq < 1) { const [x, y] = along(pts, hq); head.at(x, y).set(1); } else head.set(0);
      fl.set(u > dur ? Math.max(0, 1 - (u - dur) / .7) : 0);
      pin.attr('opacity', u > dur + .5 && tail < 1 ? .9 * (1 - tail) : 0);
    },
  };
}

// ---------------------------------------------------------------- text
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const fontCss = (size, {font = F.head, weight = 400} = {}) => `${weight} ${size}px ${font}`;
/** Width of a line of text with tracking (em), not counting the space after the last letter. */
export function measure(str, size, o = {}) { str = String(str ?? ''); ctx.font = fontCss(100, o); return (ctx.measureText(str).width + (o.track ?? .32) * 100 * Math.max(0, [...str].length - 1)) * size / 100; }
export function capH(size, o = {}) { const key = fontCss(100, o); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 72; } return caps[key] * size / 100; }
export const fit = (lines, width, max, o = {}) => Math.min(max, ...[].concat(lines).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
export function wrap(str, size, width, o = {}) {
  const lines = []; let line = '';
  for (const word of String(str ?? '').split(/\s+/).filter(Boolean)) { const next = line ? line + ' ' + word : word; if (line && measure(next, size, o) > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
export function flow(str, width, height, max, min = 24, o = {}, leading = 1.9) {
  for (let size = max; ; size -= 2) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/** The landing ramp: k 0 saturated orange -> .4 red -> 1 cool white. */
export function landColor(k) {
  k = clamp(k); let c;
  if (k < .4) { const u = k / .4; c = [255, 95 - 75 * u, 30 * u]; } else { const u = (k - .4) / .6; c = [255 - 10 * u, 20 + 223 * u, 30 + 225 * u]; }
  return `rgb(${c.map(v => Math.round(v)).join(',')})`;
}
export function title(lg, str, x, y, size, {track = .32, anchor = 'middle', font = F.head, weight = 400, land = true, color = C.core, halo = 0} = {}) {
  lg = layersOf(lg); str = String(str ?? '');
  const o = {font, weight, track: 0}, bare = measure(str, size, o), n = Math.max(0, [...str].length - 1), cap = capH(size, {font, weight});
  const mk = layer => { const t = layer.append('text').attr('y', y).style('font', fontCss(size, {font, weight})).text(str); return t; };
  const glow = mk(lg.text).attr('filter', lg.st.url('glow')), node = mk(lg.text);
  if (halo) node.attr('stroke', '#000').attr('stroke-opacity', .5).attr('stroke-width', halo).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
  const width = tr => bare + tr * size * n;
  const x0 = tr => anchor === 'middle' ? x - width(tr) / 2 : anchor === 'end' ? x - width(tr) : x;
  const self = {node, glow, cap, w: width(track), x0: () => x0(track), str,
    show(a = 1, dim = 1) {
      a = clamp(a); const tr = track + (1 - a) * track * .8, k = land ? clamp((a - .55) / .45) : 1, al = Math.min(1, a * 6) * dim, col = land ? landColor(k) : color;
      for (const t of [glow, node]) t.attr('x', x0(tr)).style('letter-spacing', `${tr * size}px`).attr('fill', col);
      node.attr('opacity', a <= 0 ? 0 : al); glow.attr('opacity', a <= 0 ? 0 : al * (land ? .35 + .55 * (1 - k) : .3));
      return self;
    }};
  return self.show(0);
}
export function titles(lg, lines, x, cy, size, o = {}, leading = 1.7) {
  const cap = capH(size, o), pitch = cap * leading, top = cy - ((lines.length - 1) * pitch + cap) / 2;
  const rows = lines.map((l, i) => title(lg, l, x, top + cap + i * pitch, size, o));
  return {rows, top, bottom: top + (lines.length - 1) * pitch + cap, pitch, cap, show: (t, at = 0, gap = .25, len = .9, dim = 1) => rows.forEach((r, i) => r.show(span(t, at + i * gap, len), dim))};
}
export function mono(lg, x, y, str, {size = 26, color = C.core, anchor = 'start', track = .08, weight = 300, opacity = .9, halo = 0, leading = 1.5} = {}) {
  lg = layersOf(lg);
  const node = lg.text.append('text').attr('x', x).attr('y', y).attr('fill', tone(color)).attr('text-anchor', anchor).attr('opacity', opacity).style('font', fontCss(size, {font: F.mono, weight})).style('letter-spacing', `${track}em`);
  if (halo) node.attr('stroke', '#000').attr('stroke-opacity', .55).attr('stroke-width', halo).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}

// ---------------------------------------------------------------- footage helpers
// The plate behind overlay text: a rounded near-black teal panel with a faint light rim, so thin light text reads on
// any footage (a soft grey pool read as a smudge on bright rooms). Strength = stage shade (default 1; 0 = no plate,
// e.g. under the night look). pool() keeps its old signature: (cx, cy) centre, (rx, ry) the old pool radii.
const plate = (lg, x, y, w, h, a) => {
  const L = layersOf(lg), sk = L.st.shade, g = L.shade.append('g').attr('opacity', a);
  if (sk <= 0) return g;
  g.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', Math.min(26, h / 4))
    .attr('fill', C.plate ?? '#061214').attr('fill-opacity', Math.min(.9, .8 * sk))
    .attr('stroke', '#cfe3ff').attr('stroke-opacity', .2 * Math.min(1, sk)).attr('stroke-width', 1.5);
  return g;
};
export const pool = (lg, cx, cy, rx, ry, a = 1) => plate(lg, cx - rx * .7, cy - ry * .6, rx * 1.4, ry * 1.2, a);
export const band = (lg, y0, y1, a = 1) => plate(lg, 40, y0, layersOf(lg).st.W - 80, y1 - y0, a);
export const presence = (t, life, fade = .3) => clamp(t / fade) * (life ? 1 - span(t, life - fade, fade) : 1);
export const leave = (t, life, len = .6) => life ? span(t, life - len, len) : 0;
export function faceAt(props, t) {
  if (props.locate) return props.locate(t + (props.at ?? 0));
  const track = props.track; if (!track?.length) return props.box ?? {x: .3, y: .3, w: .4, h: .22};
  let i = track.findIndex(s => s[0] > t); if (i < 0) i = track.length - 1;
  const a = track[Math.max(0, i - 1)], b = track[i], q = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0])) : 0;
  return {x: mix(a[1], b[1], q), y: mix(a[2], b[2], q), w: mix(a[3], b[3], q), h: mix(a[4], b[4], q)};
}
/** Small dim mono labels in the corners of a title card (top-left sits right of the red dot). */
export function cornerLabels(st, labels = [], {size = null, inset = 70} = {}) {
  const {W, H} = st, s = size ?? 20 + 6 * st.k, top = Math.max(inset + 10, H * .1 - s * .2);
  const nodes = (labels || []).slice(0, 4).map((l, i) => l ? mono(st.root, i % 2 ? W - inset : (i > 1 ? inset : inset + 60), i > 1 ? H - inset : top + s * .4, up(l), {size: s, color: C.dim, anchor: i % 2 ? 'end' : 'start', track: .22, opacity: 0, weight: 300}) : null);
  return (t, start = 1) => nodes.forEach((n, i) => n?.attr('opacity', .75 * ease(span(t, start + i * .15, .8))));
}
/** Where the scene's red dot sits on a title card (top-left, ~10% in), and a standard fire path from it to a point. */
export const origin = st => [Math.max(70, st.W * .1), Math.max(80, st.H * .1)];
