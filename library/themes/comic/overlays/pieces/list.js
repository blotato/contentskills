import {comicStage, C, look, up, fit, capH, txt, plate, rectPath, slabLabel, badge, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// A list that builds as the speaker names things: the title pops on a slab, then each item pops
// out as a paper strip with a numbered burst at `times[i]` seconds (or evenly spaced). The newest
// item is the yellow one. `y` is the top edge; keep the block above or below the face.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'THE DEFAULT PLAN', items: ['POST EVERY DAY', 'GROW', 'HOPE TO GET PAID'], times: null, y: 200, accent: 'red', x: 70, width: 760};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), items = props.items.map(up), o = {role: 'slab'}, rh = 96, gap = 22, x0 = props.x;
  const title = slabLabel(root, x0, props.y, props.title, {size: fit(up(props.title), props.width - 80, 62, o), fill: ink.accent, tilt: -2}), top = props.y + title.h + 34;
  const size = Math.min(fit(items, props.width - 150, 64, o)), cap = capH(size, o);
  const rows = items.map((item, i) => {
    const g = root.append('g').attr('transform', `translate(${x0 + 60} ${top + i * (rh + gap) + rh / 2})`).append('g'), w = Math.min(props.width - 60, Math.max(280, 110 + size * item.length * .46 + 60));
    const box = plate(g, {shape: rectPath, fill: C.paper, drop: 8, width: 6}).box(0, -rh / 2, w, rh); txt(g, 80, cap / 2, item, {size, role: 'slab', color: C.ink});
    return {g, box, num: badge(g, 0, 0, 58, i + 1, {fill: ink.accent, seed: i + 1}), at: props.times?.[i] ?? .5 + i * .7};
  });
  return {
    seek(t) {
      const x = leave(t, props.life); scaleTo(title.g, spring(span(t, 0, .42)) * (1 - x));
      const latest = rows.reduce((a, r, i) => t >= r.at ? i : a, -1);
      rows.forEach((r, i) => { const q = span(t, r.at, .4); scaleTo(r.g, spring(q) * (1 - x), (i % 2 ? 1 : -1) * 1.2 + (1 - easeOut(q)) * -8); r.box.node.attr('fill', i === latest ? C.yellow : C.paper); r.num.boil(t + i); });
    },
  };
}
