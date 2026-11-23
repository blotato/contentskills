import {C, stage, tone, rip, scribble, hash, boil} from '../../kit.js';

// A cut accent: for a few frames white rips tear across the footage (a cross, then diagonals), a
// tint washes over it and a marker doodle flashes up, different every three frames, then it is gone.
// Put it on a cut. `seconds` is how long the burst lasts.
export const meta = {duration: 1.2};
export const defaults = {seconds: .5, tints: ['teal', 'plum', 'brick'], tint: .34, doodles: true, seed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true, seed: props.seed}), {root, under, W, H} = st;
  const wash = under.append('rect').attr('width', W).attr('height', H), tears = root.append('path').attr('fill', C.white), doodle = root.append('path').attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 10).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round');
  return {seek(t) {
    st.tick(t); const on = t >= 0 && t < props.seconds, k = boil(t, 10), sd = props.seed * 31 + k, r = i => hash(i, sd);
    wash.attr('opacity', on ? props.tint : 0).attr('fill', tone(props.tints[k % props.tints.length]));
    if (!on) { tears.attr('d', ''); doodle.attr('d', ''); return; }
    let d = '';
    if (k % 3 !== 2) d += rip(-30, H * (.2 + .5 * r(1)), W + 30, H * (.2 + .5 * r(2)), {seed: sd, thick: 28, amp: 26}) + rip(W * (.25 + .5 * r(3)), -30, W * (.25 + .5 * r(4)), H + 30, {seed: sd + 3, thick: 24, amp: 24});
    if (k % 3 !== 0) d += rip(-30, H * r(5) * .5, W + 30, H * (.5 + .5 * r(6)), {seed: sd + 5, thick: 20, amp: 30});
    tears.attr('d', d);
    const cx = W * (.2 + .6 * r(7)), cy = H * (.12 + .2 * r(8)) + (k % 2 ? H * .62 : 0), kind = k % 3;
    doodle.attr('d', !props.doodles ? '' : kind === 0 ? scribble.burst(cx, cy, 130, sd) : kind === 1 ? scribble.cross(cx, cy, 90, sd) + scribble.circle(cx, cy, 110, 110, sd) : scribble.cross(cx, cy, 70, sd));
  }};
}
