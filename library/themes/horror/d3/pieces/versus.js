import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// Two figures side by side as tall thin columns, one bone and one rose, with their labels and the
// difference between them stated underneath.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Reported / explained', unit: 'Cases · illustrative', a: {label: 'REPORTED', value: 214}, b: {label: 'EXPLAINED', value: 61}, foot: 'THE REST ARE STILL OPEN'};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, max = Math.max(props.a.value, props.b.value), base = BOX.y1 - 110, top = BOX.y0 + 110, sides = [[props.a, 300, C.bone], [props.b, 700, C.rose]];
  hair(g, `M${BOX.x0} ${base}H${BOX.x1}`, C.bone, 2, .4); hair(g, `M500 ${BOX.y0 + 20}V${base}`, C.bone, 1, .2).attr('stroke-dasharray', '4 8');
  const cols = sides.map(([d, x, color], i) => ({d, x, color, bar: g.append('rect').attr('x', x - 40).attr('width', 80).attr('fill', color).attr('mask', c.st.wear), value: txt(g, x, 0, '', {size: 92, font: F.head, weight: 400, spacing: .04, anchor: 'middle', color}), label: txt(g, x, base + 54, up(d.label), {size: 32, font: F.head, weight: 400, spacing: .26, anchor: 'middle', color: C.fog})}));
  const foot = txt(g, 500, BOX.y1 + 4, up(props.foot), {size: 28, color: C.bone, spacing: .3, anchor: 'middle', weight: 600});
  return {seek(t) {
    c.head(t); cols.forEach((col, i) => { const at = .8 + i * .7, q = easeOut(span(t, at, 1)), h = (base - top) * col.d.value / max * q; col.bar.attr('y', base - h).attr('height', h).attr('opacity', i ? lamp(t, 3, .4, 2) : .9); col.value.attr('y', base - h - 22).text(comma(col.d.value * q)).attr('opacity', t > at ? 1 : 0); col.label.attr('opacity', flickerOn(t, at - .2, .3, i)); });
    foot.attr('opacity', flickerOn(t, 3, .3, 4) * .9);
  }};
}
