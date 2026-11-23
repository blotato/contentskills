import {threeStage, hex} from '/library/_shared/kit.js';
import {C} from '../../hud.js';

// An endless floor grid rushing toward the horizon under a second grid ceiling. A moving backdrop.
export const meta = {duration: 4, loop: true};

export function mount(el) {
  const {T, scene, camera, render} = threeStage(el, {fov: 60, background: C.bg});
  scene.fog = new T.Fog(hex(C.bg), 6, 44); camera.position.set(0, 1.6, 6); camera.lookAt(0, 1.2, -20);
  const make = (y, color) => {
    const points = [];
    // The grid stops just in front of the camera: lines that pass behind it get dropped by some renderers.
    for (let x = -60; x <= 60; x += 2) points.push(x, 0, -60, x, 0, 2);
    for (let z = -60; z <= 2; z += 2) points.push(-60, 0, z, 60, 0, z);
    const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(points, 3));
    const g = new T.LineSegments(geometry, new T.LineBasicMaterial({color: hex(color), transparent: true, opacity: .8})); g.position.y = y; scene.add(g); return g;
  };
  const floor = make(0, C.cyan), ceiling = make(5.2, C.magenta); ceiling.material.opacity = .35;
  const horizon = new T.Mesh(new T.PlaneGeometry(120, .06), new T.MeshBasicMaterial({color: hex(C.white), fog: false})); horizon.position.set(0, 1.25, -44); scene.add(horizon);
  // One loop moves exactly four grid cells, so the last frame flows into the first.
  return {seek(t) { const z = (t / meta.duration * 8) % 2; floor.position.z = z; ceiling.position.z = z; render(); }};
}
