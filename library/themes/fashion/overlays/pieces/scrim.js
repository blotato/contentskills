import {stage, gradient, leave, fade} from '../../kit.js';

// A soft darkening that falls from the top and rises from the bottom of the frame, so white type
// and captions sit comfortably on bright footage. `top` / `bottom` are how far each reaches
// (0..1 of the frame; 0 = none), `strength` how dark. The middle of the picture is left alone.
export const meta = {duration: 4, live: true};
export const defaults = {top: .3, bottom: .34, strength: .55};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, s = props.strength, g = root.append('g');
  if (props.top) g.append('rect').attr('width', W).attr('height', H * props.top).attr('fill', gradient(st, [['#000', 0], ['#000', s * .45], ['#000', s]], 90));
  if (props.bottom) g.append('rect').attr('y', H * (1 - props.bottom)).attr('width', W).attr('height', H * props.bottom).attr('fill', gradient(st, [['#000', s], ['#000', s * .45], ['#000', 0]], 90));
  return {seek(t) { g.attr('opacity', fade(t, 0, .4) * (1 - leave(t, props.life, .4))); }};
}
