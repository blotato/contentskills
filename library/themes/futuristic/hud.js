// Futuristic theme drawing kit. Every piece in this theme draws with these colors, fonts and
// helpers, which is what keeps overlays, diagrams and captions looking like one system:
// thin glowing line-work, notched frames, corner brackets, tick rulers, small mono readouts.
import {clamp, span, easeOut} from '/library/_shared/kit.js';
export {clamp, span, mix, easeOut, easeInOut, easeBack} from '/library/_shared/kit.js';

export const C = {
  bg: '#04070c', panel: '#08121d', grid: '#12303f',
  cyan: '#3ef0ff', teal: '#17b9cf', magenta: '#ff3fa4', amber: '#ffb300', red: '#ff4d5a',
  white: '#e9fcff', dim: '#6c93a8',
};
export const series = [C.cyan, C.magenta, C.amber, C.teal, C.white, C.red];
export const F = {display: 'Orbitron', text: 'Rajdhani', mono: '"Share Tech Mono"'};
export const FRAME = {width: 1080, height: 1920};   // overlays are drawn in full-frame pixels

let stages = 0;
/**
 * An SVG stage with the theme's glow filter.
 *   overlay: true  -> transparent, 1080x1920, meant to sit on top of footage
 *   otherwise      -> 1000x1000 card on the dark grid background (clear: true keeps it transparent)
 */
export function hudStage(el, {overlay = false, clear = false} = {}) {
  const d3 = window.d3, [w, h] = overlay ? [FRAME.width, FRAME.height] : [1000, 1000], id = `hud${++stages}`;
  const svg = d3.select(el).append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('preserveAspectRatio', 'xMidYMid meet').style('overflow', 'visible');
  const defs = svg.append('defs');
  const glow = defs.append('filter').attr('id', id + '-glow').attr('x', '-30%').attr('y', '-30%').attr('width', '160%').attr('height', '160%');
  glow.append('feGaussianBlur').attr('stdDeviation', overlay ? 5 : 4).attr('result', 'b');
  const merge = glow.append('feMerge'); merge.append('feMergeNode').attr('in', 'b'); merge.append('feMergeNode').attr('in', 'SourceGraphic');
  el.style.background = overlay || clear ? 'transparent' : C.bg;
  if (!overlay && !clear) {
    const grid = defs.append('pattern').attr('id', id + '-grid').attr('width', 50).attr('height', 50).attr('patternUnits', 'userSpaceOnUse');
    grid.append('path').attr('d', 'M50 0H0V50').attr('fill', 'none').attr('stroke', C.grid).attr('stroke-width', 1);
    svg.append('rect').attr('width', w).attr('height', h).attr('fill', `url(#${id}-grid)`).attr('opacity', .55);
  }
  const root = svg.append('g').attr('filter', `url(#${id}-glow)`);
  return {svg, root, defs, id, w, h};
}

/** Path for a rectangle with notched (cut) corners. */
export const chamfer = (x, y, w, h, c = 18) => `M${x + c} ${y}H${x + w}V${y + h - c}L${x + w - c} ${y + h}H${x}V${y + c}Z`;
/** Path for four corner brackets around a box. */
export const brackets = (x, y, w, h, len = 40) =>
  `M${x} ${y + len}V${y}H${x + len}M${x + w - len} ${y}H${x + w}V${y + len}M${x + w} ${y + h - len}V${y + h}H${x + w - len}M${x + len} ${y + h}H${x}V${y + h - len}`;

