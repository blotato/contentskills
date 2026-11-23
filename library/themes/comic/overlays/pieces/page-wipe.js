import {comicStage, C, FRAME, tone, halftonePath, streaksPath, clipShape, span, easeInOut} from '../../kit.js';

// A page turn for a cut: a slanted sheet in a flat colour, with a paper gutter and ink rule on
// both edges, dots and speed streaks, sweeps across the whole frame and off the other side.
// Put the cut at the middle of it (0.3 s in), when the frame is fully covered.
export const meta = {duration: .7};
export const defaults = {color: 'red', dir: 1};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, W = FRAME.width, H = FRAME.height, fill = tone(props.color), slant = 260, band = W + slant + 260;
  const g = root.append('g'), shape = `M${slant} -40H${band}L${band - slant} ${H + 40}H0Z`, clip = clipShape(stage, shape);
  g.append('path').attr('d', shape).attr('fill', fill).attr('stroke', C.gutter).attr('stroke-width', 56).attr('stroke-linejoin', 'round');
  g.append('path').attr('d', shape).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 76).attr('stroke-linejoin', 'round').lower();
  const inside = g.append('g').attr('clip-path', clip.url);
  inside.append('path').attr('d', halftonePath(0, 0, band, H, {pitch: 44, from: [0, 1], reach: .8})).attr('fill', fill === C.yellow ? C.orange : C.ink).attr('opacity', .4);
  inside.append('path').attr('d', streaksPath(0, 0, band, H, {n: 30, seed: 3, thick: 3})).attr('fill', C.white).attr('opacity', .85);
  g.append('path').attr('d', shape).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 9).attr('stroke-linejoin', 'round');
  return {
    seek(t) {
      const q = easeInOut(span(t, 0, meta.duration)), x = (W + 80) - q * (W + band + 160), k = props.dir < 0 ? `translate(${W} 0) scale(-1 1)` : '';
      g.attr('transform', `${k} translate(${x} 0)`).attr('opacity', t <= 0 || t >= meta.duration ? 0 : 1);
    },
  };
}
