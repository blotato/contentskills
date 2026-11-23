import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A door at the end of a dark room, opening very slowly on a lit space beyond. A wedge of cold
// light spreads across the floor toward the camera as the gap widens; then the light fails.
export const meta = {duration: 8, live: true};
export const defaults = {light: '#c7d3f0', open: 38};

export function mount(el, props = defaults) {
  const s = scene(el, {background: '#020304', fov: 40, z: 10, fog: ['#020304', .02], flicker: 0}), {T} = s, lam = c => new T.MeshLambertMaterial({color: c}), W = 1.7, Hh = 4.1, y0 = -3;
  const wallPart = (w, h, x, y) => { const m = new T.Mesh(new T.PlaneGeometry(w, h, 8, 8), lam(0x2c3338)); m.position.set(x, y, 0); s.scene.add(m); };
  wallPart(12, 12, -6 - W / 2, 1); wallPart(12, 12, 6 + W / 2, 1); wallPart(W, 8, 0, y0 + Hh + 4);
  const floor = new T.Mesh(new T.PlaneGeometry(24, 24, 30, 30), lam(0x3a3f43)); floor.rotation.x = -Math.PI / 2; floor.position.set(0, y0, 6); s.scene.add(floor);
  const beyond = new T.Mesh(new T.PlaneGeometry(W, Hh), new T.MeshBasicMaterial({color: hex(props.light), fog: false})); beyond.position.set(0, y0 + Hh / 2, -.3); s.scene.add(beyond);
  [[-W / 2 - .09, y0 + Hh / 2, .18, Hh + .2], [W / 2 + .09, y0 + Hh / 2, .18, Hh + .2], [0, y0 + Hh + .09, W + .36, .18]].forEach(([x, y, w, h]) => { const f = new T.Mesh(new T.BoxGeometry(w, h, .16), lam(0x4a5258)); f.position.set(x, y, .05); s.scene.add(f); });
  const hinge = new T.Group(); hinge.position.set(-W / 2, y0, 0); s.scene.add(hinge); const door = new T.Mesh(new T.BoxGeometry(W, Hh, .09), lam(0x3c3a36)); door.position.set(W / 2, Hh / 2, 0); hinge.add(door);
  [[.5, .68], [.5, .28]].forEach(([u, vv]) => { const p = new T.Mesh(new T.BoxGeometry(W * .66, Hh * .3, .02), lam(0x2d2b28)); p.position.set(W * u, Hh * vv, .05); hinge.add(p); }); const knob = new T.Mesh(new T.SphereGeometry(.07, 12, 8), lam(0x8a8f96)); knob.position.set(W - .16, Hh * .47, .1); hinge.add(knob);
  const wedgeGeo = new T.BufferGeometry(); wedgeGeo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(9), 3)); wedgeGeo.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 1, 1, 0, 1], 2));
  const wedge = new T.Mesh(wedgeGeo, new T.MeshBasicMaterial({color: hex(props.light), transparent: true, opacity: .3, blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide})); s.scene.add(wedge);
  const spill = new T.PointLight(hex(props.light), 0, 14, 1.4); spill.position.set(.4, y0 + 2, .9); s.scene.add(spill, new T.AmbientLight(0x8090a8, .035)); const halo = s.glow(props.light, 7, .4); halo.position.set(W / 2, y0 + Hh / 2, .2); s.scene.add(halo);
  return {seek(t) {
    const open = easeInOut(span(t, .6, 5.2)) * props.open * Math.PI / 180 + .012, v = t > 6.3 ? (hash(step(t, 14), 3) < .5 && t < 6.9 ? .7 : .04) : lamp(t, 7, .5, .8); hinge.rotation.y = -open;
    const gap = W * (1 - Math.cos(open)), x1 = W / 2 - gap, p = wedgeGeo.attributes.position.array, far = 13; p.set([x1, y0 + .01, .05, W / 2 + far * .45, y0 + .01, far, x1 - far * Math.tan(open) * .9 - gap, y0 + .01, far]); wedgeGeo.attributes.position.needsUpdate = true;
    wedge.material.opacity = .32 * v * clamp(open * 4); beyond.material.color.set(hex(props.light)).multiplyScalar(v); spill.intensity = v * 16 * clamp(open * 3); halo.material.opacity = .4 * v * clamp(open * 3); halo.position.x = W / 2 - gap / 2;
    s.camera.position.set(.5, -.6, 10 - Math.min(t, 10) * .22); s.camera.lookAt(.2, -.9, 0); s.finish(t);
  }};
}
