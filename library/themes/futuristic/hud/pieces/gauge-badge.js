import {C, F, hudStage, line, ring, text, span, presence, easeBack, flicker, noise} from '../../hud.js';

// A round gauge badge: the arc winds up to the value and overshoots slightly before settling, the number counts, and
// two dashed rings keep turning around it. `x`, `y` are the centre in frame pixels, `r` the radius.
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 87, max: 100, suffix: '%', label: 'MATCH', x: 830, y: 1180, r: 150, color: 'cyan'};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), color = C[props.color] ?? C.cyan, {x, y, r} = props, g = root.append('g').attr('transform', `translate(${x} ${y})`), len = 2 * Math.PI * (r - 16);
  g.append('circle').attr('r', r + 8).attr('fill', C.bg).attr('fill-opacity', .66);
  const outer = ring(g, 0, 0, r + 8, color, 3, `${r * .9} ${r * .26}`), far = ring(g, 0, 0, r + 26, C.dim, 2, '3 12'); ring(g, 0, 0, r - 16, C.grid, 16);
  const arc = ring(g, 0, 0, r - 16, color, 16).attr('transform', 'rotate(-90)').attr('stroke-linecap', 'butt'), tip = g.append('g'), knob = tip.append('rect').attr('x', -9).attr('y', -(r - 16) - 15).attr('width', 18).attr('height', 30).attr('fill', C.white);
  let marks = ''; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2, r0 = r - 36, r1 = r0 - (i % 5 ? 7 : 15); marks += `M${Math.cos(a) * r0} ${Math.sin(a) * r0}L${Math.cos(a) * r1} ${Math.sin(a) * r1}`; }
  const dial = line(g, marks, C.dim, 2), digits = String(props.value).length + (props.suffix ? .7 : 0);
  const num = text(g, 0, r * .16, '', {size: Math.min(r * .62, r * 1.25 / (digits * .8)), font: F.display, weight: 900, color: C.white, anchor: 'middle', spacing: '0'});
  const label = text(g, 0, r * .44, props.label, {size: Math.max(22, r * .16), color, anchor: 'middle', spacing: '.2em'});
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life));
      const frac = props.value / props.max, wind = easeBack(span(t, .25, 1.2)), v = Math.max(0, Math.min(1, frac * wind + (t > 1.6 ? (noise(t * 3, 4) - .5) * .012 : 0)));
      arc.attr('stroke-dasharray', `${len * v} ${len}`); tip.attr('transform', `rotate(${v * 360})`).attr('opacity', span(t, .25, .1));
      outer.attr('transform', `rotate(${t * 36})`); far.attr('transform', `rotate(${-t * 20})`); dial.attr('opacity', flicker(t, .15));
      num.text(Math.round(props.value * Math.min(1, wind)) + (props.suffix ?? '')); label.attr('opacity', flicker(t, .6));
    },
  };
}
