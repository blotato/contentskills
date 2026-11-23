import {C, card, txt, label, rule, dot, comma, fit, fade, glide, span, swell, clipLive} from '../../kit.js';
import {hold} from './_local.js';

// The pulse of an edit: changes per second across the whole clip as one filled line drawn left to
// right, the busiest second marked, the average in thin tall numerals, and under it a row of counts.
// With `use: 'project'` everything is counted from this very storyboard (cuts, zooms, effects,
// transitions, layout moves, graphics and their cues; see authoredEvents in pipeline/timeline.js) so it is
// always true of the video it appears in. Otherwise pass `values` (per second) and `counts`, and say if illustrative.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'This edit', unit: 'Illustrative · changes per second', clear: false, field: 'bone', accent: 'poppy', use: '', note: 'changes a second', show: ['cuts', 'graphics', 'transitions', 'sounds'], drawFor: .7,
  values: [3, 1, 2, 2, 3, 2, 1, 3, 2, 2, 3, 4, 2, 2, 3, 2, 1, 2, 3, 2], counts: [{label: 'cuts', value: 12}, {label: 'graphics', value: 30}, {label: 'transitions', value: 10}, {label: 'sounds', value: 60}]};

const NAMES = {cuts: ['jump cuts', p => p.edl?.cuts], graphics: ['graphics', p => p.graphics], effects: ['effects', p => p.effects], transitions: ['transitions', p => p.transitions], sounds: ['sounds', p => p.sounds], layouts: ['layout moves', p => p.layouts], zooms: ['punch-ins', p => p.zooms]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, d3 = window.d3, P = props.use === 'project' ? props.project : null;
  const values = P?.pace ?? props.values, n = values.length, avg = P ? P.changes / P.duration : d3.mean(values), counts = P ? props.show.map(k => NAMES[k] && {label: NAMES[k][0], value: NAMES[k][1](P)}).filter(c => c && c.value != null) : props.counts;
  const x = d3.scaleLinear().domain([0, n - 1]).range([90, 910]), y = d3.scaleLinear().domain([0, Math.max(1, d3.max(values))]).range([640, 420]), peak = values.indexOf(d3.max(values));
  const num = txt(g, 90, 372, '', {size: 150, role: 'num', color: ink.accent}).style('font-variant-numeric', 'tabular-nums'), note = label(g, 910, 300, props.note, {size: 30, color: ink.head, anchor: 'end'}), sub = label(g, 910, 340, `${n} s  ·  busiest second ${values[peak]}`, {size: 22, color: ink.dim, anchor: 'end'});
  const clip = clipLive(st), body = g.append('g').attr('clip-path', clip.url), curve = d3.curveMonotoneX;
  body.append('path').attr('d', d3.area().x((d, i) => x(i)).y0(640).y1(d => y(d)).curve(curve)(values)).attr('fill', ink.accent).attr('opacity', .2);
  body.append('path').attr('d', d3.line().x((d, i) => x(i)).y(d => y(d)).curve(curve)(values)).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 7).attr('stroke-linejoin', 'round');
  const floor = rule(g, 90, 640, 820, ink.line, 2), head = g.append('rect').attr('y', 410).attr('width', 3).attr('height', 230).attr('fill', ink.head), mark = dot(g, x(peak), y(values[peak]), 13, ink.head);
  const ends = [label(g, 90, 676, '0 s', {size: 17, color: ink.dim}), label(g, 910, 676, `${n} s`, {size: 17, color: ink.dim, anchor: 'end'})];
  const cw = 820 / counts.length, size = Math.min(110, ...counts.map(c => fit(comma(c.value), cw - 30, 110, {role: 'num'}))), cells = counts.map((c, i) => ({c, cell: g.append('g'), at: props.drawFor * .5 + i * .1})).map(o => {
    const cx = 90 + cw * counts.indexOf(o.c); if (counts.indexOf(o.c)) o.cell.append('rect').attr('x', cx - 14).attr('y', 730).attr('width', 2).attr('height', 150).attr('fill', ink.line).attr('opacity', .2);
    o.num = txt(o.cell, cx, 830, '', {size, role: 'num', color: ink.head}).style('font-variant-numeric', 'tabular-nums'); label(o.cell, cx + 2, 874, o.c.label, {size: Math.min(24, fit(String(o.c.label).toUpperCase(), cw - 30, 24 * 1.18, {role: 'label'}) / 1.18), color: ink.head}); return o; });
  return {seek(t) {
    hold(st, t); const q = swell(span(t, .1, props.drawFor)); floor.set(glide(span(t, .05, .4))); floor.node.attr('opacity', .6);
    clip.set(80, 380, 840 * q + 4, 300); head.attr('x', 90 + 820 * q).attr('opacity', q > 0 && q < 1 ? 1 : 0); mark.attr('opacity', fade(t, .1 + props.drawFor * peak / n, .12));
    num.text((avg * glide(span(t, .1, props.drawFor))).toFixed(1)).attr('opacity', fade(t, .05, .15)); note.attr('opacity', fade(t, .15, .2)); sub.attr('opacity', fade(t, .1 + props.drawFor, .25)); ends.forEach(e => e.attr('opacity', fade(t, .3, .3)));
    cells.forEach(({c, cell, num, at}) => { num.text(comma(c.value * glide(span(t, at, .5)))); cell.attr('opacity', fade(t, at - .04, .15)); });
  }};
}
