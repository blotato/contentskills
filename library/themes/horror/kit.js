// Horror theme drawing kit. Every piece in this theme draws with these colours, fonts, textures
// and motion helpers, which is what keeps title cards, overlays, diagrams and captions one style.
//
// THE STYLE (studied from the user's reference: a minimal horror title sequence / trailer theme)
//   Palette   Almost no colour. Near-black blue-grey slate (#0d1115) lifting to a faint grey glow
//             in the middle, pure black for end cards, a cold night blue for exteriors. Lettering
//             is bone white. ONE accent: a muted rose-red (#e0556b), used on a single letter or a
//             single word per line, never as a fill for big areas.
//   Light     Very dark. Light is scarce and unstable: a lamp that dips and cuts out for a frame
//             or two, a heavy vignette, slow fog. Footage is desaturated and cold (teal-grey).
//   Texture   Fine grain everywhere, an occasional thin vertical film scratch, dust specks, worn
//             (chipped) lettering on stamps and labels, aged paper for case files, tape noise.
//   Type      Tall condensed sans capitals (Bebas Neue), SMALL in the frame and widely tracked,
//             centred, with a smaller tracked line above. Lots of empty dark around it. Case-file
//             material is typewriter (Special Elite / Courier Prime); camcorder readouts are VT323.
//   Motion    Letters do not slide or bounce. They switch on one at a time in random order, each
//             stuttering for a few frames; the accent letter sits knocked out of the baseline
//             and drops into place late. Lines leave as vertical streaks (letters smear up and
//             down and thin out) or simply cut to black. Everything holds almost still: a slow
//             creep-in of a few percent, a 12 fps grain, sudden flicker dips. Nothing eases
//             playfully; things are either creeping or cutting.
//   Restraint Mood comes from darkness, texture, type and motion. No gore, no injury.
//
// Everything here is a pure function of its inputs: pieces set every animated value from t.
import {clamp, span, mix, easeOut, easeInOut} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut};

