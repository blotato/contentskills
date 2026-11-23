import {card, grow, fade, fmt, decimalsOf, num, fig, tag, dot, rule} from './_card.js';

// One trend: a thick ink line drawn left to right over a tinted area, the last point marked in the accent and its
// value printed big in the Didone; first and last are labelled directly, with two quiet guide values on the left.
// Props: title, unit, values [...], labels [first, last] (x-axis ends), caption (beside the figure), decimals,
// prefix, suffix, note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'Views keep *climbing*', unit: 'Illustrative · thousand views a week', note: 'Illustrative data', index: '02', field: 'paper', clear: false, prefix: '', suffix: 'K', caption: 'this week',
  labels: ['Week 1', 'Week 12'], values: [12, 14, 13, 18, 22, 21, 27, 33, 31, 40, 48, 61]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g, st} = pg, d3 = window.d3, v = props.values, n = v.length, p = {...props, decimals: decimalsOf(v, props)};
  const base = pg.y1 - 52, top = pg.y0 + 170, xa = pg.x0 + 6, xb = pg.x1 - 26;
  const x = d3.scaleLinear().domain([0, n - 1]).range([xa, xb]), y = d3.scaleLinear().domain([Math.min(0, d3.min(v)), d3.max(v) || 1]).range([base, top]);
  const big = num(g, pg.x0, pg.y0 + 118, '', {size: 150, color: ink.accent}), cap = tag(g, pg.x1, pg.y0 + 112, props.caption ?? '', 360, {anchor: 'end', color: ink.fg});
  const first = fig(g, pg.x1, pg.y0 + 60, `from ${fmt(v[0], p)}`, {anchor: 'end', color: ink.sub, size: 34});
  const cid = st.uid('draw'), clip = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', 0).attr('y', 0).attr('height', 1000), plot = g.append('g').attr('clip-path', `url(#${cid})`);
  plot.append('path').attr('d', d3.area().x((d, i) => x(i)).y0(base).y1(d => y(d)).curve(d3.curveMonotoneX)(v)).attr('fill', ink.faint);
  plot.append('path').attr('d', d3.line().x((d, i) => x(i)).y(d => y(d)).curve(d3.curveMonotoneX)(v)).attr('fill', 'none').attr('stroke', ink.fg).attr('stroke-width', 8).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
  const floor = rule(g, pg.x0, base, pg.x1, base, {width: 3, color: ink.fg}), end = dot(g, x(n - 1), y(v[n - 1]), 18, ink.accent);
  const ends = [tag(g, pg.x0, base + 46, props.labels?.[0] ?? '', 400, {color: ink.fg}), tag(g, pg.x1, base + 46, props.labels?.[1] ?? '', 400, {anchor: 'end', color: ink.fg})];
  return {seek(t) {
    pg.seek(t); const q = grow(t, pg.T + .05, .65);
    floor.draw(grow(t, pg.T, .4)); clip.attr('width', xa + (xb - xa) * q + 6);
    end.attr('opacity', q > .97 ? 1 : 0).attr('r', 18 * fade(t, pg.T + .6, .2));
    big.text(fmt(v[n - 1] * q, p)).attr('opacity', fade(t, pg.T, .2)); cap.attr('opacity', fade(t, pg.T + .2, .3)); first.attr('opacity', fade(t, pg.T + .28, .3));
    ends.forEach((e, i) => e.attr('opacity', fade(t, pg.T + .1 + i * .4, .25)));
  }};
}
