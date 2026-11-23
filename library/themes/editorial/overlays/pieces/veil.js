import {stage, veil, span, ease, leave} from '../../kit.js';

// A quiet ground for type on footage: a soft gradient of paper (or ink) fading in from the top and/or bottom of the
// frame. Nothing else. Props: top, bottom (shares of the frame height, 0 = none), color (paper|ink|wine), strength.
export const meta = {duration: 4, live: true};
export const defaults = {top: .32, bottom: 0, color: 'paper', strength: .85};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), v = veil(st, st.root, {top: props.top ?? .32, bottom: props.bottom ?? 0, color: props.color ?? 'paper', strength: props.strength ?? .85}), life = props.life ?? meta.duration;
  return {seek(t) { v.attr('opacity', ease(span(t, 0, .35)) * (1 - ease(leave(t, life, .35)))); }};
}
