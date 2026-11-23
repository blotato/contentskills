import {card, grow, fade, num, fig, tag, clamp} from './_card.js';

// Shares of a whole as one thick ring sweeping round from twelve o'clock: the share that matters in the accent, the
// rest in ink, umber and fog; that share's percentage stands in the centre in the Didone, and every segment is
// labelled where it sits (figure over name), no legend.
// Props: title, unit, items [{label, value}], highlight (index; the largest by default), note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'Where the *hours* go', unit: 'Illustrative · share of a week', note: 'Illustrative data', index: '04', field: 'paper', clear: false, highlight: null,
  items: [{label: 'Editing', value: 46}, {label: 'Filming', value: 24}, {label: 'Writing', value: 18}, {label: 'Posting', value: 12}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, d3 = window.d3, items = props.items, total = d3.sum(items, d => d.value) || 1, hi = props.highlight ?? d3.maxIndex(items, d => d.value);
  const cx = 500, cy = (pg.y0 + pg.y1) / 2 + 6, R = Math.min(214, (pg.y1 - pg.y0) / 2 - 56), r = R - 78, rest = [ink.fg, ink.rest, ink.faint, ink.sub];
  const arcs = d3.pie().sort(null).value(d => d.value)(items), arc = d3.arc().innerRadius(r).outerRadius(R).padAngle(.012);
  let k = 0; const segs = arcs.map((a, i) => {
    const hot = i === hi, color = hot ? ink.accent : rest[k++ % rest.length], mid = (a.startAngle + a.endAngle) / 2, sx = Math.sin(mid), sy = -Math.cos(mid), side = Math.abs(sx) < .28 ? 'middle' : sx > 0 ? 'start' : 'end';
    const lx = cx + sx * (R + 26), ly = clamp(cy + sy * (R + 44), pg.y0 + 40, pg.y1 - 40) + (side === 'middle' ? (sy < 0 ? -18 : 30) : 0), room = side === 'middle' ? 300 : side === 'start' ? pg.x1 - lx : lx - pg.x0;
    return {a, hot, path: g.append('path').attr('fill', color).attr('transform', `translate(${cx} ${cy})`),
      pct: fig(g, lx, ly, `${Math.round(100 * a.data.value / total)}%`, {anchor: side, size: 40, color: hot ? ink.accent : ink.fg}), name: tag(g, lx, ly + 38, a.data.label, room, {anchor: side, color: hot ? ink.accent : ink.fg, track: .1})};
  });
  const share = Math.round(100 * items[hi].value / total), big = num(g, cx - 14, cy + 44, '', {size: 128, anchor: 'middle', color: ink.accent}), sign = num(g, 0, cy - 6, '%', {size: 52, color: ink.accent});
  return {seek(t) {
    pg.seek(t); const q = grow(t, pg.T, .65), sweep = q * Math.PI * 2;
    segs.forEach((s, i) => {
      const a0 = Math.min(s.a.startAngle, sweep), a1 = Math.min(s.a.endAngle, sweep);
      s.path.attr('d', a1 - a0 > .002 ? arc({startAngle: a0, endAngle: a1, padAngle: .012}) : null);
      const o = fade(t, pg.T + .12 + .5 * (s.a.startAngle + s.a.endAngle) / (4 * Math.PI), .25); s.pct.attr('opacity', o); s.name.attr('opacity', o);
    });
    const txt = String(Math.round(share * q)); big.text(txt).attr('opacity', fade(t, pg.T, .2)); sign.attr('x', cx - 14 + txt.length * 37 + 4).attr('opacity', fade(t, pg.T, .2));
  }};
}
