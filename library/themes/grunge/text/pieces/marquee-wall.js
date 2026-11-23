import {C, stage, look, sheet, strip, capH, hash, hold, jit} from '../../kit.js';

// A wall of pasted strips, each scrolling its own way in held steps: bare type on the wall,
// bone paper with black type, one strip in the accent. Rows are slapped on one after another.
export const meta = {duration: 6, live: true};
export const defaults = {rows: ['KEEP MOVING', 'NO PAUSE', 'LOOP IT', 'STAY LOUD', 'ONE MORE TIME'], accent: 'red', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {tall: true}), {root, W, H} = st, ink = look(props.accent), n = Math.max(5, Math.round(H / 200)), rh = H / n;
  const kinds = [0, 1, 0, 2, 3, 1, 0, 2, 1, 3];
  const rows = Array.from({length: n}, (_, i) => {
    const kind = kinds[i % kinds.length], role = i % 3 === 1 ? 'wide' : i % 3 === 2 ? 'cond' : 'head', size = rh * (role === 'cond' ? .62 : .46) / capH(1, {role}), cap = capH(size, {role}), g = root.append('g'), inner = g.append('g');
    const fill = [null, C.bone, ink.accent, C.char][kind], color = [C.bone, C.soot, ink.on, ink.accent][kind];
    if (fill) sheet(inner, {fill, seed: i + 2, sides: 'tb', amp: 8, rim: kind === 1 ? C.white : null}).set(-80, -rh * .42, W + 160, rh * .84);
    const text = strip(inner, st, props.rows[i % props.rows.length], cap / 2, size, {color, role, sepColor: kind === 0 ? ink.accent : color});
    return {g, text, tilt: (hash(i, 3) - .5) * 3.4, dir: i % 2 ? 1 : -1, rate: 150 + 90 * hash(i, 7)};
  });
  return {seek(t) {
    const s = st.tick(t), h = hold(t);
    rows.forEach((row, i) => {
      const j = jit(s, i, 2, .25), on = h >= .08 + i * .09;
      row.g.attr('transform', `translate(${j.x} ${(i + .5) * rh + j.y}) rotate(${row.tilt + j.r} ${W / 2} 0)`).attr('opacity', on ? 1 : 0);
      row.text.set(row.dir * h * row.rate * props.speed + i * 137);
    });
  }};
}
