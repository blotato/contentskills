import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// One large figure that rolls through wrong digits before it settles, with a tracked line above,
// a label below under a short accent rule, and a note.
export const meta = {duration: 5, live: true};
export const defaults = {
  value: '03:14', kicker: 'EVERY NIGHT AT', label: 'THE SAME KNOCK', note: 'THREE TIMES, THEN NOTHING.\nNOBODY IS EVER THERE.',
  labels: ['LOGGED', 'NO. 01', '', 'ILLUSTRATIVE'], field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, value = String(props.value), size = Math.min(fit(value, W * .74, 520, {spacing: .04}), H * .3), cap = capH(size), cy = H * .47;
  const num = letters(root, value, W / 2, cy + cap / 2, size, {spacing: .04, seed: 5});
  const kick = txt(root, W / 2, cy - cap / 2 - 60, up(oneLine(props.kicker)), {size: 34 + 6 * k, anchor: 'middle', color: C.fog, spacing: .34, weight: 600});
  const rule = hair(root, `M${W / 2 - 50} ${cy + cap / 2 + 70}H${W / 2 + 50}`, C.rose, 3, .9);
  const label = letters(root, up(oneLine(props.label)), W / 2, cy + cap / 2 + 150, Math.min(72, fit(up(oneLine(props.label)), W - 220, 72)), {marks: false, seed: 8});
  const note = txt(root, W / 2, cy + cap / 2 + 240, up(props.note), {size: 26 + 4 * k, anchor: 'middle', color: C.fog, spacing: .28, leading: 1.6}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); kick.attr('opacity', flickerOn(t, .2, .3, 1) * .9); num.show(t, {at: .4, spread: .5});
    num.units.forEach(u => { const final = value[u.at], rolling = /\d/.test(final) && t < 1.1 + u.r2 * .7; u.g.select('text').text(rolling ? Math.floor(hash(step(t, 14), u.at) * 10) : final); });
    draw(rule, span(t, 1.9, .4)); label.show(t, {at: 2, spread: .6}); note.attr('opacity', flickerOn(t, 2.8, .3, 3) * .85); corners(t, 1.4);
  }};
}
