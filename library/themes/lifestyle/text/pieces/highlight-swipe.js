import {stage, look, C, capH, flow, glyphs, pose, fade, glide, span, leave, easeInOut} from '../../kit.js';

// Overlay: a sentence in bold cream that arrives word by word, and a brushed band of the accent
// colour that swipes in behind the words given in `mark` (those words turn to the readable ink
// for that colour). `y` is the middle of the block; `width` its measure; `maxSize` the largest type.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'This is the part worth slowing down for', mark: 'slowing down', y: 330, accent: 'leaf', width: 880, maxSize: 110};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, ink = look(props.accent, true), o = {role: 'soft'}, key = s => s.toLowerCase().replace(/[^a-z0-9']/g, '');
  const {size, lines, pitch} = flow(props.text, props.width, 420, props.maxSize, 40, o, 1.5), cap = capH(size, o), block = lines.length * pitch - (pitch - cap), top = props.y - block / 2;
  const marks = String(props.mark ?? '').split(/\s+/).map(key).filter(Boolean), bands = root.append('g'), words = root.append('g'), units = [], bars = [];
  lines.forEach((line, i) => glyphs(words, line, W / 2, top + cap + i * pitch, size, {by: 'word', anchor: 'middle', color: C.cream, ...o}).forEach(u => { u.n2 = units.length; u.row = i; units.push(u); }));
  // find the run of words that matches `mark`, then one band per line it touches
  let at = -1; for (let i = 0; i + marks.length <= units.length && at < 0; i++) if (marks.length && marks.every((m, j) => key(units[i + j].str) === m)) at = i;
  if (at >= 0) { const hot = units.slice(at, at + marks.length); hot.forEach(u => { u.hot = true; });
    [...new Set(hot.map(u => u.row))].forEach((row, j) => { const us = hot.filter(u => u.row === row), x0 = us[0].cx - us[0].w / 2 - size * .16, x1 = us.at(-1).cx + us.at(-1).w / 2 + size * .16, yb = top + cap + row * pitch;
      bars.push({rect: bands.append('rect').attr('x', x0).attr('y', yb - cap - size * .2).attr('height', cap + size * .4).attr('rx', 6).attr('fill', ink.accent).attr('transform', `rotate(${j % 2 ? .8 : -1} ${(x0 + x1) / 2} ${yb})`), w: x1 - x0, first: us[0].n2}); }); }
  const soft = units.filter(u => !u.hot); words.selectAll('text').attr('filter', null); words.attr('filter', st.soft);
  const step = Math.min(.16, 1.6 / units.length);
  return {
    seek(t) {
      const x = leave(t, props.life);
      units.forEach(u => { const q = span(t, .1 + u.n2 * step, .6), swiped = u.hot ? easeInOut(span(t, .5 + u.n2 * step, .4)) : 0; pose(u, {y: (1 - glide(q)) * cap * .25 - x * cap * .3, o: easeInOut(q) * (1 - x)}); if (u.hot) u.text.attr('fill', swiped > .5 ? ink.on : C.cream); });
      bars.forEach(b => b.rect.attr('width', b.w * glide(span(t, .45 + b.first * step, .7))).attr('opacity', 1 - x));
    },
  };
}
