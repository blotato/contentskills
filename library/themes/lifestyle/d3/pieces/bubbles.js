import {card, C, series, up, fit, capH, txt, blob, inkOn, fade, glide, span} from '../../kit.js';

// Soft blobs sized by value, packed together and breathing: what is in the bag, the bowl or
// the budget. Big blobs carry their label and number inside; small ones just a label.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'What is in the weekend bag', unit: 'Illustrative · share of space', clear: false, accent: 'leaf', suffix: '%',
  items: [{label: 'Clothes', value: 38}, {label: 'Shoes', value: 18}, {label: 'Books', value: 14}, {label: 'Wash bag', value: 12}, {label: 'Snacks', value: 10}, {label: 'Camera', value: 8}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root} = st, d3 = window.d3, W = 840, H = 660;
  const nodes = d3.theme().size([W, H]).padding(16)(d3.hierarchy({children: props.items}).sum(d => d.value)).leaves();
  const items = nodes.map((nd, i) => { const color = series[i % series.length], g = root.append('g').attr('transform', `translate(${80 + nd.x} ${245 + nd.y})`).append('g'), shape = g.append('path').attr('fill', color), ink = inkOn(color), big = nd.r > 86;
    const lsize = fit(up(nd.data.label), nd.r * 1.45, 22, {role: 'label'}), vsize = Math.min(96, nd.r * .62);
    if (big) txt(g, 0, capH(vsize) / 2 - 8, `${nd.data.value}${props.suffix}`, {size: vsize, role: 'head', anchor: 'middle', color: ink});
    txt(g, 0, big ? capH(vsize) / 2 + 30 : 7, up(nd.data.label), {size: lsize, role: 'label', anchor: 'middle', color: ink});
    return {nd, g, shape, i}; });
  return {seek(t) {
    st.header(t);
    items.forEach(({nd, g, shape, i}) => { const e = glide(span(t, .3 + i * .16, 1.1));
      shape.attr('d', blob(nd.r * 1.06, i + 2, t * 1.1 + i));
      g.attr('transform', `translate(${Math.sin(t * .6 + i * 1.9) * 5} ${Math.cos(t * .5 + i * 1.3) * 5 + (1 - e) * 40}) scale(${Math.max(.001, .5 + .5 * e)})`).attr('opacity', fade(t, .3 + i * .16, .5)); });
  }};
}
