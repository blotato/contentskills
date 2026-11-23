import {filmStage, C, hash, noise} from './_film.js';

// An old desk globe turning slowly on its stand while a crimson route arcs across it and the camera
// pushes in. The land is made up. props.turns is how far the globe turns (in turns) over the piece.
export const meta = {duration: 6, live: true};
export const defaults = {turns: .08, route: true};

export function mount(el, props = defaults) {
  const {T, scene, camera, mat, mesh, art, table, play} = filmStage(el, {fov: 32});
  table(70, -3.4);
  const map = art((ctx, w, h) => {
    ctx.fillStyle = '#51627a'; ctx.fillRect(0, 0, w, h);
    for (let k = 0; k < 9; k++) {                                         // made-up land: wobbly blobs
      const cx = hash(k * 3.1) * w, cy = h * (.2 + .6 * hash(k * 5.7)), rx = w * (.05 + .09 * hash(k * 7.3)), ry = h * (.08 + .14 * hash(k * 9.1));
      for (const dx of [-w, 0, w]) { ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.2832, r = 1 + (noise(i * .4 + k * 9) - .5) * .9; ctx.lineTo(cx + dx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r); } ctx.fillStyle = k % 3 ? C.paper : C.bone; ctx.fill(); ctx.strokeStyle = '#2a3542'; ctx.lineWidth = 3; ctx.stroke(); }
    }
    ctx.strokeStyle = 'rgba(11,16,23,.45)'; ctx.lineWidth = 2;
    for (let i = 1; i < 12; i++) { ctx.beginPath(); ctx.moveTo(i * w / 12, 0); ctx.lineTo(i * w / 12, h); ctx.stroke(); } for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(0, i * h / 6); ctx.lineTo(w, i * h / 6); ctx.stroke(); }
  }, [1024, 512]);
  const tiltG = new T.Group(); tiltG.rotation.z = .4; scene.add(tiltG);
  const globe = new T.Group(); tiltG.add(globe); mesh(new T.SphereGeometry(2.5, 48, 32), mat('#ffffff', {map}), globe);
  mesh(new T.TorusGeometry(2.72, .07, 10, 64, Math.PI), mat(C.silver), tiltG).rotation.z = -Math.PI / 2;
  mesh(new T.CylinderGeometry(.07, .07, 5.9, 10), mat(C.silver), tiltG);
  mesh(new T.CylinderGeometry(.16, .5, .9, 20), mat(C.slate)).position.y = -2.95; mesh(new T.CylinderGeometry(1.5, 1.7, .22, 32), mat(C.slate)).position.y = -3.3;
  // the route: a great-circle arc lifted off the surface, drawn progressively
  const p = (lon, lat, r = 2.56) => new T.Vector3(Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, -Math.cos(lat) * Math.sin(lon) * r), a = p(-.5, .1), b = p(.75, .62), N = 60;
  const pts = Array.from({length: N + 1}, (_, i) => a.clone().lerp(b, i / N).normalize().multiplyScalar(2.56 + Math.sin(i / N * Math.PI) * .32));
  const tube = mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 120, .035, 6), mat(C.crimson, {glow: .7}), globe), per = tube.geometry.index.count / 120;
  const ends = [a, b].map(v => { const m = mesh(new T.SphereGeometry(.09, 12, 8), mat(C.crimson, {glow: .7}), globe); m.position.copy(v); return m; });
  return play(t => {
    const u = t / meta.duration, q = Math.min(1, Math.max(0, (t - .8) / 3.2)), e = 1 - Math.pow(1 - q, 3);
    globe.rotation.y = -1.9 + u * props.turns * 6.2832; tube.visible = ends[0].visible = props.route; tube.geometry.setDrawRange(0, Math.floor(120 * e) * per); ends[1].visible = props.route && q >= 1;
    camera.position.set(.6 - u * .5, 1.4 + u * .2, 14.5 - u * 1.6); camera.lookAt(0, -.45, 0);
  });
}
