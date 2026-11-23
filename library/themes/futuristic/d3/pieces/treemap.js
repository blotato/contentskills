import {C, F, series, brackets, line, text, ticks, draw, span, easeOut, flicker, scramble, typed} from '../../hud.js';
import {card} from './_card.js';

// A treemap that subdivides in front of you: the block is cut in two, then each half is cut
// again, until every item has its own cell (area = value). Cells then fill and label themselves,
// and a bracket keeps stepping through them in order of size.
export const meta = {duration: 6.5, live: true};
export const defaults = {title: 'Where the income comes from', unit: 'Illustrative · share of income', suffix: '%', clear: false,
  items: [{label: 'Sponsors', value: 34}, {label: 'Products', value: 24}, {label: 'Ads', value: 16}, {label: 'Affiliates', value: 11}, {label: 'Members', value: 8}, {label: 'Tips', value: 4}, {label: 'Licensing', value: 3}]};

// Balanced binary partition: split the sorted list where the two halves' totals are closest,
// cut the rectangle across its longer side in that proportion, and recurse.
function partition(items, x, y, w, h, depth, cells, cuts) {
  if (items.length === 1) { cells.push({...items[0], x, y, w, h, depth}); return; }
  const total = items.reduce((s, d) => s + d.value, 0); let k = 0, acc = 0;
  do acc += items[k++].value; while (k < items.length - 1 && acc + items[k].value / 2 < total / 2);
  const f = acc / total;
  if (w >= h) { cuts.push({d: `M${x + w * f} ${y}V${y + h}`, depth}); partition(items.slice(0, k), x, y, w * f, h, depth + 1, cells, cuts); partition(items.slice(k), x + w * f, y, w * (1 - f), h, depth + 1, cells, cuts); }
  else { cuts.push({d: `M${x} ${y + h * f}H${x + w}`, depth}); partition(items.slice(0, k), x, y, w, h * f, depth + 1, cells, cuts); partition(items.slice(k), x, y + h * f, w, h * (1 - f), depth + 1, cells, cuts); }
}

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), x0 = 100, y0 = 262, w = 816, h = 590, step = .5, cells = [], cuts = [], items = props.items.map((d, i) => ({...d, i})).sort((a, b) => b.value - a.value), total = items.reduce((s, d) => s + d.value, 0);
  partition(items, x0, y0, w, h, 0, cells, cuts);
  const outer = line(root, `M${x0} ${y0}H${x0 + w}V${y0 + h}H${x0}Z`, C.teal, 2), top = ticks(root, x0, y0 - 24, w, 40, C.dim), side = ticks(root, x0 - 24, y0, h, 30, C.dim, true);
  const tiles = cells.map((c, rank) => { const g = root.append('g'), color = series[c.i % series.length], pad = 5, cw = c.w - pad * 2, ch = c.h - pad * 2, name = String(c.label).toUpperCase(), value = Math.round(c.value) + (props.suffix ?? '');
    const fill = g.append('rect').attr('x', c.x + pad).attr('y', c.y + pad).attr('width', cw).attr('height', ch).attr('fill', color), edge = line(g, `M${c.x + pad} ${c.y + pad}h${cw}v${ch}h${-cw}Z`, color, 2.5);
    const roomy = cw > 120 && ch > 96, ls = Math.min(30, (cw - 28) / (name.length * .56)), vs = roomy ? Math.min(92, ch * .42, (cw - 28) / (value.length * .82)) : Math.min(30, ch * .5, (cw - 12) / (value.length * .82));
    const label = roomy ? text(g, c.x + pad + 14, c.y + pad + 14 + ls * .8, '', {size: ls, font: F.text, weight: 700, color: C.white, spacing: '.05em'}) : null;
    const num = text(g, roomy ? c.x + pad + 14 : c.x + c.w / 2, roomy ? c.y + c.h - pad - 16 : c.y + c.h / 2 + vs * .36, '', {size: vs, font: F.display, weight: 800, color, anchor: roomy ? 'start' : 'middle', spacing: '0'});
    return {c, g, fill, edge, label, num, name, rank, at: .7 + c.depth * step, mark: line(root, brackets(c.x + pad + 6, c.y + pad + 6, cw - 12, ch - 12, Math.min(26, cw / 3, ch / 3)), C.white, 3)}; });
  const knives = cuts.map(c => ({...c, path: line(root, c.d, C.white, 3), at: .6 + c.depth * step})), built = .7 + Math.max(...cells.map(c => c.depth)) * step + .9;
  const foot = text(root, x0, 912, '', {size: 22, color: C.dim, spacing: '.18em'}), spot = text(root, x0 + w, 914, '', {size: 26, color: C.amber, anchor: 'end', spacing: '.12em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(outer, span(t, .15, .5)); draw(top, span(t, .3, .5)); draw(side, span(t, .3, .5));
    for (const k of knives) { draw(k.path, span(t, k.at, .35)); k.path.attr('opacity', 1 - span(t, k.at + .45, .3)); }
    const slot = (t - built) / 1.1, active = slot > 0 ? Math.floor(slot) % tiles.length : -1;
    for (const p of tiles) { const q = easeOut(span(t, p.at + .1, .8)), hot = p.rank === active;
      p.g.attr('opacity', flicker(t, p.at)); p.fill.attr('opacity', (hot ? .42 : .15 + .04 * Math.sin(t * 2.5 + p.rank)) * span(t, p.at, .3)); draw(p.edge, span(t, p.at, .5));
      p.label?.text(scramble(p.name, span(t, p.at + .15, .45), t)); p.num.text(Math.round(p.c.value * q) + (props.suffix ?? '')); p.mark.attr('opacity', hot ? flicker(slot % 1, 0, .25) : 0); }
    foot.text(typed(`${tiles.length} SEGMENTS · TOTAL ${Math.round(total)}${props.suffix ?? ''}`, span(t, built - .5, .5)));
    spot.text(active < 0 ? '' : typed(`> ${String(active + 1).padStart(2, '0')} ${tiles[active].name} ${Math.round(tiles[active].c.value)}${props.suffix ?? ''}`, span(slot % 1, 0, .3)));
  }};
}
