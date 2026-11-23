import {textStage, look, capH, strip, shade, span, spring, easeOut, leave} from '../kit.js';

// Overlay: a marquee band that keeps scrolling, every other copy mirrored, with a thin second
// strip of readout text running the other way above it. It springs open, and folds shut before
// `life` ends. `y` is the centre of the main band; `tilt` leans the pair.
export const meta = {duration: 4, live: true};
export const defaults = {text: 'NEW EPISODE', sub: 'OUT NOW', y: 1760, height: 130, accent: 'cyan', tilt: 0, speed: 1};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, W} = stage, ink = look(props.accent), h = props.height, h2 = h * .42, o = {role: 'mono'};
  const g = root.append('g').attr('transform', `translate(${W / 2} ${props.y}) rotate(${props.tilt}) translate(${-W / 2} 0)`);
  const thin = g.append('g').attr('transform', `translate(0 ${-h / 2 - h2 / 2 - 6})`).append('g'); shade(thin, .78, 0).set(-80, -h2 / 2, W + 160, h2);
  thin.append('path').attr('d', `M-80 ${-h2 / 2}H${W + 80}`).attr('stroke', ink.alt).attr('stroke-width', 3);
  const main = g.append('g'); main.append('rect').attr('x', -80).attr('y', -h / 2).attr('width', W + 160).attr('height', h).attr('fill', ink.accent);
  const s2 = h2 * .46 / capH(1, o), run2 = strip(thin, stage, props.sub, capH(s2, o) / 2, s2, {color: ink.alt, role: 'mono', mirror: false});
  const s1 = h * .54 / capH(1), run = strip(main, stage, props.text, capH(s1) / 2, s1, {color: ink.on, ghost: .45});
  return {
    seek(t) {
      const x = leave(t, props.life), kick = (1 - easeOut(span(t, 0, .8))) * 1100;
      main.attr('transform', `scale(1 ${spring(span(t, 0, .5)) * (1 - x)})`); thin.attr('transform', `scale(1 ${spring(span(t, .18, .5)) * (1 - x)})`);
      run.set((t * 230 + kick) * props.speed); run2.set(-(t * 120 + kick * .6) * props.speed);
    },
  };
}
