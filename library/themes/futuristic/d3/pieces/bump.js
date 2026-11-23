import {C, F, series, line, text, draw, span, easeInOut, flicker, spring, typed} from '../../hud.js';
import {card} from './_card.js';

// A bump chart: rank over time, with lines that cross as positions change. A cursor races
// across revealing the lines and stamping a rank badge at every step; then each contender is
// highlighted in turn while a packet runs along its line.
export const meta = {duration: 7, live: true};
export const defaults = {title: 'Which format leads', unit: 'Illustrative · rank by reach', periods: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'], clear: false,
  series: [{label: 'Shorts', ranks: [3, 2, 2, 1, 1, 1]}, {label: 'Reels', ranks: [1, 1, 3, 3, 2, 2]}, {label: 'TikTok', ranks: [2, 3, 1, 2, 3, 4]}, {label: 'Long form', ranks: [5, 4, 4, 4, 4, 3]}, {label: 'Podcast', ranks: [4, 5, 5, 5, 5, 5]}]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), S = props.series, P = props.periods, n = S.length, m = P.length, x0 = 170, x1 = 700, yt = 350, yb = 850;
  const x = i => x0 + i / (m - 1) * (x1 - x0), y = r => yt + (r - 1) / Math.max(1, n - 1) * (yb - yt), build = [.9, 2.6];
  const guides = P.map((p, i) => ({i, rule: line(root, `M${x(i)} ${yt - 44}V${yb + 34}`, C.grid, 2), name: text(root, x(i), yt - 62, '', {size: 22, color: C.dim, anchor: 'middle', spacing: '.12em'}), label: p}));
  const ranks = d3.range(1, n + 1).map(r => text(root, 100, y(r) + 10, `#${r}`, {size: 28, font: F.display, weight: 800, color: C.dim, anchor: 'middle', spacing: '0'}));
  const clip = defs.append('clipPath').attr('id', id + '-race').append('rect').attr('x', 0).attr('y', 0).attr('height', 1000), plot = root.append('g').attr('clip-path', `url(#${id}-race)`);
  const rows = S.map((s, k) => { const color = series[k % series.length], path = line(plot, d3.line().x((d, i) => x(i)).y(d => y(d)).curve(d3.curveBumpX)(s.ranks), color, 6), ghost = line(root, path.attr('d'), color, 6).attr('opacity', 0);
    const dots = s.ranks.map((r, i) => { const g = root.append('g'); g.append('circle').attr('r', 19).attr('fill', C.bg).attr('stroke', color).attr('stroke-width', 3); text(g, 0, 8, r, {size: 22, color: C.white, anchor: 'middle', spacing: '0'}); return {g, i, r}; });
    const move = s.ranks[0] - s.ranks.at(-1), tag = root.append('g'), ly = y(s.ranks.at(-1));
    const name = text(tag, x1 + 40, ly + 2, '', {size: 28, font: F.text, weight: 700, color: C.white, spacing: '.05em'}); text(tag, x1 + 40, ly + 30, move > 0 ? `UP ${move}` : move < 0 ? `DOWN ${-move}` : 'HELD', {size: 20, color: move > 0 ? C.amber : C.dim, spacing: '.14em'});
    return {s, k, color, path, ghost, len: ghost.node().getTotalLength(), dots, tag, name, label: String(s.label).toUpperCase(), packet: root.append('rect').attr('width', 16).attr('height', 16).attr('fill', C.white)}; });
  const cursor = line(root, `M0 ${yt - 44}V${yb + 34}`, C.white, 2), spot = text(root, 84, 250, '', {size: 24, color: C.amber, spacing: '.14em'});
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    guides.forEach(g => { draw(g.rule, span(t, .25 + g.i * .08, .4)); g.name.text(typed(g.label, span(t, .4 + g.i * .08, .25))); }); ranks.forEach((r, i) => r.attr('opacity', flicker(t, .3 + i * .08)));
    const q = easeInOut(span(t, build[0], build[1] - build[0])), cx = x0 - 30 + q * (x1 - x0 + 60); clip.attr('width', q >= 1 ? 1000 : cx); cursor.attr('transform', `translate(${cx} 0)`).attr('opacity', q > 0 && q < 1 ? .9 : 0);
    const slot = (t - build[1] - .7) / 1.2, active = slot > 0 ? Math.floor(slot) % n : -1;
    for (const r of rows) { const hot = r.k === active, dim = active >= 0 && !hot;
      r.path.attr('opacity', dim ? .3 : 1).attr('stroke-width', hot ? 9 : 6);
      for (const d of r.dots) { const hit = (x(d.i) - x0 + 30) / (x1 - x0 + 60), at = build[0] + hit * (build[1] - build[0]); d.g.attr('transform', `translate(${x(d.i)} ${y(d.r)}) scale(${q >= hit ? spring(span(t, at, .45)) : 0})`).attr('opacity', dim ? .4 : 1); }
      r.tag.attr('opacity', flicker(t, build[1] + r.k * .1) * (dim ? .4 : 1)); r.name.text(typed(r.label, span(t, build[1] + r.k * .1, .3))).attr('fill', hot ? r.color : C.white);
      const u = slot % 1, p = r.ghost.node().getPointAtLength(r.len * easeInOut(Math.max(0, u))); r.packet.attr('x', p.x - 8).attr('y', p.y - 8).attr('transform', `rotate(45 ${p.x} ${p.y})`).attr('opacity', hot ? 1 : 0); }
    const a = active >= 0 ? rows[active] : null; spot.text(a ? typed(`> ${a.label}: #${a.s.ranks[0]} TO #${a.s.ranks.at(-1)}`, span(slot % 1, 0, .3)) : typed('RANK 1 = MOST REACH', span(t, .5, .5)));
  }};
}
