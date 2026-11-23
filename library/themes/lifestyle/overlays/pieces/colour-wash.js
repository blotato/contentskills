import {stage, C, FRAME, tone, blob, glow, gradient, fade, leave, noise} from '../../kit.js';

// Atmosphere only: large soft washes of colour that bloom in from the top and bottom edges and
// drift very slowly, with a faint cream veil at the top and a warm one at the bottom. It warms
// and softens footage without covering the middle. Safe to leave up for a whole clip.
// `colors` are palette names or CSS colours; `strength` 0..1.
export const meta = {duration: 8, live: true};
export const defaults = {colors: ['sun', 'blush', 'sage', 'sky'], strength: .6, veil: true};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, {width: W, height: H} = FRAME, a = props.strength;
  const veils = props.veil ? [root.append('rect').attr('width', W).attr('height', 520).attr('fill', gradient(st, [[C.cream, 0], [C.cream, .34 * a]], 90)),
    root.append('rect').attr('y', H - 620).attr('width', W).attr('height', 620).attr('fill', gradient(st, [[tone(props.colors[0]), .3 * a], [tone(props.colors[0]), 0]], 90))] : [];
  const spots = [[.12, .03, 520], [.9, .1, 430], [.05, .95, 560], [.86, .98, 500]].map(([fx, fy, r], i) => ({fx, fy, r, i, node: root.append('path').attr('fill', glow(st, tone(props.colors[i % props.colors.length]), .85 * a))}));
  return {
    seek(t) {
      const o = fade(t, 0, 1.4) * (1 - leave(t, props.life, .9));
      veils.forEach(v => v.attr('opacity', o));
      spots.forEach(s => { const x = W * s.fx + (noise(t * .18, s.i) - .5) * 220, y = H * s.fy + (noise(t * .15, s.i + 9) - .5) * 160, k = 1 + .12 * Math.sin(t * .35 + s.i * 1.7);
        s.node.attr('d', blob(s.r, s.i + 2, t * .5 + s.i)).attr('transform', `translate(${x} ${y}) scale(${k * (.7 + .3 * fade(t, s.i * .2, 1.6))})`).attr('opacity', o); });
    },
  };
}
