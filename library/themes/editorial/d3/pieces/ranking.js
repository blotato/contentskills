import {card, grow, fade, fmt, decimalsOf, fig, box, text, rule, F} from './_card.js';

// A league table: rank in mono, the name in the serif, the figure at the right, and under each name a thick bar to
// scale; rows are parted by hairlines and the leader is in the accent (its name in italic).
// Props: title, unit, items [{label, value}] (sorted as given, 3-5), highlight (index, 0 by default), decimals,
// prefix, suffix, note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'The *top* five hooks', unit: 'Illustrative · average watch time, seconds', note: 'Illustrative data', index: '06', field: 'paper', clear: false, highlight: 0, prefix: '', suffix: ' s',
  items: [{label: 'A question', value: 21.4}, {label: 'A bold claim', value: 17.9}, {label: 'A number', value: 15.2}, {label: 'A story', value: 11.6}, {label: 'A greeting', value: 6.3}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, d3 = window.d3, items = props.items, n = items.length, p = {...props, decimals: decimalsOf(items.map(d => d.value), props)};
  const pitch = Math.min(150, (pg.y1 - pg.y0 + 10) / n), bh = Math.max(44, Math.min(54, pitch - 74)), size = Math.min(58, pitch - bh - 16), xb = pg.x0 + 84, max = d3.max(items, d => d.value) || 1;
  const rows = items.map((d, i) => {
    const hot = i === (props.highlight ?? 0), c = hot ? ink.accent : ink.fg, y = pg.y0 + i * pitch, grp = g.append('g');
    fig(grp, pg.x0, y + size * .78, String(i + 1).padStart(2, '0'), {size: 38, color: hot ? ink.accent : ink.sub});
    text(grp, xb, y + size * .8, d.label, {font: hot ? F.italic : F.head, size, color: c});
    return {d, grp, value: fig(grp, pg.x1, y + size * .78, '', {size: 44, anchor: 'end', color: c}), bar: box(g, xb, y + size + 6, 0, bh, hot ? ink.accent : ink.rest),
      line: i ? rule(g, pg.x0, y - (pitch - size - bh - 6) / 2 + 2, pg.x1, y - (pitch - size - bh - 6) / 2 + 2, {width: 2, color: ink.fg, opacity: .3}) : null};
  });
  return {seek(t) {
    pg.seek(t);
    rows.forEach((r, i) => {
      const at = pg.T + i * .07, q = grow(t, at + .04, .5), a = fade(t, at, .28);
      r.grp.attr('opacity', a); r.bar.attr('width', (pg.x1 - xb) * r.d.value / max * q); r.value.text(fmt(r.d.value * q, p)); r.line?.draw(grow(t, at, .4));
    });
  }};
}
