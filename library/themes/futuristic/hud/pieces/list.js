import {C, F, hudStage, chamfer, plate, line, text, draw, span, presence, flicker} from '../../hud.js';

// A numbered list that reveals one row at a time. Use `times` (seconds after the overlay
// starts) to bring each row in on the word that names it. `y` is the top edge in frame pixels.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'REVENUE CHANNELS', items: ['SPONSORS', 'PRODUCTS', 'COURSES', 'ADS', 'SERVICES'], times: null, y: 240};

export function mount(el, props = defaults) {
  const {root} = hudStage(el, {overlay: true}), row = 92, w = 620, h = 110 + props.items.length * row, g = root.append('g').attr('transform', `translate(70 ${props.y})`);
  plate(g, chamfer(0, 0, w, h, 26), .7); const edge = line(g, chamfer(0, 0, w, h, 26), C.cyan, 3);
  text(g, 34, 60, props.title, {size: 26, color: C.amber, spacing: '.25em'}); line(g, `M34 82H${w - 34}`, C.dim, 2);
  const rows = props.items.map((item, i) => {
    const r = g.append('g').attr('transform', `translate(34 ${118 + i * row})`);
    line(r, chamfer(0, 0, 64, 64, 10), C.cyan, 2); text(r, 32, 44, String(i + 1).padStart(2, '0'), {size: 30, color: C.cyan, anchor: 'middle', spacing: '0'});
    text(r, 92, 46, item, {size: 44, font: F.text, weight: 700, color: C.white});
    return {r, bar: line(r, `M92 62H${w - 80}`, C.teal, 2)};
  });
  return {
    seek(t) {
      root.attr('opacity', presence(t, props.life)); draw(edge, span(t, 0, .5));
      rows.forEach(({r, bar}, i) => { const at = props.times?.[i] ?? .5 + i * .6; r.attr('opacity', flicker(t, at)); draw(bar, span(t, at + .1, .4)); });
    },
  };
}
