import {stage, C, up, capH, flow, glyphs, pose, measure, tag, txt, stroke, squiggle, blob, draw, fade, glide, span, easeInOut} from '../../kit.js';

// A sentence that arrives one word at a time, each word pale at first and then at full strength,
// the way a thought is spoken. Words listed in `emphasis` are set in the accent colour with a
// brushed underline. A pill tag sits above, a caps footnote below, a soft blob breathes behind.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  statement: 'The best mornings are the ones you do not rush', emphasis: ['rush'], tag: 'Note 07',
  labels: [], foot: 'Slow is a skill', accent: 'leaf',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, under, W, H, ink} = st, m = 100, o = {role: 'soft'}, key = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const strong = new Set((props.emphasis ?? []).map(key)), {size, lines, pitch} = flow(props.statement, W - m * 2, H * .46, 150, 50, o, 1.42), cap = capH(size, o), top = H / 2 - (lines.length * pitch - (pitch - cap)) / 2;
  const shape = under.append('path').attr('fill', ink.accent).attr('opacity', .16), units = [], lines2 = [];
  lines.forEach((line, i) => glyphs(root, line, m, top + cap + i * pitch, size, {by: 'word', color: ink.head, ...o}).forEach(u => {
    u.n2 = units.length; u.hot = strong.has(key(u.str)); units.push(u);
    if (u.hot) { u.text.attr('fill', ink.accent); lines2.push({u, path: stroke(root, squiggle(u.cx - u.w / 2, u.y + size * .16, u.w, size * .05, Math.max(2, Math.round(u.w / 90)), u.n2), ink.accent, size * .055)}); }
  }));
  const chip = tag(root, m, top - 90, props.tag, {fill: C.ink, size: 24, dot: ink.accent}), foot = txt(root, m, top + lines.length * pitch + 70, up(props.foot), {size: 26, role: 'label', color: ink.soft});
  const step = Math.min(.24, 2.6 / units.length);
  return {
    seek(t) {
      units.forEach(u => { const q = span(t, .4 + u.n2 * step, .7); pose(u, {y: (1 - glide(q)) * cap * .25, o: .0 + easeInOut(q)}); });
      lines2.forEach(({u, path}) => draw(path, glide(span(t, .9 + u.n2 * step, .8))));
      shape.attr('d', blob(W * .42, 4, t * .5)).attr('transform', `translate(${W * .72 + Math.sin(t * .3) * 20} ${H * .36 + Math.cos(t * .25) * 24}) scale(${glide(span(t, 0, 1.6))})`);
      chip.g.attr('opacity', fade(t, .1, .5)); foot.attr('opacity', fade(t, .7 + units.length * step, .7));
    },
  };
}
