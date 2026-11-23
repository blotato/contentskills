import {stage, look, C, up, fit, capH, txt, stroke, draw, fade, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// A diary stamp in a corner, straight on the footage: the day in wide caps, a big day number,
// the month in serif italic and the time of day under a short rule. `side` is 'right' or 'left';
// `y` is the top edge.
export const meta = {duration: 4, live: true};
export const defaults = {day: 'Saturday', number: '14', month: 'June', time: 'Golden hour', side: 'right', y: 110, accent: 'sun'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), right = props.side !== 'left', x = right ? 1016 : 64, anchor = right ? 'end' : 'start', y = props.y, dir = right ? -1 : 1;
  const soft = soften(root, st), nsize = fit(String(props.number), 280, 210), cap = capH(nsize);
  const day = txt(soft, x, y + 26, up(props.day), {size: 26, role: 'wide', color: C.cream, anchor});
  const num = txt(soft, x - dir * 4, y + 62 + cap, props.number, {size: nsize, role: 'head', color: C.cream, anchor});
  const month = txt(soft, x, y + 62 + cap + 74, props.month, {size: 70, role: 'serif', color: C.cream, anchor});
  const rule = stroke(soft, `M${x} ${y + cap + 166}h${dir * 120}`, ink.accent, 6), time = txt(soft, x, y + cap + 208, up(props.time), {size: 22, role: 'label', color: C.cream, anchor});
  return {
    seek(t) {
      const out = leave(t, props.life, .5), o = 1 - out;
      day.attr('opacity', fade(t, 0, .5) * o); num.attr('opacity', fade(t, .15, .6) * o).attr('transform', `translate(0 ${(1 - glide(span(t, .15, .9))) * 26})`);
      month.attr('opacity', fade(t, .4, .6) * o).attr('transform', `translate(${(1 - glide(span(t, .4, .9))) * -dir * 24} 0)`);
      draw(rule, glide(span(t, .7, .7)) * o); time.attr('opacity', fade(t, .9, .6) * o);
    },
  };
}
