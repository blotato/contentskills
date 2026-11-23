import {C, stage, up, span, ease, io, light, openBox, flash, fire, title, mono, fit, capH, leave} from '../../kit.js';

// A picture-in-picture frame of light for a screenshot or second clip. The red dot fires into the
// frame's left side, the frame opens both ways from there and meets on the right, corner ticks
// draw out, the label lands above and a mono caption sits below. `box` is 0..1 of the frame.
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .14, w: .4, h: .2}, label: 'EXHIBIT A', caption: 'SCREEN RECORDING', fill: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W, H} = st, b = props.box ?? defaults.box, x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H;
  const pane = root.shade.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', '#040506').attr('opacity', 0);
  const fx = Math.max(60, x - 70), shot = fire(root, [[fx, y + h / 2], [x, y + h / 2]], {dur: .4, hold: 99, r: 10});
  const frame = openBox(root, x, y, w, h, {from: 'left', width: 2.6}), ticks = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].map(([cx, cy, sx, sy]) => light(root, [[cx - sx * 16, cy + sy * 30], [cx - sx * 16, cy - sy * 16], [cx + sx * 30, cy - sy * 16]], {width: 1.8, echo: false}));
  const lsize = Math.min(30, fit(up(props.label), w, 30, {track: .3})), label = title(root, up(props.label), x, y - 34, lsize, {anchor: 'start', track: .3, halo: 5});
  const cap = props.caption ? mono(root, x + w, y + h + 50, up(props.caption), {size: 24, anchor: 'end', track: .18, opacity: 0, halo: 4, weight: 500}) : null, blue = flash(root, x + w, y + h / 2, {color: 'blue', r: 140});
  return {seek(t) {
    const xo = leave(t, props.life, .5), tail = ease(xo); pane.attr('opacity', (props.fill ?? 0) * ease(span(t, .5, .5)) * (1 - xo));
    shot.seek(t); shot.line.range(tail, ease(span(t, 0, .4))); frame.range(tail, io(span(t, .4, 1.1))); ticks.forEach((k, i) => k.range(tail, ease(span(t, 1.2 + i * .08, .5))));
    blue.set(t > 1.4 ? .5 * (1 - ease((t - 1.4) / .9)) * (1 - xo) : 0); label.show(ease(span(t, .8, .9)), 1 - xo); cap?.attr('opacity', .85 * ease(span(t, 1.4, .6)) * (1 - xo));
  }};
}
