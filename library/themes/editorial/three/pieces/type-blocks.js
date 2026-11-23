import {stage3, shade, matte, span, glide, smooth} from './_scene.js';

// A page layout as architecture: on a sheet of paper lying flat, the blocks of a 12-column grid rise one after
// another: a headline bar, three columns of text, a tall picture block in the accent, a caption, a folio. The camera
// drifts round it slowly. "How it is built", "the structure", "the layout".
// Props: field (ground), accent (kit colour of the picture block), clear.
export const meta = {duration: 8};
export const defaults = {clear: false, field: 'paper', accent: 'wine'};

// x, z (centre, in page units: the page is 4 x 5.4), w, d, height, colour
const BLOCKS = [[-.55, -2.05, 2.5, .34, .2, 'ink'], [1.5, -2.05, .6, .34, .12, 'crimson'], [-1.2, -.55, 1.2, 2.1, .34, 'stone'], [.15, -.9, 1.2, 1.4, .5, 'stone'], [1.5, -.55, .6, 2.1, .26, 'fog'],
  [.48, .55, 1.86, 1.1, .95, 'accent'], [-1.2, 1.55, 1.2, 1.7, .42, 'stone'], [.48, 1.85, 1.86, 1.1, .3, 'blush'], [-1.5, 2.48, .6, .1, .08, 'ink'], [1.5, 2.48, .6, .1, .08, 'ink']];

export function mount(el, props = defaults) {
  const s = stage3(el, props, {fov: 28}), {T, scene, camera} = s, page = new T.Group(); scene.add(page);
  const under = shade(6.6, 8, .22); under.position.y = -.06; page.add(under);
  const base = new T.Mesh(new T.BoxGeometry(4, .06, 5.4), matte(s.field.name === 'paper' ? 'stone' : 'paper')); base.position.y = -.03; page.add(base);
  const blocks = BLOCKS.map(([x, z, w, d, h, c], i) => { const m = new T.Mesh(new T.BoxGeometry(w, 1, d), matte(c === 'accent' ? props.accent ?? 'wine' : c)); m.position.set(x, 0, z); page.add(m); return {m, h, at: .15 + i * .09}; });
  return {seek(t) {
    s.hold(.8); const push = smooth(span(t, 0, meta.duration));
    camera.position.set(5 - push * 1.8, 8.5 - push * .7, 9.6 - push * .8); camera.lookAt(0, .1, .2);
    page.rotation.y = -.12 + push * .1;
    blocks.forEach(b => { const q = glide(span(t, b.at, .6)), h = Math.max(.001, b.h * q); b.m.scale.y = h; b.m.position.y = h / 2; b.m.visible = q > 0; });
    s.render(t);
  }};
}
