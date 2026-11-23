import {stage, C, up, fit, capH, glyphs, settle, txt, blob, stroke, cornerLabels, draw, fade, glide, span, drift} from '../../kit.js';

// One number, very large. It settles into place with its tracking closing up (and counts up to
// its value if it is a plain number), over a soft breathing blob in the accent colour, with a
// wide-caps kicker above, a heavy label and a short note below.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  value: '30', kicker: 'Day', label: 'of slower mornings', note: 'small habits, kept daily,\nadd up quietly',
  labels: ['The count', 'No. 01'], accent: 'sun',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, under, W, H, ink} = st, m = 90, value = String(props.value), flat = s => String(s ?? '').replace(/\n/g, ' ');
  const size = Math.min(fit(value, W - m * 2, 640), H * .3 / capH(1)), cap = capH(size), base = H * .47 + cap / 2;
  const shape = under.append('path').attr('fill', ink.accent).attr('opacity', .3), group = root.append('g');
  const digits = glyphs(group, value, W / 2, base, size, {anchor: 'middle', color: ink.head}), counts = /^[1-9]\d*$/.test(value) ? Number(value) : null;
  const kicker = txt(root, W / 2, base - cap - 60, up(flat(props.kicker)), {size: fit(up(flat(props.kicker)), W - m * 2, 40, {role: 'wide'}), role: 'wide', anchor: 'middle', color: ink.soft});
  const lsize = fit(flat(props.label), W - m * 2, 66), label = txt(root, W / 2, base + 76 + capH(lsize), flat(props.label), {size: lsize, role: 'head', anchor: 'middle'});
  const rule = stroke(root, `M${W / 2 - 60} ${base + 150 + capH(lsize)}h120`, ink.accent, 7);
  const note = txt(root, W / 2, base + 222 + capH(lsize), props.note, {size: 42, role: 'serif', anchor: 'middle', color: ink.soft, leading: 1.1});
  const corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      const q = span(t, .2, 1.5);
      if (counts != null) { const now = String(Math.round(counts * glide(span(t, .2, 1.8)))).padStart(value.length, ' '); digits.forEach(u => u.text.text(now[u.i] ?? '')); }
      settle(digits, q, 0, .45); group.attr('transform', `translate(${W / 2} ${base - cap / 2}) scale(${drift(t, .05)}) translate(${-W / 2} ${-(base - cap / 2)})`);
      shape.attr('d', blob(Math.min(W * .4, H * .24), 9, t * .6)).attr('transform', `translate(${W / 2 + Math.sin(t * .4) * 14} ${base - cap / 2 + Math.cos(t * .3) * 14}) scale(${glide(span(t, 0, 1.4))})`);
      kicker.attr('opacity', fade(t, .1, .6)); label.attr('opacity', fade(t, .9, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, .9, .8))) * 20})`);
      draw(rule, glide(span(t, 1.2, .7))); note.attr('opacity', fade(t, 1.4, .7)); corners.set(t, .7);
    },
  };
}
