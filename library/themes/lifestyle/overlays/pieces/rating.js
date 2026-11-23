import {stage, look, C, up, fit, txt, sheet, starPath, clipLive, fade, glide, span, leave} from '../../kit.js';

// A star rating on a paper slip: five outlined stars fill left to right up to `value` (halves
// work) while the number counts up beside them, with a caps label and a serif-italic line
// underneath. Sample values only. (`x`, `y`) is the top-left.
export const meta = {duration: 4.5, live: true};
export const defaults = {value: 4.5, max: 5, label: 'Would theme again', note: 'our sample score', x: 70, y: 150, accent: 'sun'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y} = props, r = 34, gap = 80, n = props.max, w = 60 + n * gap + 190, h = 210;
  const card = root.append('g'); sheet(card.append('g').attr('filter', st.lift), x, y, w, h, {radius: 6});
  const sx = x + 40 + r, sy = y + 72, mask = clipLive(st), empty = card.append('g'), full = card.append('g').attr('clip-path', mask.url);
  const stars = Array.from({length: n}, (_, i) => { const at = `translate(${sx + i * gap} ${sy})`;
    empty.append('path').attr('d', starPath(r)).attr('transform', at).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 3).attr('stroke-linejoin', 'round');
    return full.append('g').attr('transform', at).append('path').attr('d', starPath(r)).attr('fill', ink.accent).attr('stroke', C.ink).attr('stroke-width', 3).attr('stroke-linejoin', 'round'); });
  const num = txt(card, x + w - 40, sy + 30, '', {size: 88, role: 'head', anchor: 'end'});
  const label = txt(card, x + 40, y + 150, up(props.label), {size: fit(up(props.label), w - 80, 23, {role: 'label'}), role: 'label'}), note = txt(card, x + 40, y + 188, props.note, {size: 32, role: 'serif', color: C.soft});
  return {
    seek(t) {
      const out = leave(t, props.life, .5), e = glide(span(t, 0, .8)), q = glide(span(t, .5, 1.4)), v = props.value * q;
      card.attr('transform', `translate(${(1 - e) * -60 - out * 60} 0)`).attr('opacity', fade(t, 0, .4) * (1 - out));
      mask.set(sx - r - 6, sy - r - 10, (Math.floor(v) * gap + (v % 1) * (r * 2)) + 6, r * 2 + 20);
      stars.forEach((s, i) => s.attr('transform', `scale(${.8 + .2 * glide(span(v, i, .6))})`));
      num.text(v.toFixed(1)).attr('opacity', fade(t, .4, .5)); label.attr('opacity', fade(t, .9, .5)); note.attr('opacity', fade(t, 1.1, .6));
    },
  };
}
