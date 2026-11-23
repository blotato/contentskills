import {C, F, stage, torn, rule, txt, bar, brush, tone, span, mix, easeInOut, settle} from '../../kit.js';
import {live, float} from './_overlay.js';

// A timeline rule across the top of the picture: decade ticks with years, and a crimson marker that
// travels from `start` to `at` while the year above it counts. A label wipes on underneath.
// (x, y) is the left end of the rule; w its length.
export const meta = {duration: 5, live: true};
export const defaults = {from: 1900, to: 1950, step: 10, start: 1900, at: 1931, label: 'THE YEAR EVERYTHING CHANGED', seconds: 2.2, x: 90, y: 300, w: 900, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), {w, from, to} = props, X = v => (v - from) / (to - from) * w, fill = tone(props.color);
  const back = g.append('path').attr('d', torn(-46, -150, w + 92, 236, {seed: 4, rough: 5, step: 24})).attr('fill', C.char).attr('opacity', .86);
  const smear = brush(g, -60, 62, w * .5, 22, {seed: 3, color: C.blood, opacity: .8}), ticks = g.append('g');
  rule(ticks, 0, 0, w, {tickH: 16, width: 3});
  for (let v = from; v <= to + 1e-6; v += props.step) { ticks.append('path').attr('d', `M${X(v)} -12v24`).attr('stroke', C.bone).attr('stroke-width', 2.5); txt(ticks, X(v), 52, String(v), {size: 28, anchor: 'middle', color: C.silver, weight: 500, spacing: .04}); }
  for (let v = from; v < to; v += props.step / 5) ticks.append('path').attr('d', `M${X(v)} -6v12`).attr('stroke', C.bone).attr('stroke-width', 1.2).attr('opacity', .6);
  const trail = g.append('path').attr('stroke', C.crimson).attr('stroke-width', 7), mark = g.append('g');
  mark.append('path').attr('d', 'M0 -20V20').attr('stroke', C.red).attr('stroke-width', 5); mark.append('path').attr('d', 'M-13 -34H13L0 -18Z').attr('fill', C.red);
  const box = g.append('g'); box.append('path').attr('d', torn(-92, -122, 184, 84, {seed: 2, rough: 3, step: 10, sides: 'rl'})).attr('fill', C.crimson);
  const year = txt(box, 0, -58, '', {size: 66, anchor: 'middle', weight: 700, spacing: .02});
  const label = props.label ? bar(g, props.label, {size: 34, fill: 'glass', seed: 6}) : null; label?.g.attr('transform', `translate(${Math.max(0, w - label.w)} 124)`);
  return {seek(t) {
    const x = live(st, t, props), q = easeInOut(span(t, .7, props.seconds)), v = mix(props.start, props.at, q), mx = Math.max(60, Math.min(w - 60, X(v)));
    g.attr('transform', float(t, x, props.x, props.y, {dx: 0, dy: 0})); back.attr('opacity', .86 * span(t, 0, .4)); smear.reveal(settle(span(t, .1, .7)));
    ticks.attr('opacity', span(t, .15, .5)); trail.attr('d', `M${X(props.start)} 0H${X(v)}`).attr('opacity', span(t, .6, .2));
    mark.attr('transform', `translate(${X(v)} 0)`).attr('opacity', span(t, .45, .35)); box.attr('transform', `translate(${mx} 0)`).attr('opacity', span(t, .45, .35)); year.text(String(Math.round(v)));
    label?.reveal(span(t, .9 + props.seconds, .8));
  }};
}
