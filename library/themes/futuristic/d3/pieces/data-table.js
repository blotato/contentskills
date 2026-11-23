import {C, F, chamfer, line, text, draw, span, easeOut, flicker, scramble, typed, comma, blink} from '../../hud.js';
import {card} from './_card.js';

// A data table that types itself in row by row: the name decodes, the number counts up with a
// bar beneath it, and a status chip switches on. A highlight then keeps stepping down the rows.
// Each row is [name, number, status]; status colours come from `tones`.
export const meta = {duration: 5.6, live: true};
export const defaults = {title: 'Posting log', unit: 'Illustrative · sample rows', columns: ['Clip', 'Views', 'Status'], clear: false,
  tones: {LIVE: 'cyan', TOP: 'amber', LOW: 'magenta', QUEUED: 'dim'},
  rows: [['Hook test A', 12400, 'LIVE'], ['Hook test B', 8100, 'LIVE'], ['Tutorial cut', 30250, 'TOP'], ['Behind the scenes', 2900, 'LOW'], ['Reply to comment', 6400, 'LIVE'], ['Trend remix', 15800, 'QUEUED']]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), n = props.rows.length, y0 = 300, pitch = Math.min(100, 580 / n), xn = 150, xv = 700, xs = 740, max = Math.max(...props.rows.map(r => r[1]));
  const head = root.append('g'); text(head, 84, 250, '#', {size: 22, color: C.amber}); text(head, xn, 250, props.columns[0].toUpperCase(), {size: 22, color: C.amber, spacing: '.2em'});
  text(head, xv, 250, props.columns[1].toUpperCase(), {size: 22, color: C.amber, anchor: 'end', spacing: '.2em'}); text(head, xs, 250, props.columns[2].toUpperCase(), {size: 22, color: C.amber, spacing: '.2em'});
  const band = root.append('rect').attr('x', 70).attr('width', 860).attr('height', pitch - 10).attr('fill', C.cyan).attr('opacity', 0), caret = line(root, `M0 0V${pitch - 10}`, C.cyan, 5);
  const rows = props.rows.map(([name, value, status], i) => { const y = y0 + i * pitch, g = root.append('g'), tone = C[props.tones?.[status]] ?? C.cyan, sw = String(status).length * 17 + 44;
    text(g, 84, y + 40, String(i + 1).padStart(2, '0'), {size: 24, color: C.dim, spacing: '0'});
    line(g, `M${xn} ${y + 62}H${xv}`, C.grid, 4); const chip = root.append('g');
    line(chip, chamfer(xs, y + 8, sw, 46, 10), tone, 2); chip.append('rect').attr('x', xs + 14).attr('y', y + 25).attr('width', 12).attr('height', 12).attr('fill', tone);
    text(chip, xs + 36, y + 40, String(status), {size: 24, color: tone, spacing: '.06em'});
    return {g, chip, name: String(name).toUpperCase(), value, y, at: .5 + i * .62, bar: line(g, `M${xn} ${y + 62}H${xn + (xv - xn) * value / max}`, tone, 4),
      label: text(g, xn, y + 42, '', {size: Math.min(38, 330 / (String(name).length * .5)), font: F.text, weight: 700, color: C.white, spacing: '.04em'}),
      num: text(g, xv, y + 42, '', {size: 34, color: C.white, anchor: 'end', spacing: '0'})}; });
  const end = .5 + n * .62, foot = text(root, 84, y0 + n * pitch + 36, '', {size: 22, color: C.dim, spacing: '.2em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); head.attr('opacity', flicker(t, .25));
    const typing = Math.min(n - 1, Math.max(0, Math.floor((t - .5) / .62))), row = t < end ? typing : Math.floor((t - end) / .8) % n;
    band.attr('y', y0 + row * pitch + 2).attr('opacity', t > .5 ? .09 + (t < end ? .05 * blink(t, 6) : 0) : 0); caret.attr('transform', `translate(72 ${y0 + row * pitch + 2})`).attr('opacity', t > .5 ? 1 : 0);
    for (const r of rows) { const since = t - r.at, q = easeOut(span(since, .15, .5));
      r.g.attr('opacity', since > 0 ? 1 : 0); r.label.text(scramble(r.name, span(since, 0, .4), t) + (since > 0 && since < .45 && blink(t, 5) ? '_' : ''));
      r.num.text(since > .12 ? comma(r.value * q) : ''); draw(r.bar, span(since, .15, .5)); r.chip.attr('opacity', flicker(t, r.at + .42)); }
    foot.text(typed(`${n} ROWS · SYNC OK`, span(t, end, .5)) + (t > end && blink(t, 1.5) ? ' _' : ''));
  }};
}
