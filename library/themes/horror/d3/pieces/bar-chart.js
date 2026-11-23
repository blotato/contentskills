import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// Horizontal bars as thin strips on hairline tracks; one bar (`highlight`) is rose. Values count up.
export const meta = {duration: 5, live: true};
export const defaults = {title: 'Reports by hour', unit: 'Calls logged · illustrative', items: [{label: '9 PM', value: 4}, {label: '11 PM', value: 7}, {label: '1 AM', value: 12}, {label: '3 AM', value: 31}, {label: '5 AM', value: 9}], highlight: 3, suffix: ''};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, items = props.items, n = items.length, max = Math.max(...items.map(d => d.value)), pitch = BOX.h / n, x0 = BOX.x0 + 190, w = BOX.w - 190 - 120;
  const rows = items.map((d, i) => { const y = BOX.y0 + i * pitch + pitch / 2, hot = i === props.highlight; hair(g, `M${x0} ${y}H${x0 + w}`, C.bone, 1.5, .2);
    return {d, hot, y, label: txt(g, BOX.x0, y + 12, up(d.label), {size: 34, font: F.head, weight: 400, spacing: .16, color: hot ? C.bone : C.fog}), bar: g.append('rect').attr('x', x0).attr('y', y - 9).attr('height', 18).attr('fill', hot ? C.rose : C.bone).attr('opacity', hot ? 1 : .8), value: txt(g, 0, y + 14, '', {size: 42, font: F.head, weight: 400, spacing: .06, color: hot ? C.rose : C.bone})}; });
  return {seek(t) {
    c.head(t); rows.forEach((r, i) => { const at = .7 + i * .22, q = easeOut(span(t, at, .8)), len = w * r.d.value / max * q;
      r.label.attr('opacity', flickerOn(t, at - .1, .25, i)); r.bar.attr('width', len).attr('opacity', (r.hot ? lamp(t, i, .5, 2) : .8) * (t > at ? 1 : 0)); r.value.attr('x', x0 + len + 18).text(comma(r.d.value * q) + (props.suffix ?? '')).attr('opacity', t > at ? 1 : 0); });
  }};
}
