import {C, stage, up, oneLine, span, ease, io, light, flash, fire, title, mono, flow, capH, fit, cornerLabels, origin} from '../../kit.js';

// A quotation. The red dot fires to a pair of quote marks drawn in light; a rule draws down the
// left of the quote and each line lands as the light passes it. The source lands under a short
// rule, with a mono line for who they are.
export const meta = {duration: 6, live: true};
export const defaults = {
  quote: 'Done beats perfect every single time', by: 'NOTE TO SELF', role: 'PINNED SINCE DAY ONE',
  labels: ['', 'QUOTED', '', 'NO. 12'], field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .45]}), {root, W, H, k} = st, m = 110, o = {track: .18};
  const {size, lines, pitch} = flow(up(oneLine(props.quote)), W - m * 2 - 30, H * (st.sq ? .36 : .38), 86, 28, o, 1.85);
  const cap = capH(size), top = H * .46 - (lines.length * pitch - (pitch - cap)) / 2, x0 = m + 30, [ox, oy] = origin(st), qy = top - 70 - 20 * k;
  const marks = [0, 1].map(i => light(root, [[x0 + i * 34 + 14, qy - 30], [x0 + i * 34, qy + 16]], {width: 3.4}));
  const shot = fire(root, [[ox, oy], [ox, qy - 7], [x0 - 14, qy - 7]], {dur: 1, hold: 1.2});
  const bottom = top + (lines.length - 1) * pitch + cap, rule = light(root, [[m, top - 10], [m, bottom + 14]], {width: 2.4});
  const rows = lines.map((l, i) => title(root, l, x0, top + cap + i * pitch, size, {...o, anchor: 'start'}));
  const by = up(props.by ?? ''), bsize = Math.min(34 + 6 * k, fit(by, W - x0 - m, 40, {track: .3})), byY = bottom + 110 + 20 * k;
  const short = light(root, [[x0, byY - bsize - 34], [x0 + 80, byY - bsize - 34]], {width: 2.4});
  const who = by ? title(root, by, x0, byY, bsize, {anchor: 'start', track: .3}) : null;
  const role = props.role ? mono(root, x0, byY + 56, up(props.role), {size: 22 + 6 * k, track: .16, opacity: 0, color: C.dim}) : null;
  const blue = flash(root, x0, qy, {color: 'blue', r: 150}), corners = cornerLabels(st, props.labels), T = shot.arrive, D = 1.4 + .25 * lines.length;
  return {seek(t) {
    st.tick(t); shot.seek(t); marks.forEach((q, i) => q.draw(ease(span(t, T + i * .15, .6)))); blue.set(t > T ? .5 * (1 - ease((t - T) / 1)) : 0);
    rule.draw(io(span(t, T + .3, D))); rows.forEach((r, i) => r.show(ease(span(t, T + .5 + D * (i + .4) / lines.length, 1.1))));
    const e = T + .5 + D; short.draw(io(span(t, e, .7))); who?.show(ease(span(t, e + .3, 1))); role?.attr('opacity', .85 * ease(span(t, e + .8, .8))); corners(t, T);
  }};
}
