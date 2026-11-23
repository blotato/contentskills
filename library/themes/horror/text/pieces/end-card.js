import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// The sign-off, on black: the lines come up, a lamp somewhere behind them catches and fails,
// then the call to action and the handle. `strip` is the small line at the very bottom.
export const meta = {duration: 6, live: true};
export const defaults = {
  lines: ['FOLLOW', 'FOR MORE'], action: 'A NEW STORY EVERY WEEK', handle: '@YOURNAME', strip: 'SLEEP WELL',
  labels: ['THE END', 'OR IS IT'], field: 'void',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field ?? 'void'}), {root, back, W, H, k} = st, m = 110, lines = props.lines.map(up);
  const flare = back.append('ellipse').attr('cx', W * .5).attr('cy', H * .2).attr('rx', W * .7).attr('ry', H * .3).attr('fill', linear(st, [[0, '#9fb4d8', .5], [1, '#9fb4d8', 0]]));
  const size = fit(lines, W - m * 2, 150 + 40 * k), head = block(root, lines, W / 2, H * .47, size, {seed: 6});
  const action = txt(root, W / 2, head.bottom + 84, up(props.action), {size: 30 + 6 * k, anchor: 'middle', color: C.fog, spacing: .32, weight: 600});
  const rule = hair(root, `M${W / 2 - 50} ${head.bottom + 130}H${W / 2 + 50}`, C.rose, 3, .9);
  const handle = letters(root, props.handle ?? '', W / 2, head.bottom + 220, Math.min(72, fit(props.handle ?? '', W - m * 2, 72)), {marks: false, color: C.rose, seed: 9});
  const strip = txt(root, W / 2, H - 130 * k - 30, up(props.strip), {size: 24 + 4 * k, anchor: 'middle', color: C.fog, spacing: .5}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); const f = step(t, 10), on = t > 1.4 && hash(f, 4) < .28; flare.attr('opacity', on ? .16 + hash(f, 5) * .2 : 0);
    head.show(t, {at: .3, spread: .9, gap: .4}); action.attr('opacity', flickerOn(t, 1.8, .3, 1) * .9); draw(rule, span(t, 2.2, .4)); handle.show(t, {at: 2.5, spread: .5});
    strip.attr('opacity', flickerOn(t, 3.4, .3, 3) * .7); corners(t, 1.2);
  }};
}
