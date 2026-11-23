import {stage, look, C, up, tag, hand, tape, fade, glide, swell, span, leave} from '../../kit.js';

// Overlay: a paper mat for a picture-in-picture. A square-cornered paper border grows open
// around the window (wide first, then tall), a strip of tape lands on its top edge, a pill tag
// names it and a handwritten caption writes itself underneath. `box` is 0..1 of the frame;
// `fill` 0..1 tints the window with paper (0 leaves it see-through for footage placed under it).
export const meta = {duration: 4.5, live: true};
export const defaults = {box: {x: .5, y: .075, w: .43, h: .2}, label: 'Exhibit A', caption: 'screen recording', fill: 0, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, ink = look(props.accent), b = props.box, bw = b.w * W, bh = b.h * H, cx = b.x * W + bw / 2, cy = b.y * H + bh / 2, mat = 16;
  const g = root.append('g').attr('transform', `translate(${cx} ${cy})`).append('g'), pane = g.append('rect').attr('fill', C.paper).attr('fill-opacity', props.fill);
  const frame = g.append('path').attr('fill', C.paper).attr('fill-rule', 'evenodd').attr('filter', st.lift), strip = tape(g, 0, -bh / 2 - mat / 2, 150, 42, -3, ink.accent);
  const chip = tag(g, -bw / 2 + 14, bh / 2 - 44, props.label, {fill: C.paper, color: C.ink, size: 22, dot: ink.accent});
  const note = hand(root, st, cx + bw / 2 + mat, cy + bh / 2 + mat + 62, String(props.caption).toLowerCase(), {size: 56, color: C.cream, anchor: 'end', rot: -3}); note.node.attr('filter', st.soft);
  return {
    seek(t) {
      const x = leave(t, props.life), w = Math.max(1, bw * swell(span(t, 0, .7))), h = Math.max(1, bh * swell(span(t, .35, .8)));
      frame.attr('d', `M${-w / 2 - mat} ${-h / 2 - mat}h${w + mat * 2}v${h + mat * 2}h${-w - mat * 2}ZM${-w / 2} ${-h / 2}v${h}h${w}v${-h}Z`); pane.attr('x', -w / 2).attr('y', -h / 2).attr('width', w).attr('height', h);
      g.attr('opacity', (t > 0 ? 1 : 0) * (1 - x)).attr('transform', `scale(${1 - x * .05}) rotate(${-1.5 * glide(span(t, .3, 1.2))})`);
      strip.attr('opacity', fade(t, 1.0, .4)).attr('transform', `translate(0 ${-bh / 2 - mat / 2 - (1 - glide(span(t, 1.0, .7))) * 30}) rotate(-3)`);
      chip.g.attr('opacity', fade(t, 1.1, .5)); note.set(glide(span(t, 1.4, 1)) * (1 - x));
    },
  };
}
