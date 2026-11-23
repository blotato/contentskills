import {comicStage, C, look, up, fit, txt, capH, inked, rectPath, halftonePath, clipLive, captionBox, burst, scaleTo, span, spring, easeOut, leave} from '../../kit.js';

// A meter: an inked bar that fills with flat colour and dots up to `to` percent over `seconds`,
// its label in a caption box above and the running figure in a burst that rides the end of the
// fill and thumps when it arrives. `y` is the bar's vertical centre.
export const meta = {duration: 3, live: true};
export const defaults = {label: 'BURNOUT RISK', to: 100, seconds: .9, y: 330, accent: 'red', x: 110, width: 800};

export function mount(el, props = defaults) {
  const stage = comicStage(el, {overlay: true}), {root} = stage, ink = look(props.accent), x0 = props.x, w = props.width, h = 84, y = props.y;
  const g = root.append('g'); inked(g, rectPath(x0, y - h / 2, w, h), {fill: C.paper, width: 7, drop: 10});
  const mask = clipLive(stage); mask.rect.attr('x', x0).attr('y', y - h / 2).attr('height', h);
  const fill = g.append('g').attr('clip-path', mask.url); fill.append('rect').attr('x', x0).attr('y', y - h / 2).attr('width', w).attr('height', h).attr('fill', ink.accent);
  fill.append('path').attr('d', halftonePath(x0, y - h / 2, w, h, {pitch: 18, from: [.5, 1.6], reach: 1.2, max: .5})).attr('fill', ink.accent === C.yellow ? C.orange : C.ink).attr('opacity', .35);
  const edge = g.append('path').attr('stroke', C.ink).attr('stroke-width', 7); g.append('path').attr('d', rectPath(x0, y - h / 2, w, h)).attr('fill', 'none').attr('stroke', C.ink).attr('stroke-width', 7).attr('stroke-linejoin', 'round');
  for (let i = 1; i < 10; i++) g.append('path').attr('d', `M${x0 + w * i / 10} ${y + h / 2}v${i === 5 ? -30 : -18}`).attr('stroke', C.ink).attr('stroke-width', 5);
  const label = captionBox(root, x0 - 10, y - h / 2 - 78, props.label, {size: 40, tilt: -2}), knob = root.append('g'), star = burst(knob, 96, {fill: C.yellow, points: 11, depth: .76, seed: 4, width: 6, drop: 7});
  const value = txt(knob, 0, 20, '0%', {size: 56, role: 'head', color: C.red, anchor: 'middle', outline: 6, drop: 4});
  return {
    seek(t) {
      const x = leave(t, props.life), q = easeOut(span(t, .3, props.seconds)), pct = props.to * q, fw = w * pct / 100, hit = span(t, .3 + props.seconds, .4);
      g.attr('transform', `translate(${x0 + w / 2} ${y}) scale(${Math.max(.0001, spring(span(t, 0, .4)) * (1 - x))}) translate(${-x0 - w / 2} ${-y})`);
      mask.rect.attr('width', fw); edge.attr('d', fw > 4 && fw < w - 4 ? `M${x0 + fw} ${y - h / 2}v${h}` : '');
      scaleTo(label.g, spring(span(t, .15, .4)) * (1 - x));
      star.boil(t); value.say(Math.round(pct) + '%'); knob.attr('transform', `translate(${x0 + fw} ${y}) rotate(${-8 + Math.sin(t * 3) * 3}) scale(${Math.max(.0001, spring(span(t, .25, .4)) * (1 - x) * (1 + (hit > 0 && hit < 1 ? Math.sin(hit * Math.PI) * .3 : 0)))})`);
    },
  };
}
