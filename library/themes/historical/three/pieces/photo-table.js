import {filmStage, paintPhoto, paintPaper, C, hash} from './_film.js';

// The documentary pan in 3D: photographic prints and a letter lie scattered on a dark table and the
// camera drifts slowly across them, low and close, as if under a rostrum lamp. A crimson thread
// runs between two pins. props.kinds picks the stand-in photographs.
export const meta = {duration: 7, live: true};
export const defaults = {kinds: ['city', 'portrait', 'hills', 'ship', 'portrait', 'city']};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, art, table, play} = filmStage(el, {fov: 30, near: 10, far: 30});
  table(60);
  const spots = [[-3.6, -1.2, .16, 3.4, 2.5], [.4, -1.9, -.1, 2.3, 3], [3.9, -.6, .08, 3.4, 2.4], [-1.6, 1.7, -.2, 3.2, 2.3], [2.4, 2.1, .22, 2.1, 2.8], [6.6, 1.6, -.12, 3.2, 2.3]];
  spots.forEach(([x, z, rot, w, h], i) => {
    const kind = props.kinds[i % props.kinds.length], tx = art((ctx, cw, ch) => { paintPaper(ctx, cw, ch, {seed: i + 2}); const m = cw * .055; ctx.save(); ctx.beginPath(); ctx.rect(m, m, cw - m * 2, ch - m * 2 - m * .8); ctx.clip(); ctx.translate(m, m); paintPhoto(ctx, cw - m * 2, ch - m * 2.8, kind, i + 1); ctx.restore(); }, [Math.round(256 * w), Math.round(256 * h)]);
    mesh(new T.PlaneGeometry(w + .12, h + .12), mat('#000000', {opacity: .5})).rotation.x = -Math.PI / 2; const sh = scene.children.at(-1); sh.position.set(x + .1, .012 + i * .012, z + .14); sh.rotation.z = rot;
    const p = mesh(new T.PlaneGeometry(w, h), mat('#ffffff', {map: tx})); p.rotation.x = -Math.PI / 2; p.rotation.z = rot; p.position.set(x, .02 + i * .012, z);
  });
  const letter = mesh(new T.PlaneGeometry(2.6, 3.5), mat('#ffffff', {map: art((ctx, w, h) => paintPaper(ctx, w, h, {lines: 14, heading: true, seed: 9, fill: C.bone}), [384, 512])})); letter.rotation.x = -Math.PI / 2; letter.rotation.z = .3; letter.position.set(-6.2, .015, .6);
  const pins = [[-3.9, -2.2], [4.3, -1.5]].map(([x, z]) => { const m = mesh(new T.SphereGeometry(.11, 12, 8), mat(C.crimson)); m.position.set(x, .2, z); return m; });
  const thread = mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-3.9, .2, -2.2), new T.Vector3(0, .12, -2.5), new T.Vector3(4.3, .2, -1.5)]), 40, .02, 5), mat(C.crimson, {glow: .5}));
  return play(t => {
    const u = t / meta.duration, x = -3.2 + u * 6;
    camera.position.set(x, 6.2 - u * .9, 6.4 - u * .6); camera.lookAt(x + .5, 0, -.2); camera.rotation.z += .03 - u * .05;
  });
}
