import {C, F, series, line, text, draw, span, easeInOut, flicker, mix} from '../../hud.js';
import {card} from './_card.js';

// Stacked areas revealed by a scanning cursor. Once drawn, the cursor keeps sweeping back
// and forth and the legend reads out each layer's value where it stands.
export const meta = {duration: 5.5, live: true};
export const defaults = {title: 'Income mix by month', unit: 'Illustrative · thousands', labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'], clear: false,
  layers: [{label: 'Ads', values: [1, 1.2, 1.1, 1.5, 1.8, 2, 2.1, 2.6, 2.4, 3, 3.2, 3.5]}, {label: 'Sponsors', values: [0, 0, .5, .8, .6, 1.5, 2, 1.8, 2.8, 3, 3.6, 4.2]}, {label: 'Products', values: [0, 0, 0, 0, .4, .8, 1.5, 2.4, 3, 4.2, 5, 6.5]}]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), L = props.layers, n = L[0].values.length, x0 = 130, x1 = 900, yb = 850, yt = 412;
  const stack = L.map((_, k) => L[0].values.map((_, i) => d3.sum(L.slice(0, k + 1), l => l.values[i]))), top = d3.max(stack.at(-1));
  const x = d3.scaleLinear().domain([0, n - 1]).range([x0, x1]), y = d3.scaleLinear().domain([0, top * 1.08]).nice().range([yb, yt]);
  for (const v of y.ticks(4)) { line(root, `M${x0} ${y(v)}H${x1 + 10}`, C.grid, 2); text(root, x0 - 14, y(v) + 7, v, {size: 20, color: C.dim, anchor: 'end', spacing: '0'}); }
  const every = Math.ceil(n / 6); props.labels.forEach((l, i) => { if (i % every === 0 || i === n - 1) text(root, x(i), yb + 38, l, {size: 20, color: C.dim, anchor: 'middle', spacing: '.1em'}); });
  line(root, `M${x0} ${yb}H${x1 + 10}`, C.dim, 2);
  const clip = defs.append('clipPath').attr('id', id + '-reveal').append('rect').attr('x', 0).attr('y', 0).attr('height', 1000), plot = root.append('g').attr('clip-path', `url(#${id}-reveal)`);
  L.forEach((l, k) => { const color = series[k % series.length], lower = i => k ? stack[k - 1][i] : 0;
    plot.append('path').attr('d', d3.area().x((d, i) => x(i)).y0((d, i) => y(lower(i))).y1(d => y(d))(stack[k])).attr('fill', color).attr('fill-opacity', .24);
    line(plot, d3.line().x((d, i) => x(i)).y(d => y(d))(stack[k]), color, 4).attr('stroke-linejoin', 'round'); });
  const cursor = line(root, `M0 ${yt - 30}V${yb}`, C.white, 2), month = text(root, 0, yt - 40, '', {size: 24, color: C.white, anchor: 'middle', spacing: '.1em'});
  const keys = L.map((l, k) => { const color = series[k % series.length], g = root.append('g').attr('transform', `translate(${90 + k * 284} 232)`);
    g.append('rect').attr('width', 20).attr('height', 20).attr('y', 4).attr('fill', color); text(g, 32, 24, l.label.toUpperCase(), {size: 26, font: F.text, weight: 700, color: C.white, spacing: '.05em'});
    return {g, l, k, value: text(g, 0, 76, '', {size: 44, font: F.display, weight: 800, color, spacing: '0'}), dot: root.append('rect').attr('width', 14).attr('height', 14).attr('fill', C.bg).attr('stroke', color).attr('stroke-width', 3)}; });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    // Reveal left to right, then wander: the cursor eases back over the chart and returns.
    const first = easeInOut(span(t, .4, 2.2)), u = first < 1 ? first : 1 - .7 * (.5 - .5 * Math.cos((t - 2.6) * 1.5)), at = u * (n - 1), i = Math.min(n - 2, Math.floor(at)), f = at - i, cx = x(at);
    clip.attr('width', first < 1 ? cx : 1000); cursor.attr('transform', `translate(${cx} 0)`).attr('opacity', flicker(t, .4) * .85);
    month.attr('x', cx).text(props.labels[Math.round(at)] ?? '').attr('opacity', flicker(t, .4));
    for (const key of keys) {
      key.g.attr('opacity', flicker(t, .3 + key.k * .15)); key.value.text(mix(key.l.values[i], key.l.values[i + 1], f).toFixed(1));
      key.dot.attr('x', cx - 7).attr('y', y(mix(stack[key.k][i], stack[key.k][i + 1], f)) - 7).attr('opacity', flicker(t, .4));
    }
  }};
}