// ---------------------------------------------------------------- theme
export const C = {
  void: '#030405', slate: '#0d1115', ash: '#171c21', steel: '#2b343b', fog: '#8d979f', bone: '#e9e6df',
  rose: '#e0556b', blood: '#9c1c30', dried: '#4a121c', cold: '#7c8cc4', night: '#0a0e1a', sick: '#7f8f80',
  paper: '#b9b09a', paperDark: '#8f8672', ink: '#16130f',
};
export const series = [C.bone, C.rose, C.fog, C.cold, C.sick, C.blood];
export const F = {head: '"Bebas Neue"', sub: '"Barlow Condensed"', type: '"Special Elite"', mono: '"Courier Prime"', vhs: 'VT323', hand: '"Homemade Apple"'};
export const FRAME = {width: 1080, height: 1920};
/** Backdrops. bg is the darkest tone, lift the faint glow in the middle, fog the mist colour. */
export const fields = {
  slate: {bg: '#0a0d10', lift: '#1c2329', fog: '#93a0aa', mist: .07},
  void: {bg: '#020203', lift: '#0a0c0e', fog: '#6f7880', mist: .03},
  cold: {bg: '#070a14', lift: '#1b2444', fog: '#8090cc', mist: .1},
  blood: {bg: '#0a0405', lift: '#2a0b12', fog: '#b0606c', mist: .06},
  mist: {bg: '#12171a', lift: '#39434a', fog: '#b9c4cb', mist: .16},
};
/** Field and colour names other themes use, so a storyboard can switch themes without editing props. */
const fieldAlias = {blue: 'cold', black: 'void', red: 'blood', white: 'mist', lime: 'slate', magenta: 'blood', violet: 'cold', sky: 'cold', sunset: 'blood', dusk: 'cold', candy: 'blood', sea: 'cold', gold: 'slate', paper: 'mist'};
export const fieldOf = name => fields[name] ?? fields[fieldAlias[name]] ?? fields.slate;
const toneAlias = {pink: 'rose', red: 'rose', magenta: 'rose', hot: 'rose', coral: 'rose', orange: 'rose', amber: 'rose', yellow: 'bone', white: 'bone', paper: 'bone', lime: 'bone', gold: 'bone', cyan: 'cold', blue: 'cold', violet: 'cold', teal: 'cold', aqua: 'cold', sea: 'cold', dusk: 'cold', candy: 'rose', black: 'void', night: 'void'};
/** A colour of this theme for a colour name from any theme ('pink' -> rose); CSS colours pass through. */
export const tone = c => C[c] ?? C[toneAlias[c]] ?? (/^(#|rgb|hsl)/.test(c ?? '') ? c : C.rose);
export const up = s => String(s ?? '').toUpperCase();
export const oneLine = s => String(s ?? '').replace(/\s*\n\s*/g, ' ');

// ---------------------------------------------------------------- numbers
/** Seeded pseudo-random 0..1. Pieces may not use Math.random; hash(i, seed) is the stand-in. */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A smoothly wandering value 0..1 over time. */
export const noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
export const easeIn = x => { x = clamp(x); return x * x * x; };
export const pad = (n, width = 2) => String(Math.floor(n)).padStart(width, '0');
export const comma = n => Math.round(n).toLocaleString('en-US');
/** Running timecode HH:MM:SS:FF. */
export const timecode = (t, base = 0) => { const s = base + t; return `${pad(s / 3600)}:${pad(s / 60 % 60)}:${pad(s % 60)}:${pad((s % 1) * 30)}`; };
export const blink = (t, hz = 1) => Math.floor(t * hz * 2) % 2 ? 0 : 1;
/** Text that types itself. */
export const typed = (value, q) => value.slice(0, Math.round(value.length * clamp(q)));
/** The frame counter the textures step on: grain and damage change 12 times a second, not every frame. */
export const step = (t, fps = 12) => Math.floor(t * fps + 1e-6);

// ---------------------------------------------------------------- motion
/** Switching on like a bad tube: off, a few stuttering frames, then on. Returns an opacity. */
export const flickerOn = (t, start, length = .3, seed = 0) => { const q = (t - start) / length; return q <= 0 ? 0 : q >= 1 ? 1 : hash(Math.floor(q * 9), seed + 5) < .42 ? .12 : 1; };
/** The unstable light of the theme: 1 most of the time, with sudden short dips. `depth` 0..1 is how dark a dip gets. */
export function lamp(t, seed = 0, depth = .6, rate = 1.1) {
  const k = Math.floor(t * rate), r = hash(k, seed + 31), at = (t * rate - k);
  let v = 1 - .04 * noise(t * 9, seed);
  if (r < .42) { const a = hash(k, seed + 7) * .7, len = .05 + hash(k, seed + 9) * .16; if (at > a && at < a + len) v *= 1 - depth * (hash(Math.floor(t * 24), seed) < .7 ? 1 : .4); }
  return v;
}
/** Overall opacity of an overlay: stutters on at the start and, given a `life` in seconds, cuts out just before the end. */
export const presence = (t, life, seed = 0) => flickerOn(t, 0, .3, seed) * (life ? 1 - flickerOn(t, life - .22, .2, seed + 3) : 1);
/** 0 while an overlay is up, rising to 1 over its last `len` seconds when the storyboard gives it a `life`. */
export const leave = (t, life, len = .4) => life ? span(t, life - len, len) : 0;
/** A hand-held 12 fps tremble, in pixels. */
export const jitter = (t, amp = 1.5, seed = 0) => { const f = step(t); return [(hash(f, seed) - .5) * 2 * amp, (hash(f, seed + 1) - .5) * 2 * amp]; };

// ---------------------------------------------------------------- textures (drawn once per page into canvases)
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const cache = {};
const texture = (name, size, draw) => cache[name] ??= (() => { const c = document.createElement('canvas'); c.width = c.height = size; draw(c.getContext('2d'), size, mulberry(size + name.length * 977)); return c.toDataURL('image/png'); })();
/** Fine black-and-white grain with soft alpha. */
const grainTexture = () => texture('grain', 256, (x, s, r) => { const d = x.createImageData(s, s); for (let i = 0; i < s * s; i++) { const v = r() < .5 ? 0 : 235; d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = r() * r() * 150; } x.putImageData(d, 0, 0); });
/** A wear mask: white with black chips, pits and thin scratches. White shows, black removes. */
const wearTexture = () => texture('wear', 512, (x, s, r) => {
  x.fillStyle = '#fff'; x.fillRect(0, 0, s, s); x.fillStyle = x.strokeStyle = '#000';
  for (let i = 0; i < 520; i++) { x.globalAlpha = .5 + r() * .5; x.beginPath(); x.arc(r() * s, r() * s, r() * r() * 3.4 + .4, 0, 7); x.fill(); }
  for (let i = 0; i < 26; i++) { x.globalAlpha = .28 + r() * .3; x.beginPath(); x.ellipse(r() * s, r() * s, 6 + r() * 20, 3 + r() * 9, r() * 3, 0, 7); x.fill(); }
  for (let i = 0; i < 70; i++) { x.globalAlpha = .5 + r() * .5; x.lineWidth = .6 + r() * 1.6; const px = r() * s, py = r() * s, a = (r() - .5) * .9 + (r() < .7 ? 1.57 : 0), l = 14 + r() * 110; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
});
/** Tape / dead-channel noise: short horizontal dashes. */
const staticTexture = () => texture('static', 256, (x, s, r) => { for (let y = 0; y < s; y += 2) for (let px = 0; px < s;) { const w = 1 + r() * r() * 14, v = r(); x.fillStyle = `rgba(${v < .5 ? '0,0,0' : '225,228,232'},${(.25 + r() * .75).toFixed(2)})`; x.fillRect(px, y, w, 2); px += w; } });

// ---------------------------------------------------------------- stage
let stages = 0;
/**
 * An SVG stage.
 *   mode 'overlay' -> transparent 1080x1920, to sit on footage (positions in frame pixels)
 *   mode 'card'    -> 1000x1000 diagram card on the dark backdrop (clear: true keeps it transparent)
 *   mode 'tall'    -> a full-frame title card: 1080 wide and as tall as its element (1080..1920)
 * Draw into `root`. Call `tick(t)` from seek: it runs the backdrop (grain, fog drift, scratches,
 * dust, lamp dips) and, on tall cards, the slow creep-in.
 */
export function stage(el, {mode = 'tall', field = 'slate', clear = false, creep = .028, damage = 1} = {}) {
  const d3 = window.d3, id = `hr${++stages}`, overlay = mode === 'overlay', cw = el.clientWidth || 1080, ch = el.clientHeight || 1920;
  const [W, H] = overlay ? [1080, 1920] : mode === 'card' ? [1000, 1000] : [1080, Math.round(clamp(1080 * ch / cw, 1080, 1920))], ink = fieldOf(field);
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${W} ${H}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'hidden');
  const defs = svg.append('defs'), bare = overlay || clear;
  el.style.background = bare ? 'transparent' : ink.bg;
  const grad = (name, stops, attrs = {}) => { const g = defs.append('radialGradient').attr('id', `${id}-${name}`); for (const [k, v] of Object.entries(attrs)) g.attr(k, v); stops.forEach(([o, c, a]) => g.append('stop').attr('offset', o).attr('stop-color', c).attr('stop-opacity', a)); };
  grad('lift', [[0, ink.lift, 1], [1, ink.lift, 0]]); grad('fog', [[0, ink.fog, 1], [.6, ink.fog, .35], [1, ink.fog, 0]]);
  grad('vig', [[0, '#000', 0], [.55, '#000', .1], [.82, '#000', .62], [1, '#000', .94]], {r: '72%'});
  grad('pool', [[0, '#000', .66], [.35, '#000', .5], [.65, '#000', .22], [.85, '#000', .06], [1, '#000', 0]]);
  const pat = (name, url, size) => defs.append('pattern').attr('id', `${id}-${name}`).attr('width', size).attr('height', size).attr('patternUnits', 'userSpaceOnUse').call(p => p.append('image').attr('href', url).attr('width', size).attr('height', size));
  const grainP = pat('grain', grainTexture(), 256); pat('wearp', wearTexture(), 512); const staticP = pat('static', staticTexture(), 256);
  defs.append('mask').attr('id', `${id}-wear`).attr('maskUnits', 'userSpaceOnUse').attr('x', -3000).attr('y', -3000).attr('width', 7000).attr('height', 7000).append('rect').attr('x', -3000).attr('y', -3000).attr('width', 7000).attr('height', 7000).attr('fill', `url(#${id}-wearp)`);
  defs.append('filter').attr('id', `${id}-soft`).attr('x', '-40%').attr('y', '-40%').attr('width', '180%').attr('height', '180%').append('feGaussianBlur').attr('stdDeviation', 14);
  defs.append('filter').attr('id', `${id}-haze`).attr('x', '-60%').attr('y', '-60%').attr('width', '220%').attr('height', '220%').append('feGaussianBlur').attr('stdDeviation', 38);
  const back = svg.append('g'), creepG = svg.append('g'), root = creepG.append('g'), front = svg.append('g');
  const st = {svg, defs, back, root, front, id, W, H, ink, k: H / 1920, sq: H < 1500, mode, n: 0,
    wear: `url(#${id}-wear)`, soft: `url(#${id}-soft)`, haze: `url(#${id}-haze)`, fill: name => `url(#${id}-${name})`, grainP, staticP, tick: () => {}};
  if (bare) return st;
  back.append('rect').attr('width', W).attr('height', H).attr('fill', ink.bg);
  const glow = back.append('ellipse').attr('cx', W / 2).attr('cy', H * .5).attr('rx', W * .85).attr('ry', H * .5).attr('fill', st.fill('lift'));
  const fogs = [0, 1, 2].map(i => back.append('ellipse').attr('fill', st.fill('fog')).attr('opacity', ink.mist * (1 - i * .2)));
  front.append('rect').attr('width', W).attr('height', H).attr('fill', st.fill('vig'));
  const grain = front.append('rect').attr('x', -300).attr('y', -300).attr('width', W + 600).attr('height', H + 600).attr('fill', st.fill('grain')).attr('opacity', .5);
  const scratches = [0, 1, 2].map(() => front.append('line').attr('stroke', C.bone).attr('stroke-width', 1.4)), dust = [0, 1, 2, 3].map(() => front.append('circle').attr('fill', C.bone));
  const dark = front.append('rect').attr('width', W).attr('height', H).attr('fill', '#000').attr('opacity', 0);
  st.tick = (t, {light = 1} = {}) => {
    const f = step(t);
    grain.attr('transform', `translate(${Math.round(hash(f, 1) * 250)} ${Math.round(hash(f, 2) * 250)})`);
    glow.attr('opacity', .75 + .25 * noise(t * .6, 4));
    fogs.forEach((e, i) => e.attr('cx', W * (.5 + .45 * Math.sin(t * .09 + i * 2.1))).attr('cy', H * (.3 + i * .22 + .05 * Math.sin(t * .13 + i))).attr('rx', W * (.75 + .1 * i)).attr('ry', H * (.14 + .03 * Math.sin(t * .2 + i * 4))));
    scratches.forEach((s, i) => { const on = hash(f * 3 + i, 21) < .1 * damage, x = hash(f, 30 + i) * W, y = hash(f, 40 + i) * H * .5; s.attr('opacity', on ? .07 + hash(f, 50 + i) * .14 : 0).attr('x1', x).attr('x2', x + (hash(f, 60 + i) - .5) * 8).attr('y1', y).attr('y2', y + H * (.2 + hash(f, 70 + i) * .6)); });
    dust.forEach((c, i) => c.attr('opacity', hash(f * 5 + i, 81) < .14 * damage ? .3 : 0).attr('cx', hash(f, 90 + i) * W).attr('cy', hash(f, 100 + i) * H).attr('r', 1 + hash(f, 110 + i) * 2.6));
    dark.attr('opacity', clamp(1 - lamp(t, 2, .5) * light));
    if (mode === 'tall' && creep) { const s = 1 + creep * Math.min(t, 14) / 6; creepG.attr('transform', `translate(${W / 2} ${H / 2}) scale(${s}) translate(${-W / 2} ${-H / 2})`); }
  };
  return st;
}
const uid = st => `${st.id}-c${++st.n}`;
export function clipBox(st, x, y, w, h) { const id = uid(st); st.defs.append('clipPath').attr('id', id).append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h); return `url(#${id})`; }
export function clipPath(st, d) { const id = uid(st); st.defs.append('clipPath').attr('id', id).append('path').attr('d', d); return `url(#${id})`; }
/** A linear gradient; stops are [offset, colour, opacity]. Returns the paint string. */
export function linear(st, stops, {x1 = 0, y1 = 0, x2 = 0, y2 = 1} = {}) { const id = uid(st), g = st.defs.append('linearGradient').attr('id', id).attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2); stops.forEach(([o, c, a = 1]) => g.append('stop').attr('offset', o).attr('stop-color', c).attr('stop-opacity', a)); return `url(#${id})`; }
export function radial(st, stops, attrs = {}) { const id = uid(st), g = st.defs.append('radialGradient').attr('id', id); for (const [k, v] of Object.entries(attrs)) g.attr(k, v); stops.forEach(([o, c, a = 1]) => g.append('stop').attr('offset', o).attr('stop-color', c).attr('stop-opacity', a)); return `url(#${id})`; }

