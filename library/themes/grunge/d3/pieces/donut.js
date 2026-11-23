import {C, span, hold, txt, hatch, halftone, jit, pop, up, fit, capH} from '../../kit.js';
import {card} from './_card.js';

// A pie torn from different papers: each slice is pasted down in turn, slightly apart; the legend is typed beside it.
export const meta = {duration: 3.8};
export const defaults = {title: 'Where the time goes', unit: 'Illustrative · share of a week', center: '100%', centerLabel: 'OF IT', clear: false,
  items: [{label: 'Editing', value: 45}, {label: 'Filming', value: 25}, {label: 'Scripting', value: 18}, {label: 'Posting', value: 12}]};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), d3 = window.d3, cx = 330, cy = (top + 930) / 2 + 10, R = Math.min(250, (920 - top) / 2 - 10);
  const fills = [ink.accent, C.bone, hatch(st, {color: C.bone, gap: 12, width: 5}), C.ash, halftone(st, {color: C.bone, cell: 13, dot: .34}), C.paper];
  const arcs = d3.pie().sort(null).value(d => d.value).padAngle(.035)(props.items), arc = d3.arc().innerRadius(R * .44).outerRadius(R);
  const slices = arcs.map((a, i) => { const mid = (a.startAngle + a.endAngle) / 2, g = body.append('g'); g.append('path').attr('d', arc(a)).attr('fill', C.char).attr('stroke', C.white).attr('stroke-width', 5).attr('stroke-linejoin', 'round'); g.append('path').attr('d', arc(a)).attr('fill', fills[i % fills.length]); return {g, mid}; });
  const cs = fit(up(props.center), R * .7, 70, {role: 'cond'}), ctr = txt(fine, cx, cy + capH(cs, {role: 'cond'}) / 2 - 8, up(props.center), {size: cs, role: 'cond', anchor: 'middle'}), cl = txt(fine, cx, cy + cs * .62, up(props.centerLabel), {size: 20, anchor: 'middle', color: C.paper});
  const n = props.items.length, pitch = Math.min(120, (900 - top - 40) / n), ly = cy - pitch * (n - 1) / 2;
  const rows = props.items.map((d, i) => { const g = fine.append('g'), y = ly + i * pitch;
    g.append('rect').attr('x', 630).attr('y', y - 34).attr('width', 44).attr('height', 44).attr('fill', fills[i % fills.length]).attr('stroke', C.bone).attr('stroke-width', 2);
    txt(g, 692, y - 8, `${d.value}`, {size: 50, role: 'cond', color: i ? C.bone : ink.accent}); const lab = up(d.label); txt(g, 692, y + 26, lab, {size: Math.min(24, fit(lab, 230, 24, {role: 'type'})), color: C.paper}); return g; });
  return {seek(t) {
    const s = intro(t), h = hold(t);
    slices.forEach(({g, mid}, i) => { const at = .5 + i * .22, p = pop(t, at, .25), j = jit(s, i, 1.5, .5), off = 7 + (1 - Math.min(1, p)) * 60; g.attr('transform', `translate(${cx + Math.sin(mid) * off + j.x} ${cy - Math.cos(mid) * off + j.y}) rotate(${j.r + (i % 2 ? 1.5 : -1.5)})`).attr('opacity', p > 0 ? 1 : 0); rows[i].attr('opacity', h >= at + .1 ? 1 : 0); });
    const done = h >= .6 + n * .22 ? 1 : 0; ctr.attr('opacity', done); cl.attr('opacity', done);
  }};
}
