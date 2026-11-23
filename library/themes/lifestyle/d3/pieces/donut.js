import {card, C, series, up, fit, capH, txt, fade, glide, swell, span} from '../../kit.js';
import {arrive} from './_local.js';

// A ring that sweeps round in soft colours with a big number in its middle and a legend of
// dots, labels and shares beside it. Good for a budget, a day or a plate.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'One ordinary day', unit: 'Illustrative · hours', clear: false, accent: 'leaf', centre: '24', centreLabel: 'hours', suffix: 'h',
  items: [{label: 'Sleep', value: 8}, {label: 'Work', value: 8}, {label: 'Moving', value: 2}, {label: 'Meals', value: 2.5}, {label: 'Everything else', value: 3.5}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root} = st, d3 = window.d3, cx = 330, cy = 585, R = 235, r = 148, total = d3.sum(props.items, d => d.value), arc = d3.arc().innerRadius(r).outerRadius(R).cornerRadius(5).padAngle(.03);
  const ring = root.append('g').attr('transform', `translate(${cx} ${cy})`); ring.append('circle').attr('r', (R + r) / 2).attr('fill', 'none').attr('stroke', C.deep).attr('stroke-width', R - r - 8);
  let a = 0; const n = props.items.length, pitch = Math.min(96, 520 / n), ly = cy - (n - 1) * pitch / 2;
  const segs = props.items.map((d, i) => { const from = a, to = a += d.value / total * Math.PI * 2, color = series[i % series.length], g = root.append('g'), y = ly + i * pitch;
    g.append('circle').attr('cx', 640).attr('cy', y - 8).attr('r', 12).attr('fill', color);
    txt(g, 668, y, d.label, {size: fit(d.label, 250, 32, {role: 'text'}), role: 'text'}); txt(g, 668, y + 30, up(`${d.value}${props.suffix} · ${Math.round(d.value / total * 100)}%`), {size: 19, role: 'label', color: C.dim});
    return {from, to, g, path: ring.append('path').attr('fill', color)}; });
  const csize = fit(props.centre, r * 1.4, 130), mid = root.append('g'); txt(mid, cx, cy + capH(csize) / 2 - 10, props.centre, {size: csize, role: 'head', anchor: 'middle'});
  txt(mid, cx, cy + capH(csize) / 2 + 34, up(props.centreLabel), {size: 21, role: 'label', anchor: 'middle', color: C.soft});
  return {seek(t) {
    st.header(t);
    const sweep = swell(span(t, .3, 2)) * Math.PI * 2;
    segs.forEach((s, i) => { const end = Math.min(s.to, sweep); s.path.attr('d', end > s.from + .035 ? arc({startAngle: s.from, endAngle: end}) : ''); arrive(s.g, t, .6 + i * .22, 14); });
    ring.attr('transform', `translate(${cx} ${cy}) rotate(${Math.sin(t * .35) * 1.5})`); mid.attr('opacity', fade(t, .5, .7));
  }};
}
