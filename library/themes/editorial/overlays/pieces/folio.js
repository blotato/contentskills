import {C, F, stage, text, label, rule, pad, span, ease, glide, leave} from '../../kit.js';

// A page number in a corner: a Didone figure, a short hairline and a tracked section name, on a small paper tab so it
// reads on any footage. Can run a whole section. Props: index, total, label, x, y, align (left|right), field (paper|ink).
export const meta = {duration: 4, live: true};
export const defaults = {index: 3, total: 12, label: 'Proof', x: 1008, y: 300, align: 'right', field: 'paper'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.field === 'ink', fg = dark ? C.paper : C.ink, bg = dark ? C.ink : C.paper, right = props.align !== 'left', x = props.x ?? 1008, y = props.y ?? 300, w = 300, x0 = right ? x - w : x;
  const grp = st.root.append('g'); grp.append('rect').attr('x', x0).attr('y', y).attr('width', w).attr('height', 104).attr('fill', bg).attr('fill-opacity', .94).attr('rx', 4);
  text(grp, x0 + 22, y + 76, pad(props.index ?? 1), {font: F.serif, weight: 500, size: 78, color: dark ? C.blush : C.wine});
  const rl = rule(grp, x0 + 130, y + 30, x0 + w - 22, y + 30, {color: fg, width: 2});
  label(grp, x0 + 130, y + 68, props.label ?? '', {size: 26, color: fg, track: .16}); if (props.total) label(grp, x0 + 130, y + 96, `of ${pad(props.total)}`, {size: 22, color: fg, weight: 500, opacity: .7});
  const life = props.life ?? meta.duration;
  return {seek(t) { const a = glide(span(t, 0, .4)), q = leave(t, life, .26); grp.attr('opacity', ease(span(t, 0, .25)) * (1 - q)).attr('transform', `translate(${(right ? 1 : -1) * (1 - a) * 40} 0)`); rl.draw(glide(span(t, .15, .4))); }};
}
