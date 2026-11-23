import {C, stage, txt, label, leave, fade, glide, span, swell, mix, clamp} from '../../kit.js';
import {inks, plate, small} from './_ui.js';

// An editing timeline that edits itself: the raw take as one strip, the kept takes solid and the dead
// air between them in the accent; at `cutAt` every pause is cut out and the takes close up, the strip
// shrinking to its true new length while the duration counts down. With `use: 'project'` the strip is the
// real edit decision list of this very video (projects/<name>/edit/edl.json); otherwise pass
// `before`, `after` (seconds) and `segments` [{in, out}] yourself — and say so if they are illustrative.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'The raw take', done: 'Cleaned up', unit: 's', note: '', cutAt: 1.2, closeFor: .7, x: 70, y: 1180, w: 940, theme: 'bone', accent: 'poppy', use: '',
  before: 60, after: 32, segments: [{in: 2, out: 9}, {in: 13, out: 21}, {in: 24, out: 30}, {in: 37, out: 44}, {in: 52, out: 56}]};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), ink = inks(props.theme), {x, y, w} = props, edl = props.use === 'project' ? props.project?.edl : null;
  const before = edl?.before ?? props.before, segs = (edl?.segments ?? props.segments).map(s => ({in: s.in, out: s.out})), after = edl?.after ?? segs.reduce((n, s) => n + s.out - s.in, 0);
  let run = 0; for (const s of segs) { s.at = run; run += s.out - s.in; }
  const pauses = []; let edge = 0; for (const s of segs) { if (s.in > edge + .01) pauses.push({from: edge, to: s.in}); edge = s.out; } if (before > edge + .01) pauses.push({from: edge, to: before});
  const h = 400, g = st.root.append('g'), card = g.append('g'); plate(card, st, x, y, w, h, props.theme);
  const a = small(card, x + 44, y + 62, props.title, ink), b = small(card, x + 44, y + 62, props.done, ink, {color: ink.head});
  const num = txt(card, x + w - 44, y + 132, '', {size: 104, role: 'num', color: ink.head, anchor: 'end'}).style('font-variant-numeric', 'tabular-nums');
  const sx = x + 44, sw = w - 88, sy = y + 184, sh = 104, k = sw / before;
  card.append('rect').attr('x', sx).attr('y', sy + sh + 16).attr('width', sw).attr('height', 2).attr('fill', ink.line).attr('opacity', ink.faint);
  const gaps = pauses.map(p => card.append('rect').attr('y', sy).attr('height', sh).attr('fill', st.ink.accent)), takes = segs.map(() => card.append('rect').attr('y', sy).attr('height', sh).attr('fill', ink.head));
  const head = card.append('rect').attr('y', sy - 14).attr('width', 4).attr('height', sh + 28).attr('fill', st.ink.accent);
  const note = props.note || `${(before - after).toFixed(1)} ${props.unit} of pauses out  ·  ${Math.max(0, segs.length - 1)} cuts`, foot = small(card, x + 44, y + h - 40, note, ink, {color: ink.head});
  const ends = [label(card, sx, sy + sh + 52, '0', {size: 18, color: ink.dim}), label(card, sx + sw, sy + sh + 52, before.toFixed(1) + ' ' + props.unit, {size: 18, color: ink.dim, anchor: 'end'})];
  return {
    seek(t) {
      const out = leave(t, props.life, .22), into = glide(span(t, 0, .26)), cut = props.cutAt, n = pauses.length;
      g.attr('opacity', fade(t, 0, .1) * (1 - out)); card.attr('transform', `translate(0 ${(1 - into) * 70 + out * 30})`);
      const grow = glide(span(t, .1, .55)), close = swell(span(t, cut + .12, props.closeFor));
      takes.forEach((r, i) => { const s = segs[i], x0 = mix(s.in, s.at, close) * k; r.attr('x', sx + x0 * grow).attr('width', Math.max(1.5, (s.out - s.in) * k * grow - 1.5)); });
      gaps.forEach((r, i) => { const p = pauses[i], flash = fade(t, cut - .5 + i * .3 / n, .12), gone = glide(span(t, cut + i * .1 / n, .2)); r.attr('x', sx + p.from * k * grow).attr('width', Math.max(0, (p.to - p.from) * k * grow - 1.5) * (1 - gone)).attr('opacity', (.22 + .78 * flash) * (1 - gone)); });
      const scan = span(t, .15, Math.max(.2, cut - .25)); head.attr('x', sx + sw * mix(glide(scan), after / before, close) - 2).attr('opacity', fade(t, .15, .2) * (1 - fade(t, cut + props.closeFor + .5, .3)));
      num.text(mix(before, after, glide(span(t, cut + .1, props.closeFor + .15))).toFixed(1) + ' ' + props.unit).attr('fill', close >= 1 ? st.ink.accent : ink.head).attr('opacity', fade(t, .1, .25));
      const done = fade(t, cut + props.closeFor * .6, .25); a.attr('opacity', 1 - done); b.attr('opacity', done); foot.attr('opacity', fade(t, cut + props.closeFor + .05, .3)); ends[1].attr('opacity', 1 - fade(t, cut, .2)); ends[0].attr('opacity', 1 - fade(t, cut, .2));
    },
  };
}
