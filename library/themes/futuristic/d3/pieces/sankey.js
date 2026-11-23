import {C, F, series, line, text, draw, span, easeOut, easeInOut, flicker} from '../../hud.js';
import {card} from './_card.js';

// Flow bands from sources (left) to destinations (right). Bands pour across one after another
// and keep carrying small packets while the diagram is up.
export const meta = {duration: 4.6, live: true};
export const defaults = {title: 'Where views end up', unit: 'Illustrative · share of views', suffix: '%', clear: false,
  flows: [['Shorts', 'New viewers', 34], ['Shorts', 'Followers', 10], ['Reels', 'New viewers', 18], ['Reels', 'Followers', 12], ['Long form', 'Followers', 16], ['Long form', 'Buyers', 10]]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), top = 262, bottom = 900, gap = 30, xl = 262, xr = 720, bw = 18;
  const side = k => [...new Set(props.flows.map(f => f[k]))].map(name => ({name, value: d3.sum(props.flows.filter(f => f[k] === name), f => f[2]), used: 0}));
  const L = side(0), R = side(1), total = d3.sum(L, d => d.value), scale = (bottom - top - gap * (Math.max(L.length, R.length) - 1)) / total;
  const place = nodes => { let y = top + (bottom - top - total * scale - gap * (nodes.length - 1)) / 2; for (const n of nodes) { n.y = y; n.h = n.value * scale; y += n.h + gap; } };
  place(L); place(R);
  const flows = props.flows.map(([a, b, v]) => ({s: L.findIndex(n => n.name === a), t: R.findIndex(n => n.name === b), h: v * scale}));
  for (const f of [...flows].sort((p, q) => p.s - q.s || p.t - q.t)) { f.y0 = L[f.s].y + L[f.s].used; L[f.s].used += f.h; }
  for (const f of [...flows].sort((p, q) => p.t - q.t || p.s - q.s)) { f.y1 = R[f.t].y + R[f.t].used; R[f.t].used += f.h; }
  const x0 = xl + bw, x1 = xr, mx = (x0 + x1) / 2;
  [...flows].sort((p, q) => p.s - q.s || p.t - q.t).forEach((f, i) => {
    const color = series[f.s % series.length], {y0, y1, h} = f;
    f.start = .7 + i * .22; f.color = color;
    f.clip = defs.append('clipPath').attr('id', `${id}-f${i}`).append('rect').attr('x', x0).attr('y', 0).attr('height', 1000).attr('width', 0);
    f.band = root.append('path').attr('d', `M${x0} ${y0}C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}V${y1 + h}C${mx} ${y1 + h} ${mx} ${y0 + h} ${x0} ${y0 + h}Z`).attr('fill', color).attr('fill-opacity', .26).attr('stroke', color).attr('stroke-width', 1.5).attr('clip-path', `url(#${id}-f${i})`);
    f.mid = root.append('path').attr('d', `M${x0} ${y0 + h / 2}C${mx} ${y0 + h / 2} ${mx} ${y1 + h / 2} ${x1} ${y1 + h / 2}`).attr('fill', 'none'); f.len = f.mid.node().getTotalLength();
    f.dots = [0, 1, 2].map(() => root.append('rect').attr('width', 14).attr('height', 5).attr('fill', C.white));
  });
  const node = (n, i, left) => {
    const color = left ? series[i % series.length] : C.white, x = left ? xl : xr, tx = left ? xl - 18 : xr + bw + 18, anchor = left ? 'end' : 'start';
    n.bar = root.append('rect').attr('x', x).attr('y', n.y).attr('width', bw).attr('fill', color);
    n.g = root.append('g');
    text(n.g, tx, n.y + n.h / 2 - 2, n.name.toUpperCase(), {size: 28, font: F.text, weight: 700, color: C.white, anchor, spacing: '.04em'});
    n.num = text(n.g, tx, n.y + n.h / 2 + 34, '', {size: 30, font: F.display, weight: 800, color: left ? color : C.amber, anchor, spacing: '0'});
    n.start = left ? .25 + i * .15 : 1.3 + i * .3;
  };
  L.forEach((n, i) => node(n, i, true)); R.forEach((n, i) => node(n, i, false));
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    for (const n of [...L, ...R]) { const q = easeOut(span(t, n.start, .7)); n.bar.attr('height', n.h * q); n.g.attr('opacity', flicker(t, n.start)); n.num.text(Math.round(n.value * q) + (props.suffix ?? '')); }
    for (const f of flows) {
      const q = easeInOut(span(t, f.start, .9)), shimmer = .26 + .08 * Math.sin(t * 2.4 + f.y0 * .02);
      f.clip.attr('width', (x1 - x0) * q); f.band.attr('fill-opacity', shimmer);
      f.dots.forEach((dot, k) => { const u = ((t - f.start) * .42 + k / 3) % 1, p = f.mid.node().getPointAtLength(f.len * Math.max(0, u));
        dot.attr('x', p.x - 7).attr('y', p.y - 2.5).attr('opacity', t > f.start && u < q ? Math.sin(u * Math.PI) : 0); });
    }
  }};
}
