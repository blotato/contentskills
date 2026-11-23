import {xeroxStage, font, C, hash, jit} from './_fx.js';

// A balled-up sheet of paper opens out in held steps until the words printed on it can be read,
// then lies there under a raking light, still creased. props.text is the big word, props.note the small print.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'FIRST DRAFT', kicker: 'NOTE TO SELF', note: 'CRUMPLED · RESCUED · ILLUSTRATIVE'};

export function mount(el, props = defaults) {
  const {T, scene, camera, light, paper, mesh, tex, grime, play} = xeroxStage(el, {dots: .55, grain: .2, cells: 120});
  const W = 6.2, H = 7.8, nx = 34, ny = 42, geo = new T.PlaneGeometry(W, H, nx, ny), pos = geo.attributes.position, n = pos.count;
  const map = tex((ctx, w, h) => {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); grime(ctx, w, h, 4);
    ctx.textAlign = 'center'; ctx.fillStyle = '#1a1917';
    const words = String(props.text).toUpperCase().split(/\s+/); let size = 260; ctx.font = font(size); for (const word of words) size = Math.min(size, 260 * w * .8 / ctx.measureText(word).width);
    ctx.font = font(size); const top = h * .5 - (words.length - 1) * size * .5;
    words.forEach((word, i) => { ctx.fillStyle = i === words.length - 1 ? C.red : '#1a1917'; ctx.fillText(word, w / 2, top + i * size * .98 + size * .3); });
    ctx.fillStyle = '#1a1917'; ctx.font = font(40, 'type'); ctx.fillText(String(props.kicker).toUpperCase(), w / 2, top - size * .75); ctx.font = font(30, 'type'); ctx.fillText(String(props.note).toUpperCase(), w / 2, h * .9);
    ctx.strokeStyle = '#1a1917'; ctx.lineWidth = 6; ctx.strokeRect(w * .07, h * .06, w * .86, h * .88);
  }, 820, 1024);
  // The crumple: a few sharp folds (ridged waves in different directions) plus small dents, fixed per vertex.
  const base = new Float32Array(n * 3), fold = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = pos.getX(i), y = pos.getY(i); base[i * 3] = x; base[i * 3 + 1] = y; let z = 0;
    for (let k = 0; k < 5; k++) { const a = hash(k, 3) * Math.PI, f = .35 + hash(k, 4) * .55, ph = hash(k, 5) * 6, v = (x * Math.cos(a) + y * Math.sin(a)) * f + ph; z += (Math.abs(v - 2 * Math.floor(v / 2) - 1) - .5) * (.5 + hash(k, 6) * .6); }
    fold[i] = z * .5 + Math.sin(x * 3.1 + y * 1.7) * Math.cos(y * 2.6 - x) * .08;
  }
  const sheet = mesh(geo, paper(C.bone, {map, amb: .22, cut: 0}));
  camera.position.set(0, 0, 13.5); camera.lookAt(0, 0, 0);
  const fitZ = () => 13.5 * Math.max(1, .82 / camera.aspect);
  return play((th, t, s) => {
    const q = Math.min(1, th / 2.6), open = 1 - Math.pow(1 - q, 3), amt = 1 - open * .93, breathe = q >= 1 ? .02 * Math.sin(th * 2) : 0, shrink = 1 - .62 * (1 - open);
    for (let i = 0; i < n; i++) { const x = base[i * 3], y = base[i * 3 + 1], r2 = (x * x + y * y) / 24; pos.setXYZ(i, x * shrink, y * shrink, fold[i] * (amt + breathe) * (1.6 + (1 - open) * 1.2) - (1 - open) * r2 * 1.6); }
    pos.needsUpdate = true;
    const j = jit(Math.floor(th * 12), 1, .05, .012);
    sheet.rotation.set(-.32 + (1 - open) * .9 + j.y, .22 - (1 - open) * 1.4 + j.x, -.06 + (1 - open) * .8 + j.r);
    sheet.position.set(j.x, (1 - open) * .6, 0);
    light.set(.75 - open * .25 + Math.sin(th * .9) * .12, .5, .42);
    camera.position.z = fitZ();
  });
}
