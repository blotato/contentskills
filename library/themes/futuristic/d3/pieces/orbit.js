import {C, F, series, line, ring, text, draw, span, flicker, spring} from '../../hud.js';
import {card} from './_card.js';

// A core with bodies circling it on ringed orbits, each trailing an arc and tethered to the
// centre. Loops seamlessly: every body completes a whole number of laps per loop.
export const meta = {duration: 8, loop: true};
export const defaults = {title: 'One idea, many orbits', unit: 'Content ecosystem', core: 'Idea', clear: false,
  bodies: [{label: 'Shorts', orbit: 1, laps: 3, phase: .1}, {label: 'Newsletter', orbit: 2, laps: 2, phase: .55}, {label: 'Podcast', orbit: 3, laps: 1, phase: .85}, {label: 'Course', orbit: 3, laps: 1, phase: .35}]};

export function mount(el, props = defaults) {
  const {root, frame} = card(el, props), cx = 500, cy = 580, radii = [0, 130, 215, 300], T = meta.duration, W = Math.PI * 2;
  const orbits = [1, 2, 3].map(k => ({k, base: ring(root, cx, cy, radii[k], C.grid, 2), dash: ring(root, cx, cy, radii[k], C.teal, 2, k === 2 ? '3 14' : '46 22')}));
  let marks = ''; for (let i = 0; i < 72; i++) { const a = i / 72 * W, r0 = 318, r1 = i % 6 ? 326 : 340; marks += `M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a) * r1} ${cy + Math.sin(a) * r1}`; }
  const dial = line(root, marks, C.dim, 2), waves = [0, 1].map(() => ring(root, cx, cy, 10, C.cyan, 2));
  const bodies = props.bodies.map((b, i) => { const color = series[i % series.length], r = radii[b.orbit] ?? 300, len = W * r;
    const tether = line(root, '', color, 1.5).attr('opacity', .45), trail = ring(root, cx, cy, r, color, 5, `${len * .16} ${len}`), g = root.append('g');
    ring(g, 0, 0, 20, color, 2); g.append('rect').attr('x', -10).attr('y', -10).attr('width', 20).attr('height', 20).attr('fill', color).attr('transform', 'rotate(45)');
    text(g, 0, 52, b.label.toUpperCase(), {size: 26, font: F.text, weight: 700, color: C.white, anchor: 'middle', spacing: '.06em'}).attr('paint-order', 'stroke').attr('stroke', C.bg).attr('stroke-width', 8);
    return {b, r, tether, trail, g, at: .5 + i * .22}; });
  const hub = root.append('g'), hex = Array.from({length: 6}, (_, i) => `${i ? 'L' : 'M'}${Math.cos(i / 6 * W + W / 12) * 64} ${Math.sin(i / 6 * W + W / 12) * 64}`).join('') + 'Z';
  hub.append('path').attr('d', hex).attr('fill', C.panel); line(hub, hex, C.cyan, 4);
  const coreName = String(props.core).toUpperCase(); text(hub, 0, 11, coreName, {size: Math.min(30, 92 / (coreName.length * .8)), font: F.display, weight: 800, color: C.white, anchor: 'middle', spacing: '0'});
  return {seek(t) {
    draw(frame, span(t, 0, .5)); dial.attr('opacity', flicker(t, .2)).attr('transform', `rotate(${t / T * 45} ${cx} ${cy})`);
    for (const o of orbits) { o.base.attr('opacity', span(t, .15 * o.k, .3)); o.dash.attr('opacity', span(t, .15 * o.k, .3)).attr('transform', `rotate(${(o.k % 2 ? 1 : -1) * t / T * 360} ${cx} ${cy})`); }
    hub.attr('transform', `translate(${cx} ${cy}) scale(${spring(span(t, .05, .6))})`);
    waves.forEach((w, k) => { const u = (t / T * 4 + k / 2) % 1; w.attr('r', 64 + u * 240).attr('opacity', (1 - u) * .5); });
    for (const p of bodies) {
      const a = W * (p.b.phase + p.b.laps * t / T) - W / 4, x = cx + Math.cos(a) * p.r, y = cy + Math.sin(a) * p.r, on = flicker(t, p.at);
      p.g.attr('transform', `translate(${x} ${y})`).attr('opacity', on); p.tether.attr('d', `M${cx + Math.cos(a) * 66} ${cy + Math.sin(a) * 66}L${x - Math.cos(a) * 22} ${y - Math.sin(a) * 22}`).attr('opacity', on * .45);
      p.trail.attr('transform', `rotate(${a * 180 / Math.PI - 57.6 - 5} ${cx} ${cy})`).attr('opacity', on * .8);
    }
  }};
}
