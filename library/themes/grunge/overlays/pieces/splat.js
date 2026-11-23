import {C, stage, tone, inkOn, up, fit, capH, txt, splat, clipPath, disc, hold, span, jit, easeOut, presence, leave} from '../../kit.js';

// An ink splat thrown at the footage with a word inside it: the blob bursts out from its centre
// in three held steps, droplets and all, and the word is knocked out of it.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'BOOM', sub: 'JUST LIKE THAT', x: 540, y: 400, r: 190, color: 'red', tilt: -6, seed: 3};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), {root, fine} = st, color = tone(props.color), r = props.r, g = root.append('g'), word = up(props.word);
  const grow = st.defs.append('clipPath').attr('id', st.id + '-grow').append('circle'), blob = g.append('path').attr('d', splat(0, 0, r, {seed: props.seed, drops: 18})).attr('fill', color).attr('clip-path', `url(#${st.id}-grow)`);
  const size = fit(word, r * 1.5, r * .75), text = txt(g, 0, capH(size) / 2, word, {size, role: 'head', color: inkOn(color), anchor: 'middle'});
  const sub = txt(fine, props.x, props.y + r * 1.25, up(props.sub), {size: 32, anchor: 'middle', shade: true});
  return {seek(t) {
    const s = st.tick(t), h = hold(t), q = easeOut(span(h, .04, .25)), x = leave(t, props.life), j = jit(s, 2, 2, .6), o = presence(t, props.life) * (x > .5 ? 0 : 1);
    grow.attr('r', r * 2.9 * q); g.attr('transform', `translate(${props.x + j.x} ${props.y + j.y}) rotate(${props.tilt + j.r})`).attr('opacity', o);
    text.attr('opacity', h >= .22 ? 1 : 0); sub.attr('opacity', h >= .5 ? o : 0);
  }};
}
