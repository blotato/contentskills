import {stage, label, cross, up, leave, fade, glide, span} from '../../kit.js';

// Overlay: small print in the four corners of the frame (two short lines each), each behind a
// small registration cross — the slate of the shot. `mark` adds one more line, bottom centre.
export const meta = {duration: 4, live: true};
export const defaults = {
  topLeft: 'Ep. 12\nFirst fitting', topRight: 'Unscripted\nOne take', bottomLeft: 'Keep\nwatching', bottomRight: 'Pt. 01\nof 03',
  mark: '', accent: 'poppy', inset: 56,
};

export function mount(el, props = defaults) {
  const st = stage(el, {mode: 'overlay', accent: props.accent}), {root, W, H} = st, m = props.inset, g = root.append('g').attr('filter', st.soft).append('g');
  const items = [[props.topLeft, 0, 0], [props.topRight, 1, 0], [props.bottomLeft, 0, 1], [props.bottomRight, 1, 1]].filter(([s]) => s).map(([s, r, b], i) => {
    const x = r ? W - m : m, y = b ? H - m : m, mark = cross(g, x, y, 11), lines = up(s).split('\n');
    const nodes = lines.map((line, k) => label(g, r ? x - 30 : x + 30, b ? y + 7 - (lines.length - 1 - k) * 32 : y + 7 + k * 32, line, {size: 19, anchor: r ? 'end' : 'start'}));
    return {mark, nodes, i};
  });
  const mark = label(g, W / 2, H - m + 7, props.mark, {size: 19, anchor: 'middle'});
  return {
    seek(t) {
      const out = leave(t, props.life, .25);
      items.forEach(c => { c.mark.attr('opacity', fade(t, c.i * .06, .3) * (1 - out)).attr('transform', `rotate(${(1 - glide(span(t, c.i * .06, .6))) * 90} ${c.mark.node().getBBox().x + 11} ${c.mark.node().getBBox().y + 11})`); c.nodes.forEach((n, k) => n.attr('opacity', fade(t, .12 + c.i * .06 + k * .08, .4) * .88 * (1 - out))); });
      mark.attr('opacity', fade(t, .4, .4) * .88 * (1 - out));
    },
  };
}
