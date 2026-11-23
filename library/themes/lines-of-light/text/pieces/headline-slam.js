import {C, F, stage, up, oneLine, span, ease, io, light, rays, flash, fire, titles, title, mono, fit, capH, cornerLabels, origin} from '../../kit.js';

// The headline: the red dot fires a line down the left edge and across to the centre, where an
// underline opens both ways; a half-sunburst rises behind it and the headline lands over it
// (orange, red, white) line by line. A blue flash marks the moment it locks.
export const meta = {duration: 5, live: true};
export const defaults = {
  lines: ['MAKE IT', 'LOUD'], kicker: 'ONE IDEA. FULL VOLUME.', note: 'SAY THE THING YOU MEAN\nAND SAY IT BIG',
  labels: ['', 'EP. 01', '', 'NO. 26'], foot: ['PLAY IT LOUD'], field: 'teal',
};

export function mount(el, props = defaults) {
  const st = stage(el, {field: props.field, source: [.5, .62]}), {root, W, H, k} = st, m = 100, lines = [].concat(props.lines ?? []).map(up);
  const size = Math.min(fit(lines, W - m * 2, 118), H * .32 / Math.max(1, lines.length) / 1.7 / .72);
  const cy = H * (st.sq ? .4 : .44), o = {track: .3}, head = titles(root, lines, W / 2, cy, size, o), uy = head.bottom + 56 + 20 * k, [ox, oy] = origin(st);
  const shot = fire(root, [[ox, oy], [ox, uy], [W / 2, uy]], {dur: 1, hold: 1.4});
  const under = [light(root, [[W / 2, uy], [m, uy]], {width: 2.6}), light(root, [[W / 2, uy], [W - m, uy]], {width: 2.6})];
  // The horizon and sunburst sit low in the frame, below the band captions use (the bottom of the app safe zone, to
  // y 1440 on 9:16), and only when there is room under the note: never on square cards. With the horizon up, the foot
  // line moves up under the note so nothing crosses the rays.
  const noteEnd = uy + 80 + 20 * k + (props.note ? String(props.note).split('\n').length * (24 + 6 * k) * 1.7 : 0), hy = H - 150 - 60 * k;
  const footUp = noteEnd + 40 + 20 * k, fr = Math.min(120 + 120 * k, hy - Math.max(footUp + 40, H * .75 + 10)), room = !st.sq && fr >= 110;
  const fan = room ? rays(root, W / 2, hy, 46, fr, 17, 192, 348, {width: 1.8}) : [], horizon = room ? [light(root, [[W / 2, hy], [m * .6, hy]], {width: 2}), light(root, [[W / 2, hy], [W - m * .6, hy]], {width: 2})] : [];
  const kick = props.kicker ? title(root, up(oneLine(props.kicker)), W / 2, head.top - 50 - 16 * k, Math.min(28 + 6 * k, fit(up(oneLine(props.kicker)), W - m * 2, 34)), {land: false, color: C.dim, track: .42}) : null;
  const note = props.note ? mono(root, W / 2, uy + 80 + 20 * k, up(props.note), {size: 24 + 6 * k, anchor: 'middle', track: .14, opacity: 0, leading: 1.7}) : null;
  const foot = props.foot?.[0] ? title(root, '↳ ' + up(props.foot[0]), W / 2, room ? footUp : H - 150 - 30 * k, 20 + 6 * k, {land: false, color: C.dim, track: .36}) : null;
  const blue = flash(root, W / 2, (head.top + head.bottom) / 2, {color: 'blue', r: 260 + 120 * k}), corners = cornerLabels(st, props.labels);
  const T = shot.arrive;
  return {seek(t) {
    st.tick(t); shot.seek(t);
    const q = io(span(t, T, 1.2)); under.forEach(l => l.draw(q));
    horizon.forEach(l => l.draw(io(span(t, T + .3, 1.6)))); fan.forEach(r => r.draw(ease(span(t, T + .9 + (1 - r.mid) * .5, 1.6))));
    head.show(t, T + .5, .3, 1);
    kick?.show(ease(span(t, T + .3, .8)), .9);
    const lock = T + .5 + (lines.length - 1) * .3 + 1; blue.set(.55 * (t > lock ? 1 - ease((t - lock) / 1.2) : 0));
    note?.attr('opacity', .85 * ease(span(t, lock - .2, .8))); foot?.show(ease(span(t, lock + .2, .8)), .8); corners(t, T);
  }};
}
