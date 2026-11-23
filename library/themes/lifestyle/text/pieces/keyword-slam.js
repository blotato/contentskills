import {stage, look, C, up, fit, capH, glyphs, pose, settle, wallpaper, fade, glide, span, leave, easeInOut} from '../../kit.js';

// Overlay: one word, the way the reference film says a word. It first crosses the frame huge,
// in outline, then the same word settles small-to-medium in solid cream with its tracking
// closing up, under a wide-caps kicker. `solid` puts it in ink on a paper band instead.
// `y` is the middle of the word.
export const meta = {duration: 4, live: true};
export const defaults = {word: 'Unhurried', kicker: 'Word of the day', y: 330, accent: 'leaf', solid: false, tilt: 0};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root, W} = st, ink = look(props.accent, true), word = up(props.word), y = props.y, flat = s => up(s).replace(/\n/g, ' ');
  const size = fit(word, 820, 200), cap = capH(size), g = root.append('g').attr('transform', `translate(${W / 2} ${y}) rotate(${props.tilt || 0}) translate(${-W / 2} ${-y})`);
  const ghost = wallpaper(g, st, word, y + capH(430) / 2, 430, {color: C.cream, width: 3, speed: 0}), band = g.append('rect').attr('x', -40).attr('width', W + 80).attr('fill', C.paper);
  const body = g.append('g').attr('filter', props.solid ? null : st.soft), letters = glyphs(body, word, W / 2, y + cap / 2, size, {anchor: 'middle', color: props.solid ? C.ink : C.cream});
  const kicker = glyphs(body, flat(props.kicker), W / 2, y - cap / 2 - 52, 30, {anchor: 'middle', role: 'wide', color: props.solid ? C.ink : C.cream}), dot = body.append('circle').attr('cx', W / 2).attr('cy', y + cap / 2 + 56).attr('fill', ink.accent);
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, 1.3);
      ghost.g.attr('transform', `translate(${W * .9 - glide(q) * W * 1.5 - t * 30} 0)`).attr('opacity', easeInOut(span(t, 0, .3)) * (1 - easeInOut(span(t, .45, .5))) * .9);
      const bh = (cap + 190) * glide(span(t, .35, .8)) * (1 - x); band.attr('y', y - bh / 2 - 10).attr('height', props.solid ? bh : 0);
      settle(letters, span(t, .55, 1.4), x, .7); settle(kicker, span(t, .9, 1.3), x, .9);
      dot.attr('r', 9 * glide(span(t, 1.4, .6)) * (1 - x));
    },
  };
}
