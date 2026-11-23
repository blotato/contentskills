import {studio} from './_studio.js';

// A sheet of pale cloth hanging in the dark, rolling slowly as if in a draught (loop): a calm
// ground for one white word or a see-through diagram.
export const meta = {duration: 10, loop: true};
export const defaults = {field: 'noir', color: 'bone', tilt: -.05, amount: 1};

export function mount(el, props = defaults) {
  const {T, scene, render, view, mat, ink} = studio(el, {field: props.field, z: 12, fov: 30, width: 7.4, fog: false}), TAU = Math.PI * 2;
  const geo = new T.PlaneGeometry(4.8, 6.6, 80, 110), cloth = new T.Mesh(geo, mat('#FFFFFF', {side: T.DoubleSide}));
  cloth.material.color.set(({bone: '#F3F6FB', white: '#FFFFFF', ink: '#141B2B', poppy: '#3D7BFF'})[props.color] ?? props.color);
  cloth.rotation.set(-.06, .32, props.tilt); cloth.position.set(0, 0, 0); cloth.scale.setScalar(.9); scene.add(cloth);
  const base = Float32Array.from(geo.attributes.position.array), k = props.amount;
  return {seek(t) {
    const ph = t / meta.duration * TAU, p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], hang = (3.3 - y) / 6.6;                       // pinned along the top, free at the hem
      const fold = Math.sin(x * 2.6 + Math.sin(ph) * .8 + y * .15) * (.1 + .24 * hang), wave = Math.sin(y * 1.1 - ph * 2 + x * .6) * .13 * hang, swell = Math.sin(x * .8 + ph) * .3 * hang;
      p.setXYZ(i, x + Math.sin(ph + y * .2) * .12 * hang * k, y, (fold + wave + swell) * k);
    }
    p.needsUpdate = true; geo.computeVertexNormals(); view(Math.sin(ph) * .03, 0, 1); render();
  }};
}
