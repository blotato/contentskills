import {toonStage, C, hex} from './_toon.js';

// A halftone screen seen at an angle: a floor of printed dots swelling and shrinking as a wave
// rolls through it toward the camera. A quiet moving backdrop; loops.
export const meta = {duration: 4, loop: true};
export const defaults = {background: 'paper', color: 'red', second: 'blue'};

export function mount(el, props = defaults) {
  const bg = C[props.background] ?? C.paper, {T, scene, camera, render} = toonStage(el, {background: bg, dots: null, frame: 'over', fov: 40, z: 10});
  const nx = 26, nz = 34, gap = .62, make = (color, y) => { const m = new T.InstancedMesh(new T.CircleGeometry(.5, 20), new T.MeshBasicMaterial({color: hex(C[color] ?? color), side: T.DoubleSide}), nx * nz); m.position.y = y; scene.add(m); return m; };
  const under = make(props.second, -1.52), dots = make(props.color, -1.5), dummy = new T.Object3D();
  camera.position.set(0, 3.4, 9); camera.lookAt(0, -2.2, -2);
  return {seek(t) {
    const a = t / meta.duration * Math.PI * 2;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const x = (i - nx / 2 + (j % 2) * .5) * gap, z = 6 - j * gap * .87, w = .5 + .5 * Math.sin(a - z * .55 + Math.sin(x * .5) * 1.2), s = .08 + w * .34;
      dummy.position.set(x, 0, z); dummy.rotation.x = -Math.PI / 2; dummy.scale.setScalar(s * gap * 1.9); dummy.updateMatrix(); dots.setMatrixAt(i * nz + j, dummy.matrix);
      dummy.position.set(x + .09, 0, z + .09); dummy.scale.setScalar((.06 + (1 - w) * .26) * gap * 1.9); dummy.updateMatrix(); under.setMatrixAt(i * nz + j, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = under.instanceMatrix.needsUpdate = true;
    render();
  }};
}
