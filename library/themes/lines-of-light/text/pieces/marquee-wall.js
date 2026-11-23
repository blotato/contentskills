import {C, stage, group, up, span, ease, io, hash, light, title, fit, capH} from '../../kit.js';

// Rows of phrases drifting past each other in dim tracked capitals, each row under a hairline of
// light. One row at a time comes up: it lands orange, burns red, cools to white, then settles back.
export const meta = {duration: 6, live: true};
export const defaults = {rows: ['KEEP MOVING', 'NO PAUSE', 'LOOP IT', 'STAY LOUD', 'ONE MORE TIME'], field: 'teal', speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .5]}), {root, W, H} = st, list = [].concat(props.rows ?? []).map(up).filter(Boolean);
  const n = Math.max(4, Math.round(H / 250)), rh = (H - 160) / n, y0 = 80, size = Math.min(rh * .24 / .72, fit(list, W * .8, 80, {track: .3})), cap = capH(size);
  const rows = Array.from({length: n}, (_, i) => {
    const text = list[i % list.length], y = y0 + (i + .5) * rh, g = group(root), unit = text + '   ·   ', str = unit.repeat(5), dir = i % 2 ? -1 : 1;
    const rule = light(root, i % 2 ? [[W + 10, y - rh / 2], [-10, y - rh / 2]] : [[-10, y - rh / 2], [W + 10, y - rh / 2]], {width: 1.4, echo: i % 3 === 0});
    const line = title(g, str, 0, y + cap / 2, size, {anchor: 'start', track: .3});
    const lineDim = title(g, str, 0, y + cap / 2, size, {anchor: 'start', track: .3, land: false, color: C.dim});
    return {g, rule, line, lineDim, dir, rate: (40 + hash(i, 4) * 50) * (props.speed ?? 1), shift: -hash(i, 9) * 600, at: .9 + ((i * 3) % n) * .7};
  });
  return {seek(t) {
    st.tick(t);
    rows.forEach((r, i) => {
      r.g.attr('transform', `translate(${r.shift + r.dir * t * r.rate - (r.dir < 0 ? 0 : 400)} 0)`);
      r.rule.draw(io(span(t, i * .12, 1.6)));
      const a = ease(span(t, r.at, .9)), cool = ease(span(t, r.at + 1.3, 1));
      r.lineDim.show(1, a > 0 ? 0 : .45 * ease(span(t, .2 + i * .12, 1)));
      r.line.show(a, a > 0 ? 1 - .6 * cool : 0);
    });
  }};
}
