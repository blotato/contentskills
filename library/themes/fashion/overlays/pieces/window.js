import {stage, label, ticks, stroke, draw, leave, fade, glide, swell, span, mix} from '../../kit.js';

// The theme's "card over a dimmed copy" as an overlay: everything outside a window is dimmed and
// the window keeps the footage at full strength, with a soft shadow round it and open corner ticks.
// `box` is 0..1 of the frame (default: the middle, where a face is); it opens from the full frame.
// For the real thing (a sharp card over a BLURRED copy) use the `inset_frame` effect instead.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .1, y: .16, w: .8, h: .62}, dim: .55, label: 'In frame', caption: '', accent: 'poppy', marks: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H} = st, b = props.box, shade = root.append('path').attr('fill', '#000').attr('fill-rule', 'evenodd');
  const glow = root.append('rect').attr('fill', 'none').attr('stroke', '#000').attr('stroke-width', 40).attr('opacity', 0).style('filter', 'blur(30px)');
  const g = root.append('g').attr('filter', st.soft).append('g'), corners = stroke(g, ticks(b.x * W, b.y * H, b.w * W, b.h * H, 40), '#fff', 2);
  const top = label(g, b.x * W, b.y * H - 30, props.label, {size: 20}), cap = label(g, (b.x + b.w) * W, (b.y + b.h) * H + 50, props.caption, {size: 19, anchor: 'end'});
  return {
    seek(t) {
      const out = leave(t, props.life, .3), q = swell(span(t, 0, .55)) * (1 - out), x = mix(0, b.x * W, q), y = mix(0, b.y * H, q), w = mix(W, b.w * W, q), h = mix(H, b.h * H, q);
      shade.attr('d', `M0 0H${W}V${H}H0ZM${x} ${y}V${y + h}H${x + w}V${y}Z`).attr('opacity', props.dim * q);
      glow.attr('x', x - 20).attr('y', y - 20).attr('width', w + 40).attr('height', h + 40).attr('opacity', .5 * q).attr('clip-path', null);
      draw(corners, props.marks ? glide(span(t, .3, .6)) : 0); corners.attr('opacity', 1 - out);
      top.attr('opacity', fade(t, .4, .4) * .9 * (1 - out)); cap.attr('opacity', fade(t, .5, .4) * .8 * (1 - out));
    },
  };
}
