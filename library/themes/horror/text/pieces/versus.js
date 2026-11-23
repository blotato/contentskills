import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// Two sides, one above the other, split by a hairline with a small mark in its gap. The upper
// side is lit cold, the lower one warm-dark; each has a note.
export const meta = {duration: 5, live: true};
export const defaults = {a: 'WHAT THEY SAID', b: 'WHAT THEY SAW', mark: 'VS', aNote: 'THE OFFICIAL VERSION', bNote: 'THE ONE NOBODY WROTE DOWN', labels: ['TWO ACCOUNTS', 'PICK ONE', '', 'ILLUSTRATIVE'], fields: ['cold', 'blood']};

export function mount(el, props = defaults) {
  const st = stage(el, {field: 'void'}), {root, back, W, H, k} = st, m = 110, mid = H / 2, A = fieldOf(props.fields?.[0] ?? 'cold'), B = fieldOf(props.fields?.[1] ?? 'blood');
  const glow = (y, c) => back.append('ellipse').attr('cx', W / 2).attr('cy', y).attr('rx', W * .8).attr('ry', H * .26).attr('fill', linear(st, [[0, c.lift, 0], [.5, c.lift, 1], [1, c.lift, 0]])), ga = glow(H * .27, A), gb = glow(H * .73, B);
  const size = Math.min(fit([up(props.a), up(props.b)], W - m * 2, 150), H * .09), cap = capH(size);
  const a = letters(root, up(props.a), W / 2, H * .29 + cap / 2, size, {seed: 2, accent: C.cold}), b = letters(root, up(props.b), W / 2, H * .71 + cap / 2, size, {seed: 7});
  const an = txt(root, W / 2, H * .29 + cap / 2 + 76, up(props.aNote), {size: 28 + 4 * k, anchor: 'middle', color: C.fog, spacing: .3}), bn = txt(root, W / 2, H * .71 + cap / 2 + 76, up(props.bNote), {size: 28 + 4 * k, anchor: 'middle', color: C.fog, spacing: .3});
  const l1 = hair(root, `M${W / 2 - 70} ${mid}H${m - 40}`, C.bone, 2, .5), l2 = hair(root, `M${W / 2 + 70} ${mid}H${W - m + 40}`, C.bone, 2, .5);
  const mark = txt(root, W / 2 + 4, mid + 15, up(props.mark), {size: 44, font: F.head, weight: 400, anchor: 'middle', color: C.rose, spacing: .2}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); ga.attr('opacity', lamp(t, 3, .7, 1.4) * span(t, 0, .2)); gb.attr('opacity', lamp(t, 9, .7, 1.2) * flickerOn(t, 1.3, .3, 2));
    a.show(t, {at: .3, spread: .6}); an.attr('opacity', flickerOn(t, 1, .3, 1) * .85); draw(l1, span(t, .9, .5)); draw(l2, span(t, .9, .5)); mark.attr('opacity', flickerOn(t, 1.2, .3, 5));
    b.show(t, {at: 1.6, spread: .6}); bn.attr('opacity', flickerOn(t, 2.4, .3, 3) * .85); corners(t, 1.5);
  }};
}
