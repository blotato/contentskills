import {comicStage, C, look, captionBox, badge, spark, scaleTo, span, spring, leave} from '../../kit.js';

// Overlay: the small print of a comic cover. A caption box pops into each corner of the frame
// (issue, series, price-style labels), each at its own small tilt, with a burst badge carrying the
// `mark` beside the first and a spark on the last. `inset` is the gap to the frame edge.
export const meta = {duration: 4, live: true};
export const defaults = {
  topLeft: 'EP. 12\nBEHIND THE BUILD', topRight: 'UNSCRIPTED\nONE TAKE', bottomLeft: 'KEEP\nWATCHING', bottomRight: 'PT. 01\nOF 03',
  mark: 'R', accent: 'yellow', inset: 48,
};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W, H} = stage, ink = look(props.accent), i = props.inset, rows = s => String(s).split('\n').length, bh = s => rows(s) * 41 + 26;
  const boxes = [
    captionBox(root, i + (props.mark ? 104 : 0), i + 8, props.topLeft, {size: 34, fill: ink.accent, tilt: -2}),
    captionBox(root, W - i, i + 8, props.topRight, {size: 34, fill: C.white, anchor: 'end', tilt: 2}),
    captionBox(root, i, H - i - bh(props.bottomLeft), props.bottomLeft, {size: 34, fill: C.white, tilt: 2}),
    captionBox(root, W - i, H - i - bh(props.bottomRight), props.bottomRight, {size: 34, fill: ink.accent, anchor: 'end', tilt: -2}),
  ];
  const seal = props.mark ? badge(root, i + 46, i + 54, 62, props.mark, {fill: ink.accent === C.red ? C.blue : C.red, seed: 2}) : null, star = spark(root, W - i - boxes[3].w - 26, H - i - boxes[3].h, 28, C.white);
  return {
    seek(t) {
      const x = leave(t, props.life);
      boxes.forEach((b, n) => scaleTo(b.g, spring(span(t, .05 + n * .12, .42)) * (1 - x), Math.sin(t * 2 + n * 1.7) * .8));
      if (seal) { seal.boil(t); scaleTo(seal.g, spring(span(t, .3, .42)) * (1 - x), -10 + Math.sin(t * 2) * 5); }
      scaleTo(star, spring(span(t, .7, .4)) * (1 - x) * (1 + .18 * Math.sin(t * 6)), t * 60);
    },
  };
}
