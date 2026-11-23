import {C, span, hold, easeOut, sheet, txt, stamp, slam, jit, up, fit, capH, tapeStrip} from '../../kit.js';
import {card} from './_card.js';

// Two torn sheets side by side, bone against red, each with one big figure; a round stamp slams between them.
export const meta = {duration: 3.8};
export const defaults = {title: 'Short vs long', unit: 'Illustrative · average views', mark: 'VS', clear: false,
  a: {label: 'Shorts', value: 84, suffix: 'K', note: 'Fast to make\nFast to forget'}, b: {label: 'Long form', value: 31, suffix: 'K', note: 'Slow to make\nKeeps earning'}};

export function mount(el, props = defaults) {
  const {body, fine, ink, intro, top} = card(el, props), y0 = top + 20, h0 = 890 - y0;
  const sides = [props.a, props.b].map((d, i) => {
    const x = i ? 520 : 70, w = 410, g = body.append('g'), paper = sheet(g, {fill: i ? ink.accent : C.bone, seed: i * 9 + 2, sides: i ? 'tlb' : 'trb', amp: 11}).set(x, y0, w, h0);
    tapeStrip(g, 130, 40, {seed: i + 4}).attr('transform', `translate(${x + w / 2} ${y0 + 4}) rotate(${i ? 5 : -6})`);
    const f = fine.append('g'), lab = up(d.label), ls = Math.min(50, fit(lab, w - 70, 50)); txt(f, x + w / 2, y0 + 110, lab, {size: ls, role: 'head', anchor: 'middle', color: C.soot});
    const full = `${d.value}${d.suffix ?? ''}`, vs = Math.min(230, fit(full, w - 60, 230, {role: 'cond'})), value = txt(f, x + w / 2, y0 + h0 * .5 + capH(vs, {role: 'cond'}) / 2 + 10, '', {size: vs, role: 'cond', anchor: 'middle', color: C.soot});
    txt(f, x + w / 2, y0 + h0 - 96, up(d.note ?? ''), {size: 23, anchor: 'middle', color: C.soot});
    return {d, g, f, value, cx: x + w / 2};
  });
  const vs = body.append('g'), disc = vs.append('g'); disc.append('circle').attr('r', 78).attr('fill', C.soot); stamp(disc, up(props.mark), {size: 70, color: C.bone, round: true});
  return {seek(t) {
    const s = intro(t), h = hold(t);
    sides.forEach(({d, g, f, value, cx}, i) => { const at = .45 + i * .25, q = easeOut(span(h, at, .35)), j = jit(s, i, 1.5, .4), tf = `translate(${(i ? 1 : -1) * (1 - q) * 520 + j.x} ${j.y}) rotate(${(i ? 1.6 : -1.6) + j.r} ${cx} 600)`; g.attr('transform', tf); f.attr('transform', tf);
      value.text(`${Math.round(d.value * easeOut(span(h, at + .3, .7)))}${d.suffix ?? ''}`); });
    const k = slam(t, 1.45), j = jit(s, 9, 1 + k.hit * 6, 1); vs.attr('transform', `translate(${495 + j.x} ${(y0 + 890) / 2 + j.y}) rotate(${-10 + j.r}) scale(${k.s})`).attr('opacity', k.o);
  }};
}
