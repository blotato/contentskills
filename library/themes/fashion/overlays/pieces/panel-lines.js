import {stage, label, pad2, leave, fade, swell, span} from '../../kit.js';

// The vertical-panel cut as an overlay: thin near-black gutters travel down (and up) the frame
// from alternate ends and divide the picture into tall panels of unequal width, each numbered in
// small print at its foot. `splits` are the gutter positions, 0..1 across the frame. The `triptych`
// effect is the other way to do this (it slips the picture inside the panels and draws its own gutters): use one or the other.
export const meta = {duration: 4, live: true};
export const defaults = {splits: [.22, .78], gutter: 8, labels: ['01', '02', '03'], color: '#0D0D0F', y: 1846, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H} = st, xs = props.splits.map(s => s * W), edges = [0, ...xs, W];
  const lines = xs.map(x => root.append('rect').attr('x', x - props.gutter / 2).attr('width', props.gutter).attr('fill', props.color));
  const g = root.append('g').attr('filter', st.soft), names = edges.slice(0, -1).map((x, i) => label(g, (x + edges[i + 1]) / 2, props.y, props.labels?.[i] ?? pad2(i + 1), {size: 19, anchor: 'middle'}));
  return {
    seek(t) {
      const out = leave(t, props.life, .3);
      lines.forEach((l, i) => { const q = swell(span(t, i * .08, .5)), h = H * q * (1 - out); l.attr('y', i % 2 ? H - h : 0).attr('height', h); });
      names.forEach((n, i) => n.attr('opacity', fade(t, .3 + i * .08, .4) * .9 * (1 - out)));
    },
  };
}
