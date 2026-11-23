import {C, stage, up, oneLine, span, ease, io, light, flash, fire, title, mono, flow, measure, capH, fit, cornerLabels, origin} from '../../kit.js';

// A sentence in tracked capitals. The red dot fires a line to the top of a vertical rule at the left
// of the block; as the rule draws down past each line, that line's words land one after another.
// The words in `emphasis` land last and get an underline of light opening from their centre.
export const meta = {duration: 6, live: true};
export const defaults = {
  statement: 'Good ideas get better the moment you ship them', emphasis: ['SHIP'], tag: 'FIELD NOTE 07',
  labels: ['', 'OBSERVED', '', 'KEEP GOING'], foot: 'SHIP IT, THEN FIX IT', field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .45]}), {root, W, H, k} = st, m = 110, o = {track: .2};
  const want = [].concat(props.emphasis ?? props.accent ?? []).map(w => up(w).replace(/[^A-Z0-9']/g, '')).filter(Boolean);
  const {size, lines, pitch} = flow(up(oneLine(props.statement)), W - m * 2 - 30, H * (st.sq ? .44 : .4), 76, 30, o, 2);
  const cap = capH(size), top = H * (st.sq ? .5 : .47) - (lines.length * pitch - (pitch - cap)) / 2, x0 = m + 30, [ox, oy] = origin(st);
  const words = [], unders = [];
  lines.forEach((line, li) => {
    const y = top + cap + li * pitch; let at = 0;
    for (const word of line.split(' ')) {
      const idx = line.indexOf(word, at); at = idx + word.length;
      const left = x0 + (idx ? measure(line.slice(0, idx), size, o) + o.track * size : 0), w = measure(word, size, o), hot = want.includes(word.replace(/[^A-Z0-9']/g, ''));
      words.push({node: title(root, word, left + w / 2, y, size, o), li, hot});
      if (hot) unders.push([light(root, [[left + w / 2, y + 22], [left - 6, y + 22]], {width: 2.4}), light(root, [[left + w / 2, y + 22], [left + w + 6, y + 22]], {width: 2.4})]);
    }
  });
  const bottom = top + (lines.length - 1) * pitch + cap, shot = fire(root, [[ox, oy], [ox, top - 30], [m, top - 30]], {dur: 1, hold: 1.4});
  const rule = light(root, [[m, top - 30], [m, bottom + 30]], {width: 2.4});
  const tag = props.tag ? title(root, up(props.tag), m, top - 90 - 20 * k, Math.min(26 + 4 * k, fit(up(props.tag), W - m * 2, 30, {track: .42})), {anchor: 'start', land: false, color: C.dim, track: .42}) : null;
  const foot = props.foot ? mono(root, x0, bottom + 110 + 20 * k, '↳ ' + up(props.foot), {size: 24 + 6 * k, track: .14, opacity: 0}) : null;
  const blue = flash(root, W / 2, (top + bottom) / 2, {color: 'blue', r: 300}), corners = cornerLabels(st, props.labels), T = shot.arrive, D = 1.6 + .3 * lines.length;
  const plain = words.filter(w => !w.hot), hots = words.filter(w => w.hot), end = T + D + .3;
  return {seek(t) {
    st.tick(t); shot.seek(t); rule.draw(io(span(t, T, D))); tag?.show(ease(span(t, T, .8)), .9);
    plain.forEach((w, i) => w.node.show(ease(span(t, T + .25 + D * (w.li + .5) / lines.length + (i % 6) * .06, 1))));
    hots.forEach((w, i) => w.node.show(ease(span(t, end + i * .2, 1))));
    unders.forEach((u, i) => u.forEach(l => l.draw(io(span(t, end + .5 + i * .2, 1)))));
    blue.set(hots.length && t > end + .8 ? .4 * (1 - ease((t - end - .8) / 1.2)) : 0);
    foot?.attr('opacity', .85 * ease(span(t, end + 1, .8))); corners(t, T);
  }};
}
