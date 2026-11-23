import {stage, look, C, up, fit, capH, measure, glyphs, settle, txt, clipLive, fade, glide, swell, span, leave} from '../../kit.js';

// Overlay: a title running up one edge of the frame. A paper strip slides in from the side, the
// heavy title settles along it (read bottom to top), and a slimmer strip of the accent colour
// follows with a caps subline. `side` is 'left' or 'right'; `top`/`bottom` bound the strip.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'Behind the scenes', sub: 'Part 02 — uncut', side: 'left', accent: 'leaf', top: 300, bottom: 1560, edge: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, ink = look(props.accent), room = props.bottom - props.top, left = props.side !== 'right', o = {role: 'label'}, flat = s => String(s ?? '').replace(/\n/g, ' ');
  const size = fit(flat(props.text), room - 120, 84), cap = capH(size), bw = cap + 64, sw = 50, ssize = fit(up(flat(props.sub)), room - 120, 24, o);
  // draw as if the strip lay flat along the top edge, then turn it onto the side
  const g = root.append('g').attr('transform', left ? `translate(${props.edge} ${props.bottom}) rotate(-90)` : `translate(${W - props.edge} ${props.top}) rotate(90)`), mask = clipLive(st), body = g.append('g').attr('clip-path', mask.url);
  body.append('rect').attr('width', room).attr('height', bw).attr('fill', C.paper); body.append('rect').attr('y', bw).attr('width', room).attr('height', sw).attr('fill', ink.accent);
  const letters = glyphs(body, flat(props.text), 60, bw / 2 + cap / 2, size, {color: C.ink}), sub = txt(body, 60, bw + sw / 2 + capH(ssize, o) / 2, up(flat(props.sub)), {size: ssize, role: 'label', color: ink.on});
  const dot = body.append('circle').attr('cx', room - 60).attr('cy', bw / 2).attr('r', 11).attr('fill', ink.accent);
  return {
    seek(t) {
      const x = leave(t, props.life), e = swell(span(t, 0, .9)) * (1 - x), s = swell(span(t, .25, .9)) * (1 - x);
      mask.set(0, 0, room, bw * e + sw * s); body.attr('transform', `translate(0 ${-(bw + sw) * (1 - e)})`);
      settle(letters, span(t, .4, 1.3), x, .25); sub.attr('opacity', fade(t, .9, .6)); dot.attr('opacity', fade(t, 1.1, .5));
    },
  };
}
