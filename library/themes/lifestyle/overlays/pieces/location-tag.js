import {stage, look, C, up, fit, measure, capH, txt, pill, pinPath, glyphs, settle, stroke, draw, fade, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// Where this is: a pin drops gently, a paper pill slides out beside it with the place name
// settling into it, and a caps caption line (region, coordinates, time of day) fades up below
// with a thin dotted leader. (`x`, `y`) is the left-middle of the pill.
export const meta = {duration: 4.5, live: true};
export const defaults = {place: 'Harbour steps', caption: 'Old town · 8:40 am', x: 64, y: 180, accent: 'clay'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y} = props, size = fit(props.place, 720, 50, {role: 'soft'}), o = {role: 'soft'}, h = 96, w = measure(props.place, size, o) + 150;
  const g = root.append('g'), body = g.append('g').attr('filter', st.lift), plate = body.append('path').attr('fill', C.paper);
  const letters = glyphs(g, props.place, x + 104, y + capH(size, o) / 2, size, {color: C.ink, role: 'soft'});
  const pin = g.append('g'), mark = pin.append('path').attr('d', pinPath(19)).attr('fill', ink.accent).attr('fill-rule', 'evenodd'), ring = g.append('ellipse').attr('cx', x + 52).attr('cy', y + 30).attr('rx', 16).attr('ry', 5).attr('fill', C.ink).attr('opacity', .18);
  const soft = soften(root, st), lead = stroke(soft, `M${x + 52} ${y + h / 2 + 18}v34`, C.cream, 4).attr('stroke-dasharray', '2 10');
  const cap = txt(soft, x + 78, y + h / 2 + 52, up(props.caption), {size: fit(up(props.caption), 1040 - x - 78, 23, {role: 'label'}), role: 'label', color: C.cream});
  return {
    seek(t) {
      const out = leave(t, props.life, .5), e = glide(span(t, .15, .9)), ww = Math.max(h, w * e);
      g.attr('opacity', fade(t, 0, .35) * (1 - out)); plate.attr('d', pill(x, y - h / 2, ww, h));
      const d = glide(span(t, 0, .8)), bob = Math.sin(t * 1.6) * 3 * d;
      pin.attr('transform', `translate(${x + 52} ${y + 28 - (1 - d) * 70 + bob})`); ring.attr('opacity', .18 * d).attr('rx', 16 - bob);
      settle(letters, span(t, .45, 1.0), out, .3);
      lead.attr('opacity', fade(t, 1.0, .4) * (1 - out)); cap.attr('opacity', fade(t, 1.1, .6) * (1 - out)).attr('transform', `translate(${(1 - glide(span(t, 1.1, .8))) * -18} 0)`);
    },
  };
}
