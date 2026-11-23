import {C, stage, sheet, brush, bar, txt, fit, capH, tone, span, settle, easeOut} from '../../kit.js';
import {live, float} from './_overlay.js';

// The figure just spoken: big numerals counting up on a torn charcoal slip over a crimson brush
// stroke, with a label bar across its lower edge. `y` is the vertical centre (keep it off the face).
export const meta = {duration: 3.5, live: true};
export const defaults = {value: 5, prefix: '', suffix: '', label: 'LETTERS IN THE BOX', x: 540, y: 340, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), fmt = v => (props.prefix ?? '') + (Number.isInteger(props.value) ? Math.round(v).toLocaleString('en-US') : v.toFixed(1)) + (props.suffix ?? '');
  const full = fmt(props.value), size = fit(full, 520, 250, {weight: 700}), cap = capH(size, {weight: 700}), bw = Math.max(300, Math.min(620, size * .55 * full.length + 150)), bh = cap + 110;
  const smear = brush(g, -bw / 2 - 90, -bh * .2, bw + 180, bh * .5, {seed: 7, color: C.crimson, opacity: .92}), slip = g.append('g');
  sheet(slip, -bw / 2, -bh / 2, bw, bh, {fill: C.char, seed: 5, rough: 6, wear: .3});
  const num = txt(slip, 0, cap / 2 - 6, full, {size, anchor: 'middle', weight: 700, spacing: .01});
  const label = props.label ? bar(g, props.label, {size: 42, fill: tone(props.color), seed: 2}) : null; label?.g.attr('transform', `translate(${-label.w / 2 + 18} ${bh / 2 + label.h / 2 - 12})`);
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, .8));
    g.attr('transform', float(t, x, props.x ?? 540, props.y, {dx: 3})); smear.reveal(settle(span(t, 0, .7)));
    slip.attr('transform', `rotate(-1.5) scale(${1.08 - .08 * e + .006 * t})`).attr('opacity', span(t, .1, .4));
    num.text(fmt(props.value * easeOut(span(t, .3, 1.2)))); label?.reveal(span(t, .6, .8));
  }};
}
