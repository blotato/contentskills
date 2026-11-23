import {card, grow, fade, fig, tag, text, rule, box, F} from './_card.js';

// A typeset figures table: small tracked column heads over a rule, a serif name and mono figures per row,
// hairlines between rows drawing one after another; one column (the last by default) is the one that matters and
// stands on a tinted band in the accent.
// Props: title, unit, columns ['', 'Before', 'After'] (the first heads the names), rows [{label, values: [...]}]
// (values are printed as given), highlight (column index among the values; the last by default), note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'One reel, *two* ways', unit: 'Illustrative · by hand and with the tool', note: 'Illustrative data', index: '08', field: 'paper', clear: false, highlight: null,
  columns: ['', 'By hand', 'With it'], rows: [{label: 'Editing', values: ['3 h', '4 min']}, {label: 'Captions', values: ['40 min', '0']}, {label: 'Graphics', values: ['2 h', '6 min']}, {label: 'Cost', values: ['$120', '$0']}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, rows = props.rows, n = rows.length, k = Math.max(1, ...rows.map(r => r.values.length)), hi = props.highlight ?? k - 1;
  const colW = Math.min(250, (pg.w * .62) / k), xs = Array.from({length: k}, (_, j) => pg.x1 - 16 - (k - 1 - j) * colW), headY = pg.y0 + 36, top = pg.y0 + 62, pitch = Math.min(132, (pg.y1 - top) / n), size = Math.min(62, pitch * .5);
  const band = box(g, xs[hi] - colW + 28, pg.y0 - 6, colW, 0, ink.accent, .12);
  const heads = (props.columns ?? []).map((c, j) => j ? tag(g, xs[j - 1], headY, c, colW - 30, {anchor: 'end', color: j - 1 === hi ? ink.accent : ink.fg}) : tag(g, pg.x0, headY, c, 300, {color: ink.fg}));
  const first = rule(g, pg.x0, top, pg.x1, top, {width: 3, color: ink.fg});
  const lines = rows.map((r, i) => {
    const y = top + i * pitch, grp = g.append('g'), by = y + pitch / 2 + size * .3;
    text(grp, pg.x0, by, r.label, {font: F.head, size, color: ink.fg});
    r.values.forEach((v, j) => fig(grp, xs[j], by - 2, v, {size: Math.min(48, size * .82), anchor: 'end', color: j === hi ? ink.accent : ink.fg, weight: j === hi ? 500 : 400}));
    return {grp, line: rule(g, pg.x0, y + pitch, pg.x1, y + pitch, {width: 2, color: ink.fg, opacity: i === n - 1 ? 1 : .3})};
  });
  return {seek(t) {
    pg.seek(t); first.draw(grow(t, pg.T, .4)); heads.forEach((h, j) => h.attr('opacity', fade(t, pg.T + j * .05, .25)));
    band.attr('height', (top + n * pitch - pg.y0 + 6) * grow(t, pg.T + .1, .5));
    lines.forEach((r, i) => { const at = pg.T + .08 + i * .08, a = fade(t, at, .3); r.grp.attr('opacity', a).attr('transform', `translate(0 ${((1 - a) * 12).toFixed(1)})`); r.line.draw(grow(t, at + .05, .4)); });
  }};
}
