import {card, C, up, fit, txt, leafPath, fade, glide, span} from '../../kit.js';

// The year as a ring of twelve leaves: each month's leaf grows out from the middle to its
// value, coloured by season, with month initials around the rim and a serif word at the centre.
// The busiest month is named in the accent colour.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'When the garden gives', unit: 'Illustrative · harvest by month', clear: false, accent: 'leaf', centre: 'the year',
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], values: [1, 1, 2, 4, 6, 8, 10, 9, 7, 4, 2, 1]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, cx = 500, cy = 590, n = props.values.length, max = Math.max(...props.values), peak = props.values.indexOf(max), inner = 104, outer = 300;
  const tints = [C.sky, C.sky, C.leaf, C.leaf, C.leaf, C.sun, C.sun, C.sun, C.clay, C.clay, C.clay, C.sky], wheel = root.append('g').attr('transform', `translate(${cx} ${cy})`).append('g');
  wheel.append('circle').attr('r', outer + 6).attr('fill', 'none').attr('stroke', C.line).attr('stroke-width', 1.5).attr('stroke-dasharray', '2 10');
  const leaves = props.values.map((v, i) => { const a = i / n * 360 - 90, len = 84 + (outer - inner - 84) * v / max;
    const g = wheel.append('g').attr('transform', `rotate(${a}) translate(${inner} 0)`), leaf = g.append('path').attr('d', leafPath(len)).attr('fill', tints[i % 12]).attr('fill-opacity', i === peak ? 1 : .82);
    const r = outer + 40, rad = a * Math.PI / 180, label = txt(root, cx + Math.cos(rad) * r, cy + Math.sin(rad) * r + 8, up(props.months[i] ?? ''), {size: 20, role: 'label', anchor: 'middle', color: i === peak ? C.ink : C.dim, spacing: .06});
    return {leaf, label}; });
  const size = fit(props.centre, inner * 1.6, 50, {role: 'serif'}), word = txt(root, cx, cy + size * .26, props.centre, {size, role: 'serif', anchor: 'middle'});
  return {seek(t) {
    st.header(t); wheel.attr('transform', `rotate(${Math.sin(t * .3) * 2.5})`);
    leaves.forEach((l, i) => { const e = glide(span(t, .4 + i * .11, 1.1)), breathe = 1 + Math.sin(t * 1.1 + i * .7) * .012;
      l.leaf.attr('transform', `scale(${Math.max(.001, e * breathe)} ${Math.max(.001, (.35 + .65 * e))})`).attr('opacity', fade(t, .4 + i * .11, .4)); l.label.attr('opacity', fade(t, .5 + i * .11, .5)); });
    word.attr('opacity', fade(t, .3, .8));
  }};
}
