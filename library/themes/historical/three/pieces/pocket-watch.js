import {filmStage, paintPaper, C} from './_film.js';

// A pocket watch lying on a letter, its hands sweeping forward through the hours while the camera
// sinks toward it: time passing. props.hours is how many hours go by; props.from the starting hour.
export const meta = {duration: 6, live: true};
export const defaults = {hours: 5, from: 10};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, art, table, play} = filmStage(el, {fov: 30, near: 9, far: 28});
  table(50);
  const letter = mesh(new T.PlaneGeometry(6.4, 8.4), mat('#ffffff', {map: art((ctx, w, h) => paintPaper(ctx, w, h, {lines: 18, heading: true, seed: 4}), [512, 672])})); letter.rotation.x = -Math.PI / 2; letter.rotation.z = -.22; letter.position.set(.8, .01, .3);
  const watch = new T.Group(); watch.position.set(-.2, .02, 0); watch.rotation.y = .25; scene.add(watch);
  mesh(new T.CylinderGeometry(2.1, 2.2, .36, 56), mat(C.silver), watch).position.y = .18; mesh(new T.TorusGeometry(2.05, .1, 10, 56), mat(C.bone), watch).rotation.x = Math.PI / 2; watch.children.at(-1).position.y = .38;
  const face = mesh(new T.CircleGeometry(1.95, 56), mat('#ffffff', {map: art((ctx, w, h) => { ctx.fillStyle = C.bone; ctx.fillRect(0, 0, w, h); ctx.translate(w / 2, h / 2);
    for (let i = 0; i < 60; i++) { ctx.save(); ctx.rotate(i / 60 * 6.2832); ctx.fillStyle = i === 0 ? C.crimson : '#15181d'; const big = i % 5 === 0; ctx.fillRect(big ? -5 : -1.5, -w * .46, big ? 10 : 3, big ? w * .09 : w * .04); ctx.restore(); }
    ctx.strokeStyle = '#15181d'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, w * .33, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, w * .17, w * .09, 0, 7); ctx.stroke(); }, [512, 512])}), watch); face.rotation.x = -Math.PI / 2; face.position.y = .37;
  const hand = (len, wid, color, y) => { const g = new T.Group(); g.position.y = y; watch.add(g); mesh(new T.BoxGeometry(wid, .03, len), mat(color), g).position.z = -len / 2 + .2; return g; };
  const hour = hand(1.15, .13, '#15181d', .4), minute = hand(1.7, .09, '#15181d', .43), second = hand(.34, .04, C.crimson, .4); second.position.z = .66;
  mesh(new T.CylinderGeometry(.09, .09, .12, 12), mat(C.crimson), watch).position.y = .44;
  mesh(new T.CylinderGeometry(.2, .2, .5, 14), mat(C.silver), watch).rotation.x = Math.PI / 2; watch.children.at(-1).position.set(0, .2, -2.4);
  const bow = mesh(new T.TorusGeometry(.36, .07, 8, 24), mat(C.silver), watch); bow.rotation.x = Math.PI / 2; bow.position.set(0, .2, -2.95);
  for (let i = 0; i < 16; i++) { const l = mesh(new T.TorusGeometry(.17, .045, 6, 14), mat(C.silver), watch); l.position.set(Math.sin(i * .5) * .5 + i * .12, .08, -3.4 - i * .27); l.rotation.x = i % 2 ? Math.PI / 2 : .4; l.rotation.z = i * .7; }
  return play(t => {
    const u = t / meta.duration, q = Math.min(1, Math.max(0, (t - .4) / (meta.duration - 1.2))), e = q * q * (3 - 2 * q), h = props.from + props.hours * e;
    hour.rotation.y = -h / 12 * 6.2832; minute.rotation.y = -h * 6.2832; second.rotation.y = -Math.floor(t * 2) / 2 / 60 * 6.2832 * 12;
    camera.position.set(1.4 - u * .7, 9.4 - u * 2, 5.2 - u * 1.1); camera.lookAt(0, 0, -.2); camera.rotation.z += -.05 + u * .04;
  });
}
