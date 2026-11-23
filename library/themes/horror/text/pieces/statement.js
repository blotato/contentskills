import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A sentence that assembles itself out of the dark, letter by letter in no order. The words in
// `accent` come up in the accent colour; a typed tag sits above and a line below.
export const meta = {duration: 6, live: true};
export const defaults = {
  statement: 'The house was empty when they bought it', accent: ['EMPTY'], tag: 'CASE NOTE 07',
  labels: ['OBSERVED', 'ON RECORD', '', 'KEEP READING'], foot: 'It did not stay that way', field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 110;
  const {size, lines} = flow(up(props.statement), W - m * 2, H * .36, 124, 44, {spacing: .14}), body = block(root, lines, W / 2, H * .5, size, {words: props.accent, marks: props.accent?.length ? false : 1, seed: 4}, 1.7);
  const tag = props.tag ? txt(root, W / 2, body.top - 70 - 30 * k, up(props.tag), {size: 30, anchor: 'middle', color: C.fog, font: F.type, weight: 400, spacing: .2}) : null;
  const foot = props.foot ? txt(root, W / 2, body.bottom + 110 + 20 * k, up(props.foot), {size: 30 + 4 * k, anchor: 'middle', color: C.fog, spacing: .3}) : null, corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); tag?.text(typed(up(props.tag), span(t, .1, .6)) + (t < 1 && blink(t, 3) ? '_' : ''));
    body.show(t, {at: .5, spread: 1.1, gap: .3}); foot?.attr('opacity', flickerOn(t, 2.2 + lines.length * .3, .3, 6) * .9); corners(t, 1.5);
  }};
}
