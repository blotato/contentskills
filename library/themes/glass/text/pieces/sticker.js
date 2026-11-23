import {stage, capH, word, wordFit, ring, draw, up, flat, type, leave, fade, glide, span} from '../../kit.js';

// Overlay: a seal instead of a sticker. A hairline ring draws, small print runs round the inside
// of it (turning very slowly) and a short condensed word settles in the middle. `solid` fills
// the ring near-black for busy footage. (x, y) is its centre, `r` its radius.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'New', ring: 'Fresh this week', x: 850, y: 340, r: 150, accent: 'poppy', solid: false};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, defs, id, ink} = st, r = props.r, g = root.append('g').attr('filter', st.soft).append('g').attr('transform', `translate(${props.x} ${props.y})`);
  const back = g.append('circle').attr('r', r).attr('fill', '#0A0F1C').attr('opacity', props.solid ? .82 : 0), outer = ring(g, 0, 0, r, '#fff', 2).attr('transform', 'rotate(-90)');
  const rr = r - 30, size = Math.min(19, r * .13), str = up(flat(props.ring)), n = Math.max(1, Math.floor(2 * Math.PI * rr / ((str.length + 4) * size * (.62 + type.label.spacing))));
  defs.append('path').attr('id', id + '-arc').attr('d', `M0 ${-rr}A${rr} ${rr} 0 1 1 -0.01 ${-rr}`);
  const round = g.append('g'), text = round.append('text').attr('fill', '#fff').style('font', `${type.label.weight} ${size}px ${type.label.font}`).style('letter-spacing', `${type.label.spacing}em`);
  text.append('textPath').attr('href', `#${id}-arc`).attr('textLength', 2 * Math.PI * rr - 4).text(Array(n).fill(str).join('  ·  ') + '  ·  ');
  const wsize = wordFit(props.text, r * 1.15, r * 1.1, 'tall'), mid = word(g, props.text, 0, capH(wsize, {role: 'tall'}) / 2, wsize, {face: 'tall'}), spot = g.append('circle').attr('cy', -r).attr('r', 7).attr('fill', ink.accent);
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      draw(outer, glide(span(t, 0, .7))); outer.attr('opacity', 1 - out); back.attr('opacity', (props.solid ? .82 : 0) * fade(t, 0, .3) * (1 - out));
      round.attr('transform', `rotate(${t * 6 - 20 * (1 - glide(span(t, 0, 1.2)))})`).attr('opacity', fade(t, .2, .5) * .9 * (1 - out)); mid.set(t, .15, out); spot.attr('opacity', fade(t, .5, .3) * (1 - out));
    },
  };
}
