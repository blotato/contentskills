import {comicStage, C, up, fit, capH, txt, tags, captionBox, slabLabel, balloon, burst, spark, zoomLinesPath, comma, scaleTo, span, spring, easeOut} from '../../kit.js';

// One huge number. Zoom lines rush in, a two-colour burst pops and the number lands in it,
// counting up when it is a plain figure. `kicker` is the caption box above, `label` the plate
// below, `note` the balloon.
export const meta = {duration: 4.5, live: true};
export const defaults = {
  value: '2026', kicker: 'MARK THE YEAR', label: 'EVERYTHING CLICKS', note: 'SMALL STEPS, STACKED DAILY,\nLOOK LIKE LUCK FROM OUTSIDE',
  labels: ['DATA\nPOINT', 'NO. 01', 'COUNT\nIT UP'], accent: 'red',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, under, W, H, ink, k} = stage, m = 70, value = String(props.value), cy = H * .47;
  const parts = value.match(/^(\D*)(\d[\d,]*)(\.\d+)?(.*)$/), target = parts ? Number(parts[2].replace(/,/g, '') + (parts[3] ?? '')) : null, counts = parts && !/^0\d/.test(parts[2]);
  const show = q => !counts ? value : parts[1] + (parts[3] ? (target * q).toFixed(parts[3].length - 1) : parts[2].includes(',') ? comma(target * q) : String(Math.round(target * q))) + parts[4];
  const size = Math.min(fit(value, W * .74, H * (stage.sq ? .23 : .3) / capH(1))), cap = capH(size), r = Math.min(W * .5, Math.max(size * value.length * .3, cap * 1.25));
  const rays = under.append('path').attr('d', zoomLinesPath(W / 2, cy, r * .9, 1500, {n: 56, seed: 5, thick: 1.5})).attr('fill', C.white).attr('opacity', .55);
  const star = burst(root.append('g').attr('transform', `translate(${W / 2} ${cy})`), r, {fill: ink.plate, inner: ink.alt, points: 15, squash: Math.min(1, cap * 2.2 / r), seed: 8});
  const number = root.append('g').attr('transform', `translate(${W / 2} ${cy})`).append('g'), label = txt(number, 0, cap / 2, value, {size, role: 'head', color: ink.head, anchor: 'middle', outline: Math.max(6, size * .085), drop: Math.max(5, size * .06)});
  const head = tags(root, props.labels, 58), kicker = captionBox(root, W / 2, Math.max(118, cy - cap * 1.1 - 150 * (k * .6 + .4)), props.kicker, {size: 40, anchor: 'middle', tilt: -3});
  const plateLabel = slabLabel(root, W / 2, cy + cap * 1.1 + 60 * k, props.label, {size: fit(up(props.label), W - m * 2 - 80, 64, {role: 'slab'}), fill: ink.alt, anchor: 'middle', tilt: -2});
  const note = balloon(root, W / 2 + 60, Math.min(H - 105, cy + cap * 1.1 + 60 * k + 250 * (k * .5 + .5)), props.note, {size: 30, lines: up(props.note).split('\n'), tx: -80, ty: -100});
  const sparks = [spark(root, W - m - 20, cy - cap, 38, ink.third), spark(root, m + 20, cy + cap * .8, 28, ink.third)];
  return {
    seek(t) {
      rays.attr('transform', `translate(${W / 2} ${cy}) scale(${3 - 2 * easeOut(span(t, 0, .35)) + .015 * Math.sin(t * 9)}) translate(${-W / 2} ${-cy})`).attr('opacity', .55 * span(t, 0, .1));
      star.boil(t); scaleTo(star.g, spring(span(t, .1, .5)), 4 + Math.sin(t * 1.3) * 1.5);
      const q = span(t, .25, .5); scaleTo(number, spring(q) * (1 + .02 * Math.sin(t * 4)), -4 + (1 - spring(q)) * -14); label.say(show(easeOut(span(t, .3, 1.1))));
      head.forEach((b, i) => scaleTo(b.g, spring(span(t, .7 + i * .07, .4))));
      scaleTo(kicker.g, spring(span(t, .8, .45))); scaleTo(plateLabel.g, spring(span(t, 1.05, .45))); scaleTo(note.g, spring(span(t, 1.4, .45)), Math.sin(t * 2) * 1.2);
      sparks.forEach((s, i) => scaleTo(s, spring(span(t, 1.2 + i * .2, .4)) * (1 + .18 * Math.sin(t * 6 + i * 2)), t * (i ? -40 : 55)));
    },
  };
}
