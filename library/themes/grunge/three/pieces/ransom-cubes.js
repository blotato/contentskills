import {xeroxStage, font, C, hash, jit} from './_fx.js';

// Ransom-note letters as paper blocks: each one cut from a different page, tumbling in from above in
// held steps and landing crooked to spell props.word, then twitching where it sits.
export const meta = {duration: 4.5, live: true};
export const defaults = {word: 'CHAOS'};

export function mount(el, props = defaults) {
  const {T, scene, camera, light, paper, flat, mesh, tex, grime, grainTex, tornGeo, play} = xeroxStage(el, {dots: .5, grain: .2});
  const word = String(props.word).toUpperCase().replace(/\s+/g, ' ').slice(0, 14), chars = [...word], portrait = camera.aspect < .8;
  const perRow = portrait && chars.length > 3 ? Math.ceil(chars.length / Math.ceil(chars.length / 3)) : chars.length, rows = Math.ceil(chars.length / perRow), pitch = 1.22;
  const looks = [[C.bone, '#141311', 'head'], ['#141311', C.bone, 'cond'], [C.red, '#141311', 'wide'], [C.paper, '#141311', 'type'], [C.bone, C.red, 'cond'], ['#3a3835', C.bone, 'head']];
  const geo = new T.BoxGeometry(1, 1, .6);
  const cubes = chars.map((ch, i) => {
    if (ch === ' ') return null;
    const [bg, ink, role] = looks[Math.floor(hash(i, 2) * looks.length)], row = Math.floor(i / perRow), col = i % perRow, inRow = Math.min(perRow, chars.length - row * perRow);
    const map = tex((ctx, w, h) => { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); grime(ctx, w, h, i + 2, bg !== C.bone && bg !== C.paper); ctx.fillStyle = ink; ctx.textAlign = 'center'; let size = role === 'wide' ? 150 : 200; ctx.font = font(size, role); size = Math.min(size, size * w * .78 / ctx.measureText(ch).width); ctx.font = font(size, role); const m = ctx.measureText(ch); ctx.fillText(ch, w / 2, h / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2); }, 256, 256);
    const side = paper(bg === C.red ? '#8a2a0c' : '#6b675f', {amb: .4}), front = paper('#ffffff', {map, amb: .62, cut: 0}), g = new T.Group();
    mesh(geo, [side, side, side, side, front, front], g); scene.add(g);
    g.userData = {x: (col - (inRow - 1) / 2) * pitch, y: ((rows - 1) / 2 - row) * 1.45, tilt: (hash(i, 5) - .5) * .32, i};
    return g;
  }).filter(Boolean);
  // a torn strip of dark paper and a halftone offcut for the letters to land on
  const bw = perRow * pitch + 1.6, bh = rows * 1.45 + .7, back = new T.Group(); scene.add(back); back.position.z = -.5;
  mesh(tornGeo(bw + .2, bh + .2, 5, .14), flat(C.white), back).position.z = -.02; mesh(tornGeo(bw, bh, 4, .12), paper('#3a3835', {map: grainTex('#3a3835', 3, {dots: true}), amb: .6, cut: 0}), back);
  const off = mesh(tornGeo(bw * .5, bh * 1.5, 9, .14), paper(C.red, {amb: .7}), back); off.position.set(bw * .28, .2, -.06); off.rotation.z = .2;
  back.rotation.z = -.04;
  const half = (perRow * pitch) / 2 + 1.3, halfH = rows * .8 + .9;
  light.set(.4, .6, .7);
  return play((th, t, s) => {
    const fov = Math.tan(camera.fov * Math.PI / 360); const z = Math.max(half / (fov * camera.aspect), halfH / fov, 7); camera.position.set(z * .08, -z * .2, z * .97); camera.lookAt(0, 0, 0);
    cubes.forEach(g => {
      const {x, y, tilt, i} = g.userData, at = .2 + i * .16, q = Math.max(0, Math.min(1, (th - at) / .5)), fall = 1 - q * q, landed = q >= 1, since = th - at - .5;
      const bounce = landed && since < .17 ? .12 : 0, j = jit(Math.floor(th * 12 / 3) + i * 3, i, .025, .03);
      g.visible = th >= at;
      g.position.set(x + (hash(i, 7) - .5) * 3 * fall + (landed ? j.x : 0), y + fall * 9 + bounce + (landed ? j.y : 0), fall * 2);
      g.rotation.set(fall * (3 + hash(i, 8) * 4), fall * (hash(i, 9) - .5) * 9 + (landed ? (hash(i, 11) - .5) * .5 : 0), tilt + fall * 2 + (landed ? j.r : 0));
    });
  });
}
