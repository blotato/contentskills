import {toonStage, C, rand, sparkShape, cutout} from './_toon.js';

// A toy rocket blasting up the panel: toon-shaded body with halftone shadow and ink outline,
// a flickering flame, puffs of smoke left behind and speed streaks rushing down past it.
// For launches, growth, "taking off". Loops.
export const meta = {duration: 3, loop: true};
export const defaults = {background: 'purple'};

export function mount(el, props = defaults) {
  const bg = C[props.background] ?? C.purple, {T, scene, render, toon, flat, ink} = toonStage(el, {background: bg, dots: bg === C.purple ? '#4c2892' : C.ink, from: [0, 0], rays: 0});
  const rig = new T.Group(); scene.add(rig); rig.rotation.z = -.32;
  const profile = [[.41, 1.08], [.52, .5], [.54, -.3], [.46, -.9], [.36, -1.05], [0, -1.05]].map(([x, y]) => new T.Vector2(x, y));
  const body = new T.Mesh(new T.LatheGeometry(profile.slice().reverse(), 40), toon(C.white, C.sky, {side: T.DoubleSide})); ink(body, .06); rig.add(body);
  const nose = new T.Mesh(new T.ConeGeometry(.44, .85, 40), toon(C.red, '#a8121b')); nose.position.y = 1.5; ink(nose, .06); rig.add(nose);
  const band = new T.Mesh(new T.CylinderGeometry(.5, .55, .22, 40, 1, true), toon(C.red, '#a8121b')); band.position.y = -.42; rig.add(band);
  const port = new T.Mesh(new T.CircleGeometry(.2, 32), flat(C.sky)), rim = new T.Mesh(new T.CircleGeometry(.27, 32), flat(C.ink)); port.position.set(0, .45, .545); rim.position.set(0, .45, .535); rig.add(rim, port);
  const finShape = new T.Shape(); finShape.moveTo(0, .1); finShape.lineTo(.62, -.75); finShape.lineTo(.62, -1.1); finShape.lineTo(0, -.72); finShape.closePath();
  [0, 1, 2].forEach(i => { const fin = cutout(finShape, C.red, {grow: 1, depth: .1, side: '#a8121b'}), hold = new T.Group(); fin.position.set(.44, -.2, 0); hold.add(fin); hold.rotation.y = i * Math.PI * 2 / 3 + .5; rig.add(hold); });
  const flames = [[.42, 1.25, C.orange], [.27, .85, C.yellow], [.13, .5, C.white]].map(([r, h, c], i) => { const f = new T.Mesh(new T.ConeGeometry(r, h, 9), flat(c)); f.rotation.x = Math.PI; f.position.set(0, -1.05 - h / 2, i * .001); if (!i) ink(f, .05); rig.add(f); return f; });
  const puffs = Array.from({length: 9}, (_, i) => { const m = new T.Mesh(new T.SphereGeometry(.36 + rand(i, 2) * .2, 20, 14), toon(C.white, C.sky)); ink(m, .05); scene.add(m); return m; });
  const streaks = Array.from({length: 16}, (_, i) => { const s = new T.Mesh(new T.PlaneGeometry(.035 + rand(i, 3) * .05, .9 + rand(i, 5) * 1.6), flat(i % 4 ? C.white : C.yellow)); s.rotation.z = -.32; scene.add(s); return s; });
  const sparks = [0, 1, 2].map(i => { const s = cutout(sparkShape(.2), C.yellow, {grow: 1.3}); s.position.set([-1.25, 1.3, -1.1][i], [1.9, .6, -.4][i], -1); scene.add(s); return s; });
  const dir = [Math.sin(.32), Math.cos(.32)];       // the way the rocket points
  return {seek(t) {
    const p = t / meta.duration, a = p * Math.PI * 2;
    rig.position.set(.25 + Math.sin(a) * .08, .45 + Math.sin(a * 2) * .1, 0); rig.rotation.y = .35 + Math.sin(a) * .3;
    flames.forEach((f, i) => { const k = Math.floor(p * 24 + i) % 3; f.scale.set(1 + k * .06, .82 + k * .16, 1 + k * .06); });
    // Smoke leaves the nozzle, drifts back along the flight path and swells; it restarts where it began.
    puffs.forEach((m, i) => { const u = (p + i / puffs.length) % 1, d = 1.5 + u * 4.2; m.position.set(.25 - dir[0] * d + Math.sin(i * 2.4) * .3 * u, .45 - dir[1] * d + Math.cos(i * 1.7) * .25 * u, -.6 - (i % 3) * .2); m.scale.setScalar(Math.max(.001, Math.min(1, u * 5) * (.45 + u * 1.1) * Math.min(1, (1 - u) * 6))); });
    streaks.forEach((s, i) => { const u = (rand(i, 7) + p * (1 + i % 2)) % 1, x = (rand(i, 9) - .5) * 4.2; s.position.set(x - dir[0] * (u - .5) * 9, 4.5 - u * 9, -2); });
    sparks.forEach((s, i) => { s.scale.setScalar(.8 + .4 * Math.sin(a * 2 + i * 2.1)); s.rotation.z = Math.sin(a + i) * .5; });
    render();
  }};
}
