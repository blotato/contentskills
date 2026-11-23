import {C, F, FRAME, hudStage, brackets, chamfer, plate, line, text, span, presence, easeOut, typed, flicker, timecode, blink} from '../../hud.js';

// A picture-in-picture window frame: it opens from a line (wide first, then tall), then holds
// with corner brackets, a label tab, REC timecode, a centre mark and a scan line. `box` is 0..1
// of the frame; `fill` is how dark the window is (0 leaves it see-through for footage placed
// underneath).
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .5, y: .58, w: .42, h: .2}, label: 'SOURCE 02', caption: 'SCREEN CAPTURE', fill: .5, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, {width: W, height: H} = FRAME, b = props.box, bx = b.x * W, by = b.y * H, bw = b.w * W, bh = b.h * H, cx = bx + bw / 2, cy = by + bh / 2;
  const pane = root.append('rect').attr('fill', C.bg).attr('fill-opacity', props.fill), edge = line(root, '', color, 2), corners = line(root, '', color, 5), scan = line(root, '', color, 2), mark = line(root, `M${cx - 18} ${cy}h36M${cx} ${cy - 18}v36`, C.white, 2);
  const tw = props.label.length * 19 + 70, tab = root.append('g').attr('transform', `translate(${bx} ${by - 58})`); plate(tab, chamfer(0, 0, tw, 46, 10), .76); line(tab, chamfer(0, 0, tw, 46, 10), color, 2);
  tab.append('rect').attr('x', 14).attr('y', 15).attr('width', 16).attr('height', 16).attr('fill', C.amber); const name = text(tab, 42, 33, '', {size: 26, color: C.white});
  const rec = root.append('g'), lamp = rec.append('circle').attr('cx', bx + 26).attr('cy', by + bh - 26).attr('r', 8).attr('fill', C.red), clock = text(rec, bx + 44, by + bh - 17, '', {size: 22, color: C.white});
  const caption = text(root, bx + bw, by + bh + 44, '', {size: 24, color, anchor: 'end', spacing: '.18em'}), nubs = line(root, `M${bx - 26} ${cy - 30}v60M${bx + bw + 26} ${cy - 30}v60`, C.dim, 3);
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const w = Math.max(2, bw * easeOut(span(t, .05, .35))), h = Math.max(2, bh * easeOut(span(t, .35, .4))), x = cx - w / 2, y = cy - h / 2, open = span(t, .7, .05);
      pane.attr('x', x).attr('y', y).attr('width', w).attr('height', h); edge.attr('d', `M${x} ${y}H${x + w}V${y + h}H${x}Z`);
      const out = 14 + (t > .8 ? 4 * Math.sin(t * 3) : 0); corners.attr('d', brackets(x - out, y - out, w + out * 2, h + out * 2, Math.min(46, h / 2))).attr('opacity', flicker(t, .4));
      const sy = y + ((t * .35) % 1) * h; scan.attr('d', `M${x + 4} ${sy}H${x + w - 4}`).attr('opacity', open * .5); mark.attr('opacity', open * .8); nubs.attr('opacity', flicker(t, .75));
      tab.attr('opacity', flicker(t, .7)); name.text(typed(props.label, span(t, .75, .3))); rec.attr('opacity', open); lamp.attr('opacity', blink(t) ? 1 : .2); clock.text('REC ' + timecode(t));
      caption.text(typed(props.caption, span(t, .95, .4)));
    },
  };
}