export const line = (g, d, color = C.cyan, width = 3) => g.append('path').attr('d', d).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-linecap', 'square');
/** A backing plate so text stays readable over footage. */
export const plate = (g, d, opacity = .62) => g.append('path').attr('d', d).attr('fill', C.bg).attr('fill-opacity', opacity);
export function text(g, x, y, value, {size = 28, color = C.white, font = F.mono, weight = 400, anchor = 'start', spacing = '.08em'} = {}) {
  return g.append('text').attr('x', x).attr('y', y).attr('fill', color).attr('text-anchor', anchor).style('font', `${weight} ${size}px ${font}`).style('letter-spacing', spacing).text(value);
}
/** A row of ruler ticks from (x, y) going right; every 5th is longer. */
export function ticks(g, x, y, width, count, color = C.dim, vertical = false) {
  let d = '';
  for (let i = 0; i <= count; i++) { const p = i / count * width, len = i % 5 ? 8 : 18; d += vertical ? `M${x} ${y + p}h${len}` : `M${x + p} ${y}v${len}`; }
  return line(g, d, color, 2);
}
/** A ring made of dashes, for reticles and gauges. `dash` like '40 14'. */
export const ring = (g, cx, cy, r, color = C.cyan, width = 3, dash = null) => g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', color).attr('stroke-width', width).attr('stroke-dasharray', dash);

/** Reveal a path by drawing along its length. q is 0..1. */
export function draw(path, q) {
  const node = path.node(), length = node.__len ??= node.getTotalLength();
  if (path.attr('data-dash') == null) path.attr('data-dash', path.attr('stroke-dasharray') || '');
  // Dashed shapes fade in instead, since a dash pattern cannot also be used to draw the stroke on.
  if (path.attr('data-dash')) path.attr('opacity', clamp(q)); else path.attr('stroke-dasharray', length).attr('stroke-dashoffset', length * (1 - easeOut(q)));
}
/** HUD elements switch on with a quick flicker rather than a fade. Returns an opacity for time t. */
export const flicker = (t, start, length = .28) => { const q = span(t, start, length); return q <= 0 ? 0 : q >= 1 ? 1 : (Math.floor(q * 7) % 2 ? .25 : 1); };
/** Text that types itself. */
export const typed = (value, q) => value.slice(0, Math.round(value.length * clamp(q)));
export const pad = (n, width = 2) => String(Math.floor(n)).padStart(width, '0');
/** Running timecode HH:MM:SS:FF for readouts. */
export const timecode = t => `00:${pad(t / 60)}:${pad(t % 60)}:${pad((t % 1) * 30)}`;
/**
 * Overall opacity of an overlay: flickers on at the start and, when the storyboard says how
 * long it stays up (`life` seconds), switches off just before the end.
 */
export const presence = (t, life) => flicker(t, 0) * (life ? 1 - span(t, life - .18, .18) : 1);

// ---- Helpers for the larger diagram and overlay set. All are pure functions of their inputs. ----
/** Seeded pseudo-random number 0..1. Pieces may not use Math.random; hash(i, seed) is the stand-in. */
export const hash = (n, seed = 0) => { const x = Math.sin(n * 127.1 + seed * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); };
/** A smoothly wandering value 0..1 over time, for needles, levels and other idle motion. */
export const noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u; };
/** Ease that overshoots 1 and rings briefly before settling. */
export const spring = x => { x = clamp(x); return x >= 1 ? 1 : 1 - Math.exp(-6 * x) * Math.cos(10 * x); };
/** Text that decodes: characters lock in left to right while the rest cycle through glyphs. */
export const scramble = (value, q, t = 0, glyphs = '0123456789ABCDEF#%/<>*+=') => {
  q = clamp(q); if (q <= 0) return ''; if (q >= 1) return value;
  const done = Math.floor(value.length * q), frame = Math.floor(t * 20);
  return [...value].map((ch, i) => i < done || ch === ' ' ? ch : glyphs[Math.floor(hash(i, frame) * glyphs.length)]).join('');
};
/** 12345 -> "12,345". */
export const comma = n => Math.round(n).toLocaleString('en-US');
/** On/off square wave, for blinking dots and cursors. */
export const blink = (t, hz = 2) => Math.floor(t * hz * 2) % 2 ? 0 : 1;
