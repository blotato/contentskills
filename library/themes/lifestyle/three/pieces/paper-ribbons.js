import {C} from '../../kit.js';
import {softStage} from './_soft.js';

// Wide paper ribbons rolling slowly across the frame like cloth in a breeze (loop) — a calm
// backdrop for a headline or a see-through diagram.
export const meta = {duration: 8, loop: true};
export const defaults = {colors: ['sage', 'leaf', 'blush', 'sun', 'sky']};

export function mount(el, props = defaults) {
  const {T, scene, render, mat} = softStage(el, {z: 11, fov: 34}), TAU = Math.PI * 2;
  const ribbons = props.colors.map((name, i) => {
    const geo = new T.PlaneGeometry(26, 1.5 + (i % 2) * .5, 110, 6), mesh = new T.Mesh(geo, mat(C[name] ?? name, {side: T.DoubleSide, emissive: new T.Color(C[name] ?? name).multiplyScalar(.3)}));
    mesh.position.set(0, (i - (props.colors.length - 1) / 2) * 2.3, -i * .5); mesh.rotation.z = (i % 2 ? -1 : 1) * .1; scene.add(mesh);
    return {geo, base: Float32Array.from(geo.attributes.position.array), i};
  });
  return {seek(t) {
    const ph = t / meta.duration * TAU;
    ribbons.forEach(({geo, base, i}) => {
      const p = geo.attributes.position, dir = i % 2 ? -1 : 1;
      for (let k = 0; k < p.count; k++) { const x = base[k * 3], y = base[k * 3 + 1], a = x * .42 + i * 1.3 + dir * ph, b = x * .17 - dir * ph * 2 + i;
        p.setXYZ(k, x, y * (1 + .25 * Math.cos(a)) + Math.sin(a) * .5 + Math.sin(b) * .28, Math.cos(a) * .9 + y * Math.sin(a) * .7); }
      p.needsUpdate = true; geo.computeVertexNormals();
    });
    render();
  }};
}
