import {span, settle, up, fit, bar} from '../../kit.js';
import {card, ink, figure, INK, SOFT, C, F} from './_card.js';

// A muster roll: rows of small standing figures in faint ink, `value` of them inked in crimson one
// by one as a tally counts up beside the label.
export const meta = {duration: 5};
export const defaults = {title: 'Who came back', unit: 'Illustrative · out of 50 who set out', clear: false, total: 50, value: 12, cols: 10, label: 'RETURNED HOME'};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), cols = props.cols, rows = Math.ceil(props.total / cols), step = Math.min(720 / cols, 400 / rows / 1.25), s = step * 1.05, x0 = 500 - cols * step / 2 + step / 2, y0 = 300 + s;
  const figs = Array.from({length: props.total}, (_, i) => { const x = x0 + (i % cols) * step, y = y0 + Math.floor(i / cols) * s * 1.22; figure(body, x, y, s, INK).attr('opacity', .3); return i < props.value ? figure(body, x, y, s, C.crimson) : null; });
  const by = Math.min(840, y0 + rows * s * 1.22 + 40), num = ink(body, 150, by + 22, '', {size: 96, weight: 700, color: C.crimson, spacing: 0}), of = ink(body, 0, by + 22, `/ ${props.total}`, {size: 44, color: SOFT, spacing: .02});
  const lab = bar(body, props.label ?? '', {size: fit(up(props.label ?? ''), 380, 40), fill: 'char'});
  return {seek(t) {
    intro(t); const q = settle(span(t, .9, 2.4)), k = props.value * q;
    figs.forEach((f, i) => f?.attr('opacity', Math.max(0, Math.min(1, k - i))));
    num.attr('opacity', span(t, .8, .3)).select('tspan').text(Math.round(k)); const w = String(Math.round(k)).length * 50 + 14; of.attr('x', 150 + w).attr('opacity', span(t, .8, .3)).select('tspan').attr('x', 150 + w);
    lab.g.attr('transform', `translate(${880 - lab.w} ${by - 10})`); lab.reveal(span(t, 2.6, .7));
  }};
}
