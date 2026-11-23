import {scene, hex, C, clamp, span, mix, easeInOut, easeOut, hash, noise, lamp, step} from './_scene.js';

// A long dark corridor with doors along both walls and one failing light at the far end. The
// camera creeps toward it; the light dips and cuts out, and each time it returns it feels closer.
export const meta = {duration: 10, live: true};
export const defaults = {light: '#b9c8ee', wall: '#3a4248', doors: 6};

export function mount(el, props = defaults) {
  const s = scene(el, {background: '#020304', fov: 62, z: 6, fog: ['#020304', .03], flicker: 0}), {T} = s, L = 44, wall = new T.MeshLambertMaterial({color: hex(props.wall), side: T.DoubleSide}), dark = new T.MeshLambertMaterial({color: 0x15191c});
  const plane = (w, h, mat, x, y, z, rx, ry) => { const m = new T.Mesh(new T.PlaneGeometry(w, h, 1, 12), mat); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); s.scene.add(m); return m; };
  plane(L, 4, wall, -1.6, 0, -L / 2 + 6, 0, Math.PI / 2); plane(L, 4, wall, 1.6, 0, -L / 2 + 6, 0, -Math.PI / 2); plane(3.2, L, dark, 0, -2, -L / 2 + 6, -Math.PI / 2, 0); plane(3.2, L, dark, 0, 2, -L / 2 + 6, Math.PI / 2, 0); plane(3.2, 4, wall, 0, 0, -L + 6, 0, 0);
  for (let i = 0; i < props.doors; i++) for (const side of [-1, 1]) { const z = 2 - i * 6 - (side > 0 ? 3 : 0), d = new T.Mesh(new T.BoxGeometry(.08, 3, 1.3), new T.MeshLambertMaterial({color: 0x0c0f11})); d.position.set(side * 1.56, -.5, z); s.scene.add(d);
    const f = new T.Mesh(new T.BoxGeometry(.12, 3.2, 1.5), new T.MeshLambertMaterial({color: 0x23292e})); f.position.set(side * 1.59, -.4, z); s.scene.add(f); }
  const lights = [-8, -22, -36].map((z, i) => { const p = new T.PointLight(hex(props.light), 0, 26, 1.6); p.position.set(0, 1.7, z); const g = s.glow(props.light, 3.2, 1); g.position.set(0, 1.8, z); const b = new T.Mesh(new T.SphereGeometry(.09, 12, 8), new T.MeshBasicMaterial({color: 0xffffff, fog: false})); b.position.set(0, 1.85, z); s.scene.add(p, g, b); return {p, g, b, i}; });
  s.scene.add(new T.AmbientLight(0x8090a0, .3));
  return {seek(t) {
    s.camera.position.set(Math.sin(t * .7) * .05, -.25 + Math.sin(t * 1.9) * .015, 6 - Math.min(t, 14) * .55); s.camera.rotation.z = Math.sin(t * .4) * .006;
    lights.forEach(({p, g, b, i}) => { const v = i === 0 ? lamp(t, 5, .85, 1.2) : i === 1 ? (hash(step(t, 6), 3) < .16 ? 1 : .05) : lamp(t, 9, .8, .7) * .7; p.intensity = v * 70; g.material.opacity = v; b.visible = v > .3; });
    s.finish(t);
  }};
}
