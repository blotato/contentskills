import {C, F, stage, up, span, ease, io, light, ring, rays, flash, title, fit, capH, leave} from '../../kit.js';

// A badge of light: a ring opens round a point, a short sunburst radiates from it, a mono ring of
// text turns slowly inside, and the word lands in the middle with a blue flash. `x`, `y`: centre; `r`: radius.
export const meta = {duration: 3.5, live: true};
export const defaults = {text: 'NEW', ring: 'LIMITED RUN', x: 850, y: 400, r: 150, tilt: -8};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', shade: props.shade}), {root, defs, id} = st, r = props.r ?? 150, cx = props.x ?? 850, cy = props.y ?? 400;
  const g = root.group().attr('transform', `translate(${cx} ${cy}) rotate(${props.tilt ?? 0})`), shade = g.shade.append('circle').attr('r', r * 1.25).attr('fill', st.url('pool'));
  const outer = ring(g, 0, 0, r, {from: 180, width: 2.6}), inner = ring(g, 0, 0, r * .62, {from: 0, width: 1.4, echo: false}), burst = rays(g, 0, 0, r * 1.12, r * 1.5, 24, 0, 360, {width: 1.6, fade: 0});
  const rr = r * .8; defs.append('path').attr('id', id + '-ring').attr('d', `M0 ${-rr}A${rr} ${rr} 0 1 1 -0.01 ${-rr}`);
  const rsize = r * .11, spin = g.text.append('g'), path = spin.append('text').attr('fill', C.core).attr('opacity', 0).style('font', `300 ${rsize}px ${F.mono}`).style('letter-spacing', '.2em');
  path.append('textPath').attr('href', `#${id}-ring`).text((up(props.ring) + ' · ').repeat(Math.max(1, Math.floor(2 * Math.PI * rr / (rsize * .9 * (up(props.ring).length + 3))))));
  const size = Math.min(fit(up(props.text), r * 1.0, r * .42, {track: .14}), r * .42), word = title(g, up(props.text), 0, capH(size) / 2, size, {track: .14, halo: 4}), blue = flash(g, 0, 0, {color: 'blue', r: r * 1.6});
  return {seek(t) {
    const x = leave(t, props.life, .5), tail = ease(x); shade.attr('opacity', ease(span(t, 0, .3)) * (1 - x));
    outer.range(tail, io(span(t, 0, .9))); inner.range(tail, io(span(t, .3, .9))); burst.forEach((b, i) => b.range(tail, ease(span(t, .6 + (i % 3) * .06, .7))));
    spin.attr('transform', `rotate(${t * 18})`); path.attr('opacity', .8 * ease(span(t, .7, .5)) * (1 - x));
    word.show(ease(span(t, .7, .9)), 1 - x); blue.set(t > 1.2 ? .5 * (1 - ease((t - 1.2) / .9)) * (1 - x) : 0);
  }};
}
