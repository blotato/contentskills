import {C, F, stage, up, oneLine, flow, capH, txt, plate, sheet, stamp, greek, brush, cornerLabels, cardMove, span, settle, easeOut} from '../../kit.js';
import {DARK} from './_cards.js';

// A quotation as a page from the archive: a torn sheet of bone paper, a large crimson quotation
// mark, the words in an old book italic appearing line by line, the source on a stacked caption
// that overlaps the page edge, and a stamp carrying `mark`.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  quote: 'What we keep says as much about us as what we throw away', by: 'FROM A LETTER', role: 'Undated, unsigned',
  labels: ['QUOTED', 'WORDS TO KEEP', '', 'NO. 12'], mark: 'Q', field: 'night',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k, sq} = st, sx = 70, sw = W - sx * 2, sh = H * (sq ? .66 : .5), sy = H * (sq ? .13 : .2), pad = 70, o = {font: F.italic, weight: 400, spacing: .01};
  const g = root.append('g'); sheet(g, sx, sy, sw, sh, {fill: C.bone, seed: 12, rough: 9, wear: .26});
  const headH = 120, footH = 130, fl = flow(oneLine(props.quote), sw - pad * 2, sh - pad * 2 - headH - footH, 96 * (.72 + .28 * k), 34, o, 1.4), cap = capH(fl.size, o), top = sy + pad + headH + (sh - pad * 2 - headH - footH - fl.lines.length * fl.pitch) / 2;
  const mark = txt(g, sx + pad - 12, sy + pad + 170, '“', {size: 300, font: F.bold, weight: 700, color: C.crimson, spacing: 0});
  const lines = fl.lines.map((line, i) => txt(g.append('g'), sx + pad, top + i * fl.pitch + cap, line, {size: fl.size, font: F.italic, weight: 400, color: DARK, spacing: .01}));
  const endY = top + fl.lines.length * fl.pitch + 10, dash = brush(g, sx + pad, endY, 190, 14, {seed: 8, bands: 3}); greek(g, sx + pad, sy + sh - pad - 30, sw * .36, 3, {seed: 9, color: DARK, opacity: .2});
  const sg = g.append('g').attr('transform', `translate(${sx + sw - pad - 70} ${sy + pad + 66}) rotate(11)`), stp = stamp(sg.append('g'), 72, {ring: props.labels?.[0] || 'QUOTED', word: props.mark || 'Q', seed: 2});
  const pg = root.append('g').attr('transform', `translate(${W - 46} ${sy + sh - 78})`), who = plate(pg, {name: props.by, sub: props.role, align: 'right', scale: .95 + .2 * k}), corners = cornerLabels(st, props.labels);
  const done = .6 + fl.lines.length * .35;
  return {seek(t) {
    st.live(t); root.attr('transform', cardMove(st, t, {dur: meta.duration}));
    g.attr('transform', `rotate(${1.3 - .3 * t / meta.duration} ${W / 2} ${H / 2})`).attr('opacity', settle(span(t, 0, .7))); mark.attr('opacity', span(t, .2, .5));
    lines.forEach((n, i) => { const q = span(t, .6 + i * .35, .8); n.attr('opacity', q).attr('transform', `translate(0 ${12 * (1 - settle(q))})`); });
    dash.reveal(settle(span(t, done, .6))); who.reveal(t, done + .3);
    const q = span(t, done + 1, .3); stp.attr('opacity', .88 * Math.min(1, q * 3)).attr('transform', `scale(${1.5 - .5 * easeOut(q)})`); corners(t, .8);
  }};
}
