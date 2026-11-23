import {C, stage, up, oneLine, span, ease, io, light, flash, fire, title, mono, fit, capH, pad, cornerLabels, origin} from '../../kit.js';

// A numbered list on a spine of light. The red dot fires down into the spine; as it draws down,
// a branch of light reaches out to each item in turn (every `step` seconds) and the item lands
// beside it with its number above. Title and kicker sit at the top.
export const meta = {duration: 6.5, live: true};
export const defaults = {
  title: 'THE PLAN', kicker: 'FOUR MOVES', items: ['FIND THE HOOK', 'WRITE IT SHORT', 'CUT THE FLUFF', 'POST IT TODAY'],
  labels: ['', 'TODAY', '', 'IN THIS ORDER'], step: .8, field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.3, .5]}), {root, W, H, k} = st, items = [].concat(props.items ?? []).map(up), n = Math.max(1, items.length);
  const m = 96, bx = m + 170, tsize = Math.min(64, fit(up(props.title), W - m * 2, 64, {track: .32})), ty = H * (st.sq ? .2 : .17) + 30 * k;
  const head = title(root, up(props.title), W / 2, ty, tsize, {track: .32});
  const kick = props.kicker ? title(root, up(oneLine(props.kicker)), W / 2, ty - tsize - 34, 24 + 6 * k, {land: false, color: C.dim, track: .5}) : null;
  const top = ty + 90 + 30 * k, bottom = H * (st.sq ? .9 : .82), pitch = (bottom - top) / n, size = Math.min(fit(items, W - bx - 60 - m * .2, 52, {track: .2}), pitch * .3 / .72);
  const [ox, oy] = origin(st), spine = light(root, [[m, top], [m, bottom - pitch * .3]], {width: 2.2});
  const shot = fire(root, [[ox, oy], [ox, top - 20], [m, top - 20], [m, top]], {dur: 1, hold: 1.2});
  const rows = items.map((item, i) => {
    const y = top + pitch * (i + .5);
    return {y, bars: [-7, 0, 7].map((dy, j) => light(root, [[m, y + dy], [bx - 20, y + dy]], {width: j === 1 ? 3 : 1.8, echo: j === 1})),
      num: mono(root, bx, y - size - 18, pad(i + 1), {size: 22 + 6 * k, track: .3, opacity: 0}),
      line: title(root, item, bx, y + size * .36, size, {anchor: 'start', track: .2}), blue: flash(root, bx - 20, y, {color: 'blue', r: 90})};
  });
  const corners = cornerLabels(st, props.labels), T = shot.arrive, step = props.step ?? .8;
  return {seek(t) {
    st.tick(t); shot.seek(t); head.show(ease(span(t, .3, 1.1))); kick?.show(ease(span(t, .2, .9)), .85);
    spine.draw(io(span(t, T, step * n + .4)));
    rows.forEach((r, i) => {
      const at = T + .3 + i * step; r.bars.forEach((b, j) => b.draw(ease(span(t, at + j * .05, .7))));
      r.blue.set(t > at + .6 ? .5 * (1 - ease((t - at - .6) / .9)) : 0); r.num.attr('opacity', .8 * ease(span(t, at + .5, .5))); r.line.show(ease(span(t, at + .5, 1)));
    });
    corners(t, T);
  }};
}
