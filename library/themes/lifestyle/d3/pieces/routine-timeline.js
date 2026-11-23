import {card, C, up, fit, txt, stroke, hand, draw, fade, glide, swell, span} from '../../kit.js';
import {arrive} from './_local.js';

// A routine down a single line: the line draws from the top, and each step arrives in turn —
// a heavy time on the left, a dot on the line, the step and a small detail on the right. One
// step can carry a handwritten aside.
export const meta = {duration: 5.5, live: true};
export const defaults = {title: 'A morning that works', unit: 'Illustrative routine', clear: false, accent: 'leaf', note: 'non-negotiable', noteAt: 2,
  steps: [{time: '6:30', label: 'Up, curtains open', detail: 'No phone yet'}, {time: '6:45', label: 'Glass of water', detail: 'Then the kettle'}, {time: '7:00', label: 'Walk round the block', detail: 'Twenty minutes'}, {time: '7:30', label: 'Breakfast, sitting down', detail: 'Something warm'}, {time: '8:00', label: 'First hour of work', detail: 'The hard thing first'}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, n = props.steps.length, lx = 290, top = 300, pitch = Math.min(130, 600 / n), end = top + (n - 1) * pitch;
  stroke(root, `M${lx} ${top - 30}V${end + 30}`, C.line, 3); const line = stroke(root, `M${lx} ${top - 30}V${end + 30}`, C.ink, 3);
  const rows = props.steps.map((s, i) => { const y = top + i * pitch, g = root.append('g');
    txt(g, lx - 44, y + 17, s.time, {size: 48, role: 'head', anchor: 'end'});
    txt(g, lx + 46, y + 6, s.label, {size: fit(s.label, 560, 36, {role: 'soft'}), role: 'soft'}); txt(g, lx + 46, y + 40, up(s.detail ?? ''), {size: 19, role: 'label', color: C.dim});
    return {g, y, dot: root.append('circle').attr('cx', lx).attr('cy', y).attr('fill', i === props.noteAt ? ink.accent : C.paper).attr('stroke', i === props.noteAt ? ink.accent : C.ink).attr('stroke-width', 4)}; });
  const at = rows[props.noteAt], note = at && props.note ? hand(root, st, 920, at.y - 34, props.note, {size: 46, color: ink.accent, anchor: 'end', rot: -4}) : null;
  return {seek(t) {
    st.header(t); draw(line, swell(span(t, .3, .5 + n * .42)));
    rows.forEach((r, i) => { const s = .5 + i * .42; arrive(r.g, t, s, 16); r.dot.attr('r', 11 * glide(span(t, s - .05, .5))); });
    note?.set(glide(span(t, .9 + n * .42, .9)));
  }};
}
