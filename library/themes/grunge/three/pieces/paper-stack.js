import {xeroxStage, font, C, hash, jit} from './_fx.js';

// A collage table seen from above: torn sheets, a red scrap, halftone offcuts and tape, stacked in
// depth. The camera drifts in a slow circle so the layers slide over each other; every sheet
// twitches on its own like a stop-motion frame. Loops. props.label is typed on the top scrap.
export const meta = {duration: 6, loop: true};
export const defaults = {label: 'WORK IN PROGRESS'};

export function mount(el, props = defaults) {
  const {T, scene, camera, light, paper, flat, mesh, tex, grime, grainTex, tornGeo, play} = xeroxStage(el, {dots: .7, grain: .2});
  const tones = ['#5a5750', C.bone, '#24221f', C.paper, C.red, '#8e887d', C.bone, '#3a3835', C.paper, C.bone, C.red, '#5a5750'];
  const sheets = tones.map((tone, i) => {
    const w = 3.2 + hash(i, 1) * 4.2, h = 2.6 + hash(i, 2) * 4.4, g = new T.Group(), map = grainTex(tone, i + 1, {dots: i % 3 === 1});
    mesh(tornGeo(w, h, i + 3, .16), flat('#050505'), g).position.set(.14, -.16, -.03);                    // its shadow
    if (tone !== C.red) mesh(tornGeo(w + .12, h + .12, i + 40, .2), flat(C.white), g).position.z = -.01;   // the white torn edge
    mesh(tornGeo(w, h, i + 3, .16), paper(tone, {map, amb: .55, cut: 0}), g);
    const z = -5 + i * .52, a = hash(i, 5) * 6.283, r = 1.2 + hash(i, 6) * 3.4;
    g.position.set(Math.cos(a) * r * .9, Math.sin(a) * r * 1.5, z); g.userData = {rot: (hash(i, 7) - .5) * 1.1, x: g.position.x, y: g.position.y, i}; scene.add(g); return g;
  });
  const tapes = [0, 1, 2, 3].map(i => { const m = mesh(new T.PlaneGeometry(1.5, .42), flat(C.tape)), host = sheets[[1, 3, 6, 9][i]]; host.add(m); m.position.set((hash(i, 8) - .5) * 2, 1.2 + hash(i, 9), .02); m.rotation.z = (hash(i, 10) - .5) * 1.4; return m; });
  const label = String(props.label).toUpperCase(), top = new T.Group();
  const lt = tex((ctx, w, h) => { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); grime(ctx, w, h, 9); ctx.fillStyle = '#141311'; ctx.textAlign = 'center'; let size = 120; ctx.font = font(size, 'type'); size = Math.min(size, size * w * .86 / ctx.measureText(label).width); ctx.font = font(size, 'type'); ctx.fillText(label, w / 2, h / 2 + size * .32); }, 1024, 256);
  mesh(tornGeo(5.2, 1.3, 77, .1), flat('#050505'), top).position.set(.12, -.14, -.03); mesh(tornGeo(5.2, 1.3, 77, .1), paper(C.bone, {map: lt, amb: .7, cut: 0}), top);
  top.position.set(.2, -.4, 1.6); scene.add(top);
  light.set(.3, .45, .85);
  return play((th, t, s) => {
    const u = th / meta.duration * Math.PI * 2, step = Math.floor(th * 12);
    camera.position.set(Math.sin(u) * 1.5, Math.cos(u) * 1.1, 15 * Math.max(1, .7 / camera.aspect)); camera.lookAt(Math.sin(u) * .5, Math.cos(u) * .4, -2);
    sheets.forEach(g => { const {rot, x, y, i} = g.userData, j = jit(Math.floor(step / 3) + i * 5, i, .05, .012); g.position.x = x + j.x; g.position.y = y + j.y; g.rotation.z = rot + j.r; });
    const j = jit(Math.floor(step / 2), 99, .04, .02); top.rotation.z = -.07 + j.r; top.position.x = .2 + j.x;
  });
}
