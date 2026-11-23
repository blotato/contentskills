import {card, grow, fade, fmt, num, tag, box, text, label, rule, picture, loadImages, smooth, span, mix, measure, C, F} from './_card.js';

// Which reels worked, as an analytics table: one row per reel (up to 5, sorted by the final figure, best on top)
// with its picture (a 9:16 thumbnail; a tint of the footage when there is no image), its title in the serif, a small
// area chart of its views over time drawn left to right (all rows on one scale, so the rows compare), and the final
// figure in the Didone at the right, counting up. Tracked column heads over a hairline, hairlines between rows.
// Rows arrive one after another; at `flagAt` the best reel takes the accent: its chart and figure turn wine (blush
// on dark grounds), its title turns italic and a small filled tag with the word `flag` lands under it.
// The piece draws whatever it is given: whoever supplies the figures is responsible for where they come from (set
// `unit` and `note` to match). The default data is a shape, not a measurement, and says so.
// Props: title, unit, items [{label, values: [v at step 0, v at step 1, ...]}], images (server paths, by item),
// columns [reel, chart, figure] (column heads; the chart's is left out if it is wider than its column), decimals, prefix, suffix, flag, flagAt, drawFor (seconds a chart
// takes to draw), note, index, field, clear.
export const meta = {duration: 4, live: true};
export const defaults = {title: 'Which reels *worked*', unit: 'Illustrative · views, thousands', note: 'Illustrative · not real data', index: '15', field: 'paper', clear: false, flag: 'Worked', flagAt: 1.3, drawFor: .55, decimals: 0, prefix: '', suffix: 'K',
  columns: ['Reel', 'Over time', 'Views'], images: [],
  items: [{label: 'Reel one', values: [20, 34, 41, 46]}, {label: 'Reel two', values: [12, 30, 88, 164]}, {label: 'Reel three', values: [30, 44, 52, 61]}, {label: 'Reel four', values: [18, 22, 27, 30]}, {label: 'Reel five', values: [40, 55, 66, 72]}]};

const TINT = ['plaid', 'shade', 'skin', 'hair', 'wine'];

