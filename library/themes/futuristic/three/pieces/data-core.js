import {threeStage, hex, span, easeOut} from '/library/_shared/kit.js';
import {C} from '../../hud.js';

// Nested wireframe solids turning against each other around a bright core — "the engine", "the model", "the system".
export const meta = {duration: 6};

export function mount(el) {
  const {T, scene, render} = threeStage(el, {z: 9, background: C.bg});
  const shell = (geometry, color, opacity) => { const m = new T.LineSegments(new T.EdgesGeometry(geometry), new T.LineBasicMaterial({color: hex(color), transparent: true, opacity})); scene.add(m); return m; };
  const a = shell(new T.IcosahedronGeometry(2.7, 1), C.cyan, .85), b = shell(new T.OctahedronGeometry(1.8, 0), C.magenta, .9), c = shell(new T.IcosahedronGeometry(3.4, 0), C.teal, .35);
  const core = new T.Mesh(new T.OctahedronGeometry(.55, 0), new T.MeshBasicMaterial({color: hex(C.amber)})); scene.add(core);
  return {seek(t) {
    [a, b, c].forEach((m, i) => m.scale.setScalar(Math.max(.001, easeOut(span(t, i * .3, 1)))));
    a.rotation.set(t * .3, t * .5, 0); b.rotation.set(-t * .7, t * .4, t * .2); c.rotation.set(t * .12, -t * .2, 0);
    core.rotation.y = t * 2; core.scale.setScalar(1 + .18 * Math.sin(t * 5)); render();
  }};
}
