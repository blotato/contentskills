import {C, F, stage, g, text, label, rule, measure, span, glide, ease, leave} from '../../kit.js';
import {sc, labelW} from './_local.js';

// Page furniture in the four corners of the footage, inside the app-safe zone: each corner draws a short hairline,
// then its first line fades up in tracked capitals and the lines after it in small serif italic. Optional `mark`:
// a small Didone word at the top centre. Props: topLeft, topRight, bottomLeft, bottomRight ('\n' = new line), mark,
// inset (from the frame's sides, at least 70), top, bottom, color (ink|paper). Each label sits on a soft patch of
// paper (ink for paper type) so it reads on any footage; ground: 'none' removes it.
export const meta = {duration: 4, live: true};
export const defaults = {topLeft: 'Ep. 12\nBehind the build', topRight: 'Unscripted\nOne take', bottomLeft: 'Keep\nwatching', bottomRight: 'Pt. 01\nof 03', mark: '', inset: 70, top: 270, bottom: 1430, color: 'ink', ground: 'soft'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), dark = /paper|white/.test(props.color ?? ''), fg = dark ? C.paper : C.ink, bg = dark ? C.ink : C.paper, soft = props.ground !== 'none', inx = Math.max(70, props.inset ?? 70), T = Math.max(254, props.top ?? 270), B = Math.min(1440, props.bottom ?? 1430);
  const fid = st.uid('puff'); st.defs.append('filter').attr('id', fid).attr('x', '-40%').attr('y', '-60%').attr('width', '180%').attr('height', '220%').append('feGaussianBlur').attr('stdDeviation', 16);
  const puffs = g(st).attr('filter', `url(#${fid})`), root = g(st), spots = [['topLeft', 0, 0], ['topRight', 1, 0], ['bottomLeft', 0, 1], ['bottomRight', 1, 1]].filter(s => props[s[0]]).map(([key, r, b], i) => {
    const ls = String(props[key]).split('\n'), x = r ? 1080 - inx : inx, anchor = r ? 'end' : 'start', grp = root.append('g'), n = ls.length, H = 30 + (n - 1) * 46, y0 = b ? B - H - 22 : T + 22;
    const tw = Math.max(labelW(ls[0], 28), ...ls.slice(1).map(s => measure(sc(s, false), 42, {font: F.italic}))), pf = soft ? puffs.append('rect').attr('x', (r ? x - tw : x) - 34).attr('y', (b ? y0 : T) - 26).attr('width', tw + 68).attr('height', H + 22 + 52).attr('rx', 30).attr('fill', bg) : null;
    const rl = rule(root, x, b ? B : T, x + (r ? -76 : 76), b ? B : T, {color: fg, width: 3});
    label(grp, x, y0 + 26, ls[0], {size: 28, color: fg, anchor}); ls.slice(1).forEach((s, j) => text(grp, x, y0 + 26 + (j + 1) * 46, sc(s, false), {font: F.italic, size: 42, color: fg, anchor}));
    return {grp, rl, pf, at: i * .14, dy: b ? 12 : -12};
  });
  const mw = props.mark ? measure(sc(props.mark), 64, {font: F.serif, weight: 500}) : 0, mp = props.mark && soft ? puffs.append('rect').attr('x', 540 - mw / 2 - 34).attr('y', T - 14).attr('width', mw + 68).attr('height', 104).attr('rx', 30).attr('fill', bg) : null;
  const mk = props.mark ? text(root, 540, T + 62, sc(props.mark), {font: F.serif, weight: 500, size: 64, color: fg, anchor: 'middle'}) : null, life = props.life ?? meta.duration;
  return {seek(t) {
    const q = ease(leave(t, life, .28));
    spots.forEach(s => { const a = ease(span(t, s.at + .12, .35)); s.rl.range(q, glide(span(t, s.at, .4))); s.pf?.attr('opacity', .86 * a * (1 - q)); s.grp.attr('opacity', a * (1 - q)).attr('transform', `translate(0 ${((1 - a) * s.dy).toFixed(1)})`); });
    mk?.attr('opacity', ease(span(t, .5, .4)) * (1 - q)); mp?.attr('opacity', .86 * ease(span(t, .5, .4)) * (1 - q));
  }};
}
