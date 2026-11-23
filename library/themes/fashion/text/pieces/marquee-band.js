import {stage, capH, strip, label, up, flat, leave, fade, glide, span} from '../../kit.js';

// Overlay: a thin ticker. Two hairlines open across the frame and small tracked-out caps travel
// slowly between them; a second line of small print sits under the band. `y` is its middle.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'New this week', sub: 'Out now', y: 1740, height: 84, accent: 'poppy', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, ink} = st, h = props.height, y = props.y, size = h * .36, cap = capH(size, {role: 'bold'});
  const g = root.append('g').attr('filter', st.soft).append('g'), lines = [-1, 1].map(s => g.append('rect').attr('y', y + s * h / 2 - 1).attr('height', 2).attr('fill', '#fff'));
  const run = strip(g, st, up(flat(props.text)) + '   ·', y + cap / 2, size, {role: 'bold', spacing: .16, gap: size * 1.1}), sub = label(g, W / 2, y + h / 2 + 44, props.sub, {size: 19, anchor: 'middle'});
  const spot = g.append('circle').attr('cx', 60).attr('cy', y - h / 2).attr('r', 6).attr('fill', ink.accent);
  return {
    seek(t) {
      const out = leave(t, props.life, .25), q = glide(span(t, 0, .6)) * (1 - out);
      lines.forEach(l => l.attr('x', W / 2 * (1 - q)).attr('width', W * q).attr('opacity', .8)); run.set(t * 60 * props.speed + 140); run.g.attr('opacity', fade(t, .12, .4) * (1 - out));
      sub.attr('opacity', fade(t, .3, .4) * .8 * (1 - out)); spot.attr('opacity', q);
    },
  };
}
