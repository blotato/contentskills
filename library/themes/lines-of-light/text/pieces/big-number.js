import {C, stage, up, oneLine, span, ease, io, hash, light, ring, rays, flash, fire, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// A figure inside a dial of light. The red dot fires into the top of the dial, the ring opens both
// ways from there and its ticks draw out; the digits roll and land (orange, red, white) and a blue
// flash marks the lock. A tracked kicker above, a label and a mono note below.
export const meta = {duration: 5, live: true};
export const defaults = {
  value: '2026', kicker: 'MARK THE YEAR', label: 'EVERYTHING CLICKS', note: 'SMALL STEPS, STACKED DAILY,\nLOOK LIKE LUCK FROM OUTSIDE',
  labels: ['', 'NO. 01', '', 'ILLUSTRATIVE'], field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .42]}), {root, W, H, k} = st, value = String(props.value ?? ''), o = {track: .1};
  const cy = H * (st.sq ? .45 : .42), R = Math.min(W * .4, H * .21), size = Math.min(fit(value, R * 1.5, 240, o), R * .7), cap = capH(size), [ox, oy] = origin(st);
  const shot = fire(root, [[ox, oy], [ox, cy - R], [W / 2, cy - R]], {dur: 1.1, hold: 1.4});
  const dial = ring(root, W / 2, cy, R, {from: -90, width: 2.6}), inner = ring(root, W / 2, cy, R - 18, {from: -90, width: 1.2, echo: false});
  const ticks = rays(root, W / 2, cy, R + 14, R + 34, 60, -90, 270, {width: 1.4, fade: 0, echo: false}); ticks.forEach((r, i) => { r.opacity(i % 5 ? .45 : 1); r.d = Math.min(i, 60 - i) / 30; });
  const num = title(root, value, W / 2, cy + cap / 2, size, o);
  const kick = props.kicker ? title(root, up(oneLine(props.kicker)), W / 2, cy - R - 70 - 20 * k, Math.min(26 + 6 * k, fit(up(oneLine(props.kicker)), W - 200, 32, {track: .42})), {land: false, color: C.dim, track: .42}) : null;
  const lsize = Math.min(44 + 10 * k, fit(up(oneLine(props.label)), W - 180, 54, {track: .28}));
  const label = props.label ? title(root, up(oneLine(props.label)), W / 2, cy + R + 70 + 30 * k + capH(lsize), lsize, {track: .28}) : null;
  const note = props.note ? mono(root, W / 2, cy + R + 150 + 50 * k + capH(lsize), up(props.note), {size: 22 + 6 * k, anchor: 'middle', track: .14, opacity: 0, leading: 1.7}) : null;
  const blue = flash(root, W / 2, cy, {color: 'blue', r: R * 1.3}), corners = cornerLabels(st, props.labels), T = shot.arrive, lock = T + 2.1;
  return {seek(t) {
    st.tick(t); shot.seek(t);
    const q = io(span(t, T, 1.8)); dial.draw(q); inner.draw(io(span(t, T + .3, 1.8)));
    ticks.forEach(r => r.draw(ease(span(t, T + .2 + r.d * 1.5, .5))));
    const a = ease(span(t, T + .7, 1.4)), rolling = t < lock - .3;
    const shown = rolling ? value.replace(/\d/g, (d, i) => String(Math.floor(hash(Math.floor(t * 14), i + 3) * 10))) : value;
    num.node.text(shown); num.glow.text(shown); num.show(a);
    kick?.show(ease(span(t, T + .2, .9)), .9); label?.show(ease(span(t, lock, 1)));
    blue.set(t > lock ? .55 * (1 - ease((t - lock) / 1.2)) : 0); note?.attr('opacity', .85 * ease(span(t, lock + .5, .8))); corners(t, T);
  }};
}
