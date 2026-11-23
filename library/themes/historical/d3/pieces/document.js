import {span, settle, up, oneLine, fit, typed, stamp, easeOut, txt} from '../../kit.js';
import {card, ink, ruled, drawOn, INK, SOFT, C, F} from './_card.js';

// A document revealed: a letter or decree on the sheet with a serif heading between rules, body lines
// that type themselves on one after another, a pen signature and a rubber stamp pressed on at the end.
// All of it is a prop; the sample wording is invented.
export const meta = {duration: 6.5};
export const defaults = {title: 'The order', unit: 'Illustrative document · invented wording', clear: false,
  heading: 'By order of the council', date: 'The ninth day of spring', lines: ['The harbour is to be closed at dusk.', 'No vessel may land without a warrant.', 'Those who carry word inland are to be', 'given horses and safe passage.'],
  signature: 'E. Marlowe', role: 'CLERK OF THE RECORD', stamp: 'APPROVED', ring: 'Records office'};

export function mount(el, props = defaults) {
  const {body, intro} = card(el, props, {dur: meta.duration}), head = oneLine(props.heading ?? ''), hs = fit(head, 660, 54, {font: F.serif, weight: 400, spacing: .01});
  const r1 = drawOn(ruled(body, 170, 292, 830, 292, {width: 3})), r2 = drawOn(ruled(body, 170, 380, 830, 380, {width: 1.5}));
  const heading = ink(body, 500, 356, head, {size: hs, font: F.serif, weight: 400, anchor: 'middle', spacing: .01});
  const date = props.date ? typed(body, 830, 424, props.date, {size: 25, font: F.italic, color: SOFT, anchor: 'end', spacing: .01}) : null;
  const n = props.lines.length, pitch = Math.min(56, 300 / Math.max(1, n)), ls = Math.min(30, pitch * .56, fit(props.lines, 660, 30, {font: F.type, weight: 400, spacing: .02}));
  const lines = props.lines.map((l, i) => typed(body, 170, 492 + i * pitch, l, {size: ls, color: INK}));
  const sy = Math.min(800, 492 + n * pitch + 60), sig = props.signature ? typed(body, 180, sy, props.signature, {size: 76, font: F.script, color: '#1d2a44', spacing: 0}) : null, under = drawOn(ruled(body, 170, sy + 22, 520, sy + 22, {width: 1.5}));
  const role = props.role ? typed(body, 170, sy + 52, up(props.role), {size: 19, color: SOFT, spacing: .08}) : null;
  const st = props.stamp ? stamp(body.append('g').attr('transform', `translate(725 ${sy - 30}) rotate(-12)`).append('g'), 100, {word: props.stamp, ring: props.ring ?? 'Archive copy'}) : null;
  return {seek(t) {
    intro(t); r1(settle(span(t, .5, .8))); heading.attr('opacity', span(t, .7, .6)); r2(settle(span(t, .9, .8))); date?.set(span(t, 1.2, .6));
    const each = Math.min(.8, 2.8 / Math.max(1, n)); lines.forEach((l, i) => l.set(span(t, 1.6 + i * each, each)));
    const end = 1.6 + n * each; under(settle(span(t, end, .5))); sig?.set(span(t, end + .1, .7)); role?.set(span(t, end + .6, .5));
    if (st) { const q = span(t, end + 1, .28), e = easeOut(q); st.attr('opacity', .88 * Math.min(1, q * 3)).attr('transform', `scale(${1.5 - .5 * e})`); }
  }};
}