// ---------------------------------------------------------------- text: measuring, fitting, splitting
const ctx = document.createElement('canvas').getContext('2d'), caps = {};
const css = (size, {font = F.head, weight = 400} = {}) => `${weight} ${size}px ${font}`;
export function measure(str, size, o = {}) { ctx.font = css(100, o); return (ctx.measureText(str).width + (o.spacing ?? .12) * 100 * [...str].length) * size / 100; }
export function capH(size, o = {}) { const key = css(100, o); if (!caps[key]) { ctx.font = key; caps[key] = ctx.measureText('H').actualBoundingBoxAscent || 70; } return caps[key] * size / 100; }
/** The largest size (up to max) at which every line fits the width. */
export const fit = (lines, width, max, o = {}) => Math.min(max, ...[].concat(lines).map(l => 100 * width / Math.max(1, measure(l, 100, o))));
export function wrap(str, size, width, o = {}) {
  const lines = []; let line = '';
  for (const word of String(str).split(/\s+/).filter(Boolean)) { const next = line ? line + ' ' + word : word; if (line && measure(next, size, o) > width) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
}
/** The largest size (max down to min) at which the sentence wraps inside a width x height box. */
export function flow(str, width, height, max, min = 28, o = {}, leading = 1.5) {
  for (let size = max; ; size -= 3) { const lines = wrap(str, size, width, o), pitch = capH(size, o) * leading; if (size <= min || (lines.length * pitch <= height && lines.every(l => measure(l, size, o) <= width))) return {size, lines, pitch}; }
}
/** Plain text; '\n' starts a new line. `halo` puts a dark edge behind it for footage. */
export function txt(g, x, y, str, {size = 30, color = C.bone, font = F.sub, weight = 500, anchor = 'start', spacing = .16, leading = 1.3, halo = 0, opacity = 1} = {}) {
  const node = g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).attr('opacity', opacity).style('font', css(size, {font, weight})).style('letter-spacing', `${spacing}em`);
  if (halo) node.attr('stroke', '#000').attr('stroke-opacity', .55).attr('stroke-width', halo).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
  String(str ?? '').split('\n').forEach((line, i) => node.append('tspan').attr('x', x).attr('dy', i ? `${leading}em` : 0).text(line));
  return node;
}
/**
 * THE theme's lettering: a line of tracked capitals whose letters are separate, so they can switch
 * on in random order, sit knocked off the baseline and smear away.
 *   marks   how many single letters take the accent colour (default 1), or false for none
 *   words   words to colour whole (e.g. the storyboard's accent words)
 * Returns {units, w, cap, show(t, {at, spread, out, outLen})}.
 */
