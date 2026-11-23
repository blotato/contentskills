import {card, C, up, span, ease, io, light, flash, mono, title, arcPts, along, dot} from './_card.js';

// A donut of light: each share is an arc drawn round the ring in turn, a red head on the tip, with
// ticks at the joins and a leader line out to its label. The biggest share lands in the centre.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Where the views came from', unit: 'Share of views', clear: false,
  items: [{label: 'For you feed', value: 58}, {label: 'Search', value: 19}, {label: 'Profile', value: 13}, {label: 'Shares', value: 10}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = props.items ?? [], sum = items.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 500, cy = 570, R = 180, GAP = 3, STEP = .55, LEN = 1;
  light(root, arcPts(cx, cy, R - 24, 0, 360, 120), {width: 1, color: C.mute, echo: false, halo: false, opacity: .4}).draw(1);
  let a = -90; const head = dot(root, 0, 0, {color: 'red', r: 8});
  const segs = items.map((d, i) => {
    const sweep = 360 * d.value / sum, a0 = a + GAP / 2, a1 = a + sweep - GAP / 2, mid = (a0 + a1) / 2 * Math.PI / 180; a += sweep;
    const pts = arcPts(cx, cy, R, a0, Math.max(a0 + .5, a1)), at = T + .2 + i * STEP;
    const tick = light(root, [[cx + Math.cos(a0 * Math.PI / 180) * (R - 16), cy + Math.sin(a0 * Math.PI / 180) * (R - 16)], [cx + Math.cos(a0 * Math.PI / 180) * (R + 16), cy + Math.sin(a0 * Math.PI / 180) * (R + 16)]], {width: 1.4, opacity: .8});
    const side = Math.cos(mid) >= 0 ? 1 : -1, p1 = [cx + Math.cos(mid) * (R + 18), cy + Math.sin(mid) * (R + 18)], p2 = [cx + Math.cos(mid) * (R + 56), cy + Math.sin(mid) * (R + 56)], p3 = [cx + side * (R + 96), p2[1]];
    const lead = light(root, [p1, p2, p3], {width: 1.2, opacity: .75}), anchor = side > 0 ? 'start' : 'end', tx = p3[0] + side * 10;
    const pct = mono(root, tx, p3[1] - 4, Math.round(100 * d.value / sum) + '%', {size: 28, anchor, weight: 500, opacity: 0, halo: c.clear ? 4 : 0});
    const lab = mono(root, tx, p3[1] + 24, up(d.label), {size: 16, anchor, color: C.dim, track: .14, opacity: 0, halo: c.clear ? 4 : 0});
    return {d, pts, at, arc: light(root, pts, {width: 3}), tick, lead, pct, lab};
  });
  const big = items.reduce((b, d) => d.value > b.value ? d : b, items[0] ?? {value: 0, label: ''});
  const centre = title(root, Math.round(100 * big.value / sum) + '%', cx, cy + 22, 64, {track: .1});
  const sub = mono(root, cx, cy + 66, up(big.label), {size: 17, anchor: 'middle', color: C.dim, track: .18, opacity: 0});
  const done = T + .2 + (segs.length - 1) * STEP + LEN, blue = flash(root, cx, cy, {color: 'blue', r: 230});
  return {seek(t) {
    c.seek(t); let tip = null;
    for (const s of segs) {
      const q = ease(span(t, s.at, LEN)); s.arc.draw(q); s.tick.draw(ease(span(t, s.at - .1, .4)));
      if (q > 0 && q < .995) tip = along(s.pts, q);
      s.lead.draw(ease(span(t, s.at + .5, .6))); s.pct.attr('opacity', ease(span(t, s.at + .8, .5))); s.lab.attr('opacity', .9 * ease(span(t, s.at + .9, .5)));
    }
    if (tip) head.at(tip[0], tip[1]).set(1); else head.set(0);
    centre.show(ease(span(t, done - .2, 1.3))); sub.attr('opacity', .9 * ease(span(t, done + .4, .6)));
    const u = t - done; blue.set(u > 0 ? .2 + .5 * Math.exp(-u * 1.5) : 0, .8 + .3 * ease(u));
  }};
}
