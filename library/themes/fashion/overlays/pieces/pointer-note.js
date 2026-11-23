import {stage, label, stroke, draw, leave, fade, glide, span} from '../../kit.js';

// A thin pointer: a hairline runs from a small ring on the thing being pointed at (`to`) out to a
// short shelf where two lines of small print sit (`from`). All positions are frame pixels.
export const meta = {duration: 4, live: true};
export const defaults = {to: [760, 520], from: [250, 300], text: 'Wool, undyed', sub: 'Detail 01', accent: 'poppy'};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, ink} = st, [tx, ty] = props.to, [fx, fy] = props.from, right = fx > tx, shelf = 190 * (right ? 1 : -1), g = root.append('g').attr('filter', st.soft).append('g');
  const line = stroke(g, `M${tx} ${ty}L${fx} ${fy}H${fx + shelf}`, '#fff', 2), eye = g.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 13).attr('fill', 'none').attr('stroke', '#fff').attr('stroke-width', 2), spot = g.append('circle').attr('cx', tx).attr('cy', ty).attr('r', 5).attr('fill', ink.accent);
  const a = label(g, right ? fx + 4 : fx - 4, fy - 20, props.text, {size: 22, anchor: right ? 'start' : 'end'}), b = label(g, right ? fx + 4 : fx - 4, fy + 34, props.sub, {size: 18, anchor: right ? 'start' : 'end'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      eye.attr('opacity', fade(t, 0, .25) * (1 - out)).attr('r', 13 + 10 * (1 - glide(span(t, 0, .5)))); spot.attr('opacity', fade(t, 0, .25) * (1 - out)); draw(line, glide(span(t, .1, .6))); line.attr('opacity', .9 * (1 - out));
      a.attr('opacity', fade(t, .45, .35) * .95 * (1 - out)); b.attr('opacity', fade(t, .55, .35) * .75 * (1 - out));
    },
  };
}
