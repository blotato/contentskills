import {C} from '../../kit.js';
import {softStage, rand, hex} from './_soft.js';

// Soft petals and discs drifting down through the frame, tumbling as they go (loop): gentle
// ambient depth behind a headline. `count` up to 200.
export const meta = {duration: 10, loop: true};
export const defaults = {count: 130};

export function mount(el, props = defaults) {
  const {T, scene, render} = softStage(el, {z: 12, fov: 36}), n = Math.min(200, props.count), colors = [C.leaf, C.sage, C.blush, C.sun, C.clay, C.sky, C.cream, C.leaf, C.sage];
  const shape = new T.Shape(); shape.moveTo(0, -.5); shape.bezierCurveTo(.42, -.2, .42, .25, 0, .5); shape.bezierCurveTo(-.42, .25, -.42, -.2, 0, -.5);
  const petals = new T.InstancedMesh(new T.ShapeGeometry(shape, 10), new T.MeshLambertMaterial({side: T.DoubleSide}), Math.ceil(n * .7)), discs = new T.InstancedMesh(new T.CircleGeometry(.3, 24), new T.MeshLambertMaterial({side: T.DoubleSide}), n - Math.ceil(n * .7));
  [petals, discs].forEach((m, s) => { for (let i = 0; i < m.count; i++) m.setColorAt(i, new T.Color(hex(colors[Math.floor(rand(i, 7 + s) * colors.length)]))); scene.add(m); });
  const o = new T.Object3D(), TAU = Math.PI * 2, H = 26;
  return {seek(t) {
    const u = t / meta.duration;
    [petals, discs].forEach((m, s) => {
      for (let i = 0; i < m.count; i++) {
        const k = i + s * 500, z = -7 + rand(k, 1) * 13, laps = 1 + Math.floor(rand(k, 2) * 2), y = H / 2 - (((rand(k, 3) + u * laps) % 1) * H), sway = Math.sin(u * TAU * (1 + (k % 2)) + k) * (.5 + rand(k, 4));
        o.position.set((rand(k, 5) - .5) * 20 + sway, y, z); const sc = .6 + rand(k, 6) * 1; o.scale.set(sc, sc, sc);
        o.rotation.set(u * TAU * (1 + (k % 3)) + k, u * TAU * (k % 2 ? 1 : -1) + k * 2, u * TAU + k); o.updateMatrix(); m.setMatrixAt(i, o.matrix);
      }
      m.instanceMatrix.needsUpdate = true;
    });
    render();
  }};
}
