import {card, C, up, fit, txt, stroke, pill, tickPath, draw, fade, glide, span} from '../../kit.js';
import {arrive} from './_local.js';

// A week of habits: a row per habit, a dot per day. Done days fill with the accent colour one
// after another and are ticked, missed days stay as open rings, and each row totals up at the end.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'This week, honestly', unit: 'Illustrative · habits kept', clear: false, accent: 'leaf', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], today: 6,
  habits: [{label: 'Water first', done: [1, 1, 1, 1, 1, 1, 1]}, {label: 'Ten-minute walk', done: [1, 1, 0, 1, 1, 1, 0]}, {label: 'Read a chapter', done: [1, 0, 1, 1, 0, 1, 1]}, {label: 'Screens off by ten', done: [0, 1, 1, 0, 1, 0, 1]}, {label: 'Stretch', done: [1, 1, 1, 0, 1, 1, 1]}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, rows = props.habits, n = rows.length, nd = props.days.length, gx = 420, gw = 400, cw = gw / (nd - 1), top = 385, pitch = Math.min(122, 600 / n), rad = Math.min(24, cw * .36, pitch * .3);
  const col = props.today != null ? root.append('path').attr('d', pill(gx + props.today * cw - rad - 12, top - 104, rad * 2 + 24, (n - 1) * pitch + 104 + rad + 22)).attr('fill', C.deep) : null;
  props.days.forEach((d, i) => txt(root, gx + i * cw, top - 62, up(d), {size: 21, role: 'label', anchor: 'middle', color: i === props.today ? C.ink : C.dim, spacing: 0}));
  const items = rows.map((h, r) => { const y = top + r * pitch, g = root.append('g');
    txt(g, 80, y + 12, h.label, {size: fit(h.label, 290, 34, {role: 'soft'}), role: 'soft'});
    if (r) stroke(root, `M80 ${y - pitch / 2}H920`, C.line, 1.5).attr('stroke-dasharray', '2 10');
    const dots = h.done.map((on, i) => { const cx = gx + i * cw; root.append('circle').attr('cx', cx).attr('cy', y).attr('r', rad - 2).attr('fill', 'none').attr('stroke', C.line).attr('stroke-width', 3);
      return on ? {i, fill: root.append('circle').attr('cx', cx).attr('cy', y).attr('fill', ink.accent), tick: stroke(root, tickPath(cx - rad * .62, y - rad * .62, rad * 1.24), C.cream, 4.5)} : null; }).filter(Boolean);
    const count = h.done.filter(Boolean).length;
    return {g, dots, total: txt(root, 920, y + 15, `${count}/${nd}`, {size: 40, role: 'head', anchor: 'end', color: count === nd ? ink.accent : C.ink})}; });
  return {seek(t) {
    st.header(t); col?.attr('opacity', fade(t, .3, .8));
    items.forEach((it, r) => { arrive(it.g, t, .3 + r * .12, 14);
      it.dots.forEach(d => { const at = .7 + d.i * .26 + r * .07; d.fill.attr('r', (rad - 2) * glide(span(t, at, .6))); draw(d.tick, glide(span(t, at + .15, .5))); });
      it.total.attr('opacity', fade(t, .9 + nd * .26 + r * .1, .5)); });
  }};
}
