import {C, stage, group, up, span, ease, io, light, rays, ring, flash, title, mono, fit, capH, arcPts, cornerLabels, origin, dot} from '../../kit.js';

// A countdown. Each second a number lands inside a dial whose ring draws itself round as the second
// runs out, while a red dot travels the rim (the clock is the cause). On GO the dial bursts into a
// sunburst with a blue flash and the word lands.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'GO', label: 'STARTING IN', note: 'GET READY', labels: ['', 'STAND BY', '', 'TAKE 01'], field: 'teal'};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .48]}), {root, W, H, k} = st, steps = (props.from ?? 3) + 1, step = meta.duration / steps, cy = H * .48, R = Math.min(W * .34, H * .2);
  const track = ring(root, W / 2, cy, R + 20, {from: -90, width: 1, echo: false, halo: false}); track.opacity(.35);
  const label = title(root, up(props.label), W / 2, cy - R - 80 - 20 * k, 26 + 6 * k, {land: false, color: C.dim, track: .5});
  const beats = Array.from({length: steps}, (_, i) => {
    const last = i === steps - 1, value = last ? up(props.go) : String((props.from ?? 3) - i), g = group(root), size = Math.min(fit(value, R * (last ? 1.5 : 1.3), 260, {track: .1}), R * .9);
    return {g, last, num: title(g, value, W / 2, cy + capH(size) / 2, size, {track: .1}),
      arc: last ? null : light(g, arcPts(W / 2, cy, R, -90, 270, 120), {width: 3}), head: last ? null : dot(g, 0, 0, {color: 'red', r: 9}),
      burst: last ? rays(g, W / 2, cy, R * 1.12, R * 1.7, 32, 0, 360, {width: 1.8, fade: .3}) : null, blue: last ? flash(g, W / 2, cy, {color: 'blue', r: R * 2}) : null,
      note: last && props.note ? title(g, up(props.note), W / 2, Math.min(H - 110, cy + R * 1.7 + 80), 24 + 6 * k, {land: false, color: C.dim, track: .46}) : null};
  });
  const corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); track.draw(ease(span(t, 0, .6))); const at = Math.min(steps - 1, Math.floor(t / step));
    label.show(ease(span(t, 0, .6)) * (at === steps - 1 ? 1 - ease(span(t, at * step, .3)) : 1), .9);
    beats.forEach((b, i) => {
      const u = t - i * step; b.g.attr('opacity', i === at ? 1 : 0);
      b.num.show(ease(span(u, 0, b.last ? .7 : .45)));
      if (b.arc) { const q = span(u, 0, step); b.arc.draw(q); const p = arcPts(W / 2, cy, R, -90 + 360 * q, -90 + 360 * q, 1)[0]; b.head.at(p[0], p[1]).set(q > 0 && q < 1 ? 1 : 0); }
      if (b.burst) { b.burst.forEach((r, j) => r.draw(ease(span(u, .05 + (j % 4) * .04, .8)))); b.blue.set(u > 0 ? .7 * (1 - ease(u / 1)) : 0); b.note?.show(ease(span(u, .3, .6)), .9); }
    });
    corners(t, .3);
  }};
}
