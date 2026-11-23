import {C, glide, span} from '../../kit.js';
import {softStage} from './_soft.js';

// A small tabletop still life: an arch, a flight of steps, a ball, a column and a disc settle
// into place one after another while the camera drifts around them — "the essentials", a product
// stage, a calm establishing shot.
export const meta = {duration: 8, live: true};
export const defaults = {};

export function mount(el) {
  const {T, scene, render, view, mat, shadow} = softStage(el, {z: 12, width: 8.4, y: 3.2, look: [0, 1.5, 0]});
  const parts = [], add = (mesh, x, y, z, sr) => { mesh.position.set(x, y, z); const sh = shadow(sr, .55); sh.position.set(x + .25, .01, z + .1); scene.add(mesh, sh); parts.push({mesh, sh, y}); return mesh; };
  const archShape = new T.Shape(); archShape.moveTo(-1.5, 0); archShape.lineTo(-1.5, 2.4); archShape.absarc(0, 2.4, 1.5, Math.PI, 0, true); archShape.lineTo(1.5, 0); archShape.lineTo(.8, 0); archShape.lineTo(.8, 2.4); archShape.absarc(0, 2.4, .8, 0, Math.PI, false); archShape.lineTo(-.8, 0); archShape.lineTo(-1.5, 0);
  const archGeo = new T.ExtrudeGeometry(archShape, {depth: .9, bevelEnabled: false, curveSegments: 40}); archGeo.translate(0, 0, -.45);
  add(new T.Mesh(archGeo, mat(C.sage)), -.9, 0, -.9, 2.2);
  const steps = new T.Group(); [0, 1, 2].forEach(i => { const m = new T.Mesh(new T.BoxGeometry(1.5, .5 * (i + 1), .62), mat(C.cream)); m.position.set(0, .25 * (i + 1), -i * .62); steps.add(m); }); add(steps, 2.2, 0, .5, 1.5);
  add(new T.Mesh(new T.SphereGeometry(.72, 48, 32), mat(C.clay)), -.6, .72, 1.3, 1.1);
  add(new T.Mesh(new T.CylinderGeometry(.42, .42, 2.6, 48), mat(C.sun)), -3, 1.3, .4, .85);
  const disc = add(new T.Mesh(new T.CylinderGeometry(1.25, 1.25, .22, 64), mat(C.leaf)), 1.7, 3.1, -1.5, .1); disc.rotation.x = Math.PI / 2;
  add(new T.Mesh(new T.SphereGeometry(.34, 32, 24), mat(C.teal)), 2.2, 1.84, -.74, .01);
  const ground = new T.Mesh(new T.CircleGeometry(5.6, 64), new T.MeshBasicMaterial({color: 0xDDE9CB})); ground.rotation.x = -Math.PI / 2; ground.position.y = -.01; ground.renderOrder = -2; scene.add(ground);
  return {seek(t) {
    parts.forEach(({mesh, sh, y}, i) => { const e = glide(span(t, .15 + i * .28, 1.3)); mesh.position.y = y + (1 - e) * 1.6; mesh.scale.setScalar(Math.max(.001, .6 + .4 * e)); mesh.visible = sh.visible = t > .15 + i * .28; sh.material.opacity = .55 * e; });
    ground.scale.setScalar(Math.max(.001, glide(span(t, 0, 1.2))));
    view(-.32 + .5 * (1 - Math.exp(-t / 5)) + Math.sin(t * .2) * .04, 0, 1.06 - .06 * glide(span(t, 0, 7))); render();
  }};
}
