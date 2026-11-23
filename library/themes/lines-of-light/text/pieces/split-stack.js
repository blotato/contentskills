import {C, stage, up, oneLine, span, ease, io, light, flash, pulse, fire, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// Two words stacked either side of a line of light. The red dot fires into the line's left end, the
// line draws across and the top word lands; a red pulse then runs the line (the cause) and, where it
// arrives, a blue flash lands the bottom word (the result).
export const meta = {duration: 5.5, live: true};
export const defaults = {
  top: 'THINK', bottom: 'BIGGER', caption: 'START BEFORE\nYOU FEEL READY', note: 'THE FIRST DRAFT CAN BE BAD',
  labels: ['', 'MINDSET', 'NOTES TO SELF', 'PG. 04'], field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .48]}), {root, W, H, k} = st, m = 90, A = up(props.top), B = up(props.bottom), o = {track: .26};
  const size = Math.min(fit([A, B], W - m * 2, 200, o), H * .15), cap = capH(size), cy = H * .47, gap = 56 + 30 * k, [ox, oy] = origin(st);
  const shot = fire(root, [[ox, oy], [ox, cy], [m, cy]], {dur: 1, hold: 1.6});
  const line = light(root, [[m, cy], [W - m, cy]], {width: 2.8}), ends = [m, W - m].map(x => light(root, [[x, cy - 22], [x, cy + 22]], {width: 2}));
  const run = pulse(root, line), blue = flash(root, W - m, cy, {color: 'blue', r: 220});
  const top = title(root, A, W / 2, cy - gap, size, o), bottom = title(root, B, W / 2, cy + gap + cap, size, o);
  const caption = props.caption ? mono(root, W / 2, cy + gap + cap + 80 + 10 * k, up(props.caption), {size: 24 + 6 * k, anchor: 'middle', track: .14, opacity: 0, leading: 1.7}) : null;
  const note = props.note ? title(root, '↳ ' + up(oneLine(props.note)), W / 2, H - 150 - 30 * k, Math.min(20 + 6 * k, fit('↳ ' + up(oneLine(props.note)), W - m * 2, 26, {track: .36})), {land: false, color: C.dim, track: .36}) : null;
  const corners = cornerLabels(st, props.labels), T = shot.arrive, P = T + 1.5, hit = P + 1;
  return {seek(t) {
    st.tick(t); shot.seek(t);
    line.draw(io(span(t, T, 1.5))); ends.forEach((e, i) => e.draw(ease(span(t, T + i * 1.2, .5))));
    top.show(ease(span(t, T + .3, 1.1))); run(span(t, P, 1));
    blue.set(t > hit ? .7 * (1 - ease((t - hit) / 1.1)) : 0); bottom.show(ease(span(t, hit - .1, 1.1)));
    caption?.attr('opacity', .85 * ease(span(t, hit + .5, .8))); note?.show(ease(span(t, hit + .8, .8)), .8); corners(t, T);
  }};
}
