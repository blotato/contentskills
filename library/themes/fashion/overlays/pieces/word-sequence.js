import {stage, capH, word, wordFit, label, leave, fade} from '../../kit.js';

// One word at a time, in the same place: each word of `words` is revealed letter by letter out of
// blur at its cue (`times`, seconds after the overlay starts) and dims away as the next arrives —
// the way the reference film says a run of words. `faces` alternates the two voices
// ('wide' heavy caps, 'tall' condensed). `y` is the middle of the words; `speed` > 1 reveals each word faster.
export const meta = {duration: 4.5, live: true};
export const defaults = {words: ['New', 'Light', 'Easy'], times: null, step: 1.2, faces: ['wide', 'tall'], kicker: '', x: 540, y: 330, width: 640, maxSize: 150, speed: 1};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, g = root.append('g').attr('filter', st.soft).append('g'), n = props.words.length, at = i => props.times?.[i] ?? i * props.step;
  const items = props.words.map((str, i) => {
    const face = props.faces?.[i % (props.faces?.length || 1)] ?? 'wide', tall = face === 'tall', size = wordFit(str, props.width * (tall ? .8 : 1), props.maxSize * (tall ? 1.5 : 1), face);
    return {w: word(g, str, props.x, props.y + capH(size, {role: tall ? 'tall' : 'wide'}) / 2, size, {face, seed: i + 1}), start: at(i), end: i < n - 1 ? at(i + 1) : Infinity};
  });
  const kicker = label(g, props.x, props.y - 120, props.kicker, {size: 22, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      items.forEach(it => it.w.set(it.start + (t - it.start) * (props.speed || 1), it.start + .02, Math.max(out, fade(t, it.end - .16, .16))));
      kicker.attr('opacity', fade(t, .1, .35) * .9 * (1 - out));
    },
  };
}
