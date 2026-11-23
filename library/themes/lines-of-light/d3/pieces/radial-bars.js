import {card, short, C, up, span, ease, io, light, flash, mono, arcPts, along, dot} from './_card.js';

// Radial bars: one arc of light per item, nested round a centre, each sweeping clockwise from the top
// through up to three quarters of a turn by its value over a faint track. Labels sit at the arcs'
// starts; the biggest lands blue at its tip.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Time spent per task', unit: 'Hours per week', clear: false,
  items: [{label: 'Filming', value: 9}, {label: 'Editing', value: 14}, {label: 'Writing', value: 6}, {label: 'Replies', value: 4}, {label: 'Planning', value: 3}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, items = (props.items ?? []).slice(0, 7), n = Math.max(1, items.length), max = Math.max(1e-9, ...items.map(d => d.value));
  const cx = 560, cy = 590, R = 300, gap = Math.min(50, 230 / n);
  const arcs = items.map((d, i) => {
    const r = R - i * gap, sweep = Math.max(4, 270 * d.value / max), pts = arcPts(cx, cy, r, -90, -90 + sweep), at = T + .2 + i * .25;
    const track = light(root, arcPts(cx, cy, r, -90, 180), {width: 1, color: C.mute, echo: false, halo: false, opacity: .5});
    const [ex, ey] = pts.at(-1), a = (-90 + sweep) * Math.PI / 180;
    return {d, at, pts, track, arc: light(root, pts, {width: 2.6}), end: [ex, ey],
      lab: mono(root, cx - 16, cy - r + 7, up(d.label), {size: 18, anchor: 'end', track: .14, opacity: 0, halo: c.clear ? 4 : 0}),
      val: mono(root, ex + Math.cos(a) * 26, ey + Math.sin(a) * 26 + 7, short(d.value), {size: 20, anchor: 'middle', weight: 500, opacity: 0, halo: c.clear ? 4 : 0})};
  });
  const head = dot(root, 0, 0, {color: 'red', r: 7}), best = arcs.reduce((b, s) => !b || s.d.value > b.d.value ? s : b, null), blue = best ? flash(root, best.end[0], best.end[1], {color: 'blue', r: 130}) : null;
  const centre = dot(root, cx, cy, {color: 'red', r: 10});
  return {seek(t) {
    c.seek(t); centre.set(ease(span(t, T - .2, .5))); let tip = null;
    for (const s of arcs) {
      s.track.draw(ease(span(t, s.at - .3, 1.2))); const q = io(span(t, s.at, 1.8)); s.arc.draw(q); if (q > 0 && q < 1) tip ??= along(s.pts, q);
      s.lab.attr('opacity', ease(span(t, s.at, .6))); s.val.attr('opacity', ease(span(t, s.at + 1.6, .5)));
    }
    if (tip) head.at(tip[0], tip[1]).set(1); else head.set(0);
    if (best) { const u = t - best.at - 1.8; blue.set(u > 0 ? .3 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u)); }
  }};
}
