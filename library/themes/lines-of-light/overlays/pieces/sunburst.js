import {C, stage, span, ease, io, hash, rays, ring, flash, faceAt, leave} from '../../kit.js';

// A sunburst radiating from behind the speaker: rays of uneven length fan out across the upper
// half from the head, starting well outside the face so it stays clear, then a faint ring opens at
// their base and a blue flash breathes once. Centre: `x`, `y` (frame px) or the face when tracked.
export const meta = {duration: 5, live: true, wantsFaces: true};
export const defaults = {x: 540, y: 760, r0: 400, r1: 640, rays: 44, from: 180, to: 360};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W, H} = st, n = props.rays ?? 44, tracked = !!(props.locate || props.track);
  // On close framing the face is bigger than the default 400 px base radius: start the rays outside the largest the face
  // gets during the piece (its half-diagonal plus a margin), and keep their length.
  let face = 0; if (tracked) for (let t = 0; t <= (props.life ?? meta.duration) + 1e-6; t += .25) { const f = faceAt(props, t); face = Math.max(face, Math.hypot(f.w * W, f.h * H) / 2); }
  const r0 = Math.max(props.r0 ?? 400, face * 1.08 + 50), r1 = r0 + Math.max(120, (props.r1 ?? 640) - (props.r0 ?? 400));
  const g = root.group(), fan = rays(g, 0, 0, r0, r1, n, props.from ?? 180, props.to ?? 360, {width: 2, fade: .4});
  fan.forEach((f, i) => { const a = ((props.from ?? 180) + ((props.to ?? 360) - (props.from ?? 180)) * f.k) * Math.PI / 180, L = r0 + (r1 - r0) * (.45 + .55 * hash(i, 5)); f.set([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * L, Math.sin(a) * L]]); f.d = Math.abs(f.k - .5) * 2; });
  const base = ring(g, 0, 0, r0 - 16, {from: 270, width: 1.2, echo: false}), blue = flash(g, 0, -r0, {color: 'blue', r: r0});
  return {seek(t) {
    const x = leave(t, props.life, .6), tail = ease(x), f = props.locate || props.track ? faceAt(props, t) : null;
    const cx = f ? (f.x + f.w / 2) * W : props.x ?? 540, cy = f ? (f.y + f.h / 2) * H : props.y ?? 760; g.attr('transform', `translate(${cx} ${cy})`);
    fan.forEach(r => r.range(tail, ease(span(t, .1 + r.d * .8, 1.6)))); base.range(tail, io(span(t, .4, 1.6))).opacity(.45);
    blue.set(t > 1.8 ? .3 * Math.sin(Math.min(1, (t - 1.8) / 1.6) * Math.PI) * (1 - x) : 0);
  }};
}
