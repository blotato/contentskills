import {comicStage, C, up, fit, capH, glyphs, slam, tags, captionBox, balloon, burst, spark, zoomLinesPath, scaleTo, span, spring, easeOut, hash} from '../../kit.js';

// A cover line. Zoom lines rush in from the panel edges, a two-colour burst pops behind the
// middle, and the headline slams on letter by letter, oversized and tilted, each letter inked and
// extruded. A caption box and a speech balloon pop on after it; small tags sit along the edges.
// `lines` are the headline (1-3 short lines); `accent` picks the panel colour.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  lines: ['MAKE IT', 'LOUD'], kicker: 'ONE IDEA.\nFULL VOLUME.', note: 'SAY THE THING YOU MEAN\nAND SAY IT BIG',
  labels: ['VOL. 01', 'KINETIC\nTYPE', 'A SHORT\nSERIES', 'NO. 26'], foot: ['PLAY IT LOUD', 'END OF SIDE A'], accent: 'yellow',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, under, W, H, ink, k} = stage, m = 70, lines = props.lines.map(up);
  const size = Math.min(fit(lines, W - m * 2, H * .3), H * .46 / (lines.length * 1.16 * capH(1))), cap = capH(size), pitch = cap * 1.16, top = H * .5 - (lines.length * pitch - (pitch - cap)) / 2, cy = top + (lines.length * pitch - (pitch - cap)) / 2;
  const rays = under.append('path').attr('d', zoomLinesPath(W / 2, cy, 330, 1500, {n: 60, seed: 2, thick: 1.5})).attr('fill', C.white).attr('opacity', .6);
  const star = burst(root.append('g').attr('transform', `translate(${W / 2} ${cy})`), Math.min(W * .49, 300 + lines.length * pitch * .5), {fill: ink.plate, inner: ink.alt, points: 14, squash: Math.min(1.25, .5 + lines.length * .3), seed: 4});
  const head = tags(root, props.labels, 58), foot = tags(root, props.foot, H - 108, {fills: [C.white, C.yellow]});
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {anchor: 'middle', color: ink.head, seed: i + 1}));
  const kicker = captionBox(root, m, Math.max(150, top - 190 * (k * .5 + .5) - 60), props.kicker, {size: 36, tilt: -3});
  const note = balloon(root, W - m - 250, Math.min(H - 250, top + lines.length * pitch + 150 * (k * .5 + .5)), props.note, {size: 32, lines: up(props.note).split('\n'), tx: -40, ty: -130 * (k * .5 + .5) - 20});
  const sparks = [spark(root, W - m - 30, top - 60, 40, ink.third), spark(root, m + 20, top + lines.length * pitch + 50, 30, ink.third)];
  return {
    seek(t) {
      rays.attr('transform', `translate(${W / 2} ${cy}) scale(${3 - 2 * easeOut(span(t, 0, .35)) + .015 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`).attr('opacity', .6 * span(t, 0, .1));
      star.boil(t); scaleTo(star.g, spring(span(t, .1, .5)), -6 + Math.sin(t * 1.3) * 1.5);
      let n = 0;
      rows.forEach((row, i) => row.forEach(u => { const q = span(t, .22 + i * .2 + u.i * .05, .5); slam(u, q, 0, {drop: 40, live: q >= 1 ? Math.sin(t * 3 - (n++) * .6) * .012 : 0}); }));
      [...head, ...foot].forEach((b, i) => scaleTo(b.g, spring(span(t, .7 + i * .07, .4))));
      scaleTo(kicker.g, spring(span(t, 1, .45))); scaleTo(note.g, spring(span(t, 1.35, .45)), Math.sin(t * 2) * 1.2);
      sparks.forEach((s, i) => scaleTo(s, spring(span(t, 1.2 + i * .2, .4)) * (1 + .18 * Math.sin(t * 6 + i * 2)), t * (i ? -40 : 55)));
    },
  };
}
