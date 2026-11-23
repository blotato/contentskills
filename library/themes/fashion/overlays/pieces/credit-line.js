import {stage, credit, rule, leave, glide, span} from '../../kit.js';

// The line of small print that runs along the bottom of every shot in this style: tiny tracked-out
// caps, centred, parts separated by thin bars, under a very short hairline. `y` is its baseline.
export const meta = {duration: 4, live: true};
export const defaults = {parts: ['Autumn collection', 'Shot on location', 'Part 01'], y: 1830, rule: true, accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W} = st, g = root.append('g').attr('filter', st.soft).append('g');
  const line = credit(g, st, props.parts, props.y, {size: 20}), bar = rule(g, W / 2 - 30, props.y - 44, 60, '#fff', 2);
  return {seek(t) { const x = leave(t, props.life, .25); line.set(t, .1, x); bar.set(props.rule ? glide(span(t, 0, .5)) * (1 - x) : 0); bar.node.attr('opacity', .8); }};
}
