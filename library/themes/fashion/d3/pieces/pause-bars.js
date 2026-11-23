import {C, card, txt, label, rule, fade, glide, span, swell, mix} from '../../kit.js';
import {hold} from './_local.js';

// Every pause that was cut from a recording, as bars in the order they happened: height is the length
// of the pause. They rise fast, the longest take the accent and their figures, and the total counts up
// beside them in thin tall numerals. With `use: 'project'` the pauses are the real ones from this video's
// edit decision list; otherwise pass `pauses` (seconds each) and say so if they are illustrative.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Dead air, cut', unit: 'Illustrative · seconds per pause', clear: false, field: 'bone', accent: 'poppy', use: '', top: 3, note: 'pauses cut', suffix: ' s', step: .035,
  pauses: [2.1, 3.4, 1.2, .6, 4.8, 2.2, .9, 3.1, 1.7, 6.2]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, d3 = window.d3, edl = props.use === 'project' ? props.project?.edl : null;
  const data = (edl ? edl.pauses.map(p => p.to - p.from) : props.pauses).map((v, i) => ({v, i})), n = data.length, total = d3.sum(data, d => d.v);
  const x = d3.scaleBand().domain(data.map(d => d.i)).range([90, 910]).paddingInner(.34), y = d3.scaleLinear().domain([0, d3.max(data, d => d.v)]).range([0, 330]), base = 850;
  const hot = new Set([...data].sort((a, b) => b.v - a.v).slice(0, props.top).map(d => d.i));
  const num = txt(g, 90, 420, '', {size: 190, role: 'num', color: ink.accent}).style('font-variant-numeric', 'tabular-nums'), count = txt(g, 910, 340, '', {size: 120, role: 'num', color: ink.head, anchor: 'end'}), note = label(g, 910, 392, props.note, {size: 28, color: ink.head, anchor: 'end'});
  const floor = rule(g, 90, base, 820, ink.line, 2), bars = data.map(d => ({d, hot: hot.has(d.i), bar: g.append('rect').attr('x', x(d.i)).attr('width', x.bandwidth()).attr('fill', hot.has(d.i) ? ink.accent : ink.head),
    tag: hot.has(d.i) ? txt(g, x(d.i) + x.bandwidth() / 2, 0, d.v.toFixed(1), {size: 42, role: 'num', color: ink.head, anchor: 'middle'}) : null}));
  const ends = [label(g, 90, base + 50, 'start of the take', {size: 22, color: ink.dim}), label(g, 910, base + 50, 'end', {size: 22, color: ink.dim, anchor: 'end'})], scan = g.append('rect').attr('y', base - 350).attr('width', 3).attr('height', 350).attr('fill', ink.accent);
  return {seek(t) {
    hold(st, t); floor.set(glide(span(t, .05, .4))); floor.node.attr('opacity', .6);
    let shown = 0, risen = 0;
    bars.forEach(({d, bar, tag}, i) => { const at = .12 + i * props.step, e = glide(span(t, at, .32)), h = y(d.v) * e; bar.attr('y', base - h).attr('height', h); shown += d.v * e; risen += t >= at ? 1 : 0;
      tag?.attr('y', base - h - 14).attr('opacity', fade(t, at + .12, .18)); });
    num.text(shown.toFixed(1) + props.suffix).attr('opacity', fade(t, .05, .15)); count.text(risen).attr('opacity', fade(t, .1, .15)); note.attr('opacity', fade(t, .2, .2)); ends.forEach(e => e.attr('opacity', fade(t, .3, .3)));
    const q = span(t, .1, n * props.step + .3); scan.attr('x', mix(90, 910, swell(q))).attr('opacity', q > 0 && q < 1 ? .9 : 0);
  }};
}
