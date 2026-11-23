import {C, stage, txt, draw, measure, leave, fade, glide, span, mix} from '../../kit.js';
import {inks, pointer, pressed, check} from './_ui.js';

// One button, pressed: the pointer glides in and presses it at `pressAt`; the button takes the accent, its
// label changes and a tick is drawn. For "hit follow". (x, y) is the button's centre; `from` is where the
// pointer comes from, relative to it (keep its path off the face).
export const meta = {duration: 3, live: true};
export const defaults = {label: 'Follow', done: 'Following', pressAt: .7, from: [330, 330], x: 540, y: 1300, size: 62, theme: 'ink', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, size} = props, a = props.label.toUpperCase(), b = props.done.toUpperCase();
  const wa = measure(a, size, {role: 'wide'}) + size * 2.2, wb = measure(b, size, {role: 'wide'}) + size * 3.3, h = size * 2.3, g = st.root.append('g'), btn = g.append('g');
  const face = btn.append('rect').attr('rx', h / 2).attr('y', -h / 2).attr('height', h).attr('filter', st.lift), ta = txt(btn, 0, size * .36, a, {size, role: 'wide', color: props.theme === 'bone' ? C.white : C.ink, anchor: 'middle'}), tb = txt(btn, size * .55, size * .36, b, {size, role: 'wide', color: C.white, anchor: 'middle'});
  const tick = check(btn, -wb / 2 + size * .62, -size * .52, size * 1.02, C.white, 7), hand = pointer(g, st, {accent: props.theme === 'bone' ? st.ink.accent : C.white});
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .34)), at = props.pressAt, q = glide(span(t, at, .28)), w = mix(wa, wb, q);
      g.attr('opacity', fade(t, 0, .14) * (1 - out)); btn.attr('transform', `translate(${x} ${y + (1 - into) * 60}) scale(${(1 - .07 * pressed(t, at)) * mix(1, 1.06, q)})`);
      face.attr('x', -w / 2).attr('width', w).attr('fill', t >= at ? st.ink.accent : props.theme === 'bone' ? C.ink : C.white);
      ta.attr('opacity', t >= at ? 0 : 1); tb.attr('opacity', fade(t, at + .04, .14)); draw(tick, glide(span(t, at + .1, .28)));
      hand.set(t, [{t: at - .55, x: x + props.from[0], y: y + props.from[1]}, {t: at - .04, x: x + wa * .22, y: y + 14, move: .42}, {t: at + .5, x: x + wa * .22, y: y + 14}, {t: at + 1, x: x + props.from[0] * .8, y: y + props.from[1] * .7, move: .5}], [at], 1 - fade(t, at + .6, .3));
    },
  };
}
