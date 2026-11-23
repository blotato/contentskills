import {C, stage, tone, bar, torn, tape, texture, span, settle, leave, presence} from '../../kit.js';

// A paper mount for a picture-in-picture area: an aged card border with a torn outer edge and a
// clean window (put a screen recording or image under it), black photo corners, a strip of tape, a
// label bar on top and a caption on a dark strip below. `box` is the window, 0..1 of the frame;
// `fill` darkens the window (0 = fully see-through).
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .075, w: .42, h: .2}, label: 'EXHIBIT A', caption: 'SCREEN RECORDING', fill: 0, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, W, H, defs} = st, b = props.box, bw = b.w * W, bh = b.h * H, cx = b.x * W + bw / 2, cy = b.y * H + bh / 2, gt = 24, g = root.append('g');
  const hole = `M${-bw / 2} ${-bh / 2}V${bh / 2}H${bw / 2}V${-bh / 2}Z`, d = torn(-bw / 2 - gt, -bh / 2 - gt, bw + gt * 2, bh + gt * 2, {seed: 6, rough: 6, step: 20}) + hole;
  g.append('path').attr('d', d).attr('fill-rule', 'evenodd').attr('fill', '#000').attr('opacity', .45).attr('transform', 'translate(8 12)');
  g.append('path').attr('d', hole).attr('fill', C.ink).attr('fill-opacity', props.fill);
  g.append('path').attr('d', d).attr('fill-rule', 'evenodd').attr('fill', C.paper); g.append('path').attr('d', d).attr('fill-rule', 'evenodd').attr('fill', texture(defs, 'paper', 2.5).url).attr('opacity', .5);
  g.append('path').attr('d', hole).attr('fill', 'none').attr('stroke', '#15181d').attr('stroke-width', 2).attr('opacity', .6);
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sy]) => g.append('path').attr('d', `M${sx * (bw / 2 + 5)} ${sy * (bh / 2 + 5)}h${-sx * 46}L${sx * (bw / 2 + 5)} ${sy * (bh / 2 - 41)}Z`).attr('fill', '#111419'));
  tape(g, 140, 40, {seed: 3}).attr('transform', `translate(${bw * .26} ${-bh / 2 - gt}) rotate(4)`);
  const top = props.label ? bar(g, props.label, {size: 38, fill: tone(props.color), weight: 700, spacing: .08}) : null, cap = props.caption ? bar(g, props.caption, {size: 28, fill: 'glass', seed: 4, spacing: .1}) : null;
  top?.g.attr('transform', `translate(${-bw / 2 - gt - 12} ${-bh / 2 - gt - 6})`); cap?.g.attr('transform', `translate(${-bw / 2 + 6} ${bh / 2 + gt + (cap?.h ?? 0) / 2 + 2})`);
  return {seek(t) {
    const x = leave(t, props.life), e = settle(span(t, 0, .9)); root.attr('opacity', presence(t, props.life));
    g.attr('transform', `translate(${cx} ${cy + 22 * (1 - e) + 30 * x}) rotate(${.8 * (1 - e)}) scale(${.97 + .03 * e})`); top?.reveal(span(t, .4, .8)); cap?.reveal(span(t, .7, .8));
  }};
}
