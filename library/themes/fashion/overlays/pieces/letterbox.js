import {stage, label, leave, fade, swell, span} from '../../kit.js';

// Cinema bars: two soft near-black bars close in from the top and bottom of the frame and hold,
// each carrying one piece of small print. `size` is each bar's height as 0..1 of the frame.
export const meta = {duration: 4, live: true};
export const defaults = {size: .13, top: 'A short film', bottom: 'Part one', opacity: .92, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H, ink} = st, bh = props.size * H;
  const bars = [0, 1].map(() => root.append('rect').attr('width', W).attr('fill', '#0D0D0F').attr('opacity', props.opacity));
  const top = label(root, W / 2, bh / 2 + 8, props.top, {size: 21, anchor: 'middle'}), bottom = label(root, W / 2, H - bh / 2 + 8, props.bottom, {size: 21, anchor: 'middle'}), spot = root.append('circle').attr('cx', W / 2).attr('cy', bh - 34).attr('r', 5).attr('fill', ink.accent);
  return {
    seek(t) {
      const x = leave(t, props.life, .35), q = swell(span(t, 0, .6)) * (1 - x), h = bh * q;
      bars[0].attr('y', 0).attr('height', h); bars[1].attr('y', H - h).attr('height', h);
      top.attr('opacity', fade(t, .35, .4) * .9 * (1 - x)); bottom.attr('opacity', fade(t, .45, .4) * .9 * (1 - x)); spot.attr('opacity', props.top ? 0 : fade(t, .4, .3) * (1 - x));
    },
  };
}
