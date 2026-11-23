import {comicStage, C, up, flow, capH, glyphs, slam, letterOn, tags, captionBox, slabLabel, burst, spark, scaleTo, span, spring} from '../../kit.js';

// A sentence lettered across the panel word by word in shouted caps. The `emphasis` words land
// harder, in the look's second colour, with a burst popping behind the first of them. `tag` is
// the caption box above, `foot` the plate below.
export const meta = {duration: 5, live: true};
export const defaults = {
  statement: 'Good ideas get better the moment you ship them', emphasis: ['SHIP'], tag: 'FIELD NOTE 07',
  labels: ['OBSERVED', 'IN THE\nWILD', 'KEEP\nGOING'], foot: 'SHIP IT, THEN FIX IT', accent: 'teal',
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {accent: props.accent}), {root, W, H, ink} = stage, m = 76, strong = new Set((props.emphasis ?? []).map(up));
  const {size, lines, pitch} = flow(up(props.statement), W - m * 2 - 50, H * .56, 200, 60, {role: 'head'}, 1.38), cap = capH(size), block = lines.length * pitch - (pitch - cap), top = (H - block) / 2;
  const back = root.append('g'), units = lines.flatMap((line, i) => glyphs(root, line, W / 2, top + cap + i * pitch, size, {by: 'word', anchor: 'middle', color: ink.head, seed: i + 2}));
  units.forEach((u, i) => { u.strong = strong.has(u.str.replace(/[^A-Z0-9']/g, '')); u.at = .25 + i * .16; if (u.strong) u.text.attr('fill', ink.pop); });
  const first = units.find(u => u.strong), star = first ? burst(back.append('g').attr('transform', `translate(${first.cx} ${first.y - cap / 2})`), Math.max(first.w * .72, cap * 1.2), {fill: ink.plate, inner: ink.alt, squash: Math.min(1, cap * 1.5 / Math.max(first.w * .72, cap * 1.2)), seed: 6}) : null;
  const head = tags(root, props.labels, 58), tag = captionBox(root, m, top - 130, props.tag, {size: 36, tilt: -2}), foot = slabLabel(root, W - m, top + block + 70, props.foot, {size: 46, fill: ink.plate, anchor: 'end', tilt: -2});
  const sparks = [spark(root, W - m - 20, top - 70, 38, ink.third), spark(root, m + 10, top + block + 110, 28, ink.third)];
  return {
    seek(t) {
      units.forEach(u => { const q = span(t, u.at, u.strong ? .5 : .32); u.strong ? slam(u, q, 0, {from: 3, live: q >= 1 ? Math.sin(t * 4) * .02 : 0}) : letterOn(u, q); });
      if (star) { star.boil(t); scaleTo(star.g, spring(span(t, first.at + .05, .45)), -5 + Math.sin(t * 1.5) * 2); }
      head.forEach((b, i) => scaleTo(b.g, spring(span(t, .1 + i * .07, .4))));
      scaleTo(tag.g, spring(span(t, .1, .45))); scaleTo(foot.g, spring(span(t, .5 + units.length * .16, .45)));
      sparks.forEach((s, i) => scaleTo(s, spring(span(t, 1.2 + i * .3, .4)) * (1 + .18 * Math.sin(t * 6 + i * 2)), t * (i ? -40 : 55)));
    },
  };
}
