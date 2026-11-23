import {card, C, up, fit, txt, stroke, starPath, clipLive, fade, glide, span} from '../../kit.js';
import {arrive} from './_local.js';

// Scores out of five as rows of stars: outlines first, then the colour pours in from the left
// to the exact score while the number counts up. The best row takes the accent and a small tag.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Four cafés, one winner', unit: 'Illustrative · scores out of five', clear: false, accent: 'leaf', best: 'our pick',
  items: [{label: 'The corner place', detail: 'Oat flat white', score: 4.8}, {label: 'By the station', detail: 'Filter', score: 3.9}, {label: 'Garden café', detail: 'Iced latte', score: 4.3}, {label: 'The chain', detail: 'Whatever is quick', score: 2.6}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, n = props.items.length, top = 300, pitch = Math.min(155, 620 / n), R = 26, gap = 62, sx = 510, best = props.items.reduce((b, d, i) => d.score > props.items[b].score ? i : b, 0);
  const rows = props.items.map((d, i) => { const y = top + i * pitch, g = root.append('g'), color = i === best ? ink.accent : C.ink, clip = clipLive(st), stars = (fill, hold) => [0, 1, 2, 3, 4].forEach(k => hold.append('path').attr('d', starPath(R)).attr('transform', `translate(${sx + k * gap} ${y})`).attr('fill', fill ? color : 'none').attr('stroke', fill ? color : C.line).attr('stroke-width', 4).attr('stroke-linejoin', 'round'));
    if (i) stroke(root, `M80 ${y - pitch / 2}H920`, C.line, 1.5);
    txt(g, 80, y + 2, d.label, {size: fit(d.label, 370, 38, {role: 'soft'}), role: 'soft'}); txt(g, 80, y + 36, up(d.detail ?? '') + (i === best && props.best ? `  ·  ${up(props.best)}` : ''), {size: 19, role: 'label', color: i === best ? ink.accent : C.dim});
    stars(false, g); stars(true, g.append('g').attr('clip-path', clip.url));
    return {d, g, y, clip, value: txt(g, 920, y + 18, '', {size: 52, role: 'head', anchor: 'end', color})}; });
  return {seek(t) {
    st.header(t);
    rows.forEach((r, i) => { const s = .35 + i * .22, e = glide(span(t, s + .25, 1.3)), v = r.d.score * e, whole = Math.floor(v);
      arrive(r.g, t, s, 16); r.clip.set(sx - R - 6, r.y - R - 8, R + 6 + whole * gap - R + (v - whole) * R * 2 + (whole ? 0 : 0), R * 2 + 16); r.value.text(v.toFixed(1)); });
  }};
}
