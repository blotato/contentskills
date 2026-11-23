import {C, stage, up, txt, torn, chip, tapeStrip, dust, hold, jit, jtf, pop, presence} from '../../kit.js';

// The footage seen through a hole torn in a sheet of paper: ragged bone paper along the top and
// bottom (thin slivers down the sides), a taped title scrap on the top edge and a typed line below.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'FIELD RECORDING', foot: 'NO. 07 — UNEDITED', top: 150, bottom: 150, side: 26, color: 'bone'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine, W, H} = st, fill = C[props.color] ?? props.color, dark = fill === C.soot || fill === C.char, g = root.append('g');
  const hole = (seed, grow) => torn(props.side - grow, props.top - grow, W - props.side * 2 + grow * 2, H - props.top - props.bottom + grow * 2, {seed, amp: 16, step: 15});
  const outer = `M-60 -60H${W + 60}V${H + 60}H-60Z`;
  const frames = [0, 1, 2].map(i => { const f = g.append('g'); f.append('path').attr('d', outer + hole(4 + i * 9, 7)).attr('fill', C.white).attr('fill-rule', 'evenodd'); f.append('path').attr('d', outer + hole(2 + i * 9, 0)).attr('fill', fill).attr('fill-rule', 'evenodd'); return f; });
  const specks = dust(g.append('g'), W, props.top, {color: dark ? C.bone : C.soot, n: 14, seed: 4, opacity: .5});
  const tag = root.append('g'), ti = tag.append('g'); if (props.title) { chip(ti, up(props.title), {size: 44, fill: dark ? C.bone : C.soot, color: dark ? C.soot : C.bone, seedv: 5, sides: 'rl'}); tapeStrip(ti, 130, 40, {seed: 3}).attr('transform', `translate(${-ti.node().getBBox().width / 2 + 30} ${-44}) rotate(-12)`); }
  const foot = txt(fine, W / 2, H - props.bottom / 2 + 14, up(props.foot), {size: 30, anchor: 'middle', color: dark ? C.bone : C.soot});
  return {seek(t) {
    const s = st.tick(t), o = presence(t, props.life);
    g.attr('opacity', o); frames.forEach((f, i) => f.attr('display', i === s % 3 ? null : 'none')); specks.set(s);
    tag.attr('transform', jtf(W / 2, props.top / 2 + 16, s, 2, {tilt: -2, scale: pop(t, .2)})).attr('opacity', o); foot.attr('opacity', hold(t) >= .5 ? o : 0);
  }};
}
