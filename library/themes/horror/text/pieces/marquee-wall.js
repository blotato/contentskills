import {C, F, stage, fieldOf, tone, up, oneLine, clamp, span, mix, easeOut, easeInOut, easeIn, hash, noise, step, lamp, flickerOn, presence, leave, jitter, typed, blink, pad, measure, capH, fit, wrap, flow, txt, letters, block, rough, roughBox, hair, draw, pool, stamp, redact, sheet, brackets, cornerLabels, clipBox, linear} from '../../kit.js';

// A wall of the same few phrases drifting past in the dark, row against row, most of them barely
// lit; one row at a time comes up to full brightness, and stray letters catch the accent.
export const meta = {duration: 6, live: true, loop: true};
export const defaults = {rows: ['IT KNOWS YOUR NAME', 'DO NOT ANSWER', 'STAY IN THE LIGHT', 'COUNT THE DOORS', 'YOU ARE NOT ALONE'], field: 'slate', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, creep: 0}), {root, W, H} = st, n = Math.max(7, Math.round(H / 150)), rh = H / n, size = rh * .5 / capH(1), cap = capH(size);
  const rows = Array.from({length: n}, (_, j) => {
    const str = up(props.rows[j % props.rows.length]) + '   ·   ', unit = measure(str, size, {spacing: .2}), reps = Math.ceil((W + unit * 2) / unit) + 1, g = root.append('g');
    const node = txt(g, 0, j * rh + rh / 2 + cap / 2, str.repeat(reps), {size, font: F.head, weight: 400, spacing: .2, color: C.bone}).style('white-space', 'pre');
    const mark = txt(g, 0, j * rh + rh / 2 + cap / 2, str.trim()[Math.floor(hash(j, 3) * 4)] ?? 'I', {size, font: F.head, weight: 400, spacing: .2, color: C.rose});
    return {g, node, mark, unit, dir: j % 2 ? 1 : -1, at: measure(str.slice(0, Math.floor(hash(j, 3) * 4)), size, {spacing: .2})};
  });
  return {seek(t) {
    st.tick(t); const q = (t / meta.duration) % 1, lit = Math.floor(t / 1.2) % n;
    rows.forEach((r, j) => {
      const shift = (q * (1 + j % 2) * props.speed * r.dir) % 1 * r.unit - r.unit * 1.5;
      r.node.attr('x', shift).selectAll('tspan').attr('x', shift); r.mark.attr('x', shift + r.unit * 2 + r.at).selectAll('tspan').attr('x', shift + r.unit * 2 + r.at);
      const near = j === (lit * 3) % n; r.g.attr('opacity', (near ? 1 : .1 + .12 * hash(j, 5)) * lamp(t, j + 20, .8, .9));
    });
  }};
}
