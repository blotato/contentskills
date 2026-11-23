import {toonStage, C, hex, rand} from './_toon.js';

// Flying down a corridor of comic panels: inked frames in the theme's primaries rush past with
// speed streaks between them. A moving backdrop; one loop moves exactly one frame spacing.
export const meta = {duration: 3, loop: true};
export const defaults = {colors: ['red', 'yellow', 'blue', 'white']};

export function mount(el, props = defaults) {
  const {T, scene, camera, render} = toonStage(el, {background: C.ink, dots: C.purple, from: [.5, .5], reach: .55, rays: 40, ray: '#2a2140', hole: .05, frame: 'over', fov: 60, z: 6});
  const N = 8, gap = 5, colors = props.colors.map(c => C[c] ?? c);
  const ring = (w, h, th) => { const s = new T.Shape(); s.moveTo(-w, -h); s.lineTo(w, -h); s.lineTo(w, h); s.lineTo(-w, h); s.closePath(); const o = new T.Path(); o.moveTo(-w + th, -h + th); o.lineTo(-w + th, h - th); o.lineTo(w - th, h - th); o.lineTo(w - th, -h + th); o.closePath(); s.holes.push(o); return new T.ShapeGeometry(s); };
  // A frame is an ink band with a colour band inside it and a paper gutter between.
  const frames = Array.from({length: N}, (_, i) => {
    const g = new T.Group(); [[3.3, 5.3, .5, C.ink, 0], [3.16, 5.16, .2, C.gutter, .01], [2.9, 4.9, .34, colors[i % colors.length], .02], [2.6, 4.6, .09, C.ink, .03]].forEach(([w, h, th, c, z]) => { const m = new T.Mesh(ring(w, h, th), new T.MeshBasicMaterial({color: hex(c)})); m.position.z = z; g.add(m); });
    g.rotation.z = (rand(i % colors.length, 2) - .5) * .5; scene.add(g); return g;
  });
  // Streaks are thin wedges lying along the direction of travel.
  const streaks = Array.from({length: 46}, (_, i) => {
    const len = 2 + rand(i, 4) * 4, geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute([0, 0, 0, -.035, 0, len, .035, 0, len], 3));
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({color: hex(i % 5 ? C.white : C.yellow), side: T.DoubleSide})), a = rand(i, 6) * Math.PI * 2, r = 1 + rand(i, 8) * 1.6;
    m.position.set(Math.cos(a) * r * .8, Math.sin(a) * r * 1.5, 0); m.userData = {phase: rand(i, 9), a}; m.rotation.z = a + Math.PI / 2; scene.add(m); return m;
  });
  const depth = N * gap;
  return {seek(t) {
    const p = t / meta.duration;
    frames.forEach((f, i) => { const z = -depth + ((i + p * colors.length) % N) * gap; f.position.z = z + 4; f.visible = z + 4 < 5.2; });
    // N is a multiple of the colour count, so after one loop every frame sits where a same-coloured one sat.
    streaks.forEach(m => { const u = (m.userData.phase + p * 2) % 1; m.position.z = -34 + u * 36; m.visible = m.position.z < 3; });
    camera.position.set(0, 0, 6); camera.lookAt(0, 0, -20);
    render();
  }};
}
