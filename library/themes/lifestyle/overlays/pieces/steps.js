import {stage, look, C, up, fit, measure, capH, txt, pill, fade, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// A routine in numbered steps, set straight on the footage. Each step fades up on its cue; the
// current one sits on an accent pill while earlier ones fall back to plain cream. Use `times`
// (seconds after the overlay starts) to bring each step in on the word that names it.
// (`x`, `y`) is the top-left corner.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'The morning routine', items: ['Water first', 'Ten slow breaths', 'Walk around the block', 'Then coffee'], times: null, x: 70, y: 90, accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y} = props, row = 84, size = Math.min(44, fit(props.items, 800, 44, {role: 'soft'})), o = {role: 'soft'};
  const soft = soften(root, st), head = txt(soft, x, y + 26, up(props.title), {size: 24, role: 'wide', color: C.cream});
  const at = i => props.times?.[i] ?? .5 + i * 1.0, n = props.items.length;
  const rows = props.items.map((item, i) => {
    const cy = y + 92 + i * row, w = measure(item, size, o) + 132, g = root.append('g'), plate = g.append('path').attr('d', pill(x - 14, cy - 34, w, 68)).attr('fill', ink.accent);
    const dim = soft.append('g'), num = txt(dim, x + 8, cy + 11, String(i + 1).padStart(2, '0'), {size: 28, role: 'wide', color: C.cream}), label = txt(dim, x + 92, cy + capH(size, o) / 2, item, {size, role: 'soft', color: C.cream});
    const lit = g.append('g'); txt(lit, x + 8, cy + 11, String(i + 1).padStart(2, '0'), {size: 28, role: 'wide', color: ink.on}); txt(lit, x + 92, cy + capH(size, o) / 2, item, {size, role: 'soft', color: ink.on});
    return {g, dim, plate, lit, i};
  });
  return {
    seek(t) {
      const out = leave(t, props.life, .5); head.attr('opacity', fade(t, .1, .5) * (1 - out));
      rows.forEach(r => { const since = t - at(r.i), next = r.i < n - 1 ? t - at(r.i + 1) : -1, on = fade(since, 0, .45), cur = on * (1 - fade(next, 0, .45)), slide = (1 - glide(span(since, 0, .7))) * -26;
        r.dim.attr('opacity', on * (1 - cur) * (1 - out) * .92).attr('transform', `translate(${slide} 0)`); r.g.attr('opacity', cur * (1 - out)).attr('transform', `translate(${slide} 0)`); });
    },
  };
}
