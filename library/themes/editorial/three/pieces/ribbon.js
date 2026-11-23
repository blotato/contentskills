import {stage3, pageTexture, matte, tone, span, glide, smooth} from './_scene.js';

// A ribbon bookmark: a wine ribbon slides down over a printed page from the top edge and its tail curls towards
// the camera, breathing slowly, with a swallow-tail cut at the end. "Saved", "the place to come back to", "marked".
// Props: color (kit colour of the ribbon), field (ground), page (ground of the page behind, '' for none), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'stone', color: 'wine', page: 'paper'};

const SEG = 28, LEN = 5.2, WID = .62;
export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 28}), {T, scene, camera} = s;
  if (props.page) { const pg = new T.Mesh(new T.PlaneGeometry(3.6, 5.04), matte(null, pageTexture(7, {field: props.page, w: 360, h: 504}))); pg.position.set(0, 0, -.25); pg.rotation.set(-.12, .2, .03); scene.add(pg); }
  const geo = new T.PlaneGeometry(WID, LEN, 2, SEG), rib = new T.Mesh(geo, new T.MeshLambertMaterial({color: tone(props.color ?? 'wine'), side: T.DoubleSide})); scene.add(rib);
  const pos = geo.attributes.position;
  return {seek(t) {
    s.hold(.8); const push = smooth(span(t, 0, meta.duration)), drop = glide(span(t, .05, .9)), curlIn = smooth(span(t, .3, 1.4));
    camera.position.set(2.6 - push * .6, -.5, 8 - push * .8); camera.lookAt(0, -.1, 0);
    const curl = curlIn * (1.5 + .18 * Math.sin(t * .9)), sway = .05 * Math.sin(t * .7 + 1), ds = LEN / SEG;
    let y = 3.6 + (1 - drop) * LEN, z = .02, x = .55;
    for (let k = 0; k <= SEG; k++) {
      const u = k / SEG, a = curl * Math.pow(Math.max(0, u - .35) / .65, 1.7);
      if (k) { y -= Math.cos(a) * ds; z += Math.sin(a) * ds; x += sway * u * ds; }
      for (let c = 0; c < 3; c++) { const notch = k === SEG && c === 1 ? .34 : 0; pos.setXYZ(k * 3 + c, x + (c - 1) * WID / 2, y + Math.cos(a) * notch, z - Math.sin(a) * notch); }
    }
    pos.needsUpdate = true; geo.computeVertexNormals();
    s.render(t);
  }};
}
