import {C, series, glide, span, hash} from '../../kit.js';
import {softStage, rand} from './_soft.js';

// Smooth pastel pebbles floating over the paper, each bobbing and turning at its own pace above a
// soft contact shadow — calm, wellbeing, "a few good things". `count` 3-9.
export const meta = {duration: 8, live: true};
export const defaults = {count: 7};

export function mount(el, props = defaults) {
  const {T, scene, render, view, mat, shadow} = softStage(el, {z: 9.5, width: 9, y: 7, look: [0, .6, 0]});
  const colors = [C.leaf, C.sage, C.sun, C.clay, C.blush, C.teal, C.sky, C.cream, series[0]], n = Math.max(3, Math.min(9, props.count));
  const pebbles = Array.from({length: n}, (_, i) => {
    const r = .55 + rand(i, 1) * .6, geo = new T.SphereGeometry(r, 40, 28), p = geo.attributes.position;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k), d = 1 + .12 * Math.sin(x * 2.1 + i) * Math.cos(z * 1.7 + i * 2) + .08 * Math.sin(y * 3 + i * 3); p.setXYZ(k, x * d * 1.12, y * d * .78, z * d); }
    geo.computeVertexNormals();
    const a = i / n * Math.PI * 2 + rand(i, 2) * .5, R = i ? 1.9 + rand(i, 3) * 1.5 : 0, mesh = new T.Mesh(geo, mat(colors[i % colors.length])), sh = shadow(r * 1.5);
    const home = [Math.cos(a) * R * 1.15, 1.1 + rand(i, 4) * .5, Math.sin(a) * R * .95]; sh.position.set(home[0], 0, home[2]); scene.add(mesh, sh);
    return {mesh, sh, home, r, i};
  });
  return {seek(t) {
    pebbles.forEach(({mesh, sh, home, i}) => {
      const e = glide(span(t, .1 + i * .12, 1.4)), bob = Math.sin(t * .8 + i * 1.7) * .16;
      mesh.position.set(home[0], home[1] * e + bob - (1 - e) * .4, home[2]); mesh.scale.setScalar(Math.max(.001, e));
      mesh.rotation.set(t * .12 + i, t * .2 * (i % 2 ? 1 : -1) + i * 2, Math.sin(t * .3 + i) * .2);
      sh.material.opacity = .5 * e * (1 - bob); sh.scale.setScalar(.8 + .25 * e - bob * .4);
    });
    view(Math.sin(t * .18) * .22, Math.sin(t * .15) * .2, 1.04 - .04 * glide(span(t, 0, 6))); render();
  }};
}
