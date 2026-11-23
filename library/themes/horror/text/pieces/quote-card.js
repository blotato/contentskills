import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A quotation typed out like a transcript on a typewriter, a thin accent rule down its left edge,
// then who said it. `mark` from other themes is ignored.
export const meta = {duration: 6, live: true};
export const defaults = {
  quote: 'I heard it say my name from the other room', by: 'A NEIGHBOUR', role: 'STATEMENT, AS TOLD',
  labels: ['TRANSCRIPT', 'ON RECORD', '', 'NO. 12'], mark: '', field: 'slate',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field}), {root, W, H, k} = st, m = 130, o = {font: F.type, spacing: .02};
  const {size, lines, pitch} = flow(props.quote, W - m * 2 - 40, H * .34, 84, 40, o, 1.9), n = lines.length, top = H * .47 - n * pitch / 2, total = lines.join(' ').length;
  const bar = hair(root, `M${m - 10} ${top - 20}V${top + n * pitch}`, C.rose, 4, .95), g = root.append('g').attr('mask', st.wear);
  const rows = lines.map((l, i) => txt(g, m + 34, top + capH(size, o) + i * pitch, '', {size, font: F.type, weight: 400, spacing: .02, color: C.bone}));
  const by = letters(root, up(props.by), m + 34, top + n * pitch + 90, 54, {anchor: 'start', seed: 7}), role = txt(root, m + 34, top + n * pitch + 140, up(props.role), {size: 26 + 4 * k, color: C.fog, spacing: .3}), corners = cornerLabels(st, props.labels);
  return {seek(t) {
    st.tick(t); draw(bar, span(t, .1, .5)); const typedN = Math.floor(span(t, .5, Math.min(3, total * .045)) * total); let used = 0;
    rows.forEach((r, i) => { const take = clamp(typedN - used, 0, lines[i].length), last = typedN >= used && typedN < used + lines[i].length + 1; r.text(lines[i].slice(0, take) + (last && typedN < total && blink(t, 4) ? '▌' : '')); used += lines[i].length + 1; });
    const end = .5 + Math.min(3, total * .045); by.show(t, {at: end + .2, spread: .5}); role.attr('opacity', flickerOn(t, end + .8, .3, 2) * .85); corners(t, 1);
  }};
}
