import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A film-leader countdown: each number cuts in under a flash of the lamp inside a thin ring with
// a sweeping hand, then the last beat shows the `go` word. Scratches run heavier than usual.
export const meta = {duration: 4};
export const defaults = {from: 3, go: 'RUN', label: 'IT STARTS IN', note: 'STAY WHERE YOU ARE', labels: ['STAND BY', 'REEL 01', '', 'TAKE 01'], fields: ['slate', 'slate', 'slate', 'blood']};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.fields?.at(-1) === 'blood' ? 'slate' : props.fields?.[0], damage: 4, creep: 0}), {root, W, H, k} = st, steps = props.from + 1, beat = meta.duration / steps, cy = H * .5, r = Math.min(W * .36, H * .22);
  const ring = root.append('g'); ring.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', r).attr('fill', 'none').attr('stroke', C.fog).attr('stroke-width', 2).attr('opacity', .5); ring.append('circle').attr('cx', W / 2).attr('cy', cy).attr('r', r * .86).attr('fill', 'none').attr('stroke', C.fog).attr('stroke-width', 1).attr('opacity', .35);
  hair(ring, `M${W / 2 - r * 1.25} ${cy}H${W / 2 + r * 1.25}M${W / 2} ${cy - r * 1.25}V${cy + r * 1.25}`, C.fog, 1, .3); const hand = hair(ring, '', C.bone, 3, .7), sweep = ring.append('path').attr('fill', C.bone).attr('opacity', .05);
  const beats = Array.from({length: steps}, (_, i) => { const last = i === steps - 1, value = last ? up(props.go) : String(props.from - i), size = Math.min(fit(value, last ? W * .7 : r * 1.2, r * 1.5), r * 1.5), g = root.append('g'); return {g, last, l: letters(g, value, W / 2, cy + capH(size) / 2, size, {seed: i + 2, marks: last ? 1 : false, color: C.bone})}; });
  const label = txt(root, W / 2, cy - r - 80, up(props.label), {size: 32 + 6 * k, anchor: 'middle', color: C.fog, spacing: .4, weight: 600}), note = txt(root, W / 2, cy + r + 110, up(props.note), {size: 28 + 4 * k, anchor: 'middle', color: C.fog, spacing: .3}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    const i = Math.min(steps - 1, Math.floor(t / beat)), q = t / beat - i, last = i === steps - 1; st.tick(t, {light: q < .08 ? .35 : 1});
    beats.forEach((b, j) => { b.g.attr('opacity', j === i ? 1 : 0); if (j === i) b.l.show(q * beat, {at: 0, spread: b.last ? .3 : 0}); });
    const a = q * Math.PI * 2 - Math.PI / 2; ring.attr('opacity', last ? .25 : 1); hand.attr('d', `M${W / 2} ${cy}L${W / 2 + Math.cos(a) * r} ${cy + Math.sin(a) * r}`);
    sweep.attr('d', `M${W / 2} ${cy}L${W / 2} ${cy - r}A${r} ${r} 0 ${q > .5 ? 1 : 0} 1 ${W / 2 + Math.cos(a) * r} ${cy + Math.sin(a) * r}Z`);
    label.attr('opacity', last ? 0 : .9); note.attr('opacity', .8); corners(t, 0);
  }};
}
