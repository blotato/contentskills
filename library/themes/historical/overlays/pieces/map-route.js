import {C, F, stage, sheet, land, compass, route, greek, bar, txt, tone, span, settle, easeInOut} from '../../kit.js';
import {live, INK} from './_overlay.js';

// A map torn from an atlas: a made-up coastline on aged paper with a graticule and compass rose, a
// dashed crimson route that travels from place to place, and each place label inked in as the line
// reaches it. `places` are positions 0..1 inside the sheet; the land is invented, not a real map.
// (x, y) is the centre of the sheet. `seconds` is how long the journey takes.
export const meta = {duration: 6, live: true};
export const defaults = {
  title: 'THE ROUTE NORTH', note: 'ILLUSTRATIVE MAP', places: [{name: 'HARBOUR', x: .2, y: .74}, {name: 'RIVER TOWN', x: .4, y: .5}, {name: 'THE PASS', x: .6, y: .4}, {name: 'NORTH STATION', x: .84, y: .2}],
  x: 540, y: 350, w: 800, h: 460, tilt: 1.4, seed: 3, seconds: 3.2, color: 'crimson',
};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {w, h} = props, g = st.root.append('g'), sh = sheet(g, -w / 2, -h / 2, w, h, {fill: C.paper, seed: props.seed, rough: 9}), m = g.append('g').attr('clip-path', sh.clip);
  let grid = ''; for (let i = 1; i < 6; i++) grid += `M${-w / 2 + i * w / 6} ${-h / 2}v${h}`; for (let i = 1; i < 4; i++) grid += `M${-w / 2} ${-h / 2 + i * h / 4}h${w}`;
  for (let r = 0; r < 9; r++) greek(m, -w / 2 + 20, -h / 2 + 30 + r * h / 9, w - 40, 1, {seed: props.seed + r, size: 7, color: '#3f5f80', opacity: .28});
  const coast = land(w * .06, 0, w * .36, h * .4, {seed: props.seed});
  m.append('path').attr('d', coast).attr('fill', 'none').attr('stroke', '#3f5f80').attr('stroke-width', 14).attr('opacity', .22);
  m.append('path').attr('d', coast).attr('fill', '#b5ab8e').attr('stroke', '#2b2a26').attr('stroke-width', 2.5);
  m.append('path').attr('d', land(-w * .36, h * .2, w * .07, h * .1, {seed: props.seed + 5})).attr('fill', '#b5ab8e').attr('stroke', '#2b2a26').attr('stroke-width', 2);
  m.append('path').attr('d', grid).attr('stroke', '#2b2a26').attr('stroke-width', 1).attr('opacity', .28);
  compass(m, 34, {color: '#2b2a26'}).attr('transform', `translate(${-w / 2 + 70} ${-h / 2 + 86})`);
  const pts = props.places.map(p => [(p.x - .5) * w, (p.y - .5) * h]), rt = route(m, pts, {color: C.crimson, width: 6});
  // Where along the line each place sits, found by walking the path.
  const stops = pts.map(p => { let best = 0, bd = 1e9; for (let i = 0; i <= 200; i++) { const a = rt.at(i / 200), d = Math.hypot(a[0] - p[0], a[1] - p[1]); if (d < bd) { bd = d; best = i / 200; } } return best; });
  const marks = props.places.map((p, i) => { const s = m.append('g').attr('transform', `translate(${pts[i][0]} ${pts[i][1]})`), dot = s.append('circle').attr('r', 9).attr('fill', C.bone).attr('stroke', '#2b2a26').attr('stroke-width', 3), left = p.x > .7;
    const lab = txt(s, left ? -18 : 18, !left && i % 2 ? 42 : -18, p.name, {size: 28, color: INK, weight: 700, spacing: .06, anchor: left ? 'end' : 'start'}).attr('stroke', C.paper).attr('stroke-width', 6).attr('paint-order', 'stroke'); return {dot, lab}; });
  const head = m.append('circle').attr('r', 12).attr('fill', C.crimson).attr('stroke', C.bone).attr('stroke-width', 3);
  txt(m, w / 2 - 22, h / 2 - 20, props.note, {size: 20, font: F.type, color: INK, anchor: 'end', opacity: .75});
  const title = props.title ? bar(g, props.title, {size: 42, fill: tone(props.color), weight: 700}) : null; title?.g.attr('transform', `translate(${-w / 2 - 18} ${-h / 2 + 8})`);
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, 1)), q = easeInOut(span(t, .9, props.seconds));
    g.attr('transform', `translate(${props.x + 4 * t} ${props.y + 40 * x + 24 * (1 - e)}) rotate(${props.tilt - .12 * t}) scale(${.97 + .03 * e + .004 * t})`);
    rt.set(q); const [hx, hy] = rt.at(q); head.attr('cx', hx).attr('cy', hy).attr('opacity', span(t, .8, .2));
    marks.forEach(({dot, lab}, i) => { const on = span(q, Math.min(stops[i], .96) - .04, .04) * (i ? 1 : span(t, .6, .3)); dot.attr('opacity', .35 + .65 * on).attr('r', 7 + 3 * on); lab.attr('opacity', on); });
    title?.reveal(span(t, .3, .8));
  }};
}
