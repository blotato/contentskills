import {C, stage, plate, brush, rule, tone, span, settle} from '../../kit.js';
import {live, float} from './_overlay.js';

// Sets the scene in time and place: a year on a charcoal box, the place on a crimson bar and a note
// on a dark strip, wiping on over a dry brush stroke beneath a short measuring rule. (x, y) is the
// top-left of the stack; align 'right' hangs it from the right edge at x.
export const meta = {duration: 4, live: true};
export const defaults = {date: '1962', place: 'A SMALL RIVER TOWN', note: 'Early spring', x: 64, y: 170, align: 'left', color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), right = props.align === 'right', sgn = right ? -1 : 1;
  const smear = brush(g, right ? -470 : -30, 34, 500, 60, {seed: 8, color: C.blood, opacity: .85, from: right ? 'right' : 'left'});
  const p = plate(g, {date: props.date, name: props.place, sub: props.note, fill: tone(props.color), align: props.align, scale: 1.2}), line = g.append('g'), room = (right ? props.x : 1080 - props.x) - 50;
  if (p.w > room) p.g.attr('transform', `scale(${room / p.w})`);
  rule(line, 0, -26, sgn * Math.max(180, p.w * .8), {every: sgn * 40, tickH: 9, width: 2.5});
  return {seek(t) {
    const x = live(st, t, props); g.attr('transform', float(t, x, props.x, props.y, {dx: 5 * sgn}));
    smear.reveal(settle(span(t, 0, .7))); line.attr('opacity', span(t, .1, .5) * .9); p.reveal(t, .2);
  }};
}
