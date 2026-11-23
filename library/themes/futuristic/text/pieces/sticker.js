import {theme, textStage, look, up, fit, capH, measure, txt, aura, span, spring, leave} from '../kit.js';

// Overlay: a round notched seal that pops on with a spin, wobbles while it is up and spins away.
// A short word sits in the middle and `ring` runs around the edge, turning the other way.
// `x`, `y` are its centre and `r` its radius in frame pixels. `solid: true` fills it with the accent.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NEW', ring: 'LIMITED RUN', x: 850, y: 340, r: 160, accent: 'cyan', solid: false, tilt: -12};

export function mount(el, props = defaults) {
  const stage = textStage(el, {overlay: true}), {root, defs, id} = stage, look_ = look(props.accent), r = props.r, color = look_.accent, ink = props.solid ? look_.on : color, o = {role: 'mono'};
  const g = root.append('g').attr('transform', `translate(${props.x} ${props.y})`).append('g');
  const glow = g.append('g'); aura(glow, theme.seal(r), color, 5);
  const burst = g.append('path').attr('d', theme.seal(r)).attr('fill', props.solid ? color : look_.bg).attr('fill-opacity', props.solid ? 1 : .82).attr('stroke', color).attr('stroke-width', 5);
  const rr = r * .68; defs.append('path').attr('id', id + '-ring').attr('d', `M0 ${-rr}A${rr} ${rr} 0 1 1 -0.01 ${-rr}`);
  const rsize = r * .15, unit = up(props.ring) + ' // ', circ = 2 * Math.PI * rr, reps = Math.max(1, Math.floor(circ / measure(unit, rsize, o)));
  const ring = g.append('g'); txt(ring, 0, 0, '', {size: rsize, role: 'mono', color: ink, spacing: 0}).attr('textLength', circ * .995).attr('lengthAdjust', 'spacing').append('textPath').attr('href', `#${id}-ring`).text(unit.repeat(reps));
  const inner = g.append('circle').attr('r', r * .56).attr('fill', 'none').attr('stroke', ink).attr('stroke-width', 3).attr('stroke-dasharray', '26 10');
  const size = fit(up(props.text), r * .92, r * .7), word = g.append('g'); txt(word, 0, capH(size) / 2, up(props.text), {size, role: 'head', color: ink, anchor: 'middle'});
  return {
    seek(t) {
      const x = leave(t, props.life), q = span(t, .05, .6), s = spring(q) * (1 - x) * (1 + (q >= 1 ? Math.sin(t * 3) * .03 : 0));
      g.attr('transform', `rotate(${props.tilt - 140 * (1 - spring(q)) + x * 160 + Math.sin(t * 1.7) * 4}) scale(${s})`).attr('opacity', q > 0 ? 1 : 0);
      burst.attr('transform', `rotate(${t * 14})`); glow.attr('transform', `rotate(${t * 14})`); ring.attr('transform', `rotate(${-t * 36})`); inner.attr('transform', `rotate(${t * 50})`);
      word.attr('transform', `scale(${1 + .9 * (1 - spring(span(t, .2, .5)))})`).attr('opacity', span(t, .2, .08));
    },
  };
}
