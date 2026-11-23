import {comicStage, C, look, up, fit, capH, glyphs, pose, tags, captionBox, burst, txt, inPanel, zoomLinesPath, halftonePath, scaleTo, span, spring, easeOut, vel} from '../../kit.js';

// A face-off. The panel is torn in two along a slanted gutter, one colour each; the two words
// whip in from opposite sides and a burst with the `mark` pops on the tear with zoom lines behind
// it. `accents` are the two sides' colours; the notes are caption boxes.
export const meta = {duration: 4.5, live: true};
export const defaults = {a: 'FAST', b: 'PERFECT', mark: 'VS', aNote: 'SHIPS TODAY', bNote: 'SHIPS SOMEDAY', labels: ['ROUND\nONE', 'PICK\nA SIDE', 'NO TIES'], accents: ['red', 'blue']};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accents[0]}), {root, W, H, k} = stage, m = 70, A = look(props.accents[0]), B = look(props.accents[1]), slant = 90, r = 150 * (.7 + .3 * k), cy = H / 2;
  const wall = inPanel(stage), lower = wall.g.append('g');
  const half = `M${-W} ${cy + slant}L${W * 2} ${cy - slant}V${H * 2}H${-W}Z`;
  lower.append('path').attr('d', half).attr('fill', B.bg);
  const clipId = stage.id + '-lower'; stage.defs.append('clipPath').attr('id', clipId).append('path').attr('d', half);
  lower.append('path').attr('clip-path', `url(#${clipId})`).attr('d', halftonePath(0, cy - slant, W, H - cy + slant, {pitch: 34, from: [0, 1], reach: .7})).attr('fill', B.dots).attr('opacity', .85);
  const rays = wall.g.append('path').attr('d', zoomLinesPath(W / 2, cy, r * 1.15, 1600, {n: 50, seed: 3, thick: 1.5})).attr('fill', C.white).attr('opacity', .5);
  const tear = wall.g.append('path').attr('d', `M${-W} ${cy + slant}L${W * 2} ${cy - slant}`).attr('stroke', C.ink).attr('stroke-width', 40), gap = wall.g.append('path').attr('d', `M${-W} ${cy + slant}L${W * 2} ${cy - slant}`).attr('stroke', C.gutter).attr('stroke-width', 24);
  wall.ink();
  const words = [up(props.a), up(props.b)], size = Math.min(fit(words, W - m * 2, H * .17 / capH(1))), cap = capH(size), ya = cy - slant - r * .55 - 40 * k, yb = cy + slant + r * .55 + 40 * k + cap;
  const units = words.map((w, i) => glyphs(root, w, W / 2, i ? yb : ya, size, {by: 'all', anchor: 'middle', color: (i ? B : A).head, wobble: 0})[0]);
  const notes = [captionBox(root, m, Math.max(124, ya - cap - 110 * (k * .5 + .5)), props.aNote, {size: 36, tilt: -3}), captionBox(root, W - m, yb + 50 * (k * .5 + .5), props.bNote, {size: 36, anchor: 'end', tilt: 2, fill: C.white})];
  const star = burst(root.append('g').attr('transform', `translate(${W / 2} ${cy})`), r, {fill: C.yellow, inner: C.white, points: 13, seed: 5}), msize = fit(up(props.mark), r * 1.1, r * 1.1);
  txt(star.g, 0, capH(msize) / 2, up(props.mark), {size: msize, role: 'head', color: C.red, anchor: 'middle', outline: msize * .09, drop: msize * .06});
  const head = tags(root, props.labels, 58);
  return {
    seek(t) {
      units.forEach((u, i) => { const q = span(t, .1 + i * .15, .5), e = spring(q), dir = i ? 1 : -1; pose(u, {x: dir * (1 - e) * W * 1.1, skew: dir * vel(q) * 22, rot: -4.5, o: q > 0 ? 1 : 0}); });
      const q = span(t, .55, .5); star.boil(t); scaleTo(star.g, spring(q) * (1 + .03 * Math.sin(t * 5)), -8 + (1 - easeOut(q)) * -40);
      rays.attr('opacity', .5 * span(t, .55, .1)).attr('transform', `translate(${W / 2} ${cy}) scale(${2.4 - 1.4 * easeOut(span(t, .55, .35)) + .015 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`);
      notes.forEach((b, i) => scaleTo(b.g, spring(span(t, 1 + i * .2, .45)))); head.forEach((b, i) => scaleTo(b.g, spring(span(t, .8 + i * .07, .4))));
    },
  };
}
