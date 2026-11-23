import {stage, up, fit, capH, glyphs, rise, txt, wallpaper, cornerLabels, stroke, squiggle, draw, fade, glide, span, drift} from '../../kit.js';

// The theme's headline card. Giant outlined letters drift past as wallpaper; the headline rises
// into the middle letter by letter (softly, no bounce) under a serif-italic kicker, a brushed
// underline draws beneath it and small labels sit in the corners. `lines` are 1-3 short lines.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['SLOW', 'MORNINGS'], kicker: 'a little guide to', note: 'Five small rituals worth keeping',
  labels: ['Vol. 01', 'Everyday notes'], foot: ['Take your time', 'No. 26'], word: '', accent: 'leaf',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, under, W, H, ink} = st, lines = props.lines.map(up), m = 90, flat = s => String(s ?? '').replace(/\n/g, ' ');
  const size = Math.min(fit(lines, W - m * 2, 300), H * .34 / (lines.length * capH(1) * 1.12)), cap = capH(size), pitch = cap * 1.12, top = H * .5 - (lines.length * pitch - (pitch - cap)) / 2;
  const big = Math.min(H * .3, 520), walls = [.2, .86].map((f, i) => wallpaper(under, st, props.word || lines[i % lines.length], H * f + capH(big) / 2, big, {speed: i ? -22 : 30}));
  const group = root.append('g').attr('transform', `translate(${W / 2} ${H / 2})`).append('g'), inner = group.append('g').attr('transform', `translate(${-W / 2} ${-H / 2})`);
  const rows = lines.map((line, i) => glyphs(inner, line, W / 2, top + cap + i * pitch, size, {anchor: 'middle', color: ink.head}));
  const ksize = fit(flat(props.kicker), W - m * 2, 70, {role: 'serif'}), kicker = txt(inner, W / 2, top - 54, flat(props.kicker), {size: ksize, role: 'serif', anchor: 'middle', color: ink.soft});
  const bottom = top + lines.length * pitch - (pitch - cap), line = stroke(inner, squiggle(W / 2 - 150, bottom + 62, 300, 12, 4, 2), ink.accent, 9);
  const note = txt(inner, W / 2, bottom + 150, up(flat(props.note)), {size: fit(up(flat(props.note)), W - m * 2, 27, {role: 'label'}), role: 'label', anchor: 'middle', color: ink.soft});
  const corners = cornerLabels(st, [props.labels?.[0], props.labels?.at(-1), ...(props.foot ?? [])]);
  return {
    seek(t) {
      walls.forEach((w, i) => { w.set(t + 3); w.g.attr('opacity', fade(t, i * .2, 1.2)); });
      rows.forEach((row, i) => row.forEach(u => rise(u, t - (.25 + i * .22 + u.i * .045), {dist: .7, length: .9})));
      group.attr('transform', `scale(${drift(t, .04)})`);
      kicker.attr('opacity', fade(t, .15, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .15, .9))) * 18})`);
      draw(line, glide(span(t, 1.0, .9))); note.attr('opacity', fade(t, 1.25, .6)); corners.set(t, .6);
    },
  };
}
