import {C, F, stage, fieldOf, lines, label, folio, rule, text, picture, loadImages, wrap, count, span, glide, ease, clamp} from '../../kit.js';

// An analytics view of a handful of reels, as cards with pictures: the best one (largest final figure) is a large
// card at the left with its picture, its figure in the Didone and a filled area chart of its views over time; the
// others are a 2 x 2 of smaller cards, each with its own picture, title, figure and small chart. Cards rise one after
// another, the charts draw left to right and the figures count up; at `flagAt` the best reel takes the accent and a
// small filled tag (`flag`) lands on its picture. Each small chart is on its own scale from zero (a sparkline); the
// figures are what compare. Up to five items. Props: title, unit, note, index, field, clear, items [{label, values}],
// images (by item), decimals, prefix, suffix, flag, flagAt, drawFor. The default data is a shape, not a measurement.
export const meta = {duration: 3, live: true};
export const defaults = {title: 'Which reels *worked*', unit: 'Illustrative · views, thousands', note: 'Illustrative · not real data', index: '11', field: 'paper', clear: false, decimals: 0, prefix: '', suffix: 'K', flag: 'Worked', flagAt: 1.3, drawFor: .55, images: [],
  items: [{label: 'Reel one', values: [12, 30, 64, 96]}, {label: 'Reel two', values: [30, 38, 44, 52]}, {label: 'Reel three', values: [22, 30, 41, 47]}, {label: 'Reel four', values: [18, 24, 31, 39]}, {label: 'Reel five', values: [9, 15, 22, 28]}]};

export async function mount(el, props = defaults) {
  const st = stage(el, {mode: 'card', field: props.field, clear: props.clear}), f = fieldOf(props.field), root = st.root, d3 = window.d3, X0 = 64, X1 = 936;
  const order = (props.items ?? []).map((d, i) => ({...d, i, last: d.values.at(-1)})).sort((a, b) => b.last - a.last).slice(0, 5), imgs = await loadImages(order.map(d => props.images?.[d.i] ?? null), 400, 460);
  const fmt = v => `${props.prefix ?? ''}${v.toFixed(props.decimals ?? 0)}${props.suffix ?? ''}`, rest = f.dark ? C.fog : C.umber, tints = ['plaid', 'wall', 'skin', 'shade', 'hair'];
  label(root, X0, 92, props.unit, {size: 30, color: f.sub}); if (props.index) folio(root, X1, 92, props.index, {size: 30, anchor: 'end', color: f.sub});
  const top = rule(root, X0, 112, X1, 112, {color: f.fg, width: 3}), ttl = lines(st, root, [props.title], X0, 136, 80, {color: f.fg, accent: f.accent});
  const Y0 = 262, HW = 380, gap = 18, SW = (X1 - X0 - HW - gap * 2) / 2, SH = 300;
  const cards = order.map((d, k) => {
    const hero = k === 0, x = hero ? X0 : X0 + HW + gap + ((k - 1) % 2) * (SW + gap), y = hero ? Y0 : Y0 + Math.floor((k - 1) / 2) * (SH + gap), w = hero ? HW : SW, ph = hero ? 330 : 128, g = root.append('g');
    const pic = picture(st, g, {x, y, w, h: ph, image: imgs[k], tint: tints[k % 5]});
    const ty = y + ph, tsize = hero ? 46 : 31, tl = wrap(d.label, tsize, w - 4).slice(0, 2); tl.forEach((s, j) => text(g, x, ty + tsize * (1.05 + j * 1.02), s, {font: F.head, size: tsize, color: f.fg}));
    const fy = ty + tsize * 2.2 + (hero ? 96 : 50), fig = text(g, x, fy, fmt(0), {font: F.serif, weight: 500, size: hero ? 104 : 50, color: f.fg});
    const cx0 = hero ? x : x + 146, cx1 = x + w, cy1 = hero ? Y0 + SH * 2 + gap : fy + 2, ch = hero ? 96 : 44, n = d.values.length;
    const sx = d3.scaleLinear([0, n - 1], [cx0, cx1]), sy = d3.scaleLinear([0, d3.max(d.values)], [cy1, cy1 - ch]), pts = d.values.map((v, j) => [sx(j), sy(v)]);
    const cid = st.uid('rc'), cr = st.defs.append('clipPath').attr('id', cid).append('rect').attr('x', cx0 - 6).attr('y', cy1 - ch - 14).attr('height', ch + 22), cg = g.append('g').attr('clip-path', `url(#${cid})`);
    const area = cg.append('path').attr('d', d3.area().x(p => p[0]).y0(cy1).y1(p => p[1]).curve(d3.curveMonotoneX)(pts)).attr('fill', rest).attr('fill-opacity', .28);
    const ln = cg.append('path').attr('d', d3.line().curve(d3.curveMonotoneX)(pts)).attr('fill', 'none').attr('stroke', rest).attr('stroke-width', hero ? 7 : 5).attr('stroke-linecap', 'round');
    g.append('line').attr('x1', cx0).attr('x2', cx1).attr('y1', cy1 + 1).attr('y2', cy1 + 1).attr('stroke', f.fg).attr('stroke-width', 2).attr('stroke-opacity', .5);
    let tag = null; if (hero && props.flag) { tag = g.append('g'); const tw = String(props.flag).length * 24 + 56; tag.append('rect').attr('x', x + 16).attr('y', y + 16).attr('width', tw).attr('height', 58).attr('rx', 3).attr('fill', f.accent); label(tag, x + 16 + tw / 2, y + 56, props.flag, {size: 30, weight: 700, track: .14, anchor: 'middle', color: f.bg}); }
    return {d, g, pic, fig, cr, area, ln, tag, hero, w: cx1 - cx0 + 12, at: .12 + k * .08};
  });
  const foot = props.note ? rule(root, X0, 912, X1, 912, {color: f.fg, width: 2, opacity: .45}) : null, note = props.note ? label(root, X0, 952, props.note, {size: 28, color: f.sub}) : null;
  const flagAt = props.flagAt ?? 1.3, drawFor = props.drawFor ?? .55;
  return {seek(t) {
    top.draw(glide(span(t, 0, .35))); ttl.seek(t, .05);
    for (const c of cards) {
      const a = glide(span(t, c.at, .4)), q = glide(span(t, c.at + .12, drawFor)), hot = c.hero ? ease(span(t, flagAt, .3)) : 0;
      c.g.attr('opacity', ease(span(t, c.at, .2)).toFixed(3)).attr('transform', `translate(0 ${((1 - a) * 44).toFixed(1)})`); c.pic.set({zoom: 1.12 - .12 * a});
      c.cr.attr('width', c.w * q); c.fig.text(fmt(c.d.last * q));
      if (c.hero) { const col = d3.interpolateRgb(rest, f.accent)(hot); c.ln.attr('stroke', col); c.area.attr('fill', col).attr('fill-opacity', .28 + .2 * hot); c.fig.attr('fill', d3.interpolateRgb(f.fg, f.accent)(hot)); c.tag?.attr('opacity', hot).attr('transform', `translate(0 ${((1 - glide(span(t, flagAt, .3))) * -18).toFixed(1)})`); }
    }
    foot?.draw(glide(span(t, .3, .4))); note?.attr('opacity', ease(span(t, .5, .3)));
  }};
}
