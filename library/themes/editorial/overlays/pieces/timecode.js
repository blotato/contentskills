import {C, F, stage, folio, label, pad, span, ease, leave} from '../../kit.js';

// A running timecode on a small ink tab, with a tracked label: mm:ss:ff counting with the clip (it reads the time the
// overlay started at, so it shows the clip's own time). Something quietly moving in a corner.
// Props: label, fps, x, y (top), align (left|right), field (ink|paper), from (seconds added).
export const meta = {duration: 5, live: true};
export const defaults = {label: 'Rec', fps: 30, x: 72, y: 270, align: 'left', field: 'ink', from: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = props.field !== 'paper', fg = dark ? C.paper : C.ink, w = 372, h = 64, x = props.align === 'right' ? (props.x ?? 1008) - w : props.x ?? 72, y = props.y ?? 270, fps = props.fps ?? 30;
  const grp = st.root.append('g'); grp.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', dark ? C.ink : C.paper).attr('fill-opacity', .94).attr('rx', 3);
  const dot = grp.append('circle').attr('cx', x + 26).attr('cy', y + h / 2).attr('r', 8).attr('fill', dark ? C.blush : C.crimson);
  label(grp, x + 46, y + 43, props.label, {size: 26, color: fg}); const tc = folio(grp, x + w - 20, y + 44, '', {size: 30, anchor: 'end', color: fg});
  const life = props.life ?? meta.duration;
  return {seek(t) { const T = Math.max(0, t + (props.at ?? 0) + (props.from ?? 0)), f = Math.floor(T * fps + 1e-6);
    tc.select('tspan').text(`${pad(Math.floor(f / fps / 60))}:${pad(Math.floor(f / fps) % 60)}:${pad(f % fps)}`); dot.attr('opacity', .55 + .45 * Math.cos(T * Math.PI * 2)); grp.attr('opacity', ease(span(t, 0, .25)) * (1 - leave(t, life, .25))); }};
}
