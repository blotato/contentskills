import {C, card, txt, label, fade, glide, span, swell, mix} from '../../kit.js';
import {hold} from './_local.js';

// A raw take becoming an edit, as two strips drawn to one scale and joined: the recording on top with
// its kept takes solid and its pauses in the accent; at `cutAt` every kept take drops through a ribbon
// to its new place in the strip underneath, which is as much shorter as the edit really is. The two
// lengths stand beside the strips in thin tall numerals. With `use: 'project'` this is the real edit
// decision list of the video; otherwise pass `before` and `segments` [{in, out}] and say if illustrative.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Raw clip in, edited reel out', unit: 'Illustrative · one take, to scale', clear: false, field: 'bone', accent: 'poppy', use: '', a: 'Raw clip', b: 'Edited reel', suffix: ' s', cutAt: 1.1, closeFor: .6,
  before: 60, segments: [{in: 2, out: 9}, {in: 13, out: 21}, {in: 24, out: 30}, {in: 37, out: 44}, {in: 52, out: 56}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {ink} = st, g = st.body, d3 = window.d3, edl = props.use === 'project' ? props.project?.edl : null;
  const before = edl?.before ?? props.before, segs = (edl?.segments ?? props.segments).map(s => ({in: s.in, out: s.out})); let run = 0; for (const s of segs) { s.at = run; run += s.out - s.in; }
  const after = edl?.after ?? run, x = d3.scaleLinear().domain([0, before]).range([90, 910]), ya = 420, yb = 720, h = 86;
  const pauses = []; let edge = 0; for (const s of segs) { if (s.in > edge + .01) pauses.push([edge, s.in]); edge = s.out; } if (before > edge + .01) pauses.push([edge, before]);
  const na = txt(g, 90, ya - 34, '', {size: 120, role: 'num', color: ink.head}).style('font-variant-numeric', 'tabular-nums'), la = label(g, 910, ya - 40, props.a, {size: 30, color: ink.head, anchor: 'end'});
  const nb = txt(g, 90, yb + h + 128, '', {size: 150, role: 'num', color: ink.accent}).style('font-variant-numeric', 'tabular-nums'), lb = label(g, 910, yb + h + 56, props.b, {size: 30, color: ink.head, anchor: 'end'}), foot = label(g, 910, yb + h + 104, `${Math.round((1 - after / before) * 100)}% shorter  ·  ${segs.length - 1} cuts`, {size: 24, color: ink.dim, anchor: 'end'});
  const gaps = pauses.map(p => g.append('rect').attr('x', x(p[0])).attr('y', ya).attr('height', h).attr('fill', ink.accent)), ribbons = segs.map(() => g.append('path').attr('fill', ink.head).attr('opacity', .13));
  const tops = segs.map(s => g.append('rect').attr('x', x(s.in)).attr('y', ya).attr('height', h).attr('fill', ink.head)), bots = segs.map(() => g.append('rect').attr('y', yb).attr('height', h).attr('fill', ink.head));
  const end = g.append('rect').attr('y', yb - 12).attr('width', 4).attr('height', h + 24).attr('fill', ink.accent);
  return {seek(t) {
    hold(st, t); const grow = glide(span(t, .08, .45)), cut = props.cutAt, n = segs.length;
    tops.forEach((r, i) => r.attr('width', Math.max(1.5, (x(segs[i].out) - x(segs[i].in)) * grow - 2)).attr('x', mix(90, x(segs[i].in), grow)));
    gaps.forEach((r, i) => r.attr('x', mix(90, x(pauses[i][0]), grow)).attr('width', Math.max(0, (x(pauses[i][1]) - x(pauses[i][0])) * grow - 2)).attr('opacity', .3 + .7 * fade(t, .35 + i * .25 / pauses.length, .1)));
    segs.forEach((s, i) => {
      const q = swell(span(t, cut + i * props.closeFor * .5 / n, props.closeFor * .6)), x0 = x(s.in), x1 = x(s.out) - 2, b0 = x(s.at), b1 = x(s.at + s.out - s.in) - 2, yq = mix(ya + h, yb, q), m0 = mix(x0, b0, q), m1 = mix(x1, b1, q), mid = (ya + h + yq) / 2;
      ribbons[i].attr('d', q > 0 ? `M${x0} ${ya + h}C${x0} ${mid} ${m0} ${mid} ${m0} ${yq}L${m1} ${yq}C${m1} ${mid} ${x1} ${mid} ${x1} ${ya + h}Z` : null);
      bots[i].attr('x', b0).attr('width', Math.max(1.5, b1 - b0)).attr('opacity', q >= .98 ? 1 : 0);
    });
    const done = swell(span(t, cut, props.closeFor)); na.text(before.toFixed(1) + props.suffix).attr('opacity', fade(t, .05, .15)); la.attr('opacity', fade(t, .15, .2));
    nb.text(mix(before, after, glide(span(t, cut, props.closeFor + .1))).toFixed(1) + props.suffix).attr('opacity', fade(t, cut, .12)); lb.attr('opacity', fade(t, cut, .2)); foot.attr('opacity', fade(t, cut + props.closeFor, .2));
    end.attr('x', x(mix(before, after, done)) - 2).attr('opacity', fade(t, cut, .1));
  }};
}
