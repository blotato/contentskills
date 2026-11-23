import {card, BOX, C, F, series, up, clamp, span, mix, easeOut, easeInOut, hash, noise, step, lamp, flickerOn, jitter, typed, blink, pad, comma, measure, capH, fit, txt, letters, rough, roughBox, hair, draw, sheet, ekg, linear, radial, clipBox} from './_card.js';

// A month of days being crossed off one by one in rough strokes, until the marked day, which is
// ringed in rose and left open.
export const meta = {duration: 6, live: true};
export const defaults = {title: 'Days since', unit: 'October · illustrative', days: 31, offset: 2, crossed: 12, mark: 13, label: 'THE DAY THE LETTERS STOPPED', week: ['M', 'T', 'W', 'T', 'F', 'S', 'S']};

export function mount(el, props = defaults) {
  const c = card(el, props), g = c.area, cw = BOX.w / 7, rows = Math.ceil((props.days + props.offset) / 7), chh = Math.min(104, (BOX.h - 110) / rows), y0 = BOX.y0 + 50;
  props.week.forEach((d, i) => txt(g, BOX.x0 + i * cw + cw / 2, BOX.y0 + 16, d, {size: 24, color: C.fog, spacing: .1, anchor: 'middle', weight: 600}));
  const cells = Array.from({length: props.days}, (_, k) => { const day = k + 1, i = (k + props.offset) % 7, j = Math.floor((k + props.offset) / 7), x = BOX.x0 + i * cw + cw / 2, y = y0 + j * chh + chh / 2, hot = day === props.mark;
    g.append('rect').attr('x', x - cw / 2 + 5).attr('y', y - chh / 2 + 5).attr('width', cw - 10).attr('height', chh - 10).attr('fill', 'none').attr('stroke', C.bone).attr('stroke-width', 1).attr('opacity', .16);
    const num = txt(g, x, y + 16, day, {size: 46, font: F.head, weight: 400, spacing: .04, anchor: 'middle', color: hot ? C.rose : day > props.mark ? C.steel : C.bone});
    return {day, hot, num, cross: day <= props.crossed ? hair(g, rough(x - 34, y - 30, x + 34, y + 30, k, 3, 14) + rough(x + 30, y - 32, x - 32, y + 28, k + 50, 3, 14), C.fog, 4, .9).attr('stroke-linecap', 'round') : null, ring: hot ? g.append('ellipse').attr('cx', x).attr('cy', y).attr('rx', cw * .42).attr('ry', chh * .42).attr('fill', 'none').attr('stroke', C.rose).attr('stroke-width', 5).attr('transform', `rotate(-8 ${x} ${y})`) : null}; });
  const label = txt(g, 500, BOX.y1 + 6, up(props.label), {size: 28, font: F.head, weight: 400, color: C.rose, spacing: .22, anchor: 'middle'});
  return {seek(t) {
    c.head(t); const per = Math.min(.22, 2.6 / Math.max(1, props.crossed));
    cells.forEach(cl => { cl.num.attr('opacity', flickerOn(t, .5 + cl.day * .02, .2, cl.day) * (cl.cross && t > 1 + cl.day * per + .2 ? .45 : 1)); if (cl.cross) draw(cl.cross, span(t, 1 + cl.day * per, .2)); if (cl.ring) { draw(cl.ring, easeInOut(span(t, 1.3 + props.crossed * per, .5))); cl.ring.attr('opacity', lamp(t, 7, .5, 2)); } });
    label.attr('opacity', flickerOn(t, 2 + props.crossed * per, .3, 9));
  }};
}
