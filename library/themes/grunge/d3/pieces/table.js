import {C, span, hold, easeOut, sheet, txt, brush, scrawl, scribble, tapeStrip, clipLive, jit, up} from '../../kit.js';
import {card} from './_card.js';

// A typewritten ledger on a taped-up page: rows typed in one at a time, one row highlighted in lime, the bottom line circled in red.
export const meta = {duration: 4.4};
export const defaults = {title: 'The ledger', unit: 'Illustrative figures', highlight: 1, circle: true, clear: false,
  columns: ['SOURCE', 'POSTS', 'EARNED'], rows: [['Sponsors', '4', '$2,400'], ['Products', '9', '$1,850'], ['Ads', '31', '$410'], ['Tips', '31', '$65'], ['TOTAL', '', '$4,725']]};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), rowsIn = props.rows.slice(0, 7), n = rowsIn.length, x = 84, w = 832, y = top + 16, h0 = 905 - y, pitch = Math.min(84, (h0 - 110) / n), cols = props.columns.length, size = Math.min(34, pitch * .44);
  const colX = i => i === 0 ? x + 44 : x + w - 44 - (cols - 1 - i) * (w - 300) / Math.max(1, cols - 1), tilt = `rotate(-1.2 500 ${y + h0 / 2})`;
  // The page is a big flat sheet with small type on it, so it goes through the lighter print filter (under the marker layer).
  const page = st.svg.insert('g', () => st.root.node()).attr('filter', `url(#${st.id}-fine)`).append('g').attr('transform', tilt); sheet(page, {fill: C.bone, seed: 8, sides: 'b', amp: 12}).set(x, y, w, h0);
  tapeStrip(page, 150, 42, {seed: 2}).attr('transform', `translate(${x + 60} ${y + 4}) rotate(-18)`); tapeStrip(page, 150, 42, {seed: 3}).attr('transform', `translate(${x + w - 60} ${y + 6}) rotate(14)`);
  const hy = y + 72, reveal = clipLive(st), hi = props.highlight, ry = i => hy + 34 + (i + 1) * pitch - pitch * .3;
  if (hi != null && hi < n) page.append('path').attr('d', brush(x + 24, ry(hi) - size * 1.05, w - 48, size * 1.6, {seed: 5, dry: 0})).attr('fill', C.lime).attr('fill-rule', 'evenodd').attr('clip-path', reveal.url);
  const text = fine.append('g').attr('transform', tilt);
  props.columns.forEach((c, i) => txt(text, colX(i), hy, up(c), {size: size * .8, anchor: i ? 'end' : 'start', color: C.ash, role: 'small', weight: 800}));
  text.append('path').attr('d', `M${x + 30} ${hy + 20}H${x + w - 30}`).attr('stroke', C.soot).attr('stroke-width', 3);
  text.append('path').attr('d', `M${x + 30} ${ry(n - 1) - size * 1.25}H${x + w - 30}`).attr('stroke', C.soot).attr('stroke-width', 2).attr('stroke-dasharray', '10 8');
  const lines = rowsIn.map((r, i) => r.map((cell, c) => ({str: String(cell), node: txt(text, colX(c), ry(i), '', {size, anchor: c ? 'end' : 'start', color: i === n - 1 ? ink.accent === C.red ? '#c2330a' : C.soot : C.soot})})));
  const lastX = colX(cols - 1), ring = props.circle ? scrawl(body, s => scribble.circle(lastX - 70, ry(n - 1) - size * .35, 120, size * 1.05, s), {color: ink.accent, width: 7, seed: 6}) : null;
  return {seek(t) {
    const s = intro(t), h = hold(t), step = Math.min(.42, 2.4 / n);
    lines.forEach((cells, i) => { const q = span(h, .55 + i * step, step * .9), len = cells.reduce((a, c) => a + c.str.length, 0); let used = 0; cells.forEach(c => { const k = Math.max(0, Math.min(c.str.length, Math.round(len * q) - used)); used += c.str.length; c.node.text(c.str.slice(0, k)); }); });
    const end = .55 + n * step; reveal.set(0, 0, 1000 * easeOut(span(h, end + .05, .3)), 1000); ring?.draw(span(h, end + .35, .35), s);
    const j = jit(s, 1, 1, .15); page.attr('transform', `translate(${j.x} ${j.y}) ${tilt}`);
  }};
}
