import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A headline that switches on letter by letter in random order under a failing lamp: a small tracked
// line above, one to three short lines, a note and corner labels. One letter per line takes the accent.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['SOMETHING', 'IS WRONG'], kicker: 'Nobody else noticed', note: 'A TRUE STORY\nTOLD AFTER DARK',
  labels: ['PART ONE', 'AFTER DARK', '', 'NO. 26'], foot: ['KEEP THE LIGHTS ON'], field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 96, lines = props.lines.map(up);
  const size = fit(lines, W - m * 2, 132 + 40 * k), head = block(root, lines, W / 2, H * .5, size, {seed: 3});
  const kick = props.kicker ? letters(root, up(oneLine(props.kicker)), W / 2, head.top - 46 - 20 * k, Math.min(40, fit(up(oneLine(props.kicker)), W - m * 2, 40, {font: F.sub, weight: 600, spacing: .3})), {font: F.sub, weight: 600, spacing: .3, marks: false, color: C.fog, seed: 9}) : null;
  const rule = hair(root, `M${W / 2 - 60} ${head.bottom + 54}H${W / 2 + 60}`, C.rose, 3, .9);
  const note = txt(root, W / 2, head.bottom + 120, props.note, {size: 28 + 6 * k, anchor: 'middle', color: C.fog, spacing: .3, leading: 1.6});
  const foot = props.foot?.[0] ? txt(root, W / 2, H - 150 * k - 40, up(props.foot[0]), {size: 26, anchor: 'middle', color: C.bone, spacing: .4, font: F.sub, weight: 600}) : null, corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t, {light: t < .5 ? lamp(t, 8, .9, 6) : 1});
    kick?.show(t, {at: .15, spread: .5}); head.show(t, {at: .6, spread: .9, gap: .35});
    draw(rule, span(t, 1.7, .5)); note.attr('opacity', flickerOn(t, 2, .35, 2) * .9); foot?.attr('opacity', flickerOn(t, 2.5, .3, 4) * .7); corners(t, 1.2);
  }};
}
