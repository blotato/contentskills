import {C, F, series, line, text, draw, span, easeOut, flicker, pad} from '../../hud.js';
import {card} from './_card.js';

// A two-channel oscilloscope: the traces draw on, then scroll continuously while a cursor
// reads the level off the first channel. Loops seamlessly. The wave shapes are generated, not measured.
export const meta = {duration: 4, loop: true};
export const defaults = {title: 'Signal check', unit: 'Illustrative · waveform', clear: false,
  channels: [{label: 'Voice', cycles: 3, amp: .78}, {label: 'Music', cycles: 7, amp: .34}]};

export function mount(el, props = defaults) {
  const d3 = window.d3, {root, frame, defs, id} = card(el, props), x0 = 84, x1 = 916, y0 = 236, y1 = 760, mid = (y0 + y1) / 2, half = (y1 - y0) / 2, T = meta.duration, N = 180;
  let grid = ''; for (let i = 0; i <= 12; i++) grid += `M${x0 + i * (x1 - x0) / 12} ${y0}V${y1}`; for (let i = 0; i <= 8; i++) grid += `M${x0} ${y0 + i * (y1 - y0) / 8}H${x1}`;
  line(root, grid, C.grid, 1.5); let axis = `M${x0} ${mid}H${x1}`; for (let i = 0; i <= 60; i++) axis += `M${x0 + i * (x1 - x0) / 60} ${mid - (i % 5 ? 5 : 11)}v${i % 5 ? 10 : 22}`;
  line(root, axis, C.dim, 1.5); const bezel = line(root, `M${x0} ${y0}H${x1}V${y1}H${x0}Z`, C.teal, 2);
  const clip = defs.append('clipPath').attr('id', id + '-scope').append('rect').attr('x', x0).attr('y', y0).attr('height', y1 - y0);
  // Every time term uses a whole number of cycles per loop, so the last frame meets the first.
  const level = (c, k, u, t) => { const w = Math.PI * 2, drift = t / T;
    return c.amp * Math.sin(w * (c.cycles * u - (2 + k) * drift)) * (.72 + .28 * Math.sin(w * (1.5 * u + (k + 1) * drift + k * .3))) + c.amp * .16 * Math.sin(w * (c.cycles * 3.1 * u + 3 * drift)); };
  const chans = props.channels.map((c, k) => {
    const color = series[k % series.length], path = line(root, '', color, k ? 3 : 4.5).attr('clip-path', `url(#${id}-scope)`).attr('stroke-linejoin', 'round');
    const gx = x0 + k * 420, g = root.append('g');
    g.append('rect').attr('x', gx).attr('y', 800).attr('width', 22).attr('height', 22).attr('fill', color);
    text(g, gx + 36, 820, `CH${k + 1} · ${c.label.toUpperCase()}`, {size: 26, color: C.white});
    text(g, gx, 860, `${c.cycles} CYCLES / DIV`, {size: 20, color: C.dim});
    return {c, k, path, g, read: text(g, gx, 908, '', {size: 34, font: F.display, weight: 800, color, spacing: '0'})};
  });
  const cursor = line(root, `M0 ${y0}V${y1}`, C.amber, 2), probe = root.append('rect').attr('width', 14).attr('height', 14).attr('fill', C.amber);
  const trig = line(root, 'M0 0l-16 -9v18z', C.amber, 2).attr('fill', C.amber);
  return {seek(t) {
    draw(frame, span(t, 0, .5)); draw(bezel, span(t, 0, .6));
    clip.attr('width', (x1 - x0) * easeOut(span(t, .15, .8)));
    const u = .5 - .5 * Math.cos(t / T * Math.PI * 2), cx = x0 + 40 + u * (x1 - x0 - 80);
    for (const ch of chans) {
      let d = ''; for (let i = 0; i <= N; i++) d += `${i ? 'L' : 'M'}${(x0 + i / N * (x1 - x0)).toFixed(1)} ${(mid - level(ch.c, ch.k, i / N, t) * half).toFixed(1)}`;
      ch.path.attr('d', d); ch.g.attr('opacity', flicker(t, .5 + ch.k * .2));
      const v = level(ch.c, ch.k, (cx - x0) / (x1 - x0), t); ch.read.text(`${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(2)}`);
      if (!ch.k) probe.attr('x', cx - 7).attr('y', mid - v * half - 7);
    }
    cursor.attr('transform', `translate(${cx} 0)`).attr('opacity', span(t, .8, .2) * .8); probe.attr('opacity', span(t, .8, .2));
    trig.attr('transform', `translate(${x1 + 20} ${mid - level(props.channels[0], 0, 1, t) * half})`).attr('opacity', span(t, .8, .2));
  }};
}
