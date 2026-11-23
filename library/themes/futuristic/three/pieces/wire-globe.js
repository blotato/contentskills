import {threeStage, hex, span, easeOut} from '/library/_shared/kit.js';
import {C} from '../../hud.js';

// A rotating wireframe globe with glowing nodes and an orbit ring — "worldwide", "the network", "everywhere".
export const meta = {duration: 6};
const rand = s => { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); };

export function mount(el) {
  const {T, scene, camera, render} = threeStage(el, {z: 9, background: C.bg});
  const globe = new T.Group(); scene.add(globe);
  globe.add(new T.LineSegments(new T.WireframeGeometry(new T.SphereGeometry(2.6, 24, 16)), new T.LineBasicMaterial({color: hex(C.teal), transparent: true, opacity: .55})));
  const positions = []; for (let i = 0; i < 60; i++) { const u = rand(i + 1) * Math.PI * 2, v = Math.acos(2 * rand(i + 99) - 1); positions.push(2.63 * Math.sin(v) * Math.cos(u), 2.63 * Math.cos(v), 2.63 * Math.sin(v) * Math.sin(u)); }
  const dots = new T.BufferGeometry(); dots.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  const points = new T.Points(dots, new T.PointsMaterial({color: hex(C.amber), size: .13})); globe.add(points);
  const orbit = new T.Mesh(new T.TorusGeometry(3.5, .012, 8, 160), new T.MeshBasicMaterial({color: hex(C.cyan)})); scene.add(orbit);
  const outer = new T.Mesh(new T.TorusGeometry(3.9, .008, 8, 160), new T.MeshBasicMaterial({color: hex(C.magenta)})); scene.add(outer);
  return {seek(t) {
    const q = easeOut(span(t, 0, 1.2)); globe.scale.setScalar(Math.max(.001, q)); globe.rotation.set(.35, t * .45, 0);
    points.geometry.setDrawRange(0, Math.floor(60 * span(t, .6, 2)));
    orbit.rotation.set(1.25, t * .3, 0); outer.rotation.set(1.9, -t * .22, .4); orbit.scale.setScalar(Math.max(.001, easeOut(span(t, .4, 1)))); outer.scale.setScalar(Math.max(.001, easeOut(span(t, .7, 1))));
    render();
  }};
}
