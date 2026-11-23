import {C, SAFE, stage, span, ease, io, light, rays, flash, arcPts, title, up, band, leave, faceAt} from '../../kit.js';

// A horizon and a setting sun drawn in light: the horizon line opens from the centre, the sun's arc
// rises from both horizon points and meets at the top, strands of light cross it, rays fan out round
// it and dashed reflections draw under the line. `y`: the horizon (frame px). Left out (the default),
// it is placed clear of the speaker's face when the face is tracked: low under the chin if the whole
// sun fits above the app's bottom edge, otherwise above the head (the sun made smaller if it must be).
export const meta = {duration: 5, live: true, wantsFaces: true};
export const defaults = {y: null, r: 150, label: ''};

/** Where the horizon goes and how big the sun is: {hy, R}. Uses the face over the piece's whole life. */
function place(props, H) {
  let R = props.r ?? 150;
  if (props.y != null) return {hy: props.y, R};
  if (!props.locate && !props.track) return {hy: 1520, R};
  const life = props.life ?? meta.duration; let top = H, bottom = 0;
  for (let t = 0; t <= life + 1e-6; t += .25) { const f = faceAt(props, t); top = Math.min(top, f.y * H); bottom = Math.max(bottom, (f.y + f.h) * H); }
  const lab = props.label ? 70 : 0, below = bottom + R * 1.75 + lab + 50;               // rays reach 1.75 R above the line
  if (below + 110 <= SAFE.bottom + 60) return {hy: below, R};
  const hy = top - 150;                                                                    // reflections hang 110 px under it
  R = Math.max(70, Math.min(R, (hy - SAFE.top - lab) / 1.75));
  return {hy, R};
}

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, W, H} = st, {hy, R} = place(props, H), cx = W / 2;
  const shade = band(root, hy - R * 1.3, hy + 110, 0);
  const line = [light(root, [[cx, hy], [40, hy]], {width: 2.6}), light(root, [[cx, hy], [W - 40, hy]], {width: 2.6})];
  const sun = [light(root, arcPts(cx, hy, R, 180, 270), {width: 2.8}), light(root, arcPts(cx, hy, R, 360, 270), {width: 2.8})];
  const strands = [14, 30, 48, 68, 90, 114].map(d => d * R / 150).map(dy => { const hw = Math.sqrt(Math.max(0, R * R - dy * dy)); return [light(root, [[cx, hy - dy], [cx - hw, hy - dy]], {width: 1.6}), light(root, [[cx, hy - dy], [cx + hw, hy - dy]], {width: 1.6})]; });
  const fan = rays(root, cx, hy, R * 1.14, R * 1.75, 15, 186, 354, {width: 1.6});
  const refl = [1, 2, 3, 4].map(k => { const y = hy + 10 + k * k * 6, hw = R * (1 - k * .16); return [light(root, [[cx, y], [cx - hw, y]], {width: 1.2, dash: '22 14', echo: false}), light(root, [[cx, y], [cx + hw, y]], {width: 1.2, dash: '22 14', echo: false})]; });
  const blue = flash(root, cx, hy - R * .5, {color: 'blue', r: R * 2.2}), label = props.label ? title(root, up(props.label), cx, hy - R * 1.9 - 30, 28, {track: .45, halo: 5}) : null;
  return {seek(t) {
    const x = leave(t, props.life, .6), tail = ease(x); shade.attr('opacity', .8 * ease(span(t, 0, .5)) * (1 - x));
    line.forEach(l => l.range(tail, io(span(t, 0, 1.2)))); sun.forEach(l => l.range(tail, io(span(t, .7, 1.2))));
    strands.forEach((p, i) => p.forEach(l => l.range(tail, ease(span(t, 1.3 + i * .07, .6))).opacity(.75)));
    fan.forEach(r => r.range(tail, ease(span(t, 1.8 + (1 - r.mid) * .4, .9))));
    refl.forEach((p, i) => p.forEach(l => l.range(tail, ease(span(t, 1.2 + i * .08, .7))).opacity(.5 - i * .08)));
    blue.set(t > 2.4 ? .4 * (1 - ease((t - 2.4) / 1.2)) * (1 - x) : 0); label?.show(ease(span(t, 2.2, 1)), 1 - x);
  }};
}
