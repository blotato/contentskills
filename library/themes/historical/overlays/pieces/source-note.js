import {stage, bar, tone, span} from '../../kit.js';
import {live, float, strip} from './_overlay.js';

// Where a claim comes from: a small label bar and the citation typing itself on a dark strip,
// tucked along the bottom edge under the captions. (x, y) is the left end, middle of the line.
export const meta = {duration: 4, live: true};
export const defaults = {label: 'SOURCE', text: 'Private collection, box 14, folder 3', x: 56, y: 1806, color: 'crimson', size: 30};

export function mount(el, props = defaults) {
  const st = stage(el, {overlay: true}), g = st.root.append('g'), label = props.label ? bar(g, props.label, {size: props.size, fill: tone(props.color), weight: 700, spacing: .1}) : null;
  const note = strip(g, props.text, {size: props.size, seed: 3}); note.g.attr('transform', `translate(${(label?.w ?? 0) - 2} 0)`);
  return {seek(t) {
    const x = live(st, t, props); g.attr('transform', float(t, x, props.x, props.y, {dx: 2, dy: 0, sink: 20}));
    label?.reveal(span(t, 0, .7)); note.set(span(t, .3, 1.6));
  }};
}
