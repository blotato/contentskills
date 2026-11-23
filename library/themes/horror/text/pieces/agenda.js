import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A numbered list that switches on one line at a time, like items read off a case file. The line
// being read is bright with its number in the accent colour; the ones before it fall back to grey.
export const meta = {duration: 6.5, live: true};
export const defaults = {
  title: 'WHAT WE KNOW', kicker: 'FOUR THINGS', items: ['THE DOOR WAS LOCKED', 'THE LIGHTS WERE ON', 'NOBODY CALLED', 'SOMEONE ANSWERED'],
  labels: ['CASE FILE', 'TONIGHT', '', 'IN THIS ORDER'], step: .9, field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 120, items = props.items.map(up), n = items.length;
  const size = Math.min(fit(items, W - m * 2 - 130, 84), H * .5 / n / 1.9 / .72), pitch = Math.min(capH(size) * 2.5, H * .5 / n), top = H * .5 - n * pitch / 2 + 90;
  const title = letters(root, up(props.title), m, top - 70, Math.min(fit(up(props.title), W - m * 2, 120), 120), {anchor: 'start', seed: 3}), kick = txt(root, m, top - 70 - title.cap - 44, up(props.kicker), {size: 30 + 6 * k, color: C.fog, spacing: .34, weight: 600});
  const rule = hair(root, rough(m, top - 20, W - m, top - 20, 3, 1.2, 60), C.bone, 2, .4);
  const rows = items.map((item, i) => { const y = top + i * pitch + pitch / 2 + capH(size) / 2; return {num: txt(root, m, y, pad(i + 1), {size: size * .8, font: F.head, weight: 400, spacing: .1, color: C.rose}), line: letters(root, item, m + 120, y, size, {anchor: 'start', marks: false, seed: 11 + i})}; });
  const corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); kick.attr('opacity', flickerOn(t, .1, .3, 1) * .9); title.show(t, {at: .2, spread: .5}); draw(rule, span(t, .6, .6)); corners(t, 1);
    rows.forEach((r, i) => { const at = 1.1 + i * props.step, current = t < at + props.step || i === n - 1; r.num.attr('opacity', flickerOn(t, at, .25, i) * (current ? 1 : .45)); r.line.show(t, {at, spread: .35, dim: current ? 1 : .42}); });
  }};
}
