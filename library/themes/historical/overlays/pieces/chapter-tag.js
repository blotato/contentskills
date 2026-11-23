import {C, F, stage, bar, brush, torn, txt, fit, capH, tone, span, settle} from '../../kit.js';
import {live, float, strip} from './_overlay.js';

// Marks the era or chapter the story has reached: a numeral on a charcoal block behind a vertical
// brush stroke, the chapter word typed above, the title on a bone bar and the years on a crimson
// one. (x, y) is the top-left.
export const meta = {duration: 4, live: true};
export const defaults = {number: 'II', kicker: 'CHAPTER TWO', title: 'THE CROSSING', years: '1919 – 1924', x: 60, y: 150, color: 'crimson'};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), bw = 170, bh = 210, num = String(props.number);
  const stroke = brush(g.append('g').attr('transform', `translate(${bw + 22} 0) rotate(90)`), -10, -14, bh + 20, 26, {seed: 4, color: C.crimson});
  const block = g.append('g'); block.append('path').attr('d', torn(0, 0, bw, bh, {seed: 3, rough: 5, step: 18})).attr('fill', C.char);
  const ns = fit(num, bw - 44, 150, {font: F.serif, weight: 400, spacing: 0}); txt(block, bw / 2, bh / 2 + capH(ns, {font: F.serif, weight: 400}) / 2, num, {size: ns, font: F.serif, weight: 400, anchor: 'middle', spacing: 0});
  const tx = bw + 56, kick = props.kicker ? strip(g, props.kicker, {size: 28, spacing: .12, seed: 2}) : null, title = bar(g, props.title, {size: fit(String(props.title).toUpperCase(), 1080 - props.x - tx - 100, 62, {weight: 700, spacing: .04}), fill: 'bone', weight: 700, seed: 5}), years = props.years ? bar(g, props.years, {size: 40, fill: tone(props.color), seed: 6, spacing: .08}) : null;
  kick?.g.attr('transform', `translate(${tx} ${28})`); title.g.attr('transform', `translate(${tx - 14} ${28 + 30 + title.h / 2})`); years?.g.attr('transform', `translate(${tx + 26} ${28 + 30 + title.h + years.h / 2 - 4})`);
  return {seek(t) {
    const x = live(st, t, props), e = settle(span(t, 0, .8)); g.attr('transform', float(t, x, props.x, props.y, {dx: 4}));
    block.attr('opacity', span(t, 0, .4)).attr('transform', `translate(0 ${14 * (1 - e)})`); stroke.reveal(settle(span(t, .2, .7)));
    kick?.set(span(t, .3, .9)); title.reveal(span(t, .5, .8)); years?.reveal(span(t, .8, .8));
  }};
}
