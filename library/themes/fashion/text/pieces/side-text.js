import {stage, label, measure, up, flat, fit, leave, fade, glide, span} from '../../kit.js';

// Overlay: small print running up the side of the frame, like the edge marking of a film strip:
// a hairline draws along the edge and the text fades up beside it, with a dimmer second line.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'Behind the scenes', sub: 'Part 02 — uncut', side: 'left', accent: 'poppy', top: 300, bottom: 1560, edge: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, ink} = st, room = props.bottom - props.top, left = props.side !== 'right', o = {role: 'label'};
  const size = fit(up(flat(props.text)), room - 80, 28, o), x = left ? 46 + props.edge : W - 46 - props.edge, mid = (props.top + props.bottom) / 2;
  const g = root.append('g').attr('filter', st.soft).append('g').attr('transform', `translate(${x} ${mid}) rotate(${left ? -90 : 90})`);
  const line = g.append('rect').attr('y', -22).attr('height', 2).attr('fill', '#fff'), spot = g.append('circle').attr('cy', -21).attr('r', 6).attr('fill', ink.accent);
  const a = label(g, 0, 14, props.text, {size, anchor: 'middle'}), b = label(g, 0, 50, props.sub, {size: Math.min(18, size * .7), anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25), q = glide(span(t, 0, .7)) * (1 - out);
      line.attr('x', -room / 2 * q).attr('width', room * q).attr('opacity', .7); spot.attr('cx', -room / 2 * q).attr('opacity', q);
      a.attr('opacity', fade(t, .15, .4) * (1 - out)); b.attr('opacity', fade(t, .3, .4) * .7 * (1 - out));
    },
  };
}
