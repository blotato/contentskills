import {card, short, grow, fade, fmt, decimalsOf, num, fig, tag, box, rule} from './_card.js';

// Vertical bars on a baseline: thick filled columns growing on the glide curve, the one that matters in the accent
// with its figure in the Didone, the rest in umber with mono figures; names in small capitals under the baseline (cut short when the bars are narrow).
// Props: title, unit, items [{label, value}], highlight (index; the largest by default), decimals, prefix, suffix,
// note, index, field, clear.
export const meta = {duration: 4};
export const defaults = {title: 'Reach by *format*', unit: 'Illustrative · thousand views', note: 'Illustrative data', index: '01', field: 'paper', clear: false, highlight: null, prefix: '', suffix: '',
  items: [{label: 'Photo', value: 18}, {label: 'Carousel', value: 34}, {label: 'Story', value: 26}, {label: 'Reel', value: 72}, {label: 'Live', value: 41}]};

export function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g} = pg, d3 = window.d3, items = props.items, n = items.length, p = {...props, decimals: decimalsOf(items.map(d => d.value), props)};
  const hi = props.highlight ?? d3.maxIndex(items, d => d.value), base = pg.y1 - 52, top = pg.y0 + 120;
  const x = d3.scaleBand().domain(d3.range(n)).range([pg.x0, pg.x1]).paddingInner(.3).paddingOuter(.12), y = d3.scaleLinear().domain([0, d3.max(items, d => d.value) || 1]).range([0, base - top]);
  const bars = items.map((d, i) => {
    const hot = i === hi, cx = x(i) + x.bandwidth() / 2, bar = box(g, x(i), base, x.bandwidth(), 0, hot ? ink.accent : ink.rest);
    const value = hot ? num(g, cx, 0, '', {size: 104, anchor: 'middle', color: ink.accent}) : fig(g, cx, 0, '', {size: 38, anchor: 'middle', color: ink.fg});
    return {d, hot, bar, value, name: tag(g, cx, base + 46, short(d.label, x.step() - 14), x.step() - 14, {anchor: 'middle', color: hot ? ink.accent : ink.fg, size: 30})};
  });
  const floor = rule(g, pg.x0, base, pg.x1, base, {width: 3, color: ink.fg});
  return {seek(t) {
    pg.seek(t); floor.draw(grow(t, pg.T, .4));
    bars.forEach((b, i) => {
      const q = grow(t, pg.T + .06 + i * .05, .5), h = y(b.d.value) * q;
      b.bar.attr('y', base - h).attr('height', h);
      b.value.attr('y', base - h - (b.hot ? 20 : 18)).text(fmt(b.d.value * q, p)).attr('opacity', fade(t, pg.T + .06 + i * .05, .2));
      b.name.attr('opacity', fade(t, pg.T + .1 + i * .05, .25));
    });
  }};
}
