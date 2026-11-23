import {stage, look, C, arch, tag, photo, hand, stroke, arrowPath, draw, fade, glide, span, leave} from '../../kit.js';
import {soften} from './_local.js';

// An arch-shaped picture window in a corner: a thin outlined arch draws, the picture wipes up
// inside it and slowly pushes in, a pill tag settles on its foot and a handwritten note with a
// little arrow points at it. (`x`, `y`) is the top-left of the arch; `image` replaces the stand-in.
export const meta = {duration: 5, live: true};
export const defaults = {x: 700, y: 110, w: 310, h: 410, label: 'The spot', note: 'worth the walk', image: '', scene: 'coast', accent: 'clay'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), {root} = st, ink = look(props.accent), {x, y, w, h} = props, o = 16;
  const soft = soften(root, st), ring = stroke(soft, arch(x - o, y - o, w + o * 2, h + o), C.cream, 4);
  const pic = photo(root, st, x, y, w, h, {image: props.image, scene: props.scene, seed: 7, from: 'up', shape: 'arch'});
  const chip = tag(root, x + w / 2, y + h, props.label, {fill: ink.accent, size: 24, anchor: 'middle'});
  const left = x > 540, nx = left ? x - 46 : x + w + 46, note = hand(soft, st, nx, y + h * .42, props.note, {size: 60, color: C.cream, anchor: left ? 'end' : 'start', rot: left ? -5 : 4});
  const arrow = stroke(soft, arrowPath(nx + (left ? -60 : 60), y + h * .42 + 34 + (String(props.note).split('\n').length - 1) * 60, left ? x - 30 : x + w + 30, y + h * .7, left ? -.3 : .3), C.cream, 5);
  return {
    seek(t) {
      const out = leave(t, props.life, .5);
      draw(ring, glide(span(t, 0, 1.1)) * (1 - out)); pic.set(glide(span(t, .3, 1.0)), t, out);
      chip.g.attr('opacity', fade(t, 1.0, .5) * (1 - out)).attr('transform', `translate(0 ${(1 - glide(span(t, 1.0, .7))) * 22})`);
      note.set(glide(span(t, 1.3, .9))); note.node.attr('opacity', t < 1.3 ? 0 : 1 - out); draw(arrow, glide(span(t, 2.0, .7))); arrow.attr('opacity', 1 - out);
    },
  };
}
