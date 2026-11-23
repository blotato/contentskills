import {comicStage, C, up, fit, capH, txt, glyphs, letterOn, tags, captionBox, plate, slabPath, balloon, burst, badge, zoomLinesPath, measure, scaleTo, span, spring, easeOut} from '../../kit.js';

// A chapter page. The number lands huge in a burst with zoom lines behind it, the `kicker` caption
// box pops onto its corner, and the title letters itself onto a slab that pops out underneath.
// `note` is the balloon, `mark` the letter in the small badge.
export const meta = {duration: 4.5, live: true};
export const defaults = {number: '02', kicker: 'CHAPTER', title: 'THE BUILD', note: 'WHERE THE IDEA\nBECOMES A THING', labels: ['SECTION', 'KEEP\nWATCHING', 'PT. 02'], mark: 'N', accent: 'orange'};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, under, W, H, ink, k} = stage, m = 80, number = String(props.number), title = up(props.title), o = {role: 'slab'};
  const nsize = Math.min(fit(number, W * .5, H * .28 / capH(1))), ncap = capH(nsize), cy = H * (stage.sq ? .35 : .4), r = Math.min(W * .47, Math.max(ncap * (stage.sq ? 1 : 1.15), measure(number, nsize) * .8));
  const tsize = fit(title, W - m * 2 - 120, H * .095 / capH(1, o), o), tcap = capH(tsize, o), tw = measure(title, tsize, o) + 130, th = tcap + 80, ty = cy + r * .78 + 30 * k;
  const rays = under.append('path').attr('d', zoomLinesPath(W / 2, cy, r, 1600, {n: 56, seed: 7, thick: 1.5})).attr('fill', C.white).attr('opacity', .55);
  const star = burst(root.append('g').attr('transform', `translate(${W / 2} ${cy})`), r, {fill: ink.alt, inner: C.white, points: 16, depth: .72, seed: 9});
  const num = root.append('g').attr('transform', `translate(${W / 2} ${cy})`).append('g'); txt(num, 0, ncap / 2, number, {size: nsize, role: 'head', color: ink.plate, anchor: 'middle', outline: nsize * .08, drop: nsize * .055});
  const kicker = captionBox(root, W / 2 - r * .72, cy - r * .74, props.kicker, {size: 44, anchor: 'middle', tilt: -8});
  const bar = root.append('g').attr('transform', `translate(${W / 2} ${ty + th / 2}) rotate(-3)`).append('g'), slab = plate(bar, {fill: ink.plate, cut: 46, drop: 12}).box(-tw / 2, -th / 2, tw, th), letters = glyphs(bar, title, 0, tcap / 2, tsize, {role: 'slab', flat: true, anchor: 'middle', color: ink.plateOn});
  const note = balloon(root, W / 2 + 90, Math.min(H - 105, ty + th + 150 * (k * .5 + .5)), props.note, {size: 32, lines: up(props.note).split('\n'), tx: -90, ty: -100});
  const head = tags(root, props.labels, 58), seal = badge(root, W / 2 + r * .74, cy + r * .5, 70, props.mark, {fill: C.red, seed: 4});
  return {
    seek(t) {
      rays.attr('transform', `translate(${W / 2} ${cy}) scale(${3 - 2 * easeOut(span(t, 0, .35)) + .015 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`).attr('opacity', .55 * span(t, 0, .1));
      star.boil(t); scaleTo(star.g, spring(span(t, .1, .5)), Math.sin(t * 1.2) * 2);
      const q = span(t, .22, .5); scaleTo(num, spring(q) * (1 + .02 * Math.sin(t * 4)), -5 + (1 - spring(q)) * 20);
      scaleTo(kicker.g, spring(span(t, .6, .45))); scaleTo(bar, spring(span(t, .8, .45)));
      letters.forEach(u => letterOn(u, span(t, 1 + u.i * .04, .3)));
      scaleTo(note.g, spring(span(t, 1.5, .45)), Math.sin(t * 2) * 1.2); head.forEach((b, i) => scaleTo(b.g, spring(span(t, .7 + i * .07, .4))));
      seal.boil(t); scaleTo(seal.g, spring(span(t, 1.2, .45)), 12 + Math.sin(t * 2) * 4);
    },
  };
}
