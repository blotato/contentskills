import {C, stage, tone, fillOf, sheet, stamp, tape, span, settle, leave, presence} from '../../kit.js';

// A round archive stamp struck onto a torn paper slip on the picture: one or two short words across
// the middle and a line of small text round the ring. The slip slides in, then the stamp presses
// on, large and faint to exact. (x, y) is its centre, `r` its radius.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NEW', ring: 'LIMITED RUN', x: 850, y: 340, r: 160, color: 'crimson', tilt: -12};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, r = props.r, f = tone(props.color), ink = f === 'bone' || f === 'glass' ? C.crimson : f === 'char' ? '#15181d' : f === 'steel' ? '#2c4a70' : fillOf(f), g = root.append('g'), slip = g.append('g');
  sheet(slip, -r * 1.14, -r * 1.14, r * 2.28, r * 2.28, {fill: C.bone, seed: 4, rough: 7, wear: .3}); tape(slip, r * .9, r * .26, {seed: 2}).attr('transform', `translate(${-r * .3} ${-r * 1.14}) rotate(-5)`);
  const mark = slip.append('g'), s = stamp(mark.append('g'), r * .92, {ring: props.ring || props.text, word: props.text, color: ink, seed: 3});
  return {seek(t) {
    const x = leave(t, props.life), e = settle(span(t, 0, .8)), q = span(t, .6, .2); root.attr('opacity', presence(t, props.life));
    g.attr('transform', `translate(${props.x - 3 * t} ${props.y + 22 * (1 - e) + 30 * x}) rotate(${props.tilt + .2 * t})`);
    mark.attr('transform', `rotate(${6 + (1 - settle(q)) * 4}) scale(${1.5 - .5 * settle(q)})`).attr('opacity', Math.min(1, q * 3));
  }};
}
