import {C, tone, stage, hash, leave, glide, span, clamp, mix} from '../../kit.js';

// The theme's impact frame: for a few frames thin hairlines shoot outward from behind the speaker's
// head (they start outside the face, so nothing crosses it) and a thin ring opens and fades; a few of
// the lines take the accent (`hot` is the share that do; `colors`, e.g. ['poppy', 'sun', 'cobalt'], mixes several). It is centred on the face track, so it lands on the face even mid punch-in.
export const meta = {duration: .7, live: true};
export const defaults = {n: 26, seconds: .45, reach: 1, accent: 'poppy', colors: null, hot: .2, seed: 3};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), g = st.root.append('g').attr('filter', st.soft).append('g'), locate = props.locate ?? (() => ({x: .3, y: .36, w: .4, h: .26})), at = props.at ?? 0;
  const lines = Array.from({length: props.n}, (_, i) => ({a: (i + hash(i, props.seed) * .7) / props.n * Math.PI * 2, len: .5 + hash(i, props.seed + 1), delay: hash(i, props.seed + 2) * .08, hot: hash(i, props.seed + 4) < props.hot, tint: props.colors ? tone(props.colors[Math.floor(hash(i, props.seed + 6) * props.colors.length)]) : null, node: g.append('line').attr('stroke-linecap', 'butt')}));
  const ring = g.append('ellipse').attr('fill', 'none').attr('stroke', C.white).attr('stroke-width', 3);
  return {
    seek(t) {
      const f = locate(at + t), cx = (f.x + f.w / 2) * 1080, cy = (f.y + f.h / 2) * 1920, rx = f.w * 1080 * .98, ry = f.h * 1920 * .92, out = leave(t, props.life, .12);
      lines.forEach(l => {
        const q = span(t, l.delay, props.seconds), head = glide(q), tail = glide(clamp(q * 1.6 - .6)), far = 1 + l.len * .9 * props.reach, c = Math.cos(l.a), s = Math.sin(l.a);
        const r0 = mix(1.04, far, tail), r1 = mix(1.04, far, head);
        l.node.attr('x1', cx + c * rx * r0).attr('y1', cy + s * ry * r0).attr('x2', cx + c * rx * r1).attr('y2', cy + s * ry * r1).attr('stroke', l.hot ? l.tint ?? st.ink.accent : C.white).attr('stroke-width', l.hot ? 5 : 3).attr('opacity', q > 0 && q < 1 ? (1 - q * q) * (1 - out) : 0);
      });
      const q = span(t, 0, props.seconds * .9); ring.attr('cx', cx).attr('cy', cy).attr('rx', rx * (1.02 + .5 * glide(q))).attr('ry', ry * (1.02 + .5 * glide(q))).attr('opacity', q < 1 ? (1 - q) * .8 * (1 - out) : 0);
    },
  };
}
