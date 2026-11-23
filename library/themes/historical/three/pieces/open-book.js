import {filmStage, paintPaper, C} from './_film.js';

// A ledger lying open on the table, its pages turning one after another, a crimson ribbon across
// the gutter. The camera pushes in over it. props.pages is how many leaves turn.
export const meta = {duration: 6, live: true};
export const defaults = {pages: 3};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, art, table, play} = filmStage(el, {fov: 30, near: 9, far: 28});
  table(50);
  const page = seed => art((ctx, w, h) => paintPaper(ctx, w, h, {lines: 16, heading: seed % 2 === 0, seed, fill: C.bone, margin: .1}), [384, 512]);
  mesh(new T.BoxGeometry(7.4, .16, 5), mat('#2a1c1f')).position.y = .08;
  [-1, 1].forEach(s => { mesh(new T.BoxGeometry(3.5, .3, 4.7), mat(C.paper)).position.set(s * 1.78, .3, 0); const top = mesh(new T.PlaneGeometry(3.5, 4.7), mat('#ffffff', {map: page(s + 3)})); top.rotation.x = -Math.PI / 2; top.position.set(s * 1.78, .46, 0); });
  const ribbon = mesh(new T.BoxGeometry(.26, .02, 6.2), mat(C.crimson)); ribbon.position.set(.24, .48, .7); ribbon.rotation.y = .05;
  const leaves = Array.from({length: props.pages}, (_, i) => {
    const hinge = new T.Group(); hinge.position.set(0, .47 + i * .004, 0); scene.add(hinge);
    const geo = new T.PlaneGeometry(3.5, 4.7, 12, 1); geo.translate(1.75, 0, 0); geo.rotateX(-Math.PI / 2);
    const front = mesh(geo, mat('#ffffff', {map: page(i + 10)}), hinge), back = mesh(geo, mat('#ffffff', {map: page(i + 20), side: T.BackSide, flip: true}), hinge);
    return {hinge, geo, base: geo.attributes.position.array.slice()};
  });
  return play(t => {
    const u = t / meta.duration;
    leaves.forEach(({hinge, geo, base}, i) => {
      const q = Math.min(1, Math.max(0, (t - .7 - i * 1.35) / 1.5)), e = q * q * (3 - 2 * q), pos = geo.attributes.position, bend = Math.sin(e * Math.PI) * .5;
      hinge.rotation.z = e * Math.PI; hinge.visible = true;
      for (let k = 0; k < pos.count; k++) { const x = base[k * 3]; pos.setY(k, base[k * 3 + 1] + Math.sin(x / 3.5 * Math.PI) * bend); } pos.needsUpdate = true;
    });
    camera.position.set(.5 - u * .4, 8.6 - u * 1.6, 6.4 - u * 1.2); camera.lookAt(0, 0, .1);
  });
}
