import {stage, look, C, FRAME, up, fit, measure, capH, txt, comma, stroke, squiggle, draw, fade, glide, span, leave, drift} from '../../kit.js';
import {soften} from './_local.js';

// A big number for the figure just spoken, set straight on the footage: it counts up on a long
// ease and settles, with a wide-caps label above, a serif-italic unit beside it and a brushed
// underline. `y` is the baseline of the number; `seconds` how long the count takes.
export const meta = {duration: 4, live: true};
export const defaults = {value: 5, from: 0, prefix: '', suffix: '', unit: 'minutes', label: 'All it takes', seconds: 1.2, decimals: 0, y: 400, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), W = FRAME.width, y = props.y, show = v => props.prefix + (props.decimals ? v.toFixed(props.decimals) : comma(v)) + props.suffix;
  const final = show(props.value), usize = 70, uw = props.unit ? measure(props.unit, usize, {role: 'serif'}) + 26 : 0, size = fit(final, W - 260 - uw, 250), nw = measure(final, size), cap = capH(size), x0 = W / 2 - (nw + uw) / 2;
  const soft = soften(root, st), g = soft.append('g');
  const label = txt(g, W / 2, y - cap - 44, up(props.label), {size: 27, role: 'wide', color: C.cream, anchor: 'middle'});
  const num = txt(g, x0 + nw, y, '', {size, role: 'head', color: C.cream, anchor: 'end'}).style('font-variant-numeric', 'tabular-nums');
  const unit = txt(g, x0 + nw + 26, y, props.unit, {size: usize, role: 'serif', color: C.cream}), line = stroke(g, squiggle(W / 2 - 110, y + 58, 220, 10, 4, 6), ink.accent, 8);
  return {
    seek(t) {
      const out = leave(t, props.life, .5), q = glide(span(t, .25, props.seconds));
      g.attr('transform', `translate(${W / 2} ${y - cap / 2}) scale(${drift(t, .04)}) translate(${-W / 2} ${-(y - cap / 2)})`); soft.attr('opacity', 1 - out);
      label.attr('opacity', fade(t, 0, .5)); num.text(show(props.from + (props.value - props.from) * q)).attr('opacity', fade(t, .15, .5)).attr('transform', `translate(0 ${(1 - glide(span(t, .15, .9))) * 30})`);
      unit.attr('opacity', fade(t, .6, .6)).attr('transform', `translate(${(1 - glide(span(t, .6, .8))) * -20} 0)`); draw(line, glide(span(t, .25 + props.seconds * .7, .8)));
    },
  };
}
