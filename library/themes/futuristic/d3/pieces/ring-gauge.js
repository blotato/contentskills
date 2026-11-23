import {C, F, series, line, ring, text, draw, span, easeInOut, easeOut} from '../../hud.js';
import {card} from './_card.js';

// Shares of a whole as arcs on a dial, with the total in the centre and a rotating outer ring.
export const meta = {duration: 3.2};
export const defaults = {title: 'Time per video', unit: 'Illustrative · hours', suffix: 'H', clear: false,
  items: [{label: 'Editing', value: 5}, {label: 'Script', value: 2}, {label: 'Filming', value: 1.5}, {label: 'Posting', value: .5}]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame} = card(el, props), cx = 370, cy = 590, total = d3.sum(props.items, d => d.value);
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`), arcs = d3.pie().sort(null).value(d => d.value).padAngle(.05)(props.items), arc = d3.arc().innerRadius(170).outerRadius(240);
  const paths = arcs.map((a, i) => g.append('path').attr('fill', series[i % series.length]));
  const outer = ring(root, cx, cy, 280, C.cyan, 3, '90 30'), inner = ring(root, cx, cy, 140, C.dim, 2, '4 10');
  const centre = text(root, cx, cy + 34, '', {size: 100, font: F.display, weight: 900, color: C.white, anchor: 'middle', spacing: '0'});
  const keys = props.items.map((d, i) => { const k = root.append('g').attr('transform', `translate(700 ${440 + i * 88})`);
    k.append('rect').attr('width', 26).attr('height', 26).attr('fill', series[i % series.length]);
    text(k, 44, 24, d.label.toUpperCase(), {size: 28, font: F.text, weight: 700, color: C.white}); text(k, 44, 54, `${Math.round(d.value / total * 100)}%`, {size: 20, color: C.dim}); return k; });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    const sweep = easeInOut(span(t, .2, 1.8)) * Math.PI * 2;
    paths.forEach((p, i) => { const a = arcs[i]; p.attr('d', a.startAngle >= sweep ? null : arc({...a, endAngle: Math.max(a.startAngle + .001, Math.min(a.endAngle, sweep))})); });
    centre.text((total * easeOut(span(t, .2, 1.8))).toFixed(0) + (props.suffix ?? ''));
    outer.attr('transform', `rotate(${t * 30} ${cx} ${cy})`); inner.attr('transform', `rotate(${-t * 45} ${cx} ${cy})`);
    keys.forEach((k, i) => k.attr('opacity', span(t, .5 + i * .3, .15)));
  }};
}
