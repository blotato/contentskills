import {card, grow, fade, fmt, decimalsOf, fig, tag, dot, text, spread, measure, F} from './_card.js';

// Before and after as slopes: two columns with small headings, a thick line per item drawing from its old value
// to its new one, both ends labelled directly; the item that matters is in the accent, the rest in umber.
// Props: title, unit, from, to (column headings), items [{label, a, b}], highlight (index; the biggest rise by
// default), decimals, prefix, suffix, note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'What *changed* after the edit', unit: 'Illustrative · percent watched to the end', note: 'Illustrative data', index: '07', field: 'paper', clear: false, highlight: null, from: 'Raw', to: 'Edited', prefix: '', suffix: '%',
  items: [{label: 'Reels', a: 22, b: 61}, {label: 'Stories', a: 35, b: 44}, {label: 'Lives', a: 48, b: 39}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, d3 = window.d3, items = props.items, p = {...props, decimals: decimalsOf(items.flatMap(d => [d.a, d.b]), props)};
  const hi = props.highlight ?? d3.maxIndex(items, d => d.b - d.a), size = 50, nameW = Math.max(...items.map(d => measure(d.label, size))), figW = Math.max(...items.flatMap(d => [fmt(d.a, p), fmt(d.b, p)]).map(s => s.length)) * 27;
  const xa = pg.x0 + figW + 34, xb = pg.x1 - figW - nameW - 62, top = pg.y0 + 96, bot = pg.y1 - 30, all = items.flatMap(d => [d.a, d.b]);
  const y = d3.scaleLinear().domain([d3.min(all), d3.max(all)]).range([bot, top]), ya = spread(items.map(d => y(d.a)), 58, top, bot), yb = spread(items.map(d => y(d.b)), 58, top, bot);
  const heads = [tag(g, xa, pg.y0 + 30, props.from, 300, {anchor: 'middle', color: ink.fg}), tag(g, xb, pg.y0 + 30, props.to, 300, {anchor: 'middle', color: ink.fg})];
  const rows = items.map((d, i) => {
    const hot = i === hi, c = hot ? ink.accent : ink.rest, tc = hot ? ink.accent : ink.fg, grp = g.append('g');
    const ln = g.append('line').attr('x1', xa).attr('y1', ya[i]).attr('stroke', c).attr('stroke-width', hot ? 12 : 8).attr('stroke-linecap', 'round');
    fig(grp, xa - 30, ya[i] + 14, fmt(d.a, p), {size: 40, anchor: 'end', color: tc});
    const end = g.append('g'); fig(end, xb + 30, yb[i] + 14, fmt(d.b, p), {size: 40, color: tc}); text(end, xb + 44 + figW, yb[i] + 16, d.label, {font: hot ? F.italic : F.head, size, color: tc});
    return {ln, grp, end, a: dot(g, xa, ya[i], 0, c), b: dot(g, xb, yb[i], 0, c), hot, i};
  });
  return {seek(t) {
    pg.seek(t); heads.forEach((h, i) => h.attr('opacity', fade(t, pg.T + i * .3, .25)));
    rows.forEach(r => {
      const at = pg.T + .04 + r.i * .06, q = grow(t, at + .08, .5), R = r.hot ? 17 : 13;
      r.ln.attr('x2', xa + (xb - xa) * q).attr('y2', ya[r.i] + (yb[r.i] - ya[r.i]) * q).attr('opacity', q > 0 ? 1 : 0);
      r.a.attr('r', R * grow(t, at, .25)); r.b.attr('r', R * grow(t, at + .45, .25)); r.grp.attr('opacity', fade(t, at, .25)); r.end.attr('opacity', fade(t, at + .42, .25));
    });
  }};
}
