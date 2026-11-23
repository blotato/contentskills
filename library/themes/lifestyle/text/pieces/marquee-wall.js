import {stage, C, capH, strip, up, fade, drift} from '../../kit.js';

// A wall of slow marquee rows, each drifting the opposite way to its neighbours: solid ink rows,
// outlined rows, and one or two on a band of the accent colour. Calm enough to sit behind another
// piece as a background. `rows` are the phrases; `speed` scales how fast they travel.
export const meta = {duration: 6, live: true};
export const defaults = {rows: ['TAKE IT SLOW', 'STAY A WHILE', 'GOOD LIGHT', 'FRESH AIR', 'EASY DOES IT'], accent: 'leaf', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'title', accent: props.accent}), {root, W, H, ink} = st, n = Math.max(5, Math.round(H / 215)), rh = H / n, size = rh * .6 / capH(1), cap = capH(size);
  const rows = Array.from({length: n}, (_, i) => {
    const kind = i % 4 === 1 ? 'band' : i % 2 ? 'solid' : 'line', y = i * rh, g = root.append('g');
    if (kind === 'band') g.append('rect').attr('x', -10).attr('y', y + rh * .08).attr('width', W + 20).attr('height', rh * .84).attr('fill', i % 8 === 1 ? ink.accent : C.ink);
    const s = strip(g, st, up(props.rows[i % props.rows.length]), y + rh / 2 + cap / 2, size, {color: kind === 'band' ? (i % 8 === 1 ? ink.on : C.cream) : kind === 'solid' ? C.ink : C.soft, outline: kind === 'line' ? 2.5 : 0, sepColor: kind === 'band' ? C.cream : ink.accent});
    return {g, s, dir: i % 2 ? -1 : 1, v: 34 + (i * 37 % 5) * 9};
  });
  return {
    seek(t) {
      rows.forEach((r, i) => { r.s.set(r.dir * (t * r.v * props.speed + 400 + i * 130)); r.g.attr('opacity', fade(t, i * .1, .7)); });
      root.attr('transform', `translate(${W / 2} ${H / 2}) scale(${drift(t, .03)}) translate(${-W / 2} ${-H / 2})`);
    },
  };
}
