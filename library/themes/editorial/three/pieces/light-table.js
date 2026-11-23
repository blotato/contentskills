import {stage3, printTexture, matte, shade, tone, hash, span, glide, smooth} from './_scene.js';

// Prints on a light table: a loose grid of photographic prints (tints of the footage in paper borders) glides onto
// the table one after another, each a few degrees off square; one is picked out with a wine marker dot, and the
// camera pushes in on it slowly. "The contact sheet", "choosing the shot", "all the takes".
// Props: cols, rows, pick (index of the chosen print, -1 for none), color (marker), field (ground), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'stone', cols: 4, rows: 3, pick: 5, color: 'crimson'};

export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 28}), {T, scene, camera} = s, cols = Math.max(2, Math.min(6, props.cols ?? 4)), rows = Math.max(1, Math.min(5, props.rows ?? 3)), table = new T.Group(); scene.add(table);
  const pw = 1.2, ph = 1.5, gx = 1.48, gz = 1.8, pick = props.pick ?? -1;
  const prints = Array.from({length: cols * rows}, (_, i) => {
    const c = i % cols, r = Math.floor(i / cols), holder = new T.Group(), m = new T.Mesh(new T.PlaneGeometry(pw, ph), matte(null, printTexture(i + 1))); m.rotation.x = -Math.PI / 2; m.position.y = .012 + i * .0015;
    const sh = shade(pw * 1.5, ph * 1.45, .3); holder.add(sh, m);
    holder.position.set((c - (cols - 1) / 2) * gx + (hash(i, 1) - .5) * .12, 0, (r - (rows - 1) / 2) * gz + (hash(i, 2) - .5) * .12); table.add(holder);
    return {holder, x: holder.position.x, z: holder.position.z, turn: (hash(i, 3) - .5) * .22, at: .1 + hash(i, 4) * .5};
  });
  const P = prints[pick], dot = P ? new T.Mesh(new T.CircleGeometry(.13, 24), new T.MeshBasicMaterial({color: tone(props.color ?? 'crimson')})) : null;
  if (dot) { dot.rotation.x = -Math.PI / 2; dot.position.set(P.x + pw * .34, .03, P.z - ph * .36); table.add(dot); }
  return {seek(t) {
    s.hold(1); const push = smooth(span(t, 0, meta.duration)), tx = P ? P.x * .55 : 0, tz = P ? P.z * .55 : 0;
    camera.position.set(tx * push + .3, 12.6 - push * 3.4, 5.4 - push * 1.2 + tz * push); camera.lookAt(tx * push, 0, tz * push + .1);
    table.rotation.y = .06 - push * .05;
    prints.forEach(p => { const q = glide(span(t, p.at, .6)); p.holder.visible = q > 0; p.holder.position.set(p.x, 0, p.z + (1 - q) * 4.5); p.holder.rotation.y = p.turn + (1 - q) * .3; });
    if (dot) { const q = glide(span(t, 1.3, .35)); dot.visible = q > 0; dot.scale.setScalar(Math.max(.001, q)); }
    s.render(t);
  }};
}
