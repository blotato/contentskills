import {C, F, chamfer, line, text, draw, span, easeOut, flicker, typed, hash, noise, blink} from '../../hud.js';
import {card} from './_card.js';

// A candlestick price trace. Candles print one by one (wick, then body) while a price tag rides
// the latest close and a moving average trails behind; then the high and low get annotated and
// a crosshair keeps wandering over the candles, reading out open/high/low/close.
// Each candle is [open, high, low, close] with an optional fifth number for volume.
export const meta = {duration: 7, live: true};
const sample = (() => { let p = 100; return Array.from({length: 26}, (_, i) => { const o = p, c = o + (hash(i, 1) - .42) * 9, h = Math.max(o, c) + hash(i, 2) * 4, l = Math.min(o, c) - hash(i, 3) * 4; p = c; return [o, h, l, c, 20 + hash(i, 4) * 80].map(v => +v.toFixed(1)); }); })();
export const defaults = {title: 'Price action', unit: 'Illustrative · generated sample prices', average: 5, clear: false, candles: sample};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), K = props.candles, n = K.length, x0 = 96, x1 = 800, yt = 330, hasVol = K.every(k => k[4] != null), yb = hasVol ? 740 : 860, slot = (x1 - x0) / n, bw = slot * .62, step = Math.min(.09, 2.4 / n), start = .6;
  const y = d3.scaleLinear().domain([d3.min(K, k => k[2]), d3.max(K, k => k[1])]).nice().range([yb, yt]), x = i => x0 + (i + .5) * slot, vmax = hasVol ? d3.max(K, k => k[4]) : 1, fmt = v => v.toFixed(1);
  for (const v of y.ticks(5)) { line(root, `M${x0} ${y(v)}H${x1 + 8}`, C.grid, 2); text(root, x1 + 22, y(v) + 7, v, {size: 20, color: C.dim, spacing: '0'}); }
  line(root, `M${x0} ${yb + (hasVol ? 130 : 6)}H${x1 + 8}`, C.dim, 2); if (hasVol) text(root, x1 + 22, yb + 126, 'VOL', {size: 20, color: C.dim});
  const candles = K.map(([o, h, l, c, v], i) => { const up = c >= o, color = up ? C.cyan : C.magenta, top = y(Math.max(o, c)), height = Math.max(3, Math.abs(y(o) - y(c)));
    return {i, up, o: y(o), top, height, wick: line(root, `M${x(i)} ${y(l)}V${y(h)}`, color, 2), body: root.append('rect').attr('x', x(i) - bw / 2).attr('width', bw).attr('fill', up ? color : C.bg).attr('stroke', color).attr('stroke-width', 2),
      vol: hasVol ? root.append('rect').attr('x', x(i) - bw / 2).attr('width', bw).attr('fill', color).attr('opacity', .5) : null, vh: hasVol ? v / vmax * 96 : 0, at: start + i * step}; });
  const w = Math.max(2, props.average), avg = K.map((_, i) => i < w - 1 ? null : d3.mean(K.slice(i - w + 1, i + 1), k => k[3])), clip = defs.append('clipPath').attr('id', id + '-avg').append('rect').attr('x', 0).attr('y', 0).attr('height', 1000);
  line(root, d3.line().defined(d => d != null).x((d, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX)(avg), C.amber, 3).attr('clip-path', `url(#${id}-avg)`);
  const built = start + n * step + .4, hi = d3.maxIndex(K, k => k[1]), lo = d3.minIndex(K, k => k[2]);
  const note = (i, v, word, dir) => { const g = root.append('g'), px = x(i), py = y(v), tx = Math.min(x1 - 150, Math.max(x0, px - 70)); return {g, lead: line(g, `M${px} ${py + dir * 8}V${py + dir * 34}`, C.white, 2), label: text(g, tx, py + dir * 44 + (dir > 0 ? 18 : 0), '', {size: 22, color: C.white, spacing: '.1em'}), word: `${word} ${fmt(v)}`}; };
  const notes = [note(hi, K[hi][1], 'HIGH', -1), note(lo, K[lo][2], 'LOW', 1)];
  const last = line(root, `M${x0} 0H${x1 + 8}`, C.white, 2).attr('stroke-dasharray', '6 8'), tag = root.append('g'); tag.append('path').attr('d', chamfer(x1 + 14, -20, 104, 40, 8)).attr('fill', C.white); const price = text(tag, x1 + 66, 8, '', {size: 24, color: C.bg, anchor: 'middle', spacing: '0'});
  const cross = line(root, '', C.amber, 2), keys = ['O', 'H', 'L', 'C'].map((k, j) => { text(root, 96 + j * 150, 262, k, {size: 24, color: C.dim}); return text(root, 122 + j * 150, 264, '', {size: 30, font: F.display, weight: 700, color: C.white, spacing: '0'}); });
  const change = text(root, 916, 264, '', {size: 30, font: F.display, weight: 800, anchor: 'end', spacing: '0'}), legend = text(root, 96, 304, `— ${w}-BAR AVERAGE`, {size: 20, color: C.amber, spacing: '.14em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); legend.attr('opacity', flicker(t, .5));
    const head = Math.max(0, Math.min(n - 1, Math.floor((t - start) / step)));
    for (const c of candles) { const q = easeOut(span(t, c.at + step * .4, .3)); draw(c.wick, span(t, c.at, .2));
      c.body.attr('y', c.up ? c.o - c.height * q : c.o).attr('height', Math.max(.01, c.height * q)).attr('opacity', t > c.at ? 1 : 0); c.vol?.attr('y', c.top * 0 + (yb + 130) - c.vh * q).attr('height', c.vh * q); }
    clip.attr('width', t < built ? x(head) + (t > start ? slot / 2 : -1000) : 1000);
    // During the build the readout follows the newest candle; afterwards a crosshair wanders.
    const roam = t > built + .6, at = roam ? Math.round(noise((t - built) * .45, 21) * (n - 1)) : head, k = K[at], lastY = y(K[roam || t > built ? n - 1 : head][3]);
    last.attr('transform', `translate(0 ${lastY})`).attr('opacity', t > start ? .5 + .3 * blink(t, 1.5) : 0); tag.attr('transform', `translate(0 ${lastY})`).attr('opacity', t > start ? 1 : 0); price.text(fmt(K[roam || t > built ? n - 1 : head][3]));
    cross.attr('d', `M${x(at)} ${yt - 14}V${yb + (hasVol ? 130 : 6)}M${x0} ${y(k[3])}H${x1 + 8}`).attr('opacity', roam ? .7 : 0);
    keys.forEach((key, j) => key.text(t > start ? fmt(k[j]) : '')); const pct = (k[3] - k[0]) / k[0] * 100; change.text(t > start ? `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%` : '').attr('fill', pct >= 0 ? C.cyan : C.magenta);
    notes.forEach((m, j) => { m.g.attr('opacity', flicker(t, built + j * .3)); draw(m.lead, span(t, built + j * .3, .25)); m.label.text(typed(m.word, span(t, built + .1 + j * .3, .35))); });
  }};
}
