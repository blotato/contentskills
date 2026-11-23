import {C, stage, plate, tone, brush, span, settle, leave, presence} from '../../kit.js';

// Introduces the speaker: the theme's stacked caption. An optional year on a charcoal box, the name
// on a bar and the role on a dark strip, wiping on one after another over a short brush stroke.
// `y` is the centre line of the name bar (as in other themes); `x` the left edge.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'ALEX RIVERA', role: 'KEEPER OF THE ARCHIVE', date: '', x: 64, y: 1740, color: 'crimson', second: 'char'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, g = root.append('g');
  const p = plate(g, {date: props.date, name: props.name, sub: props.role, fill: tone(props.color), scale: 1.2}), nameRow = p.rows[props.date ? 1 : 0] ?? p.rows[0];
  if (p.w > 1030 - props.x) p.g.attr('transform', `scale(${(1030 - props.x) / p.w})`);
  const smear = brush(g.insert('g', ':first-child'), -34, nameRow.y - 8, Math.min(520, p.w * .8), 50, {seed: 5, color: C.blood, opacity: .85});
  return {seek(t) {
    const x = leave(t, props.life); root.attr('opacity', presence(t, props.life));
    g.attr('transform', `translate(${props.x + 5 * t} ${props.y - nameRow.y + 30 * x})`); smear.reveal(settle(span(t, 0, .6))); p.reveal(t, .15);
  }};
}
