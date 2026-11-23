import {C, stage, capH, word, wordFit, label, leave, fade, clamp} from '../../kit.js';

// A word that rides the speaker: it sits just above (or below) the face and follows it — through
// punch-ins, drifts and layout moves — growing and shrinking with the zoom, because it is placed from the
// face track every frame. `side`: 'above' | 'below'; `gap` is the distance from the face box in face-heights;
// `scale` 1 keeps the word about as wide as `width` x the face.
export const meta = {duration: 3, live: true};
export const defaults = {word: 'Watch', kicker: '', side: 'above', gap: .16, width: 1.25, face: 'wide', maxSize: 190, speed: 1.6, accent: 'poppy', color: 'white'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), tall = props.face === 'tall', role = tall ? 'tall' : 'wide', locate = props.locate ?? (() => ({x: .3, y: .36, w: .4, h: .26})), at = props.at ?? 0;
  const f0 = locate(at), base = f0.w * 1080 * props.width, size = Math.min(props.maxSize, wordFit(props.word, base, props.maxSize * 2, props.face)), cap = capH(size, {role});
  const g = st.root.append('g').attr('filter', st.soft).append('g'), w = word(g, props.word, 0, cap / 2, size, {face: props.face, color: props.color === 'accent' ? st.ink.accent : C.white}), kicker = label(g, 0, -cap / 2 - 30, props.kicker, {size: 24, anchor: 'middle'});
  return {
    seek(t) {
      const f = locate(at + t), s = f.w / f0.w, x = leave(t, props.life, .2), cx = (f.x + f.w / 2) * 1080, above = props.side !== 'below';
      const cy = above ? Math.max(70 + cap * s / 2 + (props.kicker ? 50 : 0), (f.y - f.h * props.gap) * 1920 - cap * s / 2) : Math.min(1850 - cap * s / 2, (f.y + f.h * (1 + props.gap)) * 1920 + cap * s / 2);
      g.attr('transform', `translate(${clamp(cx, 200, 880)} ${cy}) scale(${s})`);
      w.set(t * (props.speed || 1), .02, x); kicker.attr('opacity', fade(t, .08, .25) * .9 * (1 - x));
    },
  };
}
