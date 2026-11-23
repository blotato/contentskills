import {comicStage, C, up, fit, wrap, capH, glyphs, slam, txt, tags, captionBox, badge, plate, rectPath, clipShape, halftonePath, spark, scaleTo, span, spring, easeOut, clamp} from '../../kit.js';

// A numbered list as a strip of panels. The title slams on, then every `step` seconds the next
// item's panel pops out with a numbered burst and its words lettered in; the item being read is
// the bright one and the others drop back to paper. `kicker` is the caption box by the title.
export const meta = {duration: 6, live: true};
export const defaults = {
  title: 'THE PLAN', kicker: 'FOUR MOVES', items: ['FIND THE HOOK', 'WRITE IT SHORT', 'CUT THE FLUFF', 'POST IT TODAY'],
  labels: ['AGENDA', 'TODAY', 'IN THIS\nORDER'], step: .8, accent: 'blue',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 70, items = props.items.map(up), n = items.length, title = up(props.title);
  const tsize = fit(title, W - m * 2 - 60, H * .12 / capH(1)), tcap = capH(tsize), top = 150 + 60 * k, listTop = top + tcap + 110 * (k * .6 + .4), room = H - listTop - 90, rh = Math.min(250, room / n - 24), pitch = rh + Math.min(44, (room - rh * n) / Math.max(1, n - 1));
  const letters = glyphs(root, title, m, top + tcap, tsize, {color: ink.head}), kicker = captionBox(root, W - m, top + tcap + 22, props.kicker, {size: 34, anchor: 'end', tilt: 3}), head = tags(root, props.labels, 58);
  const o = {role: 'slab'}, room2 = W - m * 2 - rh * .62 - 110, base = rh * .5 / capH(1, o);
  const rows = items.map((item, i) => {
    const y = listTop + i * pitch, g = root.append('g').attr('transform', `translate(${W / 2} ${y + rh / 2})`).append('g'), box = plate(g, {shape: rectPath, fill: C.paper, drop: 10}).box(-W / 2 + m + 30, -rh / 2, W - m * 2 - 30, rh);
    const clip = clipShape(stage, rectPath(-W / 2 + m + 30, -rh / 2, W - m * 2 - 30, rh)), tone = g.append('path').attr('clip-path', clip.url).attr('d', halftonePath(-W / 2 + m + 30, -rh / 2, W - m * 2 - 30, rh, {pitch: 22, from: [1, 1], reach: .5})).attr('fill', C.orange).attr('opacity', .8);
    const size = Math.max(Math.min(base, fit(item, room2, 400, o)), Math.min(base, 44)), rowsOf = size > fit(item, room2, 400, o) ? wrap(item, size, room2, o) : [item], cap = capH(size, o);
    const label = txt(g, -W / 2 + m + rh * .62 + 50, cap / 2 - (rowsOf.length - 1) * size * .55, rowsOf.join('\n'), {size, role: 'slab', color: C.ink, leading: 1.1});
    const num = badge(g, -W / 2 + m + 30, 0, rh * .56, i + 1, {fill: ink.plate, seed: i + 1});
    return {g, box, tone, label, num, at: 1 + i * props.step, tilt: (i % 2 ? 1 : -1) * 1.2};
  });
  const star = spark(root, W - m - 10, top - 30, 36, ink.third);
  return {
    seek(t) {
      letters.forEach(u => slam(u, span(t, .1 + u.i * .05, .5), 0, {drop: 30}));
      scaleTo(kicker.g, spring(span(t, .6, .45))); head.forEach((b, i) => scaleTo(b.g, spring(span(t, .5 + i * .07, .4))));
      const now = clamp(Math.floor((t - 1) / props.step), 0, n - 1);
      rows.forEach((r, i) => {
        const q = span(t, r.at, .45), on = i === now && q > 0;
        scaleTo(r.g, spring(q) * (on ? 1.03 : 1), r.tilt * (on ? 1.6 : 1)); r.box.node.attr('fill', on ? C.yellow : C.paper); r.tone.attr('opacity', on ? .8 : 0);
        r.label.attr('opacity', span(t, r.at + .15, .1)).attr('transform', `translate(${(1 - easeOut(span(t, r.at + .15, .3))) * 40} 0)`);
        r.num.boil(t + i); scaleTo(r.num.g, spring(span(t, r.at + .1, .4)), -10 + (on ? Math.sin(t * 5) * 6 : 0));
      });
      scaleTo(star, spring(span(t, .9, .4)) * (1 + .18 * Math.sin(t * 6)), t * 50);
    },
  };
}
