import {C, stage, group, up, oneLine, span, ease, io, hash, light, ring, rays, flash, fire, titles, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// The sign-off. The red dot fires into a small ring, which opens with a plus sign inside; a
// sunburst of uneven rays radiates from it and blinks blue, then the call to action lands below,
// the handle in light, and a dim strip at the foot.
export const meta = {duration: 5.5, live: true};
export const defaults = {
  lines: ['FOLLOW', 'FOR MORE'], action: 'NEW VIDEO EVERY WEEK', handle: '@YOURNAME', strip: 'SEE YOU NEXT TIME',
  labels: ['', 'THE END', '', ''], field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .34]}), {root, W, H, k} = st, m = 100, cy = H * (st.sq ? .25 : .32), r = 58 + 26 * k, [ox, oy] = origin(st);
  const shot = fire(root, [[ox, oy], [ox, cy], [W / 2 - r, cy]], {dur: 1, hold: 1.3});
  const circle = ring(root, W / 2, cy, r, {from: 180, width: 2.8}), plus = [light(root, [[W / 2 - r * .32, cy], [W / 2 + r * .32, cy]], {width: 2.6}), light(root, [[W / 2, cy - r * .32], [W / 2, cy + r * .32]], {width: 2.6})];
  const burst = rays(root, W / 2, cy, r * 1.45, r * 1.45 + 150 + 120 * k, 40, 0, 360, {width: 1.8, fade: 0});
  burst.forEach((b, i) => { const L = Math.min(cy - (st.sq ? 100 : 40), r * 1.45 + (50 + hash(i, 7) * (90 + 140 * k))), a = i / 40 * Math.PI * 2; b.set([[W / 2 + Math.cos(a) * r * 1.45, cy + Math.sin(a) * r * 1.45], [W / 2 + Math.cos(a) * L, cy + Math.sin(a) * L]]); b.opacity(.5 + hash(i, 3) * .5); b.d = hash(i, 11); });
  // Everything below the burst is laid out from the burst's longest possible ray, so the action line never touches it
  // (square cards included): burst, gap, action line, gap, headline.
  const reach = Math.min(cy - (st.sq ? 100 : 40), r * 1.45 + 50 + 90 + 140 * k), aSize = props.action ? Math.min(22 + 6 * k, fit(up(props.action), W - m * 2, 28, {track: .4})) : 0;
  const ay = cy + reach + 40 + 16 * k + aSize * .75, lines = [].concat(props.lines ?? []).map(up), size = Math.min(fit(lines, W - m * 2, 76, {track: .32}), 76);
  const hg = group(root), head = titles(hg, lines, W / 2, 0, size, {track: .32}), dy = (props.action ? ay + 44 + 12 * k : cy + reach + 50 + 20 * k) - head.top;
  hg.attr('transform', `translate(0 ${dy})`); head.top += dy; head.bottom += dy;
  const action = props.action ? title(root, up(props.action), W / 2, ay, aSize, {land: false, color: C.dim, track: .4}) : null;
  const handle = props.handle ? mono(root, W / 2, head.bottom + 90 + 20 * k, props.handle, {size: 32 + 8 * k, anchor: 'middle', track: .12, opacity: 0, weight: 500}) : null;
  const strip = props.strip && H - 130 - 30 * k > head.bottom + 160 ? title(root, '↳ ' + up(oneLine(props.strip)), W / 2, H - 130 - 30 * k, 20 + 6 * k, {land: false, color: C.dim, track: .4}) : null;
  const blue = flash(root, W / 2, cy, {color: 'blue', r: r * 3.4}), corners = cornerLabels(st, props.labels), T = shot.arrive, B = T + 1.1;
  return {seek(t) {
    st.tick(t); shot.seek(t); circle.draw(io(span(t, T, 1.1))); plus.forEach((p, i) => p.draw(ease(span(t, T + .7 + i * .15, .6))));
    burst.forEach(b => b.draw(ease(span(t, B + b.d * .6, 1.5)))); blue.set(t > B + .4 ? .6 * (1 - ease((t - B - .4) / 1.3)) : 0);
    action?.show(ease(span(t, B + .6, .9)), .9); head.show(t, B + .9, .35, 1.1); handle?.attr('opacity', .9 * ease(span(t, B + 2, .8)));
    strip?.show(ease(span(t, B + 2.4, .8)), .8); corners(t, T);
  }};
}
