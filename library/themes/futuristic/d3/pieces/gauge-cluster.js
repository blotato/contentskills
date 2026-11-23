import {C, F, series, line, ring, text, draw, span, flicker, easeBack, noise} from '../../hud.js';
import {card} from './_card.js';

// A cluster of dial gauges: one large, the rest smaller beneath. Segments light around each
// dial, the needle overshoots and settles, then keeps trembling slightly like a live instrument.
export const meta = {duration: 4.5, live: true};
export const defaults = {title: 'Channel health', unit: 'Illustrative · score out of 100', max: 100, clear: false,
  gauges: [{label: 'Retention', value: 72}, {label: 'Click rate', value: 48}, {label: 'Consistency', value: 90}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), G = props.gauges, rest = G.length - 1, A0 = -135, sweep = 270, segs = 30, rad = a => (a - 90) * Math.PI / 180;
  const gauges = G.map((d, i) => {
    const big = i === 0, R = big ? 180 : Math.min(118, 330 / Math.max(1, rest)), cx = big ? 500 : 500 + (i - (rest + 1) / 2) * (760 / Math.max(1, rest)), cy = big ? 445 : 800, color = series[i % series.length], g = root.append('g');
    const cells = Array.from({length: segs}, (_, k) => { const a0 = rad(A0 + k * sweep / segs + 1.2), a1 = rad(A0 + (k + 1) * sweep / segs - 1.2);
      return line(g, `M${cx + Math.cos(a0) * R} ${cy + Math.sin(a0) * R}A${R} ${R} 0 0 1 ${cx + Math.cos(a1) * R} ${cy + Math.sin(a1) * R}`, k >= segs * .85 ? C.amber : color, big ? 22 : 15).attr('stroke-linecap', 'butt'); });
    let marks = ''; for (let k = 0; k <= 30; k++) { const a = rad(A0 + k * sweep / 30), r0 = R - (big ? 26 : 18), r1 = r0 - (k % 5 ? 8 : 18); marks += `M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`; }
    const dial = line(g, marks, C.dim, 2), outer = ring(g, cx, cy, R + (big ? 26 : 18), C.teal, 2, '60 16');
    const needle = line(g, `M0 ${R * .14}V${-(R - (big ? 50 : 36))}`, C.white, big ? 5 : 4); g.append('circle').attr('cx', cx).attr('cy', cy).attr('r', big ? 13 : 9).attr('fill', C.bg).attr('stroke', C.white).attr('stroke-width', 3);
    const name = String(d.label).toUpperCase();
    text(g, cx, cy + R * .92 + (big ? 4 : 10), name, {size: big ? 30 : Math.min(24, 190 / (name.length * .62)), color: C.white, anchor: 'middle', spacing: '.16em'});
    return {d, i, g, cells, dial, outer, needle, cx, cy, at: .3 + i * .35, num: text(g, cx, cy + R * .58, '', {size: big ? 84 : 52, font: F.display, weight: 900, color, anchor: 'middle', spacing: '0'})};
  });
  return {seek(t) {
    draw(frame, span(t, 0, .5));
    for (const p of gauges) {
      const frac = p.d.value / props.max, q = easeBack(span(t, p.at + .2, 1.4)), wobble = t > p.at + 1.7 ? (noise(t * 3, p.i) - .5) * .022 : 0, v = Math.max(0, frac * q + wobble), lit = v * segs;
      p.g.attr('opacity', flicker(t, p.at)); draw(p.dial, span(t, p.at, .6)); p.outer.attr('transform', `rotate(${(p.i % 2 ? -1 : 1) * t * 14} ${p.cx} ${p.cy})`);
      p.cells.forEach((c, k) => c.attr('opacity', k < Math.floor(lit) ? 1 : k < lit ? .5 : .1));
      p.needle.attr('transform', `translate(${p.cx} ${p.cy}) rotate(${A0 + v * sweep})`); p.num.text(Math.round(p.d.value * Math.min(1, q)));
    }
  }};
}
