import {stage, look, C, up, fit, capH, measure, glyphs, settle, txt, sheet, clipLive, stroke, loops, draw, fade, glide, span, leave} from '../../kit.js';

// Overlay: a name plate. A paper slip slides out from the left edge, the name settles onto it
// (tracking wide to tight), the role follows in wide caps on a strip of the accent colour and a
// brushed loop draws at the end. `y` is the top edge.
export const meta = {duration: 4, live: true};
export const defaults = {name: 'Maya Lindqvist', role: 'Morning person, mostly', y: 1500, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), y = props.y, x0 = 64, h = 132, o = {role: 'label'};
  const size = fit(props.name, 760, 82), cap = capH(size), w = measure(props.name, size) + 96, rsize = fit(up(props.role), 700, 27, o), rw = measure(up(props.role), rsize, o) + 56;
  const slide = root.append('g'), mask = clipLive(st), body = slide.append('g').attr('clip-path', mask.url).attr('filter', null);
  sheet(body, -20, y, x0 + w + 20, h, {radius: 0}); const letters = glyphs(body, props.name, x0, y + h / 2 + cap / 2, size, {color: C.ink});
  const sub = root.append('g'), subMask = clipLive(st), strip = sub.append('g').attr('clip-path', subMask.url);
  strip.append('rect').attr('x', x0).attr('y', y + h).attr('width', rw).attr('height', 62).attr('fill', ink.accent);
  txt(strip, x0 + 28, y + h + 31 + capH(rsize, o) / 2, up(props.role), {size: rsize, role: 'label', color: ink.on});
  const mark = stroke(root.append('g').attr('transform', `translate(${Math.min(980, x0 + w + 70)} ${y + h / 2})`), loops(110, 70), ink.accent, 9).attr('filter', st.soft);
  return {
    seek(t) {
      const x = leave(t, props.life), e = glide(span(t, 0, .8)) * (1 - x);
      mask.set(-20, y - 10, (x0 + w + 20) * e, h + 20); settle(letters, span(t, .2, 1.1), x, .35);
      subMask.set(x0, y + h, rw * glide(span(t, .55, .7)) * (1 - x), 62);
      draw(mark, glide(span(t, .9, 1.0)) * (1 - x)); mark.attr('opacity', 1 - x);
    },
  };
}
