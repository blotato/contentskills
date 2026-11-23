import {comicStage, C, look, boxPath, slabLabel, captionBox, spark, streaksPath, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// Overlay: an inset panel. A comic panel frame (paper gutter inside an ink box, hard shadow)
// pops open around a window in the frame, with the `label` on a slab over its top-left corner
// and the `caption` in a box under it. `box` is 0..1 of the frame; `fill` (0..1) darkens the
// window, 0 leaves it see-through for footage or a picture placed underneath.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .075, w: .42, h: .2}, label: 'EXHIBIT A', caption: 'SCREEN RECORDING', fill: 0, accent: 'red'};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W, H} = stage, ink = look(props.accent), b = props.box, bw = b.w * W, bh = b.h * H, cx = b.x * W + bw / 2, cy = b.y * H + bh / 2, gut = 16;
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`).append('g'), inner = boxPath(-bw / 2, -bh / 2, bw, bh, 4, 2), outer = boxPath(-bw / 2 - gut, -bh / 2 - gut, bw + gut * 2, bh + gut * 2, 5, 3);
  g.append('path').attr('d', outer + inner).attr('transform', 'translate(12 12)').attr('fill', C.ink).attr('fill-rule', 'evenodd');
  g.append('path').attr('d', inner).attr('fill', C.ink).attr('fill-opacity', props.fill);
  g.append('path').attr('d', outer + inner).attr('fill', C.paper).attr('fill-rule', 'evenodd').attr('stroke', C.ink).attr('stroke-width', 6).attr('stroke-linejoin', 'round');
  const swoosh = g.append('path').attr('d', streaksPath(-bw / 2, -bh / 2, bw, bh, {n: 8, seed: 4, thick: 2})).attr('fill', C.white);
  const label = slabLabel(g, -bw / 2 - gut - 14, -bh / 2 - gut - 46, props.label, {size: 44, fill: ink.accent, tilt: -4}), caption = captionBox(g, bw / 2 + gut + 6, bh / 2 + gut - 8, props.caption, {size: 28, anchor: 'end', tilt: 1.5});
  const star = spark(g, bw / 2 + gut, -bh / 2 - gut, 30, C.yellow);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .5);
      scaleTo(g, spring(q) * (1 - x), -2 + (1 - easeOut(q)) * 8); swoosh.attr('opacity', q > 0 && q < .55 ? .9 : 0);
      scaleTo(label.g, spring(span(t, .4, .42))); scaleTo(caption.g, spring(span(t, .6, .42)));
      scaleTo(star, spring(span(t, .7, .4)) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