export function letters(g, str, x, y, size, {font = F.head, weight = 400, spacing = .14, anchor = 'middle', color = C.bone, accent = C.rose, marks = 1, words = [], seed = 1, halo = 0, worn = null} = {}) {
  str = String(str ?? ''); const o = {font, weight, spacing}, total = measure(str, size, o) - spacing * size, x0 = anchor === 'middle' ? x - total / 2 : anchor === 'end' ? x - total : x, cap = capH(size, o);
  const chars = [...str], solid = chars.map((c, i) => c.trim() ? i : -1).filter(i => i >= 0), hot = new Set();
  for (const w of [].concat(words || []).map(up).filter(Boolean)) for (let at = up(str).indexOf(w); at >= 0; at = up(str).indexOf(w, at + 1)) for (let k = 0; k < w.length; k++) hot.add(at + k);
  const marked = new Set(); if (marks && !hot.size) for (let k = 0; k < marks && solid.length; k++) marked.add(solid[Math.floor(hash(seed * 13 + k * 7, str.length) * solid.length)]);
  const host = g.append('g'); if (worn) host.attr('mask', worn);
  const units = solid.map((at, i) => {
    const w = measure(chars[at], size, o) - spacing * size, cx = x0 + measure(chars.slice(0, at).join(''), size, o) + w / 2, on = hot.has(at) || marked.has(at);
    const outer = host.append('g'), t = outer.append('text').attr('text-anchor', 'middle').attr('fill', on ? accent : color).style('font', css(size, o)).text(chars[at]);
    if (halo) t.attr('stroke', '#000').attr('stroke-opacity', .5).attr('stroke-width', halo).attr('stroke-linejoin', 'round').attr('paint-order', 'stroke');
    return {g: outer, cx, y, w, cap, i, at, accent: on, jump: marked.has(at), r1: hash(at, seed), r2: hash(at, seed + 17), r3: hash(at, seed + 29)};
  });
  // Streaks grow away from the middle of the frame (where a face is): upward from lines near the top, downward from lines near the bottom.
  const pivot = y < 700 ? 0 : y > 1200 ? cap : cap / 2;
  const show = (t, {at = 0, spread = .8, out = null, outLen = .42, dim = 1} = {}) => {
    const x = out == null ? 0 : span(t, out, outLen);
    for (const u of units) {
      const q = t - at - u.r1 * spread;
      let op = q <= 0 ? 0 : q < .28 ? (hash(Math.floor(q * 30), u.at + seed) < .45 ? .12 : 1) : 1, dy = 0, sy = 1, dx = 0;
      if (q > .28 && hash(Math.floor(t * 10), u.at + seed * 3) < (u.accent ? .05 : .012)) op = .3;          // the odd letter drops out for a frame
      if (u.jump) { const land = .45 + u.r2 * .6; dy = q < land ? -cap * .36 : q < land + .07 ? -cap * .1 : 0; }
      if (x > 0) { sy = 1 + x * x * (5 + u.r3 * 18); op *= 1 - x * x; dx = (u.r2 - .5) * x * 12; }             // leave as a vertical streak
      u.g.attr('transform', `translate(${u.cx + dx} ${u.y + dy - pivot}) scale(1 ${sy}) translate(0 ${pivot})`).attr('opacity', op * dim);
    }
  };
  return {g: host, units, w: total, cap, x0, show};
}
/** Several centred lines of letters() as one block. Returns {lines, show, top, bottom}. */
export function block(g, lines, x, cy, size, o = {}, leading = 1.55) {
  const cap = capH(size, o), pitch = cap * leading, top = cy - ((lines.length - 1) * pitch + cap) / 2;
  const rows = lines.map((l, i) => letters(g, l, x, top + cap + i * pitch, size, {...o, seed: (o.seed ?? 1) + i * 5}));
  return {lines: rows, top, bottom: top + (lines.length - 1) * pitch + cap, pitch, cap, show: (t, s = {}) => rows.forEach((r, i) => r.show(t, {...s, at: (s.at ?? 0) + i * (s.gap ?? .25)}))};
}

