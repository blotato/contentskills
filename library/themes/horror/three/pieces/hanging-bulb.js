import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A bare bulb swinging on its wire in an empty room. Its pool of light slides across the floor
// and the back wall, catching a chair and some boxes, and it flickers as it goes.
export const meta = {duration: 8, live: true, loop: true};
export const defaults = {light: '#ffe2b0', swing: .5};

export function mount(el, props = defaults) {
  const s = scene(el, {background: '#020203', fov: 44, z: 9, fog: ['#020203', .03], flicker: 0}), {T} = s, grey = c => new T.MeshLambertMaterial({color: c});
  const floor = new T.Mesh(new T.PlaneGeometry(30, 30, 40, 40), grey(0x4a4e50)); floor.rotation.x = -Math.PI / 2; floor.position.y = -3; const wall = new T.Mesh(new T.PlaneGeometry(30, 16, 40, 20), grey(0x3c4347)); wall.position.set(0, 3, -5); s.scene.add(floor, wall);
  const box = (w, h, d, x, y, z, ry = 0, c = 0x555a5c) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), grey(c)); m.position.set(x, y, z); m.rotation.y = ry; s.scene.add(m); return m; };
  box(1.5, 1.1, 1.2, -2.9, -2.45, -2.6, .3); box(1, .8, 1, -2.6, -1.5, -2.7, -.2); box(1.9, 1.5, 1.3, 3.1, -2.25, -3, -.25);
  box(.9, .1, .9, .5, -1.9, -1.4, .4, 0x6a6258); box(.9, 1.1, .1, .33, -1.35, -1.8, .4, 0x6a6258); [[-.4, -.4], [.4, -.4], [-.4, .4], [.4, .4]].forEach(([x, z]) => box(.09, 1.1, .09, .5 + x * Math.cos(.4) + z * Math.sin(.4), -2.45, -1.4 - x * Math.sin(.4) + z * Math.cos(.4), .4, 0x4a443c));
  const pivot = new T.Group(); pivot.position.set(0, 4.6, -1.5); s.scene.add(pivot); const len = 3.3, wire = new T.Mesh(new T.CylinderGeometry(.012, .012, len, 6), new T.MeshBasicMaterial({color: 0x15171a})); wire.position.y = -len / 2;
  const bulb = new T.Mesh(new T.SphereGeometry(.13, 16, 12), new T.MeshBasicMaterial({color: 0xfff4dc})), halo = s.glow(props.light, 3.4, .9), light = new T.PointLight(hex(props.light), 0, 22, 1.5); bulb.position.y = halo.position.y = light.position.y = -len - .1; pivot.add(wire, bulb, halo, light);
  s.scene.add(new T.AmbientLight(0x8090a8, .04));
  return {seek(t) {
    const q = (t / meta.duration) % 1, a = Math.sin(q * Math.PI * 4) * props.swing, v = lamp(t, 6, .9, 1.3) * (hash(step(t, 12), 4) < .04 ? .3 : 1);
    pivot.rotation.z = a; pivot.rotation.x = Math.cos(q * Math.PI * 2) * props.swing * .25; light.intensity = v * 34; halo.material.opacity = v * .9; bulb.material.color.setScalar(.25 + v * .75);
    s.camera.position.set(Math.sin(q * Math.PI * 2) * .2, .3, 9); s.camera.lookAt(0, .2, -2); s.finish(t);
  }};
}
