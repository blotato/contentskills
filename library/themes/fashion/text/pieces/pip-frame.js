import {stage, label, ticks, stroke, draw, leave, fade, glide, swell, span} from '../../kit.js';

// Overlay: a frame for a picture-in-picture, as light as it can be: a soft shadow lifts the
// window off the footage, open corner ticks draw round it, and two lines of small print label
// it above and below. `box` is 0..1 of the frame; `fill` 0..1 tints the window dark (0 leaves
// it see-through for footage placed under it).
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .5, y: .075, w: .43, h: .2}, label: 'Exhibit A', caption: 'screen recording', fill: 0, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H, ink} = st, b = props.box, bw = b.w * W, bh = b.h * H, x = b.x * W, y = b.y * H;
  const shade = root.append('path').attr('fill', '#000').attr('fill-rule', 'evenodd').attr('filter', st.lift).attr('d', `M${x - 1} ${y - 1}h${bw + 2}v${bh + 2}h${-bw - 2}ZM${x} ${y}v${bh}h${bw}v${-bh}Z`);
  const pane = root.append('rect').attr('x', x).attr('y', y).attr('width', bw).attr('height', bh).attr('fill', '#0D0D0F').attr('fill-opacity', props.fill);
  const g = root.append('g').attr('filter', st.soft).append('g'), corners = stroke(g, ticks(x - 10, y - 10, bw + 20, bh + 20, 34), '#fff', 2), spot = g.append('circle').attr('cx', x - 10).attr('cy', y - 10).attr('r', 6).attr('fill', ink.accent);
  const top = label(g, x - 10, y - 34, props.label, {size: 19}), cap = label(g, x + bw + 10, y + bh + 48, props.caption, {size: 18, anchor: 'end'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25), q = swell(span(t, 0, .6));
      shade.attr('opacity', q * (1 - out)); pane.attr('opacity', q * (1 - out)); draw(corners, glide(span(t, .1, .7))); corners.attr('opacity', 1 - out);
      spot.attr('opacity', fade(t, .5, .3) * (1 - out)); top.attr('opacity', fade(t, .3, .4) * .88 * (1 - out)); cap.attr('opacity', fade(t, .45, .4) * .75 * (1 - out));
    },
  };
}
