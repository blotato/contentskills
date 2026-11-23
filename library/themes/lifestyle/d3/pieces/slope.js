import {card, C, up, fit, txt, stroke, draw, fade, glide, swell, span} from '../../kit.js';
import {arrive} from './_local.js';

// Before and after: two columns joined by lines that draw across. Lines that rise take the
// accent colour, lines that fall stay quiet; labels on the left, the change on the right.
export const meta = {duration: 4.8, live: true};
export const defaults = {title: 'A month without the scroll', unit: 'Illustrative · self-rated, 1–10', clear: false, accent: 'leaf', columns: ['Before', 'After'], min: 1, max: 10,
  items: [{label: 'Sleep', from: 5, to: 8.4}, {label: 'Focus', from: 3.6, to: 7}, {label: 'Mood', from: 6.2, to: 9.4}, {label: 'Screen time', from: 8.6, to: 2.4}]};

export function mount(el, props = defaults) {
  const st = card(el, props), {root, ink} = st, xl = 380, xr = 740, y0 = 860, y1 = 350, Y = v => y0 - (y0 - y1) * (v - props.min) / (props.max - props.min);
  [xl, xr].forEach((x, i) => { stroke(root, `M${x} ${y1 - 30}V${y0 + 10}`, C.line, 2); txt(root, x, y1 - 58, up(props.columns[i]), {size: 22, role: 'label', anchor: 'middle', color: C.soft}); });
  const rows = props.items.map((d, i) => { const rise = d.to >= d.from, color = rise ? ink.accent : C.dim, a = Y(d.from), b = Y(d.to), g = root.append('g'), end = root.append('g');
    const line = stroke(root, `M${xl} ${a}L${xr} ${b}`, color, rise ? 6 : 4);
    g.append('circle').attr('cx', xl).attr('cy', a).attr('r', 10).attr('fill', C.paper).attr('stroke', color).attr('stroke-width', 5);
    txt(g, xl - 30, a + 4, d.label, {size: fit(d.label, 200, 32, {role: 'soft'}), role: 'soft', anchor: 'end'}); txt(g, xl - 30, a + 34, String(d.from), {size: 20, role: 'label', anchor: 'end', color: C.dim});
    end.append('circle').attr('cx', xr).attr('cy', b).attr('r', 12).attr('fill', color);
    txt(end, xr + 30, b + 17, String(d.to), {size: 48, role: 'head', color: rise ? C.ink : C.dim});
    return {g, end, line}; });
  return {seek(t) {
    st.header(t);
    rows.forEach((r, i) => { const s = .35 + i * .22; arrive(r.g, t, s, 14); draw(r.line, swell(span(t, s + .4, 1.1))); r.end.attr('opacity', fade(t, s + 1.25, .45)).attr('transform', `translate(${(1 - glide(span(t, s + 1.25, .7))) * -14} 0)`); });
  }};
}
