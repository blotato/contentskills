import {stage, C, up, fit, capH, glyphs, pose, settle, txt, stroke, clipLive, cornerLabels, draw, fade, glide, swell, span, drift} from '../../kit.js';

// A chapter opener: an enormous outlined number fills with the accent colour from the bottom up
// while it slowly pushes in, a wide-caps kicker settles above it, and the chapter title rises
// underneath with a serif-italic note and a short rule.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'Chapter', title: 'The slow part', note: 'where nothing much happens,\non purpose', labels: ['Section', 'Pt. 02'], accent: 'teal'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, m = 90, number = String(props.number), flat = s => String(s ?? '').replace(/\n/g, ' ');
  const nsize = Math.min(fit(number, W * .7, 900, {spacing: .01}), H * .34 / capH(1)), ncap = capH(nsize), tsize = fit(flat(props.title), W - m * 2, 110), tcap = capH(tsize), block = 70 + ncap + 90 + tcap + 150, top = (H - block) / 2, base = top + 70 + ncap;
  const big = root.append('g'), mask = clipLive(st);
  const line = glyphs(big, number, W / 2, base, nsize, {by: 'all', anchor: 'middle', color: C.ink, outline: 3})[0], full = glyphs(big.append('g').attr('clip-path', mask.url), number, W / 2, base, nsize, {by: 'all', anchor: 'middle', color: ink.accent, spacing: .01})[0];
  const kicker = glyphs(root, up(flat(props.kicker)), W / 2, top + 20, 38, {anchor: 'middle', role: 'wide', color: ink.soft});
  const title = txt(root, W / 2, base + 90 + tcap, flat(props.title), {size: tsize, role: 'head', anchor: 'middle'}), rule = stroke(root, `M${W / 2 - 60} ${base + 90 + tcap + 54}h120`, ink.accent, 7);
  const note = txt(root, W / 2, base + 90 + tcap + 130, props.note, {size: 44, role: 'serif', anchor: 'middle', color: ink.soft, leading: 1.1}), corners = cornerLabels(st, props.labels);
  return {
    seek(t) {
      const e = swell(span(t, .5, 1.6)); mask.set(0, base + 30 - (ncap + 60) * e, W, (ncap + 60) * e);
      pose(line, {o: fade(t, 0, .7)}); pose(full, {}); big.attr('transform', `translate(${W / 2} ${base - ncap / 2}) scale(${drift(t, .06) * (1.06 - .06 * glide(span(t, 0, 1.4)))}) translate(${-W / 2} ${-(base - ncap / 2)})`);
      settle(kicker, span(t, .2, 1.3), 0, .8);
      title.attr('opacity', fade(t, 1.0, .6)).attr('transform', `translate(0 ${(1 - glide(span(t, 1.0, .9))) * 24})`); draw(rule, glide(span(t, 1.4, .7))); note.attr('opacity', fade(t, 1.6, .7)); corners.set(t, .7);
    },
  };
}
