import {C, F, stage, label, measure, span, ease, glide, leave} from '../../kit.js';

// A small section tag: tracked capitals in a tight box (ink, wine or paper) that wipes open from the left, with an
// optional mono number in front. Props: text, number, x, y (top), field (ink|wine|paper|blush), size, align (left|right|center).
export const meta = {duration: 3, live: true};
export const defaults = {text: 'Proof', number: '', x: 72, y: 270, field: 'ink', size: 30, align: 'left'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), size = props.size ?? 30, str = `${props.number ? props.number + '   ' : ''}${props.text ?? ''}`.toUpperCase(), tw = measure(str, size, {font: F.sans, weight: 600, track: .2}), w = tw + size * 1.5, h = size * 2.1;
  const f = {ink: [C.ink, C.paper], wine: [C.wine, C.paper], paper: [C.paper, C.ink], blush: [C.blush, C.ink], crimson: [C.crimson, C.paper]}[props.field] ?? [C.ink, C.paper];
  const x = props.align === 'right' ? (props.x ?? 1008) - w : props.align === 'center' ? (props.x ?? 540) - w / 2 : props.x ?? 72, y = props.y ?? 270, cid = st.uid('tag'), cr = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', x).attr('y', y).attr('height', h);
  const grp = st.root.append('g').attr('clip-path', `url(#${cid})`); grp.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', f[0]).attr('rx', 3);
  label(grp, x + size * .75, y + h / 2 + size * .36, str, {size, color: f[1]});
  const life = props.life ?? meta.duration;
  return {seek(t) { cr.attr('width', w * glide(span(t, 0, .35))); grp.attr('opacity', 1 - ease(leave(t, life, .24))); }};
}
