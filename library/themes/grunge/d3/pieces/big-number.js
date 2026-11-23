import {C, span, hold, easeOut, txt, brush, stamp, slam, scrawl, scribble, jit, up, fit, capH, measure, clipLive, comma} from '../../kit.js';
import {card} from './_card.js';

// One figure counted up in huge worn capitals, its label on a lime marker stroke, and a rubber stamp slammed in the corner.
export const meta = {duration: 3.6};
export const defaults = {title: 'The number', unit: 'Illustrative', value: 1280, prefix: '', suffix: '', label: 'Hours of footage nobody watched', stamp: 'TRUE', stampSub: '', clear: false};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), full = `${props.prefix ?? ''}${comma(props.value)}${props.suffix ?? ''}`, size = fit(full, 840, 380), cap = capH(size), by = (top + 900) / 2 + cap / 2 + 10;
  const num = txt(body, 500, by, '', {size, role: 'head', anchor: 'middle', color: ink.accent});
  const lab = up(props.label), ls = fit(lab, 760, 34, {role: 'small'}), lw = measure(lab, ls, {role: 'small'}), ly = by + 96, reveal = clipLive(st);
  body.append('path').attr('d', brush(500 - lw / 2 - 26, ly - ls * .95, lw + 52, ls * 1.6, {seed: 6, dry: 0})).attr('fill', C.lime).attr('fill-rule', 'evenodd').attr('clip-path', reveal.url);
  const label = txt(fine, 500, ly + ls * .18, lab, {size: ls, role: 'small', anchor: 'middle', color: C.soot, weight: 800});
  const zig = scrawl(body, s => scribble.zigzag(330, 600, ly + 90, s, 26, 4), {color: C.bone, width: 7, seed: 4});
  const sg = body.append('g'), sw = props.stamp ? stamp(sg.append('g'), up(props.stamp), {size: 84, color: C.bone, sub: up(props.stampSub ?? '')}) : null;
  return {seek(t) {
    const s = intro(t), h = hold(t), q = easeOut(span(h, .45, 1.1)), j = jit(s, 2, 2, .4);
    num.attr('transform', `translate(${j.x} ${j.y}) rotate(${j.r} 500 ${by})`).attr('opacity', h >= .45 ? 1 : 0).text(`${props.prefix ?? ''}${comma(props.value * q)}${props.suffix ?? ''}`);
    reveal.set(0, ly - 80, 1000 * easeOut(span(h, 1.6, .3)), 160); label.attr('opacity', h >= 1.72 ? 1 : 0); zig.draw(span(h, 1.95, .3), s);
    if (sw) { const k = slam(t, 2.35), jj = jit(s, 5, 1 + k.hit * 7, .8); const fitS = Math.min(1, 330 / sw.bw); sg.attr('transform', `translate(${920 - sw.bw * fitS / 2 + jj.x} ${Math.min(by - cap - 70, top + 70) + jj.y}) rotate(${10 + jj.r}) scale(${k.s * fitS})`).attr('opacity', k.o * .92); }
  }};
}
