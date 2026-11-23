import {C, F, M, stage, line, label, rule, measure, span, ease, glide, leave} from '../../kit.js';

// A byline strap: a paper strip glides in from the left edge carrying a tracked role over a hairline and a name in
// serif that rises from behind it; leaves the way it came. Props: role, name, y (top), field (paper|ink|wine), size.
export const meta = {duration: 3.5, live: true};
export const defaults = {role: 'Edited by', name: 'A *machine*', y: 1250, field: 'paper', size: 88};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), f = {paper: [C.paper, C.ink, C.wine], ink: [C.ink, C.paper, C.blush], wine: [C.wine, C.paper, C.blush]}[props.field] ?? [C.paper, C.ink, C.wine];
  const size = props.size ?? 88, y = props.y ?? 1250, w = Math.max(measure(props.name, size), measure(String(props.role).toUpperCase(), 28, {font: F.sans, weight: 600, track: .2})) + M + 56, h = 96 + size * 1.05;
  const grp = st.root.append('g'); grp.append('rect').attr('x', -20).attr('y', y).attr('width', w + 20).attr('height', h).attr('fill', f[0]).attr('filter', st.url('lift'));
  label(grp, M, y + 52, props.role, {size: 28, color: f[1]}); const rl = rule(grp, M, y + 72, w - 40, y + 72, {color: f[1]}), nm = line(st, grp, props.name, M, y + 80 + size * .86, size, {color: f[1], accent: f[2]});
  const life = props.life ?? meta.duration;
  return {seek(t) { const a = glide(span(t, 0, .45)), b = Math.pow(leave(t, life, .3), 3); grp.attr('transform', `translate(${-(1 - a) * (w + 40) - b * (w + 40)} 0)`); rl.draw(glide(span(t, .2, .4))); nm.set(span(t, .25, .45)); }};
}
