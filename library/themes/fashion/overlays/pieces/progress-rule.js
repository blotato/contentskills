import {stage, label, txt, leave, fade, glide, span, swell} from '../../kit.js';

// Progress as one hairline: a faint line across the frame, a white line growing along it behind
// an accent dot, small print at the left and (optionally) the figure in thin numerals at the
// right. `to` is the percentage it reaches over `seconds`; `y` is the line.
export const meta = {duration: 3.5, live: true};
export const defaults = {label: 'In progress', done: 'Done', to: 100, seconds: 1.2, showValue: true, x: 110, w: 860, y: 380, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, {x, w, y} = props, g = root.append('g').attr('filter', st.soft).append('g');
  const base = g.append('rect').attr('x', x).attr('y', y - 1).attr('height', 2).attr('fill', '#fff').attr('opacity', .35), fill = g.append('rect').attr('x', x).attr('y', y - 2).attr('height', 4).attr('fill', '#fff'), spot = g.append('circle').attr('cy', y).attr('r', 9).attr('fill', ink.accent);
  const a = label(g, x, y - 34, props.label, {size: 21}), b = label(g, x, y - 34, props.done, {size: 21}), val = txt(g, x + w, y - 28, '', {size: 54, role: 'num', anchor: 'end'}).style('font-variant-numeric', 'tabular-nums');
  return {
    seek(t) {
      const out = leave(t, props.life, .25), open = glide(span(t, 0, .4)) * (1 - out), q = swell(span(t, .15, props.seconds)) * props.to / 100, end = q >= .999 && props.to >= 100 && props.done ? fade(t, .15 + props.seconds, .25) : 0;
      base.attr('width', w * open); fill.attr('width', w * q * (1 - out)); spot.attr('cx', x + w * q).attr('opacity', fade(t, .1, .25) * (1 - out));
      a.attr('opacity', fade(t, .05, .35) * .9 * (1 - out) * (1 - end)); b.attr('opacity', end * .95 * (1 - out)); val.text(props.showValue ? Math.round(q * 100) + '%' : '').attr('opacity', fade(t, .15, .35) * (1 - out));
    },
  };
}
