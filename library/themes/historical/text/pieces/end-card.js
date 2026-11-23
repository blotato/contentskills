import {C, F, stage, up, oneLine, fit, capH, measure, txt, typed, glyphs, arrive, bar, brush, cornerLabels, cardMove, fillOf, span, settle} from '../../kit.js';
import {ticker} from './_cards.js';

// The closing card, set like a silent-film intertitle: a double-ruled frame with corner lozenges,
// the sign-off lines centred between ornament rules, the call to action on a bar, the handle typed
// beneath, and a slow ticker band along the bottom.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['TO BE', 'CONTINUED'], action: 'NEW CHAPTER EVERY WEEK', handle: '@YOURNAME', strip: 'THANK YOU FOR WATCHING',
  labels: ['THE END', 'FOR NOW'], field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, ink, k, sq} = st, lines = props.lines.map(up), n = lines.length, o = {weight: 700}, inset = 44, sh = props.strip ? 84 + 16 * k : 0, fb = H - inset - sh - (sh ? 26 : 0);
  const frame = root.append('g'); frame.append('rect').attr('x', inset).attr('y', inset).attr('width', W - inset * 2).attr('height', fb - inset).attr('fill', 'none').attr('stroke', ink.text).attr('stroke-width', 4).attr('opacity', .8);
  frame.append('rect').attr('x', inset + 14).attr('y', inset + 14).attr('width', W - inset * 2 - 28).attr('height', fb - inset - 28).attr('fill', 'none').attr('stroke', ink.text).attr('stroke-width', 1.5).attr('opacity', .6);
  [[inset + 14, inset + 14], [W - inset - 14, inset + 14], [inset + 14, fb - 14], [W - inset - 14, fb - 14]].forEach(([x, y]) => frame.append('path').attr('d', `M${x - 13} ${y}l13 -13l13 13l-13 13Z`).attr('fill', ink.accent));
  const size = fit(lines, W - 2 * 150, H * (sq ? .13 : .1) * (n > 2 ? .8 : 1), o), cap = capH(size, o), pitch = cap * 1.3, cy = (inset + fb) / 2 - 60 * k - 20, top = cy - (n * pitch) / 2;
  const orn = y => { const g = root.append('g'); g.append('path').attr('d', `M${W / 2 - 230} ${y}H${W / 2 - 26}M${W / 2 + 26} ${y}H${W / 2 + 230}`).attr('stroke', ink.dim).attr('stroke-width', 2.5); g.append('path').attr('d', `M${W / 2 - 12} ${y}l12 -12l12 12l-12 12Z`).attr('fill', ink.accent); return g; };
  const o1 = orn(top - 56), o2 = orn(top + n * pitch + 34), lw = measure(lines[n - 1], size, o), ly = top + (n - 1) * pitch + (pitch - cap) / 2;
  const stroke = brush(root, W / 2 - lw / 2 - 40, ly - cap * .12, lw + 80, cap * 1.26, {seed: 5, color: ink.accent === C.bone ? C.char : C.crimson});
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + i * pitch + (pitch - cap) / 2 + cap, size, {anchor: 'middle', color: i === n - 1 ? C.bone : ink.text}));
  const ay = top + n * pitch + 34 + 80 + 20 * k, act = props.action ? bar(root, props.action, {size: Math.min(40 + 10 * k, fit(up(oneLine(props.action)), W - 300, 60)), fill: 'char'}) : null; act?.g.attr('transform', `translate(${W / 2 - act.w / 2} ${ay})`);
  const hs = 40 + 12 * k, handle = props.handle ? typed(root, W / 2, ay + 96 + 20 * k, oneLine(props.handle), {size: hs, color: ink.text, anchor: 'middle', spacing: .06}) : null, under = root.append('path').attr('stroke', ink.accent).attr('stroke-width', 4);
  const band = root.append('g'), ts = sh * .46; let strip = null;
  if (sh) { band.append('rect').attr('x', -300).attr('y', H - inset - sh).attr('width', W + 600).attr('height', sh).attr('fill', ink.bar === 'bone' ? C.char : C.crimson); strip = ticker(band, W, up(oneLine(props.strip)), H - inset - sh / 2 + capH(ts, {weight: 500}) / 2, ts, {weight: 500, spacing: .1, mark: ink.bar === 'bone' ? C.bone : C.blood}); }
  const corners = cornerLabels(st, props.labels, {inset: 104});
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration, rot: .1}));
    frame.attr('opacity', settle(span(t, 0, 1))); o1.attr('opacity', span(t, .3, .6)); o2.attr('opacity', span(t, .9, .6));
    stroke.reveal(settle(span(t, .5 + (n - 1) * .3, .7))); rows.forEach((row, r) => row.forEach(u => arrive(u, span(t, .35 + r * .3 + u.i * .035, .7))));
    act?.reveal(span(t, 1.3 + n * .2, .7)); const hq = span(t, 1.7 + n * .2, .8); handle?.set(hq); if (handle) under.attr('d', `M${W / 2 - handle.w / 2 * settle(hq)} ${ay + 96 + 20 * k + 18}h${handle.w * settle(hq)}`);
    band.attr('opacity', span(t, .6, .6)); strip?.set(t * 46); corners(t, .8);
  }};
}
