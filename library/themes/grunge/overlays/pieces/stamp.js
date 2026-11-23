import {C, stage, tone, up, stamp, splat, slam, jit, hash, presence, leave} from '../../kit.js';

// A rubber stamp brought down on the footage: a double-ruled box (or ring) with a condensed word
// and a small typed line, inked unevenly, with a few flecks thrown out as it hits.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'APPROVED', sub: 'CHECKED BY HAND', x: 540, y: 400, size: 150, tilt: -9, color: 'red', round: false};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root} = st, color = tone(props.color), g = root.append('g');
  const flecks = g.append('path').attr('d', splat(0, 0, props.size * .9, {seed: 6, drops: 12}).replace(/^M[^Z]*Z/, '')).attr('fill', color).attr('opacity', .9);
  const mark = stamp(g.append('g'), up(props.word), {size: props.size, color, sub: up(props.sub), round: props.round});
  return {seek(t) {
    const s = st.tick(t), k = slam(t, .08), x = leave(t, props.life), j = jit(s, 2, 1.5 + k.hit * 10, .5 + k.hit * 3);
    g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r})`).attr('opacity', presence(t, props.life) * (x > .5 ? 0 : 1));
    mark.attr('transform', `scale(${k.s})`).attr('opacity', k.o * (.82 + .18 * hash(s, 3))); flecks.attr('opacity', k.hit > 0 || t > .5 ? .9 : 0);
  }};
}
