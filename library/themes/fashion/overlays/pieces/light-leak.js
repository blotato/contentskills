import {stage, glow, tone, leave, fade, hash} from '../../kit.js';

// A light leak in the colours of the theme's one loud cut: soft poppy, sun and cobalt light
// drifting slowly in from one edge of the frame and across the corners. It never reaches the
// middle. `side`: 'left' | 'right' | 'top' | 'bottom'; `colors` any of the palette names;
// `reach` < 1 keeps it closer to the edge (use it when the face is large in frame).
export const meta = {duration: 4, live: true};
export const defaults = {side: 'left', colors: ['poppy', 'sun', 'cobalt'], strength: .7, reach: 1, seed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W, H} = st, g = root.append('g').style('mix-blend-mode', 'screen'), vert = props.side === 'top' || props.side === 'bottom', far = props.side === 'right' || props.side === 'bottom';
  const lights = props.colors.map((c, i) => ({node: g.append('ellipse').attr('fill', glow(st, tone(c), .95)), i, at: (i + .5) / props.colors.length + (hash(i, props.seed) - .5) * .2, r: .32 + .14 * hash(i, props.seed + 3)}));
  return {
    seek(t) {
      g.attr('opacity', fade(t, 0, .5) * (1 - leave(t, props.life, .5)) * props.strength);
      lights.forEach(l => {
        const along = l.at + .06 * Math.sin(t * .5 + l.i * 2), depth = (far ? 1 : 0) + (far ? -1 : 1) * (.02 + .03 * Math.sin(t * .7 + l.i)), r = l.r * (1 + .08 * Math.sin(t * .6 + l.i * 1.7)), deep = props.reach ?? 1;
        l.node.attr('cx', (vert ? along : depth) * W).attr('cy', (vert ? depth : along) * H).attr('rx', (vert ? r * 1.2 : r * .75 * deep) * W).attr('ry', (vert ? r * .42 * deep : r * .9) * H);
      });
    },
  };
}
