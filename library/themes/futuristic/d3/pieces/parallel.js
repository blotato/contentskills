import {C, F, series, chamfer, line, text, draw, span, mix, easeInOut, flicker, typed} from '../../hud.js';
import {card} from './_card.js';

// Parallel coordinates: one vertical axis per measure, one line per item crossing all of them.
// Axes drop in, lines thread across one at a time, then each item is highlighted in turn while
// value markers glide along every axis to its scores.
export const meta = {duration: 8, live: true};
export const defaults = {title: 'Format trade-offs', unit: 'Illustrative · score out of 100', max: 100, axes: ['Reach', 'Effort', 'Shelf life', 'Revenue', 'Speed'], clear: false,
  rows: [{label: 'Shorts', values: [90, 25, 30, 35, 95]}, {label: 'Long form', values: [45, 80, 85, 70, 30]}, {label: 'Newsletter', values: [30, 45, 70, 80, 60]}, {label: 'Podcast', values: [35, 65, 75, 50, 40]}, {label: 'Livestream', values: [55, 50, 20, 45, 85]}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), A = props.axes, R = props.rows, n = A.length, yt = 340, yb = 770, x = i => 140 + i / (n - 1) * 720, y = v => yb - v / props.max * (yb - yt), build = 1.3, each = .38;
  const axes = A.map((a, i) => { let d = `M${x(i)} ${yt - 14}V${yb + 14}`; for (let k = 0; k <= 10; k++) d += `M${x(i) - (k % 5 ? 6 : 12)} ${y(k / 10 * props.max)}h${k % 5 ? 12 : 24}`;
    return {i, rule: line(root, d, C.dim, 2), name: text(root, x(i), yt - 40, '', {size: 26, font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.05em'}), label: a.toUpperCase(),
      top: text(root, x(i) + 20, yt + 4, props.max, {size: 18, color: C.dim, spacing: '0'}), zero: text(root, x(i) + 20, yb + 6, 0, {size: 18, color: C.dim, spacing: '0'})}; });
  const cols = R.length > 4 ? Math.ceil(R.length / 2) : R.length, keySize = Math.min(26, (832 / cols - 44) / (Math.max(...R.map(r => String(r.label).length)) * .62));
  const rows = R.map((r, k) => { const color = series[k % series.length], path = line(root, r.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(''), color, 4).attr('stroke-linejoin', 'round');
    const dots = r.values.map((v, i) => root.append('rect').attr('x', x(i) - 7).attr('y', y(v) - 7).attr('width', 14).attr('height', 14).attr('fill', C.bg).attr('stroke', color).attr('stroke-width', 3));
    const key = root.append('g').attr('transform', `translate(${84 + (k % cols) * (832 / cols)} ${846 + Math.floor(k / cols) * 38})`), sw = key.append('rect').attr('width', 18).attr('height', 18).attr('fill', color);
    return {r, k, color, path, dots, key, name: text(key, 28, 17, String(r.label).toUpperCase(), {size: keySize, font: F.text, weight: 700, color: C.white, spacing: '.04em'}), at: build + k * each}; });
  const chips = A.map((_, i) => { const g = root.append('g'); g.append('path').attr('d', chamfer(-36, -18, 72, 36, 8)).attr('fill', C.bg); const edge = line(g, chamfer(-36, -18, 72, 36, 8), C.white, 2); return {g, edge, num: text(g, 0, 8, '', {size: 22, color: C.white, anchor: 'middle', spacing: '0'})}; });
  const done = build + R.length * each + .6, spot = text(root, 84, 250, '', {size: 24, color: C.amber, spacing: '.14em'}), hint = text(root, 916, 250, 'ONE LINE = ONE FORMAT', {size: 20, color: C.dim, anchor: 'end', spacing: '.16em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); hint.attr('opacity', flicker(t, 1));
    for (const a of axes) { draw(a.rule, span(t, .3 + a.i * .12, .5)); a.name.text(typed(a.label, span(t, .5 + a.i * .12, .3))); a.top.attr('opacity', flicker(t, .7 + a.i * .12)); a.zero.attr('opacity', flicker(t, .7 + a.i * .12)); }
    const slot = (t - done) / 1.3, on = slot > 0, cur = Math.floor(Math.max(0, slot)) % R.length, prev = (cur + R.length - 1) % R.length, glide = easeInOut(span(slot % 1, 0, .45));
    for (const r of rows) { const hot = on && r.k === cur; draw(r.path, span(t, r.at, .7)); r.path.attr('opacity', on && !hot ? .25 : 1).attr('stroke-width', hot ? 7 : 4);
      r.dots.forEach((d, i) => d.attr('opacity', (t > r.at + .7 * i / (n - 1) ? 1 : 0) * (on && !hot ? .25 : 1))); r.key.attr('opacity', flicker(t, r.at) * (on && !hot ? .45 : 1)); r.name.attr('fill', hot ? r.color : C.white); }
    chips.forEach((c, i) => { const from = slot < 1 ? R[cur].values[i] : R[prev].values[i], v = mix(from, R[cur].values[i], glide); c.g.attr('transform', `translate(${x(i) + (i === n - 1 ? -52 : 52)} ${y(v)})`).attr('opacity', on ? 1 : 0); c.edge.attr('stroke', rows[cur].color); c.num.text(Math.round(v)); });
    spot.text(on ? typed(`> ${String(R[cur].label).toUpperCase()}`, span(slot % 1, 0, .3)) : typed('READ EACH LINE LEFT TO RIGHT', span(t, .6, .6)));
  }};
}
