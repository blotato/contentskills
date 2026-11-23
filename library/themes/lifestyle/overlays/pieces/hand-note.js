import {stage, look, C, hand, stroke, arrowPath, squiggle, draw, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// A handwritten note in the margin with a hand-drawn arrow pointing at something in the shot.
// The note writes itself on, a wavy underline draws beneath it, then the arrow curves out to
// `to`. `x`, `y` is where the writing starts (its baseline); `to` is the arrow's tip, in frame
// pixels; `ink` is 'cream' (default, for footage) or any palette colour.
export const meta = {duration: 4.5, live: true};
export const defaults = {note: 'my favourite\npart', x: 80, y: 330, to: {x: 330, y: 560}, size: 76, underline: true, ink: 'cream', accent: 'leaf'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), color = C[props.ink] ?? props.ink ?? C.cream, soft = soften(root, st), lines = String(props.note).split('\n');
  const note = hand(soft, st, props.x, props.y, props.note, {size: props.size, color, rot: -4}), bottom = props.y + (lines.length - 1) * props.size + 26;
  const line = stroke(soft, squiggle(props.x, bottom, Math.min(note.w, 260), 8, 3, 4), ink.accent, 6).attr('transform', `rotate(-4 ${props.x} ${props.y})`);
  const sx = props.to.x > props.x + note.w / 2 ? props.x + note.w * .6 : props.x + note.w * .3, sy = props.to.y > props.y ? bottom + 34 : props.y - props.size - 10;
  const arrow = stroke(soft, arrowPath(sx, sy, props.to.x, props.to.y, props.to.x > sx ? .28 : -.28), color, 6);
  return {
    seek(t) {
      const out = leave(t, props.life, .5);
      soft.attr('opacity', 1 - out); note.set(glide(span(t, .1, 1.2)));
      line.attr('opacity', props.underline ? 1 : 0); draw(line, glide(span(t, 1.0, .7))); draw(arrow, glide(span(t, 1.4, .9)));
    },
  };
}
