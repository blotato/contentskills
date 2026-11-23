import {C, F, stage, up, oneLine, flow, capH, txt, typed, glyphs, arrive, brush, sheet, stamp, greek, cornerLabels, cardMove, span, settle, easeOut} from '../../kit.js';
import {DARK} from './_cards.js';

// One sentence set in tall capitals on a torn sheet of bone paper, word by word. Words listed in
// `accent` print in crimson and are underlined with a brush stroke; an archive stamp is pressed on last.
export const meta = {duration: 5, live: true};
export const defaults = {
  statement: 'Every record was written by someone who chose what to keep', accent: ['CHOSE'], tag: 'FIELD NOTE 07',
  labels: ['OBSERVED', 'ON THE RECORD', '', 'KEEP READING'], foot: 'Read the margins, too', field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k, sq} = st, sx = 62, sw = W - sx * 2, sh = H * (sq ? .7 : .56), sy = (H - sh) / 2, pad = 66, o = {weight: 700};
  const g = root.append('g'), sh1 = sheet(g, sx, sy, sw, sh, {fill: C.bone, seed: 7, rough: 9, wear: .26}), accents = new Set((props.accent ?? []).map(a => up(a).replace(/[^A-Z0-9]/g, '')));
  const headH = 84, footH = 150, fl = flow(up(oneLine(props.statement)), sw - pad * 2, sh - pad * 2 - headH - footH, 132 * (.7 + .3 * k), 40, o), cap = capH(fl.size, o), top = sy + pad + headH + (sh - pad * 2 - headH - footH - fl.lines.length * fl.pitch) / 2;
  const tag = typed(g, sx + pad, sy + pad + 18, up(oneLine(props.tag)), {size: 26 + 4 * k, color: '#5b5a50', spacing: .1}); g.append('path').attr('d', `M${sx + pad} ${sy + pad + 40}H${sx + sw - pad}`).attr('stroke', '#5b5a50').attr('stroke-width', 2).attr('opacity', .5);
  let idx = 0; const marks = [], words = fl.lines.flatMap((line, i) => { const y = top + i * fl.pitch + cap, row = glyphs(g, line, sx + pad, y, fl.size, {by: 'word', color: DARK});
    return row.map(u => { const hot = accents.has(u.str.replace(/[^A-Z0-9]/g, '')); if (hot) { u.node.select('text').attr('fill', C.crimson); marks.push({b: brush(g, u.cx - u.w / 2 - 6, y + cap * .13, u.w + 12, cap * .15, {seed: idx + 2, bands: 3}), at: idx}); } return {u, at: idx++}; }); });
  const foot = txt(g, sx + pad, sy + sh - pad, props.foot, {size: 34 + 8 * k, font: F.italic, weight: 400, color: '#3a3e45', spacing: .01}); greek(g, sx + pad, sy + sh - pad - 100, sw * .42, 3, {seed: 3, color: DARK, opacity: .22});
  const sg = g.append('g').attr('transform', `translate(${sx + sw - pad - 86} ${sy + sh - pad - 74}) rotate(-13)`), stp = stamp(sg.append('g'), 84, {ring: props.labels?.[1] || 'ON THE RECORD', word: 'NOTED', seed: 4});
  const corners = cornerLabels(st, props.labels), step = Math.min(.16, 2.2 / Math.max(1, idx)), done = .5 + idx * step;
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    g.attr('transform', `rotate(${-1.4 + .3 * t / meta.duration} ${W / 2} ${H / 2})`).attr('opacity', settle(span(t, 0, .7)));
    tag.set(span(t, .2, .7)); words.forEach(({u, at}) => arrive(u, span(t, .5 + at * step, .6), 0, {from: 1.08, rise: 14}));
    marks.forEach(({b, at}) => b.reveal(settle(span(t, .8 + at * step, .6)))); foot.attr('opacity', span(t, done + .3, .6));
    const q = span(t, done + .7, .3); stp.attr('opacity', .88 * Math.min(1, q * 3)).attr('transform', `scale(${1.5 - .5 * easeOut(q)})`); corners(t, .8);
  }};
}
