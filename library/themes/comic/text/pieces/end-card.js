import {comicStage, C, up, fit, capH, glyphs, slam, tags, slabLabel, balloon, burst, spark, strip, inPanel, zoomLinesPath, scaleTo, span, spring, easeOut} from '../../kit.js';

// The last page. The sign-off slams on over a burst, the `action` pops out on a slab like a
// button that keeps nudging, the `handle` speaks from a balloon and a printed band with the
// `strip` text runs along the bottom of the panel.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['FOLLOW', 'FOR MORE'], action: 'NEW VIDEO EVERY WEEK', handle: '@YOURNAME', strip: 'SEE YOU NEXT TIME',
  labels: ['THE END', 'OR IS IT', 'FIN.'], accent: 'yellow',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, under, W, H, ink, k} = stage, m = 70, lines = props.lines.map(up), bandH = 120 * (k * .4 + .6), bandY = H - 26 - bandH - 70 * k;
  const size = Math.min(fit(lines, W - m * 2, H * .3), H * (stage.sq ? .27 : .34) / (lines.length * 1.16 * capH(1))), cap = capH(size), pitch = cap * 1.16, block = lines.length * pitch - (pitch - cap), top = H * (stage.sq ? .33 : .4) - block / 2, cy = top + block / 2;
  const rays = under.append('path').attr('d', zoomLinesPath(W / 2, cy, 320, 1500, {n: 56, seed: 6, thick: 1.5})).attr('fill', C.white).attr('opacity', .55);
  const star = burst(root.append('g').attr('transform', `translate(${W / 2} ${cy})`), Math.min(W * .49, 280 + block * .5), {fill: ink.alt, inner: ink.plate, points: 14, squash: Math.min(1.2, .5 + lines.length * .3), seed: 11});
  const wall = inPanel(stage), band = wall.g.append('g').attr('transform', `translate(${W / 2} ${bandY + bandH / 2}) rotate(-2) translate(${-W / 2} ${-bandH / 2})`);
  band.append('rect').attr('x', -W).attr('width', W * 3).attr('height', bandH).attr('fill', C.ink);
  const ssize = bandH * .56 / capH(1), run = strip(band, stage, props.strip, bandH / 2 + capH(ssize) / 2, ssize, {color: C.yellow, sepColor: C.white}); wall.ink();
  const rows = lines.map((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {anchor: 'middle', color: ink.head, seed: i + 5}));
  const action = slabLabel(root, W / 2, top + block + 60 * (k * .5 + .5), props.action, {size: fit(up(props.action), W - m * 2 - 90, 70, {role: 'slab'}), fill: ink.plate, anchor: 'middle', tilt: -3, cut: 34});
  const handle = balloon(root, W / 2 + 100, Math.min(bandY - 110, top + block + 60 * (k * .5 + .5) + action.h + 150 * (k * .5 + .5)), props.handle, {size: 44, lines: [String(props.handle)], tx: -110, ty: -110});
  const head = tags(root, props.labels, 58), sparks = [spark(root, W - m - 30, top - 50, 40, ink.third), spark(root, m + 20, top + block + 40, 30, ink.third)];
  return {
    seek(t) {
      rays.attr('transform', `translate(${W / 2} ${cy}) scale(${3 - 2 * easeOut(span(t, 0, .35)) + .015 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`).attr('opacity', .55 * span(t, 0, .1));
      star.boil(t); scaleTo(star.g, spring(span(t, .1, .5)), 5 + Math.sin(t * 1.3) * 1.5);
      rows.forEach((row, i) => row.forEach(u => slam(u, span(t, .2 + i * .2 + u.i * .045, .5), 0, {drop: 40})));
      scaleTo(action.g, spring(span(t, 1, .45)) * (1 + .04 * Math.max(0, Math.sin(t * 5))), Math.sin(t * 5) * .8); scaleTo(handle.g, spring(span(t, 1.4, .45)), Math.sin(t * 2) * 1.5);
      band.attr('opacity', span(t, .6, .01)); run.set(t * 150 - (1 - easeOut(span(t, .6, .5))) * 900);
      head.forEach((b, i) => scaleTo(b.g, spring(span(t, .7 + i * .07, .4))));
      sparks.forEach((s, i) => scaleTo(s, spring(span(t, 1.2 + i * .2, .4)) * (1 + .18 * Math.sin(t * 6 + i * 2)), t * (i ? -40 : 55)));
    },
  };
}
