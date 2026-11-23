import {stage, label, cross, draw, leave, fade, glide, span} from '../../kit.js';

// A hairline frame drawn just inside the edge of the picture, starting from two opposite corners,
// with registration crosses where the lines meet and two pieces of small print sitting on it.
// `inset` is its distance from the edge in px. The footage shows through untouched.
export const meta = {duration: 4, live: true};
export const defaults = {inset: 44, topLabel: 'Look 04', bottomLabel: 'Natural light', accent: 'poppy', crosses: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H, ink} = st, m = props.inset, g = root.append('g').attr('filter', st.soft).append('g'), w = W - m * 2, h = H - m * 2;
  const a = g.append('path').attr('d', `M${m} ${m}H${W - m}V${H - m}`), b = g.append('path').attr('d', `M${W - m} ${H - m}H${m}V${m}`);
  [a, b].forEach(p => p.attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2).attr('opacity', .85));
  const marks = props.crosses ? [[m, m], [W - m, m], [W - m, H - m], [m, H - m]].map(([x, y]) => cross(g, x, y, 14)) : [], spot = g.append('circle').attr('cx', m).attr('cy', m).attr('r', 7).attr('fill', ink.accent);
  const top = label(g, m + 34, m + 46, props.topLabel, {size: 20}), bottom = label(g, W - m - 34, H - m - 30, props.bottomLabel, {size: 20, anchor: 'end'});
  return {
    seek(t) {
      const x = leave(t, props.life, .3), q = glide(span(t, 0, .9)) * (1 - x);
      draw(a, q); draw(b, q); marks.forEach((c, i) => c.attr('opacity', fade(t, .2 + i * .08, .3) * (1 - x))); spot.attr('opacity', fade(t, .5, .3) * (1 - x));
      top.attr('opacity', fade(t, .35, .4) * .9 * (1 - x)); bottom.attr('opacity', fade(t, .5, .4) * .9 * (1 - x));
    },
  };
}
