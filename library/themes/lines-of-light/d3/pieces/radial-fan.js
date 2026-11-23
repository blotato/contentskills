import {card, short, C, up, span, ease, io, light, flash, mono, openBox, rays, arcPts, measure} from './_card.js';

// A fan of rays from a source at the bottom: nested half-rings open round the source, a fine dim
// sunburst comes up behind, and one ray per item runs out to a length set by its value, where a label
// box opens from the point the ray touches it. The longest ray lands blue.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Plan a week', unit: 'Posts per day', clear: false,
  items: [{label: 'Mon', value: 2}, {label: 'Tue', value: 3}, {label: 'Wed', value: 2}, {label: 'Thu', value: 4}, {label: 'Fri', value: 3}, {label: 'Sat', value: 5}, {label: 'Sun', value: 1}]};

export function mount(el, props = defaults) {
  const c = card(el, {...props}, {source: [.5, .85]}), {root, T} = c, items = (props.items ?? []).slice(0, 9), n = Math.max(1, items.length), max = Math.max(1e-9, ...items.map(d => d.value));
  const cx = 500, cy = 850, A0 = 196, A1 = 344, R0 = 96;
  const arcs = [44, 62, 80].map(r => [light(root, arcPts(cx, cy, r, 180, 270), {width: 1.8}), light(root, arcPts(cx, cy, r, 360, 270), {width: 1.8})]);
  const base = light(root, [[90, cy], [910, cy]], {width: 1, color: C.mute, echo: false, halo: false, opacity: .7});
  const burst = rays(root, cx, cy, R0, 330, 40, 184, 356, {width: 1, color: C.mute, echo: false, halo: false, fade: .9});
  const spokes = items.map((d, i) => {
    const a = (A0 + (A1 - A0) * (n > 1 ? i / (n - 1) : .5)) * Math.PI / 180, len = 230 + 190 * d.value / max, ca = Math.cos(a), sa = Math.sin(a);
    const str = up(d.label), bw = measure(str, 20, {font: '"IBM Plex Mono"', weight: 300, track: .12}) + 30, bh = 40;
    const ex = cx + ca * len, ey = cy + sa * len, bx = ex - bw / 2, by = ey - bh;
    const at = T + .5 + i * .22, from = [ex, ey];
    return {d, at, ex, ey, ray: light(root, [[cx + ca * R0, cy + sa * R0], [ex, ey]], {width: 2}), box: openBox(root, bx, by, bw, bh, {from: 'bottom', width: 1.6}),
      lab: mono(root, ex, by + 27, str, {size: 20, anchor: 'middle', track: .12, opacity: 0, halo: c.clear ? 4 : 0}),
      val: mono(root, ex, by - 14, short(d.value), {size: 18, anchor: 'middle', color: C.dim, weight: 500, opacity: 0, halo: c.clear ? 4 : 0})};
  });
  const best = spokes.reduce((b, s) => !b || s.d.value > b.d.value ? s : b, null), blue = best ? flash(root, best.ex, best.ey - 20, {color: 'blue', r: 120}) : null;
  return {seek(t) {
    c.seek(t); base.draw(ease(span(t, T - .3, 1.2)));
    arcs.forEach((pair, i) => pair.forEach(l => l.draw(io(span(t, T + i * .15, 1)))));
    burst.forEach(l => l.draw(ease(span(t, T + .3 + Math.abs(l.k - .5) * .8, 1.2))));
    for (const s of spokes) {
      const q = ease(span(t, s.at, 1.2)); s.ray.draw(q); s.box.draw(io(span(t, s.at + .9, .7)));
      s.lab.attr('opacity', ease(span(t, s.at + 1.2, .5))); s.val.attr('opacity', .9 * ease(span(t, s.at + 1.4, .5)));
    }
    if (best) { const u = t - best.at - 1.6; blue.set(u > 0 ? .25 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u)); }
  }};
}
