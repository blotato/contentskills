import {stage, look, C, up, capH, strip, fade, swell, span, leave} from '../../kit.js';

// Overlay: a paper band across the frame carrying a slow marquee of the text in heavy ink, with
// a slim band of the accent colour under it running the subline the other way. Both slide in
// from opposite sides. `y` is the top of the band, `height` its height, `speed` scales travel.
export const meta = {duration: 5, live: true};
export const defaults = {text: 'New this week', sub: 'Out now', y: 1740, height: 120, accent: 'leaf', tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, ink = look(props.accent), h = props.height, h2 = h * .42, flat = s => up(s).replace(/\n/g, ' ');
  const g = root.append('g').attr('transform', `translate(${W / 2} ${props.y}) rotate(${props.tilt || 0}) translate(${-W / 2} 0)`), a = g.append('g'), b = g.append('g');
  a.append('rect').attr('x', -60).attr('width', W + 120).attr('height', h).attr('fill', C.paper); b.append('rect').attr('x', -60).attr('y', h).attr('width', W + 120).attr('height', h2).attr('fill', ink.accent);
  const size = h * .5 / capH(1), main = strip(a, st, flat(props.text), h / 2 + capH(size) / 2, size, {color: C.ink, sepColor: ink.accent}), ssize = h2 * .42 / capH(1, {role: 'label'});
  const sub = strip(b, st, flat(props.sub), h + h2 / 2 + capH(ssize, {role: 'label'}) / 2, ssize, {color: ink.on, role: 'label', sepColor: ink.on});
  return {
    seek(t) {
      const x = leave(t, props.life, .6), e = swell(span(t, 0, .9)) * (1 - x), e2 = swell(span(t, .2, .9)) * (1 - x);
      a.attr('transform', `translate(${-(W + 140) * (1 - e)} 0)`); b.attr('transform', `translate(${(W + 140) * (1 - e2)} 0)`);
      main.set((t * 60 + 300) * props.speed); sub.set(-(t * 34 + 100) * props.speed);
    },
  };
}
