import {lightStage, circle, ease, io, span} from './_light.js';

// A wire globe of light turning slowly: latitude rings open, meridians come up round it, then a red
// point fires arcs that rise off the surface and land on other points, each landing in a blue flash.
// The far side fades into the haze. Not a map: no countries. "Worldwide", "global reach", "it spread".
export const meta = {duration: 8, loop: true};
export const defaults = {clear: false};
const R = 2.6;
const onSphere = (lat, lon, r = R) => [Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, Math.cos(lat) * Math.sin(lon) * r];

export function mount(el, props = defaults) {
  const s = lightStage(el, props, {fov: 38, near: 9, far: 13.5}), {T, scene, camera} = s;
  camera.position.set(0, .6, 10.5); camera.lookAt(0, 0, 0);
  const g = new T.Group(); g.rotation.z = .25; scene.add(g);
  const lats = [-60, -40, -20, 0, 20, 40, 60].map(d => { const a = d * Math.PI / 180; return s.line(circle(Math.cos(a) * R, 96, 'y', [0, Math.sin(a) * R, 0]), {opacity: d ? .6 : .9}); });
  const mer = s.line(Array.from({length: 12}, (_, i) => Array.from({length: 49}, (_, k) => onSphere(-Math.PI / 2 + k / 48 * Math.PI, i / 12 * Math.PI * 2))), {opacity: .45, echo: false});
  [...lats, mer].forEach(l => g.add(l.obj));
  const D = Math.PI / 180, from = [20 * D, -30 * D], to = [[45 * D, 40 * D], [-10 * D, 60 * D], [-35 * D, -70 * D], [55 * D, -95 * D]];
  const arcs = to.map(([la, lo], i) => {
    const a = new T.Vector3(...onSphere(...from)).normalize(), b = new T.Vector3(...onSphere(la, lo)).normalize(), ang = a.angleTo(b);
    const pts = Array.from({length: 49}, (_, k) => { const f = k / 48, v = a.clone().multiplyScalar(Math.sin((1 - f) * ang)).add(b.clone().multiplyScalar(Math.sin(f * ang))).divideScalar(Math.sin(ang)); return v.multiplyScalar(R * (1 + .32 * ang * Math.sin(f * Math.PI))); });
    const l = s.line(pts, {color: 'red', echo: false, near: 5, far: 20}); g.add(l.obj); return {l, end: pts.at(-1), at: 2.6 + i * .7};
  });
  const fx = s.points(1 + arcs.length, {size: .3}); g.add(fx.obj);
  return {seek(t) {
    s.hold(.85);
    lats.forEach((l, i) => l.draw(io(span(t, Math.abs(i - 3) * .18, 1.6)))); mer.draw(ease(span(t, .8, 1.8)));
    g.rotation.y = -.6 + t * Math.PI * 2 / 24;
    fx.set(0, onSphere(...from), t > 2.2 ? 1 : 0, .45, 'red');
    arcs.forEach(({l, end, at}, i) => { l.draw(io(span(t, at, 1.1))); const u = t - at - 1.1; fx.set(1 + i, end, u > 0 ? .5 + .9 * Math.exp(-u * 2) : 0, u > 0 ? .5 + 1.2 * Math.exp(-u * 2) : .3, 'blue'); });
    s.render(t);
  }};
}
