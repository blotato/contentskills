import {card, grow, fade, count, num, tag, box, rule, label, fit, measure, F, C} from './_card.js';

// Two figures side by side, parted by a hairline: each name in small capitals, the figure huge in the Didone and
// counting up, and a thick bar to scale under it. The winner (the larger unless `winner` says) is in the accent with
// a small filled badge; the other stays in ink. Built to be read as a punchline in under a second (0 against 12).
// Props: title, unit, a {label, value, suffix, prefix}, b {...}, winner ('a' | 'b' | null), badge (word on the
// winner, '' for none), bars (false hides the bars; they hide themselves when the two suffixes differ), note, index, field, clear.
export const meta = {duration: 3.5};
export const defaults = {title: 'Edits made *by hand*', unit: 'Illustrative · this reel', note: 'Illustrative data', index: '10', field: 'paper', clear: false, winner: null, badge: 'Winner',
  a: {label: 'By hand', value: 0, suffix: ''}, b: {label: 'With the tool', value: 12, suffix: ''}};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, sides = [props.a, props.b], val = d => parseFloat(String(d.value).replace(/,/g, '')) || 0, max = Math.max(val(props.a), val(props.b)) || 1;
  const win = props.winner === 'a' ? 0 : props.winner === 'b' ? 1 : val(props.b) >= val(props.a) ? 1 : 0, mid = 500, bars = props.bars !== false && (props.a.suffix ?? '') === (props.b.suffix ?? ''), colW = (pg.w - 72) / 2, full = d => `${d.prefix ?? ''}${d.value}${d.suffix ?? ''}`;
  const size = Math.min(330, ...sides.map(d => fit(full(d), colW - 10, 330, {font: F.serif, weight: 500}))), barY = pg.y1 - 74, base = bars ? barY - 46 : (pg.y0 + pg.y1) / 2 + size * .36 + 40, headY = pg.y0 + 34;
  const part = rule(g, mid, pg.y0, mid, pg.y1 + 6, {width: 2, color: ink.fg, opacity: .4});
  const cols = sides.map((d, i) => {
    const x = i ? mid + 36 : pg.x0, hot = i === win, c = hot ? ink.accent : ink.fg, name = tag(g, x, headY, d.label, colW - 26, {color: c, size: 34});
    let badge = null;
    if (hot && props.badge) { const w = measure(props.badge.toUpperCase(), 30, {font: F.sans, weight: 700}) + props.badge.length * 30 * .14 + 40; badge = g.append('g'); box(badge, x, headY + 26, w, 52, ink.accent); label(badge, x + 20, headY + 63, props.badge, {size: 30, weight: 700, track: .14, color: ink.bg}); }
    return {d, hot, name, badge, x, big: num(g, x - size * .02, base, '', {size, color: c}), track: box(g, x, barY, colW, bars ? 56 : 0, ink.faint, .55), bar: box(g, x, barY, 0, bars ? 56 : 0, hot ? ink.accent : ink.fg)};
  });
  return {seek(t) {
    pg.seek(t); part.draw(grow(t, pg.T, .4));
    cols.forEach((c, i) => {
      const at = pg.T + i * .1, q = grow(t, at, .45);
      c.name.attr('opacity', fade(t, at, .25)); c.big.text(`${c.d.prefix ?? ''}${count(c.d.value, q)}${c.d.suffix ?? ''}`).attr('opacity', fade(t, at, .2));
      c.track.attr('width', colW * grow(t, at, .4)); c.bar.attr('width', colW * val(c.d) / max * q);
      c.badge?.attr('opacity', fade(t, at + .35, .25)).attr('transform', `translate(0 ${((1 - grow(t, at + .35, .3)) * 10).toFixed(1)})`);
    });
  }};
}
