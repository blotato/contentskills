import {comicStage, C, up, fit, capH, glyphs, pose, tags, captionBox, balloon, badge, inset, streaksPath, scaleTo, span, spring, easeOut, vel} from '../../kit.js';

// Two stacked words whip in from opposite sides, skewed by their speed and trailed by speed
// streaks, and a picture panel pops between them at a tilt. A caption box sits above, a balloon
// below, and two burst badges carry the `marks`. `image` (a URL) fills the panel if given.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  top: 'THINK', bottom: 'BIGGER', caption: 'START BEFORE\nYOU FEEL READY', note: 'THE FIRST DRAFT\nCAN BE BAD',
  labels: ['PART\nTWO', 'MINDSET', 'NOTES\nTO SELF', 'PG. 04'], marks: ['A', 'R'], image: null, accent: 'blue',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 70, words = [up(props.top), up(props.bottom)];
  const size = Math.min(fit(words, W - m * 2, H * .2 / capH(1))), cap = capH(size), ih = H * (stage.sq ? .2 : .24), iw = W * .62, cy = H * (stage.sq ? .51 : .5), yTop = cy - ih / 2 - 46, yBot = cy + ih / 2 + 46 + cap;
  const streaks = [yTop - cap, yBot - cap].map((y, i) => root.append('path').attr('d', streaksPath(0, y, W, cap, {n: 9, seed: i + 3, thick: 1.6})).attr('fill', C.white));
  const pic = inset(root, stage, (W - iw) / 2, cy - ih / 2, iw, ih, {image: props.image, fill: C.sky});
  const units = words.map((w, i) => glyphs(root, w, W / 2, i ? yBot : yTop, size, {by: 'all', anchor: 'middle', color: i ? ink.pop : ink.head, wobble: 0})[0]);
  const head = tags(root, props.labels, 58);
  const caption = captionBox(root, m, Math.max(124, yTop - cap - 150 * (k * .6 + .4)), props.caption, {size: 34, tilt: -3});
  const note = balloon(root, W - m - 220, Math.min(H - 110, yBot + 130 * (k * .6 + .4) + 30), props.note, {size: 32, lines: up(props.note).split('\n'), tx: -60, ty: -110 * (k * .6 + .4) - 10});
  const marks = (props.marks ?? []).slice(0, 2).map((mk, i) => badge(root, i ? (W + iw) / 2 - 10 : (W - iw) / 2 + 10, i ? cy + ih / 2 - 6 : cy - ih / 2 + 6, 62, mk, {fill: i ? ink.alt : ink.plate, seed: i + 2}));
  return {
    seek(t) {
      units.forEach((u, i) => { const q = span(t, .1 + i * .18, .5), e = spring(q), dir = i ? 1 : -1; pose(u, {x: dir * (1 - e) * W * 1.1, skew: dir * vel(q) * 22, sx: 1 + vel(q) * .25, sy: 1, rot: i ? 2 : -3, o: q > 0 ? 1 : 0}); streaks[i].attr('opacity', q > 0 && q < .7 ? .9 : 0).attr('transform', `translate(${dir * (1 - easeOut(q)) * 200} 0) scale(${dir} 1) translate(${dir < 0 ? -W : 0} 0)`); });
      scaleTo(pic, spring(span(t, .45, .5)), -4 + Math.sin(t * 1.4) * .8);
      head.forEach((b, i) => scaleTo(b.g, spring(span(t, .7 + i * .07, .4))));
      scaleTo(caption.g, spring(span(t, .95, .45))); scaleTo(note.g, spring(span(t, 1.25, .45)), Math.sin(t * 2) * 1.2);
      marks.forEach((b, i) => { b.boil(t); scaleTo(b.g, spring(span(t, .85 + i * .15, .4)), (i ? 10 : -12) + Math.sin(t * 2 + i) * 4); });
    },
  };
}
