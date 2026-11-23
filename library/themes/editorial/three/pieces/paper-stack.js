import {stage3, pageTexture, shade, matte, sheet, hash, span, glide, smooth} from './_scene.js';

// Sheets of paper sliding into a stack, seen three-quarter from above: each printed page glides in from an alternate
// side, turns a few degrees and settles on the pile; the last one is the cover page in the accent ground. The camera
// pushes in slowly. "The drafts", "everything it wrote", "the pile of work".
// Props: count (sheets, 3-14), field (ground), top (ground of the last sheet), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'paper', count: 9, top: 'wine'};

export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 28}), {T, scene, camera} = s, N = Math.max(3, Math.min(14, props.count ?? 9)), grounds = ['paper', 'stone', 'paper', 'blush', 'paper', 'stone'];
  const pile = new T.Group(); scene.add(pile);
  const under = shade(3.6, 4.6, .26); under.position.y = -.02; pile.add(under);
  const sheets = Array.from({length: N}, (_, i) => {
    const last = i === N - 1, m = sheet(2.1, 2.94, matte(null, pageTexture(i + 1, {field: last ? props.top ?? 'wine' : grounds[i % grounds.length]})), {thick: .03});
    m.rotation.x = -Math.PI / 2; const holder = new T.Group(); holder.add(m); pile.add(holder);
    return {holder, side: i % 2 ? 1 : -1, turn: last ? 0 : (hash(i, 2) - .5) * .34, dx: last ? 0 : (hash(i, 5) - .5) * .16, dz: last ? 0 : (hash(i, 7) - .5) * .16};
  });
  return {seek(t) {
    s.hold(1); const push = smooth(span(t, 0, meta.duration));
    camera.position.set(2.6 - push * .5, 5.4 - push * .5, 6.2 - push * .7); camera.lookAt(0, .1, .1);
    pile.rotation.y = -.25 + push * .16;
    sheets.forEach((p, i) => {
      const q = glide(span(t, .1 + i * .16, .7));
      p.holder.visible = q > 0; p.holder.position.set(p.dx + p.side * (1 - q) * 5.5, .02 + i * .034 + (1 - q) * .5, p.dz + (1 - q) * -.6); p.holder.rotation.y = p.turn + p.side * (1 - q) * .5;
    });
    under.material.opacity = .26 * glide(span(t, .1, .8));
    s.render(t);
  }};
}
