import {C, span, hold, easeOut, sheet, txt, scrawl, hatch, jit, up, fit} from '../../kit.js';
import {card, hand} from './_card.js';

// Torn-paper bars pasted up from a marker baseline; the highlighted one is red, the rest bone with pencil hatching.
export const meta = {duration: 3.6};
export const defaults = {title: 'Where creators earn', unit: 'Illustrative · percent', max: 50, highlight: 0, clear: false,
  items: [{label: 'Sponsors', value: 42}, {label: 'Products', value: 31}, {label: 'Ads', value: 14}, {label: 'Affiliates', value: 9}, {label: 'Tips', value: 4}]};

export function mount(el, props = defaults) {
  const {st, body, fine, ink, intro, top} = card(el, props), n = props.items.length, slot = 810 / n, w = slot * .68, base = 838, peak = top + 90;
  const shade = hatch(st, {color: C.soot, gap: 11, width: 2.5});
  const bars = props.items.map((d, i) => {
    const x = 95 + i * slot + (slot - w) / 2, hot = i === props.highlight, paper = sheet(body, {fill: hot ? ink.accent : i % 2 ? C.paper : C.bone, seed: i + 3, sides: 't', amp: 9});
    const lines = hot ? null : body.append('rect').attr('fill', shade).attr('opacity', .28);
    const lab = up(d.label); txt(fine, x + w / 2, base + 50, lab, {size: Math.min(25, fit(lab, slot - 10, 25, {role: 'type'})), anchor: 'middle', color: C.paper});
    const value = txt(fine, x + w / 2, 0, '', {size: 58, role: 'cond', anchor: 'middle', color: hot ? ink.accent : C.bone});
    return {d, x, paper, lines, value};
  });
  const baseLine = scrawl(body, s => hand(80, base + 6, 920, base + 4, s, 5), {color: C.bone, width: 7, seed: 2});
  return {seek(t) {
    const s = intro(t), h = hold(t); baseLine.draw(span(h, .3, .3), s);
    bars.forEach(({d, x, paper, lines, value}, i) => {
      const q = easeOut(span(h, .5 + i * .14, .5)), hh = (base - peak) * Math.min(1, d.value / props.max) * q, j = jit(s, i, 1.5, 0);
      paper.set(x + j.x, base - hh, w, hh); lines?.attr('x', x + 6).attr('y', base - hh + 12).attr('width', w - 12).attr('height', Math.max(0, hh - 14));
      value.attr('y', base - hh - 20).text(Math.round(d.value * q)).attr('opacity', q > 0 ? 1 : 0);
    });
  }};
}