// ---------------------------------------------------------------- marks
/** A slightly unsteady line from A to B, as path data. */
export function rough(x1, y1, x2, y2, seed = 1, amp = 2.2, every = 26) {
  const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / every)), nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1; let d = '';
  for (let i = 0; i <= n; i++) { const q = i / n, j = i === 0 || i === n ? 0 : (hash(i, seed) - .5) * 2 * amp; d += `${i ? 'L' : 'M'}${(x1 + (x2 - x1) * q + nx / l * j).toFixed(1)} ${(y1 + (y2 - y1) * q + ny / l * j).toFixed(1)}`; }
  return d;
}
/** A rectangle with unsteady edges, as closed path data. */
export const roughBox = (x, y, w, h, seed = 1, amp = 2.2) => [rough(x, y, x + w, y, seed, amp), rough(x + w, y, x + w, y + h, seed + 1, amp), rough(x + w, y + h, x, y + h, seed + 2, amp), rough(x, y + h, x, y, seed + 3, amp)].map((d, i) => i ? d.replace('M', 'L') : d).join('') + 'Z';
export const hair = (g, d, color = C.bone, width = 2, opacity = .5) => g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('opacity', opacity);
/** Reveal a path by drawing along its length. q is 0..1. */
export function draw(path, q) { const node = path.node(), length = node.__len ??= node.getTotalLength(); path.attr('stroke-dasharray', length).attr('stroke-dashoffset', length * (1 - clamp(q))); }
/** A pool of darkness behind overlay text so it reads on bright footage: a soft-edged ellipse, no hard box. */
export const pool = (g, st, cx, cy, rx, ry, opacity = 1) => g.append('ellipse').attr('cx', cx).attr('cy', cy).attr('rx', rx).attr('ry', ry).attr('fill', st.fill('pool')).attr('opacity', opacity);
/** A worn rubber stamp: unsteady double box with tracked capitals. Origin at its centre. Returns {g, w, h}. */
export function stamp(g, st, str, {size = 54, color = C.rose, seed = 3, font = F.head} = {}) {
  const w = measure(str, size, {font, spacing: .16}) + size * .9, h = size * 1.5, s = g.append('g'), inner = s.append('g').attr('mask', st.wear);
  inner.append('path').attr('d', roughBox(-w / 2, -h / 2, w, h, seed, 1.6)).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .09);
  inner.append('path').attr('d', roughBox(-w / 2 + size * .16, -h / 2 + size * .16, w - size * .32, h - size * .32, seed + 9, 1.2)).attr('fill', 'none').attr('stroke', color).attr('stroke-width', size * .03);
  txt(inner, size * .08, capH(size, {font}) / 2, str, {size, color, font, weight: 400, anchor: 'middle', spacing: .16});
  return {g: s, w, h};
}
/** A redaction bar with a ragged marker edge. */
export const redact = (g, x, y, w, h, seed = 1, color = '#050505') => g.append('path').attr('d', roughBox(x, y, w, h, seed, h * .07)).attr('fill', color);
/** A sheet of aged paper (case files, evidence cards): dim, stained, worn at the edges. Returns the group to write on. */
export function sheet(g, st, x, y, w, h, {seed = 1, color = C.paper, lines = 0} = {}) {
  const s = g.append('g'), body = s.append('g').attr('mask', st.wear), d = roughBox(x, y, w, h, seed, 2.4);
  s.insert('path', ':first-child').attr('d', d).attr('fill', '#000').attr('opacity', .55).attr('transform', 'translate(10 14)');
  body.append('path').attr('d', d).attr('fill', color);
  const cp = clipPath(st, d), stains = body.append('g').attr('clip-path', cp);
  stains.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', linear(st, [[0, '#000', .02], [1, '#000', .34]]));
  for (let i = 0; i < 4; i++) stains.append('ellipse').attr('cx', x + hash(i, seed + 3) * w).attr('cy', y + hash(i, seed + 4) * h).attr('rx', 40 + hash(i, seed + 5) * w * .3).attr('ry', 30 + hash(i, seed + 6) * h * .3).attr('fill', radial(st, [[0, '#3a2c18', .0], [.8, '#3a2c18', .2], [1, '#3a2c18', 0]]));
  for (let i = 1; i <= lines; i++) stains.append('path').attr('d', `M${x + 24} ${y + i * h / (lines + 1)}H${x + w - 24}`).attr('stroke', C.ink).attr('stroke-width', 1.5).attr('opacity', .25);
  return s.append('g').attr('clip-path', cp);
}
/** Path of a heart-monitor trace `beats` long across width w, baseline y; `phase` 0..1 shifts it. */
export function ekg(x, y, w, amp, beats = 4, phase = 0) {
  const shape = [[0, 0], [.18, 0], [.24, -.12], [.3, 0], [.4, 0], [.44, .16], [.5, -1], [.56, .42], [.62, 0], [.74, 0], [.82, -.2], [.9, 0], [1, 0]], bw = w / beats; let d = '';
  for (let b = -1; b <= beats; b++) for (const [px, py] of shape) { const X = x + (b + px + phase) * bw; if (X < x - 1 || X > x + w + 1) continue; d += `${d ? 'L' : 'M'}${X.toFixed(1)} ${(y + py * amp).toFixed(1)}`; }
  return d;
}
/** Four corner brackets round a box (camcorder framing). */
export const brackets = (x, y, w, h, len = 60) => `M${x} ${y + len}V${y}H${x + len}M${x + w - len} ${y}H${x + w}V${y + len}M${x + w} ${y + h - len}V${y + h}H${x + w - len}M${x + len} ${y + h}H${x}V${y + h - len}`;
/**
 * The small tracked labels most cards carry in their corners (the `labels` prop: top-left,
 * top-right, bottom-left, bottom-right). Returns seek(t, start), which switches them on.
 */
export function cornerLabels(st, labels = [], {size = null, color = C.fog, inset = null} = {}) {
  const {W, H, front} = st, m = inset ?? 64, s = size ?? 22 + 6 * st.k;
  const nodes = (labels || []).slice(0, 4).map((l, i) => l ? txt(front, i % 2 ? W - m : m, i > 1 ? H - m : m + s * .8, up(oneLine(l)), {size: s, color, anchor: i % 2 ? 'end' : 'start', spacing: .28, weight: 500}) : null);
  return (t, start = .8) => nodes.forEach((n, i) => n?.attr('opacity', flickerOn(t, start + i * .18, .3, i) * .8));
}

/** The grain tile as a data URL, for pieces that are not SVG (the 3D scenes lay it over their canvas). */
export const grainURL = () => grainTexture();