export async function mount(el, props = defaults) {
  const pg = card(el, props), {ink, body: g, st} = pg, d3 = window.d3, n0 = Math.min(5, (props.items ?? []).length);
  const last = d => d.values[d.values.length - 1] ?? 0;
  const items = (props.items ?? []).slice(0, 5).map((d, i) => ({label: d.label ?? '', values: (d.values ?? []).length > 1 ? d.values : [0, ...(d.values ?? [0])], image: props.images?.[i] ?? null, i})).sort((a, b) => last(b) - last(a) || a.i - b.i);
  const n = Math.max(1, n0), max = d3.max(items, d => d3.max(d.values)) || 1, cols = props.columns ?? defaults.columns;
  // rows: a head line, then n rows down to the foot
  const headY = pg.y0 + 30, top = pg.y0 + 46, pitch = Math.min(128, (pg.y1 - top) / n), th = Math.min(104, pitch - 12), tw = th * 9 / 16;
  const shots = await loadImages(items.map(d => d.image), Math.round(tw * 3), Math.round(th * 3));
  // columns: picture | title (as wide as the longest title needs, up to 400 px; the type shrinks to fit) | chart | figure
  const tagW = props.flag ? measure(String(props.flag).toUpperCase(), 30, {font: F.sans, weight: 700}) + 30 * .14 * String(props.flag).length + 28 : 0;
  const figSize = 58, figW = Math.max(measure(fmt(max, props), figSize, {font: F.serif, weight: 500}), measure(cols[2] ?? '', 30, {font: F.sans, weight: 600, track: .1}) + 30 * .1 * String(cols[2] ?? '').length) + 6;
  const nx = pg.x0 + tw + 20, longest = Math.max(1, ...items.map(d => Math.max(measure(d.label, 100, {font: F.head}), measure(d.label, 100, {font: F.italic})))), nameMax = Math.min(380, pg.x1 - figW - 28 - 190 - 26 - nx);
  const size = Math.max(30, Math.min(48, 100 * nameMax / longest)), nameW = Math.max(Math.min(nameMax, longest * size / 100), Math.min(nameMax, tagW));
  const cx0 = nx + nameW + 26, cx1 = pg.x1 - figW - 28, ch = Math.min(74, pitch - 34);
  const headW = (str, track) => measure(String(str ?? '').toUpperCase(), 30, {font: F.sans, weight: 600}) + 30 * track * String(str ?? '').length, midRoom = pg.x1 - headW(cols[2], .14) - 26 - cx0, midFits = headW(cols[1], .02) <= midRoom;
  const heads = [tag(g, pg.x0, headY, cols[0], nameW + tw + 20, {color: ink.sub, track: .14, opacity: 0}), tag(g, cx0, headY, midFits ? cols[1] : '', midRoom, {color: ink.sub, track: .14, opacity: 0}), tag(g, pg.x1, headY, cols[2], figW, {color: ink.sub, track: .14, anchor: 'end', opacity: 0})];
  const headRule = rule(g, pg.x0, top, pg.x1, top, {width: 2, color: ink.fg});
  const x = d3.scaleLinear().domain([0, 1]).range([cx0, cx1 - 9]), y = d3.scaleLinear().domain([0, max]).range([ch / 2, -ch / 2 + 6]);
  const rows = items.map((d, r) => {
    const cy = top + (r + .5) * pitch, row = g.append('g'), lead = r === 0 && n0 > 1, K = d.values.length, px = k => x(k / (K - 1));
    const pic = picture(st, row, {x: pg.x0, y: cy - th / 2, w: tw, h: th, image: shots[r] ?? null, tint: TINT[d.i % TINT.length]});
    const by = cy + size * .3, name = text(row, nx, by, d.label, {font: F.head, size, color: ink.fg}), nameHot = lead ? text(row, nx, by, d.label, {font: F.italic, size, color: ink.accent, opacity: 0}) : null;
    const cid = st.uid('spark'), clip = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', cx0 - 6).attr('y', cy - ch / 2 - 14).attr('height', ch + 28).attr('width', 0);
    const plot = row.append('g').attr('clip-path', `url(#${cid})`), area = d3.area().x((v, k) => px(k)).y0(cy + ch / 2).y1(v => cy + y(v)).curve(d3.curveMonotoneX)(d.values), path = d3.line().x((v, k) => px(k)).y(v => cy + y(v)).curve(d3.curveMonotoneX)(d.values);
    plot.append('path').attr('d', area).attr('fill', ink.faint);
    const stroke = c => plot.append('path').attr('d', path).attr('fill', 'none').attr('stroke', c).attr('stroke-width', 6).attr('stroke-linejoin', 'round').attr('stroke-linecap', 'round');
    stroke(ink.fg); const hotArea = lead ? plot.append('path').attr('d', area).attr('fill', ink.accent).attr('opacity', 0) : null, hotLine = lead ? stroke(ink.accent).attr('opacity', 0) : null;
    const base = rule(row, cx0, cy + ch / 2, cx1, cy + ch / 2, {width: 2, color: ink.fg, opacity: .5});
    const end = row.append('circle').attr('cx', px(K - 1)).attr('cy', cy + y(last(d))).attr('r', 0).attr('fill', ink.fg);
    const value = num(row, pg.x1, cy + figSize * .34, '', {size: figSize, anchor: 'end', color: ink.fg});
    const sep = r < n - 1 ? rule(g, pg.x0, cy + pitch / 2, pg.x1, cy + pitch / 2, {width: 1.5, color: ink.fg, opacity: .28}) : null;
    const flag = lead && props.flag ? row.append('g') : null;
    if (flag) { box(flag, nx, cy + 8, tagW, 42, ink.accent); label(flag, nx + 14, cy + 40, props.flag, {size: 30, weight: 700, track: .14, color: ink.bg}); }
    return {d, row, pic, cy, name, nameHot, clip, hotArea, hotLine, base, end, value, sep, flag, lead, by};
  });
  const drawFor = props.drawFor ?? .55, flagAt = props.flagAt ?? 1.3;
  return {seek(t) {
    pg.seek(t); headRule.draw(grow(t, pg.T - .06, .4)); heads.forEach((h, i) => h.attr('opacity', fade(t, pg.T - .04 + i * .04, .25)));
    const f = smooth(span(t, flagAt, .28)), fl = grow(t, flagAt + .04, .3);
    rows.forEach((r, i) => {
      const at = .15 + i * .07, a = grow(t, at, .38), q = smooth(span(t, at + .08, drawFor)), shift = r.flag ? -19 * f : 0;
      r.row.attr('transform', `translate(0 ${((1 - a) * 26).toFixed(1)})`).attr('opacity', fade(t, at, .2));
      r.clip.attr('width', (cx1 - cx0 + 12) * q); r.base.draw(grow(t, at + .04, .4)); r.sep?.draw(grow(t, at + .06, .45));
      r.end.attr('r', 9 * grow(t, at + .08 + drawFor * .86, .2)).attr('fill', r.lead ? d3.interpolateRgb(ink.fg, ink.accent)(f) : ink.fg);
      r.value.text(fmt(r.d.values[r.d.values.length - 1] * q, props)).attr('fill', r.lead ? d3.interpolateRgb(ink.fg, ink.accent)(f) : ink.fg);
      r.hotArea?.attr('opacity', f * .3); r.hotLine?.attr('opacity', f);
      r.name.attr('y', r.by + shift).attr('opacity', r.nameHot ? 1 - f : 1); r.nameHot?.attr('y', r.by + shift).attr('opacity', f);
      r.flag?.attr('transform', `translate(${(-(1 - fl) * 18).toFixed(1)} 0)`).attr('opacity', fade(t, flagAt + .04, .2));
    });
  }};
}
