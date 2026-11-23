import {card, guide, short, invert, C, up, span, ease, io, light, flash, mono, dot, comma} from './_card.js';

// A funnel drawn in light. The rim opens from its middle, the two walls run down, and each stage's
// line opens from both walls the moment they reach it, meeting in the middle. A red drop falls through
// the centre and lands blue at the outlet. Each stage shows its count and its share of the first.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'From view to sale', unit: 'People at each step', clear: false,
  stages: [{label: 'Saw the video', value: 10000}, {label: 'Opened profile', value: 2400}, {label: 'Clicked the link', value: 600}, {label: 'Bought', value: 90}]};

export function mount(el, props = defaults) {
  const c = card(el, props), {root, T} = c, S = (props.stages ?? props.items ?? []).slice(0, 6), n = Math.max(1, S.length), first = S[0]?.value || 1;
  const cx = 330, top = 290, bot = 830, h = (bot - top) / n, w = k => 500 - k * (360 / n), WALL = 2.4;
  const yAt = k => top + k * h, wall = s => Array.from({length: n + 1}, (_, k) => [cx + s * w(k) / 2, yAt(k)]);
  const rim = [light(root, [[cx, top], [cx - w(0) / 2, top]], {width: 2.4}), light(root, [[cx, top], [cx + w(0) / 2, top]], {width: 2.4})];
  const walls = [light(root, wall(-1), {width: 2.2}), light(root, wall(1), {width: 2.2})], wq = u => ease(u), WT = T + .4;
  const axis = guide(root, [[cx, top + 10], [cx, bot + 50]], {dash: '3 8'});
  const rows = S.map((d, i) => {
    const k = i + 1, y = yAt(k), reach = WT + WALL * invert(wq, k / n), mid = (yAt(i) + y) / 2, share = 100 * d.value / first;
    const halves = k < n ? [light(root, [[cx - w(k) / 2, y], [cx, y]], {width: 1.6, opacity: .8}), light(root, [[cx + w(k) / 2, y], [cx, y]], {width: 1.6, opacity: .8})] : [light(root, [[cx - w(k) / 2, y], [cx + w(k) / 2, y]], {width: 2})];
    const lx = 600, lead = light(root, [[cx + (w(i) + w(k)) / 4 + 14, mid], [lx - 14, mid]], {width: 1.1, opacity: .6});
    const pct = mono(root, cx, mid + 9, (share >= 10 || share === 0 ? Math.round(share) : share.toFixed(1)) + '%', {size: 24, anchor: 'middle', weight: 500, opacity: 0, halo: c.clear ? 4 : 0});
    const val = mono(root, lx, mid - 2, comma(d.value), {size: 30, weight: 500, opacity: 0, halo: c.clear ? 4 : 0});
    const lab = mono(root, lx, mid + 28, up(d.label), {size: 17, color: C.dim, track: .14, opacity: 0, halo: c.clear ? 4 : 0});
    return {reach: WT + WALL * invert(wq, (i + .5) / n), line: reach, halves, lead, pct, val, lab};
  });
  const drop = dot(root, cx, top, {color: 'red', r: 9}), blue = flash(root, cx, bot, {color: 'blue', r: 150}), DROP = [T + 1.2, 2.6];
  return {seek(t) {
    c.seek(t); rim.forEach(l => l.draw(ease(span(t, T, .8)))); axis.draw(ease(span(t, T, 1.5)));
    const q = wq(span(t, WT, WALL)); walls.forEach(l => l.draw(q));
    for (const r of rows) {
      r.halves.forEach(l => l.draw(ease(span(t, r.line - .05, .7)))); r.lead.draw(ease(span(t, r.reach + .3, .5)));
      r.pct.attr('opacity', ease(span(t, r.reach + .2, .5))); r.val.attr('opacity', ease(span(t, r.reach + .5, .5))); r.lab.attr('opacity', .9 * ease(span(t, r.reach + .6, .5)));
    }
    const d = span(t, DROP[0], DROP[1]); drop.at(cx, top + (bot - top) * d * d).set(d > 0 && d < 1 ? 1 : 0);
    const u = t - DROP[0] - DROP[1]; blue.set(u > 0 ? .25 + .6 * Math.exp(-u * 1.5) : 0, 1 + .3 * ease(u));
  }};
}
