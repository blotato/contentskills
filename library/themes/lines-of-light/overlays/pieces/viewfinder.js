import {C, stage, up, span, ease, io, light, dot, title, mono, pad, presence, leave, pool} from '../../kit.js';

// A viewfinder drawn in light round the safe area: the red dot top-left fires the first bracket,
// the other three corners open in turn, and small mono readouts sit inside (a label, a running
// clock, a note). Made to run for a whole clip; the middle of the frame stays clear.
export const meta = {duration: 6, live: true};
export const defaults = {label: 'LIVE', note: 'TAKE 01', clock: true, box: {x: 80, y: 270, w: 920, h: 1160}, start: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root} = st, b = props.box ?? defaults.box, len = 90, {x, y, w, h} = b;
  const corners = [[x, y, 1, 1], [x + w, y, -1, 1], [x + w, y + h, -1, -1], [x, y + h, 1, -1]].map(([cx, cy, sx, sy]) => light(root, [[cx, cy + sy * len], [cx, cy], [cx + sx * len, cy]], {width: 2.6}));
  const red = dot(root, x, y, {color: 'red', r: 11});
  const shades = [pool(root, x + w - 90, y + 40, 200, 80, 0), pool(root, x + 120, y + h - 40, 230, 80, 0)];
  const label = title(root, up(props.label), x + w - 30, y + 46, 22, {anchor: 'end', track: .4, halo: 5});
  const clock = props.clock ? mono(root, x + 30, y + h - 30, '', {size: 26, track: .12, opacity: 0, halo: 4, weight: 500}) : null;
  const note = props.note ? mono(root, x + w - 30, y + h - 30, up(props.note), {size: 22, anchor: 'end', track: .2, opacity: 0, halo: 4, weight: 500, color: C.dim}) : null;
  return {seek(t) {
    const x2 = leave(t, props.life, .6), tail = ease(x2); red.set(ease(span(t, 0, .25)) * (1 - x2));
    corners.forEach((c, i) => c.range(tail, ease(span(t, .1 + i * .25, 1.1))));
    shades.forEach(s => s.attr('opacity', ease(span(t, .6, .5)) * (1 - x2)));
    label.show(ease(span(t, .5, .9)), 1 - x2);
    const s = (props.start ?? 0) + t; clock?.select('tspan').text(`${pad(s / 60)}:${pad(s % 60)}:${pad((s % 1) * 30)}`); clock?.attr('opacity', .9 * ease(span(t, .9, .5)) * (1 - x2));
    note?.attr('opacity', .85 * ease(span(t, 1.1, .5)) * (1 - x2));
  }};
}
