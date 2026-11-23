import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// Two words stacked either side of a hairline that draws itself across the frame; the lower word
// arrives late. A caption sits above, a note below. (`image`, `art` and `marks` from other themes are ignored.)
export const meta = {duration: 5, live: true};
export const defaults = {
  top: 'DON\'T', bottom: 'LOOK', caption: 'WHATEVER YOU HEAR\nBEHIND YOU', note: 'IT ONLY MOVES\nWHEN YOU DO',
  labels: ['PART TWO', 'THE RULE', 'FIELD NOTES', 'PG. 04'], marks: [], image: null, art: null, field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 110, top = up(props.top), bottom = up(props.bottom);
  const size = Math.min(fit([top, bottom], W - m * 2, 260), H * .16), cap = capH(size), cy = H / 2, gap = 56;
  const a = letters(root, top, W / 2, cy - gap, size, {seed: 2, marks: false}), b = letters(root, bottom, W / 2, cy + gap + cap, size, {seed: 6});
  const rule = hair(root, rough(m - 40, cy, W - m + 40, cy, 4, 1.4, 60), C.bone, 2, .55);
  const cap1 = txt(root, W / 2, cy - gap - cap - 120 * (.6 + .4 * k), up(props.caption), {size: 28 + 6 * k, anchor: 'middle', color: C.fog, spacing: .3, leading: 1.6});
  const note = txt(root, W / 2, cy + gap + cap + 110, up(props.note), {size: 28 + 6 * k, anchor: 'middle', color: C.fog, spacing: .3, leading: 1.6}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); a.show(t, {at: .3, spread: .6}); draw(rule, easeInOut(span(t, .7, .9))); b.show(t, {at: 1.5, spread: .5});
    cap1.attr('opacity', flickerOn(t, .1, .3, 1) * .85); note.attr('opacity', flickerOn(t, 2.3, .3, 2) * .85); corners(t, 1.4);
  }};
}
