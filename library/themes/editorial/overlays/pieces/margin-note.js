import {C, F, stage, text, label, rule, measure, wrap, span, ease, glide, leave} from '../../kit.js';

// An editor's note in the margin: a small paper slip with a tracked label and one or two lines of italic, and a
// hairline with a dot that draws from the slip to the thing it is about. Props: label, note, x, y (slip top-left),
// w, to [x, y] (where the pointer ends; null = no pointer), size, field.
export const meta = {duration: 3, live: true};
export const defaults = {label: 'Note', note: 'Tighter here', x: 90, y: 1250, w: 460, to: [760, 1120], size: 56, field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.field === 'ink', fg = dark ? C.paper : C.ink, acc = dark ? C.blush : C.wine, x = props.x ?? 90, y = props.y ?? 1250, w = props.w ?? 460, size = props.size ?? 56;
  const arr = wrap(props.note, size, w - 56, {font: F.italic}), h = 78 + arr.length * size * 1.08 + 14, to = props.to, grp = st.root.append('g');
  const ptr = to ? rule(st.root, to[0] < x ? x : x + w, y + h / 2, to[0], to[1], {color: acc, width: 3}) : null, dot = to ? st.root.append('circle').attr('cx', to[0]).attr('cy', to[1]).attr('r', 9).attr('fill', acc) : null;
  grp.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', dark ? C.ink : C.paper).attr('rx', 4).attr('filter', st.url('lift'));
  grp.append('rect').attr('x', x).attr('y', y).attr('width', 6).attr('height', h).attr('fill', acc);
  label(grp, x + 30, y + 48, props.label, {size: 26, color: acc}); arr.forEach((s, i) => text(grp, x + 30, y + 64 + size * .8 + i * size * 1.08, s, {font: F.italic, size, color: fg}));
  const life = props.life ?? meta.duration;
  return {seek(t) { const a = glide(span(t, 0, .4)), q = leave(t, life, .26); grp.attr('opacity', ease(span(t, 0, .25)) * (1 - q)).attr('transform', `translate(0 ${(1 - a) * 30})`); ptr?.draw(glide(span(t, .25, .4)) * (1 - q)); dot?.attr('opacity', ease(span(t, .55, .2)) * (1 - q)); }};
}
