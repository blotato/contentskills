import {stage3, coverTexture, matte, sheet, shade, span, glide, smooth} from './_scene.js';

// Covers on a slow ring: eight magazine covers (a Didone numeral, a rule, a tint of the footage, two cover lines)
// stand in a circle facing outwards and turn past the camera; they rise into place one after another.
// "Every issue", "the back catalogue", "pick one".
// Props: count (4-10), fields (grounds of the covers in order), marks (masthead text per cover; "No.01"... by
// default), speed (turns of the ring per second), field (ground), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'paper', count: 8, speed: .035, fields: ['stone', 'wine', 'blush', 'ink', 'stone', 'blush', 'wine', 'ink'], marks: null};

export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 26}), {T, scene, camera} = s, N = Math.max(4, Math.min(10, props.count ?? 8)), R = 2.7, ring = new T.Group(); scene.add(ring);
  const fields = props.fields?.length ? props.fields : defaults.fields, floor = shade(9.5, 9.5, .16); floor.position.y = -1.52; scene.add(floor);
  const covers = Array.from({length: N}, (_, i) => {
    const a = i / N * Math.PI * 2, f = fields[i % fields.length], m = sheet(1.72, 2.4, matte(null, coverTexture(i + 1, {field: f, mark: props.marks?.[i] ?? null})), {back: matte(f), thick: .05});
    m.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); m.rotation.y = a; ring.add(m); return {m, a};
  });
  return {seek(t) {
    s.hold(1); const push = smooth(span(t, 0, meta.duration));
    camera.position.set(0, 4.2 - push * .5, 15.4 - push * 1.4); camera.lookAt(0, -.1, 0);
    ring.rotation.y = -.4 - t * (props.speed ?? .035) * Math.PI * 2 - glide(span(t, 0, 1.2)) * .5;
    covers.forEach((c, i) => { const q = glide(span(t, i * .05, .6)); c.m.position.y = -(1 - q) * 4.2; c.m.visible = q > 0; });
    floor.material.opacity = .16 * glide(span(t, .2, .8));
    s.render(t);
  }};
}
