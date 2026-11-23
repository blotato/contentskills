import {stage, C, up, fit, capH, glyphs, pose, txt, photo, hand, cornerLabels, fade, glide, swell, span, easeInOut} from '../../kit.js';

// Two huge words stacked around a wide picture: the top word slides in from the left in solid
// ink, the bottom one from the right, and a square-cornered picture
// wipes open between them while it slowly pushes in. A serif caption and a handwritten note sit
// beside it. `image` is an optional picture URL (a drawn stand-in scene otherwise).
export const meta = {duration: 5, live: true};
export const defaults = {
  top: 'GOLDEN', bottom: 'HOUR', caption: 'the best light\nis free', note: 'go outside',
  labels: ['Part two', 'Light', 'Notes to self', 'Pg. 04'], image: null, scene: 'meadow', accent: 'sun',
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, m = 70, a = up(props.top), b = up(props.bottom);
  const size = Math.min(fit([a, b], W - m * 2, 400), H * .15 / capH(1)), cap = capH(size), ph = H * (st.sq ? .26 : .34), py = H / 2 - ph / 2;
  const pic = photo(root, st, m, py, W - m * 2, ph, {image: props.image, scene: props.scene, seed: 3, from: 'right'});
  const top = glyphs(root, a, m, py - 34, size, {by: 'all', color: ink.head})[0];
  const low = glyphs(root, b, W - m, py + ph + 34 + cap, size, {by: 'all', anchor: 'end', color: ink.head})[0];
  const caption = txt(root, m, py + ph + 78, props.caption, {size: 46, role: 'serif', color: ink.soft, leading: 1.05});
  const note = hand(root, st, m + 6, py + ph + 34 + cap + (st.sq ? 0 : 110), props.note, {size: st.sq ? 0 : 84, color: ink.accent, rot: -4});
  const corners = cornerLabels(st, props.labels, {top: 96});
  const capW = W - m * 2 - low.w < 260;
  return {
    seek(t) {
      const q1 = span(t, .1, 1.1), q2 = span(t, .3, 1.1);
      pose(top, {x: -(1 - glide(q1)) * W * .8, o: easeInOut(span(q1, 0, .4))});
      pose(low, {x: (1 - glide(q2)) * W * .8, o: easeInOut(span(q2, 0, .4))});
      pic.set(swell(span(t, .35, 1.2)), t);
      caption.attr('opacity', capW ? 0 : fade(t, 1.5, .6)); note.set(glide(span(t, 1.7, 1))); corners.set(t, .8);
    },
  };
}
