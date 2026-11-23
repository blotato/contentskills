import {stage, look, C, FRAME, up, fit, txt, pill, fade, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// "Part 2 of 5": a row of dots along the top where the current one stretches into a pill of the
// accent colour, with a caps label and a serif-italic section name. Pass `from` to animate the
// step change from an earlier part. `y` is the middle of the row.
export const meta = {duration: 4, live: true};
export const defaults = {current: 2, total: 5, from: 1, label: 'Part', name: 'the kitchen shelf', y: 130, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), W = FRAME.width, y = props.y, n = props.total, d = 22, gap = 20, long = 86, total = (n - 1) * (d + gap) + long, x0 = W / 2 - total / 2;
  const soft = soften(root, st), dots = Array.from({length: n}, () => soft.append('path'));
  const label = txt(soft, W / 2, y - 44, `${up(props.label)} ${props.current} / ${n}`, {size: 23, role: 'wide', color: C.cream, anchor: 'middle'});
  const name = txt(soft, W / 2, y + 78, props.name, {size: fit(props.name, 900, 50, {role: 'serif'}), role: 'serif', color: C.cream, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .5), q = glide(span(t, .6, .9)), pos = (props.from ?? props.current) + (props.current - (props.from ?? props.current)) * q - 1; let x = x0;
      dots.forEach((dot, i) => { const k = Math.max(0, 1 - Math.abs(i - pos)), w = d + (long - d) * k, grow = glide(span(t, .05 + i * .07, .6));
        dot.attr('d', pill(x + w / 2 - w / 2 * grow, y - d / 2 * grow, w * grow, d * grow)).attr('fill', k > .5 ? ink.accent : C.cream).attr('fill-opacity', k > .5 ? 1 : .55 + .45 * (i < pos ? 1 : 0)); x += w + gap; });
      soft.attr('opacity', 1 - out); label.attr('opacity', fade(t, .3, .5)); name.attr('opacity', fade(t, .8, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .8, .8))) * 14})`);
    },
  };
}
