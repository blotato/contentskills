import {stage, C, up, fit, capH, glyphs, rise, tag, hand, strip, stroke, loops, squiggle, cornerLabels, draw, fade, glide, swell, span, drift} from '../../kit.js';

// The sign-off: the closing lines rise into the middle, a brushed loop draws above them, the
// call to action arrives in an ink pill, the handle writes itself on by hand with a wavy
// underline, and a band in the accent colour slides up along the bottom carrying a slow marquee.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  lines: ['SEE YOU', 'SOON'], action: 'New film every Sunday', handle: '@yourname', strip: 'Thanks for staying',
  labels: ['The end', 'For now'], accent: 'leaf',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, m = 90, lines = props.lines.map(up), bandH = 130, flat = s => String(s ?? '').replace(/\n/g, ' ');
  const size = Math.min(fit(lines, W - m * 2, 300), H * .3 / (lines.length * capH(1) * 1.12)), cap = capH(size), pitch = cap * 1.12, block = lines.length * pitch - (pitch - cap), top = (H - bandH) / 2 - block / 2 - 40;
  const group = root.append('g'), rows = lines.map((line, i) => glyphs(group, line, W / 2, top + cap + i * pitch, size, {anchor: 'middle'}));
  const mark = stroke(root.append('g').attr('transform', `translate(${W / 2} ${top - 100})`), loops(190, 100), ink.accent, 12);
  const action = tag(root, W / 2, top + block + 90, flat(props.action), {fill: C.ink, size: Math.min(30, fit(up(flat(props.action)), W - m * 2 - 80, 30, {role: 'label'})), anchor: 'middle'});
  const hsize = Math.min(110, fit(props.handle, W - m * 2, 110, {role: 'hand'})), handle = hand(root, st, W / 2, top + block + 240, props.handle, {size: hsize, anchor: 'middle', rot: -3}), under = stroke(root, squiggle(W / 2 - handle.w / 2, top + block + 268, handle.w, 9, 5, 4), ink.accent, 7);
  const band = root.append('g'); band.append('rect').attr('x', -10).attr('y', H - bandH).attr('width', W + 20).attr('height', bandH + 10).attr('fill', ink.accent);
  const run = strip(band, st, up(flat(props.strip)), H - bandH / 2 + capH(54) / 2, 54, {color: ink.on, sepColor: C.cream}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      rows.forEach((row, i) => row.forEach(u => rise(u, t - (.3 + i * .22 + u.i * .05), {dist: .7, length: .9})));
      group.attr('transform', `translate(${W / 2} ${top + block / 2}) scale(${drift(t, .04)}) translate(${-W / 2} ${-(top + block / 2)})`);
      draw(mark, glide(span(t, .1, 1.4)));
      action.g.attr('opacity', fade(t, 1.2, .5)).attr('transform', `translate(0 ${(1 - glide(span(t, 1.2, .8))) * 22})`);
      handle.set(glide(span(t, 1.7, 1.1))); draw(under, glide(span(t, 2.5, .8)));
      band.attr('transform', `translate(0 ${(1 - swell(span(t, .6, 1))) * (bandH + 10)})`); run.set(t * 46 + 200); corners.set(t, .7);
    },
  };
}
