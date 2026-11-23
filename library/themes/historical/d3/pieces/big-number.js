import {span, settle, up, fit, capH, brush, bar, stamp, typed, easeOut} from '../../kit.js';
import {card, ink, ruled, INK, SOFT, C, F} from './_card.js';

// One figure, entered large in ink and counting up, underlined with a dry crimson brush stroke;
// what it measures on a charcoal bar, and an optional rubber stamp (`sticker`).
export const meta = {duration: 4.5};
export const defaults = {title: 'The number that matters', unit: 'Illustrative', clear: false, value: 87, prefix: '', suffix: '%', label: 'NEVER CAME HOME', sticker: 'ON RECORD', note: 'AS ENTERED IN THE LEDGER'};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), fmt = v => (props.prefix ?? '') + (Number.isInteger(props.value) ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)) + (props.suffix ?? '');
  const full = fmt(props.value), size = fit(full, 640, 330, {weight: 700, spacing: 0}), cap = capH(size, {weight: 700}), by = 430 + cap;
  const stroke = brush(body, 150, by + 22, 640, 44, {seed: 6}), num = ink(body, 500, by, full, {size, weight: 700, anchor: 'middle', spacing: 0});
  const lab = bar(body, props.label ?? '', {size: fit(up(props.label ?? ''), 600, 46), fill: 'char', seed: 2}); lab.g.attr('transform', `translate(${500 - lab.w / 2} ${by + 124})`);
  const note = props.note ? typed(body, 500, by + 196, up(props.note), {size: 22, color: SOFT, anchor: 'middle', spacing: .06}) : null;
  const st = props.sticker ? stamp(body.append('g').attr('transform', 'translate(770 372) rotate(-14)').append('g'), 92, {word: props.sticker, ring: 'Archive copy · illustrative'}) : null;
  return {seek(t) {
    intro(t); num.attr('opacity', span(t, .5, .4)).select('tspan').text(fmt(props.value * settle(span(t, .5, 1.6))));
    stroke.reveal(settle(span(t, 1.5, .7))); lab.reveal(span(t, 1.9, .7)); note?.set(span(t, 2.4, .8));
    if (st) { const q = span(t, 2.7, .28), e = easeOut(q); st.attr('opacity', .88 * Math.min(1, q * 3)).attr('transform', `scale(${1.5 - .5 * e})`); }
  }};
}
