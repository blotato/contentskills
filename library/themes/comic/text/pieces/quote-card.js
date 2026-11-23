import {comicStage, C, up, flow, fit, capH, inked, tags, captionBox, slabLabel, balloon, badge, spark, scaleTo, span, spring} from '../../kit.js';

// A quotation in one big speech balloon that pops open, its lines lettered on one after another,
// with oversized quote marks, the speaker on a plate under the balloon's tail and a caption box
// for the role. `mark` is the letter in the burst badge.
export const meta = {duration: 5, live: true};
export const defaults = {
  quote: 'Done beats perfect every single time', by: 'NOTE TO SELF', role: 'PINNED SINCE DAY ONE',
  labels: ['QUOTED', 'WORDS\nTO KEEP', 'NO. 12'], mark: 'Q', accent: 'purple',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, W, H, ink, k} = stage, m = 70, bw = W - m * 2;
  const {size, lines} = flow(up(props.quote), bw - 130, H * .36, 104, 44, {role: 'hand'}, 1.75), cy = H * .45;
  const b = balloon(root, W / 2, cy, '', {size, lines, tx: -bw * .22, ty: null, pad: 84, tail: 70}), ty = cy + b.h / 2 + 70;
  const open = root.append('g'), comma = 'M-40 0C-40 -60 -10 -95 30 -105C5 -85 -5 -60 0 -40A40 40 0 1 1 -40 0Z';
  [0, 104].forEach(dx => inked(open.append('g').attr('transform', `translate(${m + 40 + dx} ${cy - b.h / 2 + 10}) scale(1.15)`), comma, {fill: ink.plate, width: 6, drop: 7}));
  const by = slabLabel(root, m + 10, ty + 34, props.by, {size: fit(up(props.by), bw * .7, 72, {role: 'slab'}), fill: ink.plate, tilt: -3});
  const role = captionBox(root, m + 60, ty + 34 + by.h + 26, props.role, {size: 32, tilt: 1});
  const head = tags(root, props.labels, 58), seal = badge(root, W - m - 60, cy - b.h / 2 - 10, 84, props.mark, {fill: ink.alt, seed: 3});
  const star = spark(root, W - m - 30, ty + 80, 36, ink.third);
  return {
    seek(t) {
      scaleTo(b.g, spring(span(t, .1, .55)), -1.5 + Math.sin(t * 1.4) * .6);
      b.rows.forEach((row, i) => row.attr('opacity', span(t, .45 + i * .22, .08)).attr('transform', `translate(0 ${(1 - spring(span(t, .45 + i * .22, .3))) * 14})`));
      open.attr('transform', `translate(${m + 60} ${cy - b.h / 2}) scale(${Math.max(.0001, spring(span(t, .35, .45)))}) rotate(${-8 + Math.sin(t * 2) * 2}) translate(${-m - 60} ${-(cy - b.h / 2)})`);
      const at = .6 + lines.length * .22; scaleTo(by.g, spring(span(t, at, .45))); scaleTo(role.g, spring(span(t, at + .25, .45)));
      head.forEach((x, i) => scaleTo(x.g, spring(span(t, .7 + i * .07, .4))));
      seal.boil(t); scaleTo(seal.g, spring(span(t, .9, .45)), 10 + Math.sin(t * 2) * 4); scaleTo(star, spring(span(t, at + .4, .4)) * (1 + .18 * Math.sin(t * 6)), t * 50);
    },
  };
}
