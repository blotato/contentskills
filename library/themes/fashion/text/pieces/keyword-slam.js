import {stage, capH, word, wordFit, label, about, fade, leave, drift} from '../../kit.js';

// Overlay: THE word. One short white word set straight on the footage, revealed letter by letter
// out of a soft blur — typed on in heavy wide caps (`face: 'wide'`) or, for `face: 'tall'`, in
// light condensed caps that arrive in scattered order while very wide tracking closes up.
// A line of small print may sit above it. `speed` > 1 reveals it faster, for windows under a second. `y` is the middle of the word; keep it off the face.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'Effortless', kicker: '', y: 330, x: 540, face: 'wide', width: 640, maxSize: 150, speed: 1, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, tall = props.face === 'tall', role = tall ? 'tall' : 'wide';
  const size = wordFit(props.word, props.width * (tall ? .8 : 1), props.maxSize * (tall ? 1.5 : 1), props.face), cap = capH(size, {role}), g = root.append('g').attr('filter', st.soft).append('g');
  const w = word(g, props.word, props.x, props.y + cap / 2, size, {face: props.face}), kicker = label(g, props.x, props.y - cap / 2 - 40, props.kicker, {size: 22, anchor: 'middle'});
  return {
    seek(t) {
      const x = leave(t, props.life, .25);
      w.set(t * (props.speed || 1), .02, x); kicker.attr('opacity', fade(t, .1, .35) * .9 * (1 - x)); about(g, props.x, props.y, drift(t, .04, 4));
    },
  };
}
