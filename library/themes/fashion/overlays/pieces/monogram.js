import {stage, capH, word, wordFit, label, ring, draw, leave, fade, glide, span} from '../../kit.js';

// The closing mark: the footage dims toward near-black, a hairline ring draws in the middle with
// one accent dot riding on it, initials settle inside and one line of small print sits beneath.
// `dim` 0..1 is how far the picture is darkened; (x, y) the centre of the ring. An original mark:
// replace the initials with your own.
export const meta = {duration: 4.5, live: true};
export const defaults = {text: 'AB', label: 'Studio name', note: '', dim: .72, x: 540, y: 900, r: 120, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H, ink} = st, {x, y, r} = props, shade = root.append('rect').attr('width', W).attr('height', H).attr('fill', '#0D0D0F');
  const g = root.append('g'), circle = ring(g, x, y, r, '#fff', 2).attr('transform', `rotate(-90 ${x} ${y})`), spot = g.append('circle').attr('r', 8).attr('fill', ink.accent);
  const size = wordFit(props.text, r * 1.1, r * .9, 'tall'), mark = word(g, props.text, x, y + capH(size, {role: 'tall'}) / 2, size, {face: 'tall'}), name = label(g, x, y + r + 64, props.label, {size: 23, anchor: 'middle'}), note = label(g, x, y + r + 104, props.note, {size: 18, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .4), q = glide(span(t, .15, 1)), a = -Math.PI / 2 + q * Math.PI * 2;
      shade.attr('opacity', props.dim * fade(t, 0, .9) * (1 - out)); draw(circle, q); circle.attr('opacity', 1 - out);
      spot.attr('cx', x + Math.cos(a) * r).attr('cy', y + Math.sin(a) * r).attr('opacity', fade(t, .2, .3) * (1 - out)); mark.set(t, .35, out);
      name.attr('opacity', fade(t, .8, .5) * .92 * (1 - out)); note.attr('opacity', fade(t, 1, .5) * .7 * (1 - out));
    },
  };
}
