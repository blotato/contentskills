import {C, stage, span, ease, leave} from '../../kit.js';

// Two emergency lamps, drawn in the theme's line style: a dome on a base at each given point, one red and one blue.
// They light in turn (a smooth alternation, `rate` times a second each) and each throws a soft turning wedge of its
// colour. Meant for the top corners of the frame, with the theme's siren_beams effect on the footage.
// Props: left [x, y], right [x, y], size, rate, colors [red, blue], reach.
export const meta = {duration: 2.5, live: true};
export const defaults = {left: [130, 300], right: [950, 300], size: 46, rate: 2, colors: ['#D4143C', '#2447C8'], reach: 520};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay'}), s = props.size ?? 46, life = props.life ?? meta.duration, reach = props.reach ?? 520;
  const lamps = [[props.left ?? [130, 300], (props.colors ?? defaults.colors)[0], 0, 1], [props.right ?? [950, 300], (props.colors ?? defaults.colors)[1], .5, -1]].map(([pt, col, phase, dir]) => {
    const [x, y] = pt, g = st.root.append('g'), gid = st.uid('beam'), gr = st.defs.append('radialGradient').attr('id', gid).attr('gradientUnits', 'userSpaceOnUse').attr('cx', x).attr('cy', y).attr('r', reach);
    gr.append('stop').attr('offset', 0).attr('stop-color', col).attr('stop-opacity', .55); gr.append('stop').attr('offset', 1).attr('stop-color', col).attr('stop-opacity', 0);
    const beam = g.append('path').attr('d', `M${x} ${y}L${x + reach} ${y - reach * .2}L${x + reach} ${y + reach * .2}Z`).attr('fill', `url(#${gid})`);
    const glow = g.append('circle').attr('cx', x).attr('cy', y - s * .2).attr('r', s * 1.5).attr('fill', col).style('filter', `blur(${s * .5}px)`);
    g.append('rect').attr('x', x - s * .9).attr('y', y + s * .42).attr('width', s * 1.8).attr('height', s * .32).attr('rx', 4).attr('fill', C.ink);
    const dome = g.append('path').attr('d', `M${x - s * .62} ${y + s * .42}v${-s * .4}a${s * .62} ${s * .62} 0 0 1 ${s * 1.24} 0v${s * .4}z`).attr('fill', col).attr('stroke', C.ink).attr('stroke-width', 4);
    return {g, beam, glow, dome, x, y, phase, dir};
  });
  return {seek(t) {
    const on = ease(span(t, 0, .25)) * (1 - ease(leave(t, life, .25)));
    for (const l of lamps) { const k = .5 + .5 * Math.cos((t * (props.rate ?? 2) + l.phase) * Math.PI * 2), ang = l.dir * (t * (props.rate ?? 2) * 360) + (l.dir > 0 ? 40 : 140);
      l.g.attr('opacity', on); l.glow.attr('opacity', (.15 + .6 * k).toFixed(3)); l.dome.attr('fill-opacity', (.45 + .55 * k).toFixed(3)); l.beam.attr('transform', `rotate(${ang.toFixed(1)} ${l.x} ${l.y})`).attr('opacity', (.25 + .5 * k).toFixed(3)); }
  }};
}
