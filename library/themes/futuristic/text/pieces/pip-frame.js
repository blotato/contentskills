import {textStage, look, up, fit, capH, measure, txt, plate, shade, bracketFrame, mark, halo, appear, span, spring, easeOut, leave, vel} from '../kit.js';

// Overlay: a bracketed picture-in-picture frame. The brackets punch in oversized and settle, a
// label tab stretches out along the top, a targeting ring smears in behind one corner and a
// reticle mark spins on another. `box` is 0..1 of the frame; `fill` darkens the window (0 leaves
// it see-through for footage or a picture placed underneath).
export const meta = {duration: 4, live: true};
export const defaults = {box: {x: .52, y: .075, w: .42, h: .2}, label: 'EXHIBIT A', caption: 'SCREEN RECORDING', fill: 0, accent: 'cyan'};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W, H} = stage, ink = look(props.accent), b = props.box, bw = b.w * W, bh = b.h * H, cx = b.x * W + bw / 2, cy = b.y * H + bh / 2;
  const ring = halo(root, stage, {color: ink.alt, ghosts: 4}), g = root.append('g').attr('transform', `translate(${cx} ${cy})`), pane = shade(g, props.fill, 0).set(-bw / 2, -bh / 2, bw, bh);
  const frame = g.append('g'); frame.append('rect').attr('x', -bw / 2).attr('y', -bh / 2).attr('width', bw).attr('height', bh).attr('fill', 'none').attr('stroke', ink.accent).attr('stroke-width', 2).attr('opacity', .7);
  bracketFrame(frame, -bw / 2 - 16, -bh / 2 - 16, bw + 32, bh + 32, {len: Math.min(70, bh / 3), color: ink.accent, width: 7});
  const lsize = fit(up(props.label), bw - 60, 44, {role: 'text'}), lw = measure(up(props.label), lsize, {role: 'text'}) + 44, tab = g.append('g').attr('transform', `translate(${-bw / 2 - 16} ${-bh / 2 - 16 - 78})`), slab = plate(tab, {fill: ink.accent, cut: 14});
  const name = txt(tab, 22, 32 + capH(lsize, {role: 'text'}) / 2, up(props.label), {size: lsize, color: ink.on});
  const caption = txt(g, bw / 2 + 12, bh / 2 + 62, up(props.caption), {size: 28, role: 'mono', anchor: 'end', shade: true});
  const star = mark(g, -bw / 2 - 16, bh / 2 + 16, 30, ink.third);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .55), s = 1 + .7 * (1 - spring(q)) + x * .25;
      frame.attr('transform', `scale(${s})`).attr('opacity', appear(t, .05) * (1 - x)); pane.node.attr('opacity', span(t, .2, .2) * (1 - x));
      const k = span(t, .45, .4), e = easeOut(k); slab.set(0, 0, lw * e * (1 - x), 64); slab.node.attr('transform', `skewX(${-vel(k) * 16})`); name.attr('opacity', appear(t, .65) * (1 - x));
      caption.attr('opacity', appear(t, .8) * (1 - x)).attr('transform', `translate(${30 * (1 - easeOut(span(t, .8, .35)))} 0)`);
      star.attr('transform', `rotate(${t * 80}) scale(${spring(span(t, .7, .5)) * (1 - x)})`);
      const p = span(t, .15, .8), r = Math.min(bw, bh) * .2; ring.set(cx + bw / 2 - 6 + Math.sin(t * .9) * 10 + (1 - easeOut(p)) * 300, cy - bh / 2 + 8 + Math.cos(t * .8) * 8, r * (1 - x), 60 + vel(p) * 200 + Math.cos(t * .9) * 16, 0, p > 0 ? 1 : 0, t * 40);
    },
  };
}
