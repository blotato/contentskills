import {card, C, up, txt, stroke, pill, hand, arrowPath, draw, fade, glide, span} from '../../kit.js';

// A month at a glance: day numbers fade up row by row, marked days get a filled dot one after
// another, a run of days is joined into one soft pill, and a handwritten note points at it.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'June, planned loosely', unit: 'Illustrative month', clear: false, accent: 'leaf', days: 30, offset: 0, weekdays: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  marked: [3, 6, 10, 13, 24, 27], range: [18, 21], note: 'away!'};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, rowsN = Math.ceil((props.days + props.offset) / 7), cw = 120, x0 = 80 + cw / 2, top = 362, pitch = Math.min(112, 520 / rowsN), rad = Math.min(38, pitch * .36);
  const at = d => { const k = d - 1 + props.offset; return [x0 + (k % 7) * cw, top + Math.floor(k / 7) * pitch]; };
  props.weekdays.forEach((d, i) => txt(root, x0 + i * cw, 290, up(d), {size: 21, role: 'label', anchor: 'middle', color: C.dim, spacing: 0}));
  const band = root.append('g'), runs = [];
  if (props.range) { let [a, b] = props.range; while (a <= b) { const row = Math.floor((a - 1 + props.offset) / 7), last = Math.min(b, (row + 1) * 7 - props.offset), [ax, ay] = at(a), [bx] = at(last); runs.push(band.append('path').attr('fill', C.sun).attr('fill-opacity', .8).datum({ax, ay, w: bx - ax})); a = last + 1; } }
  const marks = new Set(props.marked), inRange = d => props.range && d >= props.range[0] && d <= props.range[1];
  const cells = Array.from({length: props.days}, (_, k) => { const d = k + 1, [x, y] = at(d), on = marks.has(d);
    return {d, y, on, dot: on ? root.append('circle').attr('cx', x).attr('cy', y).attr('fill', ink.accent) : null, num: txt(root, x, y + 12, String(d), {size: 34, role: on || inRange(d) ? 'head' : 'text', anchor: 'middle', color: on ? ink.on : inRange(d) ? C.ink : C.soft, spacing: 0})}; });
  const order = [...marks].sort((a, b) => a - b);
  let note = null, arrow = null;
  // The note sits in the free corner after the month's last day and points up at the end of the run.
  if (props.range && props.note) { const [ex, ey] = at(props.range[1]), ny = top + (rowsN - 1) * pitch + 34, tx = Math.min(ex + rad + 16, 926);
    note = hand(root, st, 916, ny, props.note, {size: 60, color: C.clay, anchor: 'end', rot: -4}); if (ny - ey > pitch * .9) arrow = stroke(root, arrowPath(900, ny - 62, tx, ey + rad * .55, -.14), C.clay, 4.5); }
  return {seek(t) {
    st.header(t);
    cells.forEach(c => { const row = Math.round((c.y - top) / pitch); c.num.attr('opacity', fade(t, .3 + row * .14 + (c.d % 7) * .02, .5)); if (c.dot) c.dot.attr('r', rad * glide(span(t, 1.2 + order.indexOf(c.d) * .2, .6))); });
    const e = glide(span(t, 1.4 + order.length * .2, .9)); runs.forEach(r => { const {ax, ay, w} = r.datum(); r.attr('d', e > 0 ? pill(ax - rad, ay - rad, rad * 2 + w * e, rad * 2) : ''); });
    note?.set(glide(span(t, 2.2 + order.length * .2, .8))); if (arrow) draw(arrow, glide(span(t, 2.8 + order.length * .2, .6)));
  }};
}
