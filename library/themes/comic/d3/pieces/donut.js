import {C, series, up, fit, capH, scaleTo, span, spring, easeInOut} from '../../kit.js';
import {card, toned, shout, label, counted, twoLine} from './_card.js';

// Shares of a whole as a thick inked ring: the slices sweep round one after another, the biggest
// one jumps out a little, and its share is shouted in the hole. A key pops on beside it.
export const meta = {duration: 4.2, live: true};
export const defaults = {title: 'Where the hours go', unit: 'Illustrative · share of a work week', center: null, clear: false, colors: series,
  items: [{label: 'Editing', value: 45}, {label: 'Filming', value: 25}, {label: 'Writing', value: 18}, {label: 'Posting', value: 12}]};

export function mount(el, props = defaults) {
  const stage = card(el, props), {root} = stage, d3 = window.d3, I = props.items, total = d3.sum(I, d => d.value), cx = 335, cy = 600, R = 240, r = 112, colors = props.colors ?? series;
  const best = I.reduce((a, d, i) => d.value > I[a].value ? i : a, 0), arc = d3.arc().innerRadius(r).outerRadius(R).padAngle(.03);
  let at = 0; const g = root.append('g').attr('transform', `translate(${cx} ${cy})`);
  const slices = I.map((d, i) => { const a0 = at, a1 = at += d.value / total * Math.PI * 2; return {d, i, a0, a1, mid: (a0 + a1) / 2, shape: toned(stage, g, {fill: colors[i % colors.length], area: [-R - 30, -R - 30, R * 2 + 60, R * 2 + 60], from: [1, 1], reach: .9, pitch: 20})}; });
  const mid = twoLine(props.center ?? I[best].label, r * 1.15, 30, {role: 'slab'}, 22), hero = shout(g, 0, mid.lines.length > 1 ? 4 : 22, '', {size: mid.lines.length > 1 ? 66 : 78, color: C.white}), sub = label(g, 0, mid.lines.length > 1 ? 40 : 62, mid.lines.join('\n'), {size: mid.size, leading: 1.05});
  const rowH = Math.min(120, 560 / I.length), ky = cy - (I.length * rowH) / 2;
  const keys = I.map((d, i) => {
    const k = root.append('g').attr('transform', `translate(650 ${ky + i * rowH + rowH / 2})`).append('g');
    k.append('rect').attr('x', 6).attr('y', -22).attr('width', 50).attr('height', 50).attr('fill', C.ink); k.append('rect').attr('x', 0).attr('y', -28).attr('width', 50).attr('height', 50).attr('fill', colors[i % colors.length]).attr('stroke', C.ink).attr('stroke-width', 6);
    const size = Math.min(34, fit(up(d.label), 215, 34, {role: 'slab'})); label(k, 70, -8 + capH(size, {role: 'slab'}) / 2 - 12, d.label, {size, anchor: 'start'});
    shout(k, 70, 40, Math.round(d.value / total * 100) + '%', {size: 40, color: C.white, anchor: 'start'});
    return k;
  });
  return {seek(t) {
    stage.intro(t);
    const sweep = easeInOut(span(t, .45, 1.5)) * Math.PI * 2, out = spring(span(t, 2, .5));
    slices.forEach(s => {
      const end = Math.min(s.a1, sweep), push = s.i === best ? out * 22 + Math.sin(t * 2.5) * 3 * out : 0;
      s.shape.set(end > s.a0 + .04 ? arc({startAngle: s.a0, endAngle: end}) : ''); s.shape.g.attr('transform', `translate(${Math.sin(s.mid) * push} ${-Math.cos(s.mid) * push})`).attr('opacity', end > s.a0 + .04 ? 1 : 0);
    });
    const q = span(t, .6, 1.3); hero.say(counted(Math.round(I[best].value / total * 100), q) + '%').attr('opacity', q > 0 ? 1 : 0); sub.attr('opacity', span(t, 1.6, .2));
    keys.forEach((k, i) => scaleTo(k, spring(span(t, 1 + i * .18, .4)), 0));
  }};
}
