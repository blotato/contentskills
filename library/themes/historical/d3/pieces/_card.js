import {C, F, stage, sheet, bar, typed, txt, greek, tape, cardMove, span, settle, up, oneLine, fit, measure, capH, clamp} from '../../kit.js';

// Shared diagram card (not a piece itself: the underscore keeps it out of piece ids).
// The diagram is a document lying on the dark table: a bone paper sheet with torn edges at a small
// angle, drawn on in dark ink with crimson as the only accent. The title sits on a crimson bar across
// the sheet's top edge, the unit is typewritten under it. With `clear` only the sheet shows.
// card() returns the stage plus {body, intro(t)}: draw into `body` (free area x 120..880, y 270..870,
// in sheet coordinates) and call intro(t) first thing in seek.
export const INK = '#15181d', SOFT = '#4b4d4e', FAINT = '#8c8672', PAPER = '#d9d2be';
/** Inks for data series on paper, strongest first. */
export const inks = [INK, C.crimson, '#3d5878', '#6b6650', '#8a6a43', '#7d8288'];

export function card(el, props, {dur = 5, seed = 1, tilt = -1.2, tapes = true} = {}) {
  const st = stage(el, {size: 1000, clear: props.clear, seed}), {root} = st;
  const tiltG = root.append('g').attr('transform', `rotate(${tilt} 500 500)`), paperG = tiltG.append('g');
  const sh = sheet(paperG, 64, 104, 872, 836, {fill: PAPER, seed: seed + 2, rough: 7, wear: .3});
  sh.g.append('rect').attr('x', 92).attr('y', 132).attr('width', 816).attr('height', 780).attr('fill', 'none').attr('stroke', INK).attr('stroke-width', 1.5).attr('opacity', .3);
  greek(sh.g, 640, 890, 240, 2, {seed: seed + 5, color: INK, opacity: .28, size: 6});
  if (tapes) tape(paperG, 130, 40, {seed}).attr('transform', 'translate(800 106) rotate(4)');
  const body = tiltG.append('g');
  const title = up(oneLine(props.title ?? '')), size = fit(title, 700, 54, {weight: 500, spacing: .04});
  const tb = bar(tiltG, title, {size, fill: 'crimson', seed: seed + 1}); tb.g.attr('transform', 'translate(98 150)');
  const unit = props.unit ? typed(tiltG, 104, 228, up(props.unit), {size: Math.min(27, fit(up(props.unit), 780, 27, {font: F.type, weight: 400, spacing: .06})), color: SOFT, spacing: .06}) : null;
  const intro = t => {
    st.live(t); root.attr('transform', cardMove(st, t, {dur, zoom: .03, rot: .15}));
    const q = settle(span(t, 0, .7)); paperG.attr('opacity', span(t, 0, .3)).attr('transform', `translate(0 ${(1 - q) * 22})`);
    tb.reveal(span(t, .15, .7)); unit?.set(span(t, .5, .7));
  };
  return {...st, body, intro, sheetG: sh.g, tiltG};
}
/** Ink text on the paper (Oswald medium by default). */
export const ink = (g, x, y, str, o = {}) => txt(g, x, y, str, {color: INK, ...o});
/** A stroke that draws itself on: returns set(q). The path must already be in the document. */
export function drawOn(path) { const len = path.node().getTotalLength() || 1; path.attr('stroke-dasharray', `${len} ${len}`); return q => path.attr('stroke-dashoffset', len * (1 - clamp(q))); }
/** A pen-ruled line (slightly uneven ink weight) from (x0,y0) to (x1,y1). Returns the path. */
export const ruled = (g, x0, y0, x1, y1, {color = INK, width = 2.5, dash = null, opacity = 1} = {}) => g.append('path').attr('d', `M${x0} ${y0}L${x1} ${y1}`).attr('stroke', color).attr('stroke-width', width).attr('stroke-dasharray', dash).attr('opacity', opacity).attr('fill', 'none').attr('stroke-linecap', 'round');
/** Hatching inside a box (engraving shade), as one path. */
export function hatch(g, x, y, w, h, {gap = 9, color = INK, width = 1.2, opacity = .5} = {}) {
  let d = ''; for (let k = -h; k < w; k += gap) { const x0 = Math.max(0, k), x1 = Math.min(w, k + h); d += `M${x + x0} ${y + h - (x0 - k)}L${x + x1} ${y + h - (x1 - k)}`; }
  return g.append('path').attr('d', d).attr('stroke', color).attr('stroke-width', width).attr('opacity', opacity).attr('fill', 'none');
}
/** A small standing figure (head and coat), feet at (x, y), height s. */
export function figure(g, x, y, s, fill = INK) {
  const f = g.append('g'); f.append('ellipse').attr('cx', x).attr('cy', y - s * .86).attr('rx', s * .13).attr('ry', s * .14).attr('fill', fill);
  f.append('path').attr('d', `M${x - s * .24} ${y}L${x - s * .2} ${y - s * .6}Q${x} ${y - s * .76} ${x + s * .2} ${y - s * .6}L${x + s * .24} ${y}Z`).attr('fill', fill); return f;
}
export {C, F};
