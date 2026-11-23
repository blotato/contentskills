import {card, sourced, grow, fade, fmt, num, tag, box, smooth, span, mix} from './_card.js';

// A raw take becoming an edit, as two strips drawn to one scale: the recording on top with the takes that were kept
// in umber and the pauses left pale; the kept takes drop out of it and close up into the strip underneath, which is
// as much shorter as the edit really is. Both lengths are printed in the Didone, the edited one in the accent, with
// the number of cuts and the time removed beside the short strip. With `use: 'project'` this is the video's real
// edit decision list (props.project.edl: before, after, cuts, segments [{in, out, at, length}]); otherwise `before`
// and `segments` [{in, out}] are drawn and the kicker should say they are illustrative.
// Props: title, unit, use ('project' | ''), before, segments, a, b (strip names), suffix, decimals, cutAt (when the
// takes drop), note, index, field, clear.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Raw take in, *reel* out', unit: 'Illustrative · one take, to scale', note: 'Illustrative data', index: '12', field: 'paper', clear: false, use: '', a: 'Raw take', b: 'Edited reel', suffix: ' s', decimals: 1, cutAt: .42,
  before: 60, segments: [{in: 2, out: 9}, {in: 13, out: 21}, {in: 24, out: 30}, {in: 37, out: 44}, {in: 52, out: 56}]};

export function mount(el, props = defaults) {
  const edl = props.use === 'project' ? props.project?.edl : null, real = Boolean(edl?.segments?.length);
  const pg = card(el, sourced(props, defaults, real, {unit: 'This take · to scale', note: 'From this video’s edit list'})), {ink, body: g} = pg, p = {decimals: props.decimals ?? 1, suffix: props.suffix ?? ''};
  let at = 0; const segs = (real ? edl.segments : props.segments).map(s => { const o = {in: s.in, out: s.out, len: s.out - s.in, at: s.at ?? at}; at = o.at + o.len; return o; });
  const before = (real ? edl.before : props.before) || Math.max(...segs.map(s => s.out)), after = (real ? edl.after : null) ?? at, cuts = real ? edl.cuts ?? segs.length - 1 : segs.length - 1, k = pg.w / before, H = 76;
  const mid = (pg.y0 + pg.y1) / 2, ya = mid - 56 - H, yb = mid + 24, x = v => pg.x0 + v * k;
  const la = tag(g, pg.x1, ya - 34, props.a, 360, {anchor: 'end', color: ink.fg}), fa = num(g, pg.x0 - 3, ya - 26, '', {size: 124, color: ink.fg});
  const lb = tag(g, pg.x1, yb + H + 146, props.b, 360, {anchor: 'end', color: ink.accent}), fb = num(g, pg.x0 - 3, yb + H + 152, '', {size: 150, color: ink.accent});
  const raw = box(g, pg.x0, ya, 0, H, ink.faint), kept = segs.map(s => box(g, x(s.in), ya, Math.max(2, s.len * k), H, ink.rest));
  const slot = box(g, pg.x0, yb, 0, H, ink.faint, .5), movers = segs.map(s => box(g, x(s.in), ya, Math.max(2, s.len * k - 2), H, ink.accent));
  const removed = before - after, side = after / before < .66 ? tag(g, pg.x1, yb + H / 2 + 11, `${cuts} cuts · −${fmt(removed, p)}`, pg.w - after * k - 30, {anchor: 'end', color: ink.fg}) : null;
  return {seek(t) {
    pg.seek(t); const q = grow(t, pg.T, .4), c = props.cutAt ?? .42;
    raw.attr('width', pg.w * q); kept.forEach(r => r.attr('opacity', q * mix(1, .32, fade(t, c, .4))));
    slot.attr('width', after * k * grow(t, c - .1, .4));
    movers.forEach((m, i) => { const s = segs[i], d = smooth(span(t, c + .22 * i / segs.length, .32)); m.attr('opacity', d > 0 ? 1 : 0).attr('x', mix(x(s.in), x(s.at), d)).attr('y', mix(ya, yb, d)); });
    fa.text(fmt(before * q, p)).attr('opacity', fade(t, pg.T, .2)); la.attr('opacity', fade(t, pg.T + .1, .25));
    const qb = grow(t, c + .1, .45); fb.text(fmt(mix(before, after, qb), p)).attr('opacity', fade(t, c + .1, .2)); lb.attr('opacity', fade(t, c + .2, .25)); side?.attr('opacity', fade(t, c + .4, .25));
  }};
}
