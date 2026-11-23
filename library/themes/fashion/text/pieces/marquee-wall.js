import {stage, capH, strip, up, flat, fade} from '../../kit.js';

// A wall of words, kept quiet: rows of heavy caps cross the field slowly in alternate
// directions, drawn as hairline outlines; only the middle row is solid white.
export const meta = {duration: 5, live: true, loop: false};
export const defaults = {rows: ['NEW SEASON', 'IN MOTION', 'THE EDIT', 'FIRST LOOK', 'ON FILM'], field: 'noir', accent: 'poppy', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', field: props.field, accent: props.accent}), {root, W, H, ink} = st, n = Math.max(5, Math.round(H / 250)) | 1, rh = H / n, size = rh * .46 / capH(1), cap = capH(size), mid = (n - 1) / 2;
  const rows = Array.from({length: n}, (_, i) => {
    const solid = i === mid, s = strip(root, st, up(flat(props.rows[i % props.rows.length])), rh * (i + .5) + cap / 2, size, {color: ink.head, outline: solid ? 0 : 1.6, gap: size * .8});
    return {s, solid, dir: i % 2 ? -1 : 1, i};
  });
  return {
    seek(t) {
      st.tick(t);
      rows.forEach(r => { r.s.set(r.dir * (t * 42 * props.speed + 300) + r.i * 137); r.s.g.attr('opacity', fade(t, Math.abs(r.i - mid) * .1, .5) * (r.solid ? 1 : .42)); });
    },
  };
}
