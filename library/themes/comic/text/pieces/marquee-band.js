import {comicStage, C, look, up, capH, strip, captionBox, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// Overlay: a printed band across the frame. An inked strip in the accent colour snaps open from
// a line, its words running sideways with sparks between them, and the `sub` line rides on a
// caption box at its corner. `y` is the centre, `height` the band's thickness, `tilt` its angle.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'NEW EPISODE', sub: 'OUT NOW', y: 1760, height: 130, accent: 'yellow', tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), h = props.height;
  const g = root.append('g').attr('transform', `translate(${W / 2} ${props.y}) rotate(${props.tilt - 1.5}) translate(${-W / 2} 0)`), band = g.append('g');
  band.append('rect').attr('x', -200).attr('y', -h / 2 + 12).attr('width', W + 400).attr('height', h).attr('fill', C.ink);
  band.append('rect').attr('x', -200).attr('y', -h / 2).attr('width', W + 400).attr('height', h).attr('fill', ink.accent).attr('stroke', C.ink).attr('stroke-width', 8);
  const size = h * .58 / capH(1), run = strip(band, stage, props.text, capH(size) / 2, size, {color: ink.on === C.ink ? C.ink : C.white, sepColor: ink.accent === C.yellow ? C.white : C.yellow, ...(ink.on === C.ink ? {} : {outline: size * .07, drop: size * .045})});
  const sub = captionBox(g, 70, -h / 2 - 52, props.sub, {size: 36, fill: ink.accent === C.yellow ? C.red : C.yellow, tilt: -3});
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, 0, .4), s = spring(q) * (1 - x);
      band.attr('transform', `scale(1 ${Math.max(.0001, s)})`).attr('opacity', s > .01 ? 1 : 0); run.set(t * 170 * props.speed - (1 - easeOut(q)) * 500);
      scaleTo(sub.g, spring(span(t, .45, .4)) * (1 - x), Math.sin(t * 3) * 1.5);
    },
  };
}
