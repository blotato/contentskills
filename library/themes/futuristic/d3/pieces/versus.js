import {C, F, line, ring, text, draw, span, easeOut, flicker, spring} from '../../hud.js';
import {card} from './_card.js';

// Two contenders compared metric by metric: bars grow outward from a centre spine, the numbers
// count up, and the higher side of each row is marked.
export const meta = {duration: 4.2, live: true};
export const defaults = {title: 'Short vs long video', unit: 'Illustrative · score out of 100', max: 100, a: 'Shorts', b: 'Long form', clear: false,
  rows: [{label: 'Reach', a: 85, b: 40}, {label: 'Watch time', a: 30, b: 90}, {label: 'Effort', a: 25, b: 80}, {label: 'Shelf life', a: 35, b: 75}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), n = props.rows.length, cx = 500, y0 = 420, pitch = Math.min(125, 480 / n), cells = 18, cw = 20, sides = [{key: 'a', color: C.cyan, dir: -1}, {key: 'b', color: C.magenta, dir: 1}];
  const heads = sides.map(s => { const name = String(props[s.key]).toUpperCase();
    return text(root, cx + s.dir * 410, 300, name, {size: Math.min(46, 320 / (name.length * .82)), font: F.display, weight: 800, color: s.color, anchor: s.dir < 0 ? 'start' : 'end', spacing: '.02em'}); });
  const unders = sides.map(s => line(root, `M${cx + s.dir * 410} 322H${cx + s.dir * 90}`, s.color, 3));
  const badge = root.append('g'), spin = ring(badge, cx, 286, 48, C.amber, 3, '34 12'); ring(badge, cx, 286, 36, C.dim, 2);
  text(badge, cx, 300, 'VS', {size: 34, font: F.display, weight: 900, color: C.amber, anchor: 'middle', spacing: '0'});
  let marks = ''; for (let i = 0; i <= 24; i++) marks += `M${cx - (i % 4 ? 5 : 10)} ${370 + i * (510 / 24)}h${i % 4 ? 10 : 20}`;
  const spine = line(root, `M${cx} 350V900` + marks, C.dim, 2);
  const rows = props.rows.map((d, i) => {
    const y = y0 + i * pitch, g = root.append('g'), win = d.a === d.b ? null : d.a > d.b ? 'a' : 'b';
    text(g, cx, y, d.label.toUpperCase(), {size: 24, color: C.white, anchor: 'middle', spacing: '.2em'}).attr('paint-order', 'stroke').attr('stroke', C.bg).attr('stroke-width', 10);
    const parts = sides.map(s => ({s, v: d[s.key], won: win === s.key,
      segs: Array.from({length: cells}, (_, k) => g.append('rect').attr('x', s.dir > 0 ? cx + 22 + k * cw : cx - 22 - (k + 1) * cw + 5).attr('y', y + 18).attr('width', cw - 5).attr('height', 34).attr('fill', s.color)),
      num: text(g, cx + s.dir * 410, y + 2, '', {size: 44, font: F.display, weight: 800, color: s.color, anchor: s.dir < 0 ? 'start' : 'end', spacing: '0'}),
      mark: line(g, `M${cx + s.dir * 300} ${y - 28}l${s.dir * -11} 13l${s.dir * 11} 13`, C.amber, 4)}));
    return {g, parts, at: .9 + i * .35};
  });
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(spine, span(t, .2, .7));
    heads.forEach((h, i) => h.attr('opacity', flicker(t, .25 + i * .15))); unders.forEach((u, i) => draw(u, span(t, .35 + i * .15, .4)));
    const pop = spring(span(t, .45, .6)); badge.attr('opacity', span(t, .45, .1)).attr('transform', `translate(${cx} 286) scale(${pop}) translate(${-cx} -286)`); spin.attr('transform', `rotate(${t * 40} ${cx} 286)`);
    for (const r of rows) {
      r.g.attr('opacity', flicker(t, r.at));
      for (const p of r.parts) {
        const q = easeOut(span(t, r.at + .1, 1)), lit = p.v * q / props.max * cells, done = span(t, r.at + 1.1, .25), glint = Math.floor(((t - r.at) * 9) % (cells + 14));
        p.segs.forEach((s, k) => s.attr('opacity', k < Math.floor(lit) ? (p.won || !done ? 1 : .55) : k < lit ? .5 : .08).attr('fill', p.won && done && k === glint && k < lit ? C.white : p.s.color));
        p.num.text(Math.round(p.v * q)).attr('opacity', p.won || !done ? 1 : 1 - done * .4); p.mark.attr('opacity', p.won ? flicker(t, r.at + 1.1) : 0);
      }
    }
  }};
}
