import {C, span, hold, easeOut, sheet, txt, tapeStrip, jit, up, fit, capH} from '../../kit.js';
import {card} from './_card.js';

// Paper strips taped to the wall, longest first; the winner is red. Values sit at the end of each strip.
export const meta = {duration: 3.8};
export const defaults = {title: 'Top formats', unit: 'Illustrative · average watch time, seconds', suffix: 'S', clear: false,
  items: [{label: 'Tutorial', value: 48}, {label: 'Story time', value: 41}, {label: 'Reaction', value: 33}, {label: 'Vlog', value: 27}, {label: 'Unboxing', value: 16}]};

export function mount(el, props = defaults) {
  const {body, fine, ink, intro, top} = card(el, props), items = props.items.slice(0, 6), n = items.length, pitch = Math.min(125, (915 - top) / n), bh = pitch * .7, max = Math.max(...items.map(d => d.value)), x0 = 120;
  const rows = items.map((d, i) => {
    const y = top + 14 + i * pitch, wFull = 250 + 480 * d.value / max, g = body.append('g'), paper = sheet(g, {fill: i ? (i % 2 ? C.bone : C.paper) : ink.accent, seed: i + 7, sides: 'r', amp: 10});
    const tape = tapeStrip(g, 96, 34, {seed: i}).attr('transform', `translate(${x0 + 30} ${y + 2}) rotate(${-28 + i * 9})`);
    const lab = up(d.label), ls = Math.min(bh * .62, fit(lab, wFull - 120, 60)), text = txt(fine, x0 + 70, y + bh / 2 + capH(ls) / 2, lab, {size: ls, role: 'head', color: C.soot});
    const rank = txt(fine, x0 - 26, y + bh / 2 + 9, String(i + 1).padStart(2, '0'), {size: 24, anchor: 'end', color: C.dust});
    const value = txt(fine, 0, y + bh / 2 + 22, '', {size: 60, role: 'cond', color: i ? C.bone : ink.accent});
    return {d, y, wFull, g, paper, tape, text, rank, value};
  });
  return {seek(t) {
    const s = intro(t), h = hold(t);
    rows.forEach(({d, y, wFull, g, paper, tape, text, rank, value}, i) => {
      const at = .5 + i * .18, q = easeOut(span(h, at, .45)), w = wFull * q, j = jit(s, i, 1.5, .4);
      g.attr('transform', `rotate(${(i % 2 ? .8 : -.8) + j.r} 500 ${y})`); paper.set(x0 + j.x, y, w, bh); tape.attr('opacity', q > .15 ? 1 : 0);
      text.attr('opacity', q > .75 ? 1 : 0); rank.attr('opacity', q > 0 ? 1 : 0); value.attr('x', x0 + w + 20).attr('opacity', q > 0 ? 1 : 0).text(`${Math.round(d.value * q)}${props.suffix ?? ''}`);
    });
  }};
}
