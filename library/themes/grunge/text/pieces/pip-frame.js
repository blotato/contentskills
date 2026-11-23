import {C, stage, look, up, txt, torn, chip, tapeStrip, hold, jit, jtf, pop, presence, leave} from '../../kit.js';

// A torn paper window for a picture-in-picture: a bone paper frame with a ragged outside edge
// around the box, taped at two corners, with a label scrap and a typed caption underneath.
export const meta = {duration: 4.5, live: true};
export const defaults = {box: {x: .52, y: .075, w: .42, h: .2}, label: 'EXHIBIT A', caption: 'SCREEN RECORDING', fill: 0, accent: 'red'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine, W, H} = st, ink = look(props.accent), b = props.box, bw = b.w * W, bh = b.h * H, cx = b.x * W + bw / 2, cy = b.y * H + bh / 2, e = 22;
  const g = root.append('g'), inner = g.append('g');
  inner.append('rect').attr('x', -bw / 2).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('fill', C.soot).attr('opacity', props.fill);
  const hole = `M${-bw / 2} ${-bh / 2}V${bh / 2}H${bw / 2}V${-bh / 2}Z`;
  inner.append('path').attr('d', torn(-bw / 2 - e - 4, -bh / 2 - e - 4, bw + e * 2 + 8, bh + e * 2 + 8, {seed: 9, amp: 9}) + hole).attr('fill', C.white).attr('fill-rule', 'evenodd');
  inner.append('path').attr('d', torn(-bw / 2 - e, -bh / 2 - e, bw + e * 2, bh + e * 2, {seed: 4, amp: 7}) + hole).attr('fill', C.bone).attr('fill-rule', 'evenodd');
  tapeStrip(inner, 150, 44, {seed: 1}).attr('transform', `translate(${-bw / 2 - 6} ${-bh / 2 - 6}) rotate(-38)`); tapeStrip(inner, 150, 44, {seed: 2}).attr('transform', `translate(${bw / 2 + 6} ${bh / 2 + 6}) rotate(-38)`);
  const label = fine.append('g'); if (props.label) chip(label.append('g'), up(props.label), {size: 32, fill: ink.accent, seedv: 3});
  const caption = txt(fine, cx, cy + bh / 2 + e + 50, up(props.caption), {size: 28, anchor: 'middle', shade: true});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), x = leave(t, props.life), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    g.attr('transform', jtf(cx, cy, s, 2, {tilt: -1.2, scale: pop(t, .05), amp: 1.5, rot: .25})).attr('opacity', o);
    label.attr('transform', jtf(cx - bw / 2 + 110, cy - bh / 2 - e - 8, s, 6, {tilt: -4, scale: pop(t, .4)})).attr('opacity', o);
    caption.attr('opacity', h >= .6 ? o : 0);
  }};
}
